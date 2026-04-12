const { prisma } = require('../db');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { sendOrderNotification, sendCustomerConfirmation, sendShippingUpdate } = require('../Services/emailService');
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const createOrder = async (req, res) => {
    console.log("📥 Petición recibida en /api/orders");
    console.log("👤 Body recibido:", JSON.stringify(req.body, null, 2)); // LOG 1

    try {
        const { items, userId, fullName, phone, address, postalCode, province, city, notes, shippingMethod, shippingCost, email} = req.body;

        // LOG 2: Verificar datos antes de Prisma
        console.log("🔍 Verificando campos: ", { userId, itemsLength: items?.length });

        // 1. Actualización de Usuario
        console.log("💾 Intentando actualizar perfil de usuario...");
        await prisma.users.update({
            where: { id: userId },
            data: { fullName, phone, address, postalCode, province, city }
        });
        console.log("✅ Perfil actualizado");

        // const total = items.reduce((acc, i) => acc + (Number(i.price) * Number(i.quantity)), 0);
        const productsTotal = items.reduce((acc, i) => acc + (Number(i.price) * Number(i.quantity)), 0);
        const total = productsTotal + Number(shippingCost || 0);

        // 2. Creación de Orden
        console.log("📝 Creando orden en BDD...");
        const newOrder = await prisma.order.create({
            data: {
                total, userId, fullName, phone, address, 
                postalCode, province, city, notes,
                shippingCost: Number(shippingCost || 0),
                shippingMethod: shippingMethod,
                items: {
                    create: items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });
        console.log("✅ Orden creada ID:", newOrder.id);

        // // No bloqueamos la respuesta al cliente, lo hacemos async
        // sendOrderNotification({
        //     customerName: fullName, // Usamos la variable fullName que ya tienes
        //     total: total,           // El total calculado (productos + envío)
        //     items: items            // Usamos 'items' que es como viene en el body
        // }).catch(err => console.error("Error enviando mail:", err));

        // let emailFinal = email;

        // if (!emailFinal) {
        //     console.log("🔍 Buscando email en DB para el user:", userId);
        //     const userDb = await prisma.users.findUnique({
        //         where: { id: userId }
        //     });
        //     emailFinal = userDb?.email;
        // }

        // if (emailFinal) {
        //     sendCustomerConfirmation({
        //         customerEmail: emailFinal, // <--- Este es el campo que Nodemailer usa para el 'to'
        //         customerName: fullName,
        //         orderId: newOrder.id, // Usa el id de la orden recién creada
        //         shippingMethod: shippingMethod,
        //         address: address,
        //         city: city,
        //         total: total,
        //         items: items
        //     }).catch(e => console.error("Error mail cliente:", e));
        // } else {
        //     console.error("❌ No se pudo enviar mail al cliente: 'email' llegó undefined en req.body");
        // }

        // 3. Mercado Pago
        const mpItems = items.map(item => ({
            id: item.id.toString(),
            title: item.title || item.name,
            unit_price: Number(item.price),
            quantity: Number(item.quantity),
            currency_id: 'ARS'
        }));

        // AGREGA ESTO para que el cliente pague el envío
        if (shippingCost > 0) {
            mpItems.push({
                id: "shipping",
                title: `Envío: ${shippingMethod}`,
                unit_price: Number(shippingCost),
                quantity: 1,
                currency_id: 'ARS'
            });
        }
        
        // 3. Mercado Pago
        console.log("💸 Solicitando preferencia a Mercado Pago...");
        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: mpItems,
                external_reference: newOrder.id.toString(),
                // back_urls: {
                //     success: "http://localhost:5173/success",
                //     failure: "http://localhost:5173/cart",
                //     pending: "http://localhost:5173/pending"
                // },
                // auto_return: "approved",
            }
        });
        console.log("✅ Link de pago generado:", result.init_point);

        res.json({ id: newOrder.id, init_point: result.init_point });

    } catch (error) {
        console.error("❌ ERROR EN CREATE ORDER:"); // LOG DE ERROR
        console.error(error); // Esto te va a decir si es Prisma, MP o un campo nulo
        res.status(500).json({ 
            error: error.message, 
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
};

const receiveWebhook = async (req, res) => {
    try {
        const { query } = req;
        const paymentId = query.id || query['data.id'];

        if (query.type === "payment" && paymentId) {
            let data;

            // --- TRUCO PARA PROBAR SIN MP REAL ---
            if (paymentId === "test123") {
                console.log("🛠️ Modo Test Detectado");
                data = {
                    status: "approved",
                    external_reference: "59" // Asegurate que la orden 50 exista en tu DB
                };
            } else {
                // Flujo real: intenta buscar en Mercado Pago
                const payment = new Payment(client);
                data = await payment.get({ id: paymentId });
            }
            // -------------------------------------

            const orderId = data.external_reference;

            if (data.status === "approved") {
                const finishedOrder = await prisma.order.update({
                    where: { id: Number(orderId) },
                    data: { status: "COMPLETADO" },
                    include: { 
                        user: true,
                        items: { include: { product: true } }
                    }
                });

                console.log(`✅ Orden ${orderId} pagada. Enviando correos...`);

                // Enviar mails (Admin y Cliente)
                await Promise.all([
                    sendOrderNotification({
                        customerName: finishedOrder.fullName || finishedOrder.user.name,
                        total: finishedOrder.total,
                        items: finishedOrder.items.map(i => ({
                            title: i.product.name,
                            quantity: i.quantity,
                            price: i.price
                        }))
                    }),
                    sendCustomerConfirmation({
                        customerEmail: finishedOrder.user.email,
                        customerName: finishedOrder.fullName || finishedOrder.user.name,
                        orderId: finishedOrder.id,
                        shippingMethod: finishedOrder.shippingMethod,
                        address: finishedOrder.address,
                        city: finishedOrder.city,
                        total: finishedOrder.total,
                        items: finishedOrder.items.map(i => ({
                            title: i.product.name,
                            quantity: i.quantity,
                            price: i.price
                        }))
                    })
                ]);
                
                console.log("📧 Mails enviados correctamente");
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Error en Webhook:", error.message || error);
        res.status(500).send("Error interno");
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true,   // Trae datos del usuario (email, name, etc.)
                items: { include: { product: true } }, 
            },
            orderBy: { id: 'desc' }
        });
        // Agregá este log para ver si en la terminal aparecen las notas
        console.log("📦 Órdenes enviadas al front:", JSON.stringify(orders[0], null, 2)); 
        
        res.json(orders);
    } catch (error) {
        console.error("❌ Error al obtener órdenes:", error);
        res.status(500).json({ error: error.message });
    }
};

const updateTracking = async (req, res) => {
    // 1. Capturamos el ID de los parámetros de la URL
    const { id } = req.params; // Si tu ruta es /api/orders/:id/tracking
    const { trackingCode } = req.body;

    console.log("🆔 Intentando actualizar Orden ID:", id); // Log de control

    try {
        const updatedOrder = await prisma.order.update({
            where: { id: Number(id) },
            data: {
                trackingCode: trackingCode,
                status: "ENVIADO"
            },
            include: { user: true }
        });
        console.log("✅ Orden actualizada en DB");

        if (updatedOrder.user?.email) {
            sendShippingUpdate({
                customerEmail: updatedOrder.user.email,
                customerName: updatedOrder.fullName || updatedOrder.user.name,
                orderId: updatedOrder.id,
                trackingCode: trackingCode
            }).catch(e => console.error("Error enviando aviso de envío:", e));
        }

        res.json(updatedOrder);

    } catch (error) {
        console.error("❌ Error en Prisma:", error.message);
        res.status(500).json({ error: "No se pudo actualizar el tracking" });
    }
};

const deleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        // Primero eliminamos los items de la orden (por integridad de DB)
        await prisma.orderItem.deleteMany({ where: { orderId: Number(id) } });
        // Luego la orden
        await prisma.order.delete({ where: { id: Number(id) } });
        res.json({ message: "Orden eliminada" });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { 
    createOrder, 
    receiveWebhook, 
    getOrders,
    updateTracking,
    deleteOrder
 };
const { prisma } = require('../db');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { sendOrderNotification, sendCustomerConfirmation, sendShippingUpdate } = require('../Services/emailService');
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const createOrder = async (req, res) => {
    console.log("📥 Petición recibida en /api/orders");
    console.log("👤 Body recibido:", JSON.stringify(req.body, null, 2));

    try {
        const { items, userId, fullName, phone, address, postalCode, province, city, notes, shippingMethod, shippingCost, email } = req.body;
        console.log("🔍 Verificando campos: ", { userId, itemsLength: items?.length });

        // 1. Actualización de Usuario
        console.log("💾 Intentando actualizar perfil de usuario...");
        await prisma.users.update({
            where: { id: userId },
            data: { fullName, phone, address, postalCode, province, city }
        });
        console.log("✅ Perfil actualizado");

        // --- NUEVA VALIDACIÓN DE SEGURIDAD: PRECIOS REALES ---
        const itemsWithValidatedPrices = await Promise.all(items.map(async (item) => {
            // 1. Buscamos el producto E incluyendo sus variantes
            const dbProduct = await prisma.product.findUnique({
                where: { id: item.id },
                include: { variants: true } // <--- FUNDAMENTAL para validar stock y sabor
            });

            if (!dbProduct) {
                throw new Error(`El producto ${item.name} ya no existe.`);
            }

            // 2. Buscamos la variante específica del sabor
            const selectedVariant = dbProduct.variants.find(v => v.flavor === item.selectedFlavor);
            
            if (!selectedVariant) {
                throw new Error(`El sabor ${item.selectedFlavor} para ${dbProduct.name} no está disponible.`);
            }

            // 3. Validamos stock real de la variante
            if (item.quantity > selectedVariant.stock) {
                throw new Error(`Stock insuficiente para ${dbProduct.name} (${item.selectedFlavor}). Disponible: ${selectedVariant.stock}`);
            }

            // 4. RETORNAMOS EL PRECIO DE LA DB
            return {
                ...item,
                price: dbProduct.price, // Ignoramos el precio que mandó el front
                validatedTitle: dbProduct.name,
                variantId: selectedVariant.id // Ya guardamos el ID real de la variante para el stock luego
            };
        }));

        const productsTotal = itemsWithValidatedPrices.reduce((acc, i) => acc + (Number(i.price) * Number(i.quantity)), 0);
        const total = productsTotal + Number(shippingCost || 0);

        // 2. Creación de Orden
        console.log("📝 Creando orden en BDD...");
        const newOrder = await prisma.order.create({
            data: {
                total, 
                userId, 
                fullName, 
                phone, 
                address, 
                postalCode, 
                province, 
                city, 
                notes,
                shippingCost: Number(shippingCost || 0),
                shippingMethod: shippingMethod,
                items: {
                    create: itemsWithValidatedPrices.map(item => {
                        // Buscamos el ID de la variante que coincida con el sabor seleccionado
                        const selectedVariant = item.variants?.find(v => v.flavor === item.selectedFlavor);
                        
                        return {
                            productId: item.id,
                            // Si encuentra la variante usa ese ID, si no, usa el variantId que venga o null
                            variantId: selectedVariant ? selectedVariant.id : (item.variantId || null),
                            quantity: item.quantity,
                            price: item.price // Precio validado de la DB
                        };
                    })
                }
            }
        });
        console.log("✅ Orden creada ID:", newOrder.id);

        // 3. Mercado Pago
        const mpItems = itemsWithValidatedPrices.map(item => ({
            id: item.id.toString(),
            title: item.validatedTitle || item.title || item.name,
            unit_price: Number(item.price), // Precio validado de la DB
            quantity: Number(item.quantity),
            currency_id: 'ARS'
        }));

        if (Number(shippingCost) > 0) {
            mpItems.push({
                id: "shipping",
                title: `Envío: ${shippingMethod}`,
                unit_price: Number(shippingCost),
                quantity: 1,
                currency_id: 'ARS'
            });
        }
        
        console.log("💸 Solicitando preferencia a Mercado Pago...");
        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: mpItems,
                external_reference: newOrder.id.toString(),
                notification_url: "https://api.nutripoint.site/api/orders/webhook", 
                back_urls: {
                    success: "https://nutripoint.site/success",
                    failure: "https://nutripoint.site/failure",
                },
                auto_return: "approved",
            }
        });
        console.log("✅ Link de pago generado:", result.init_point);
        res.json({ id: newOrder.id, init_point: result.init_point });

    } catch (error) {
        console.error("❌ ERROR EN CREATE ORDER:");
        console.error(error);
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
                    external_reference: "15" // Asegurate que la orden 50 exista en tu DB
                };
            } else {
                // Flujo real: intenta buscar en Mercado Pago
                const payment = new Payment(client);
                data = await payment.get({ id: paymentId });
            }
            // -------------------------------------

            const orderId = data.external_reference;

            if (data.status === "approved") {
                // Usamos una transacción para asegurar consistencia
                const [finishedOrder] = await prisma.$transaction(async (tx) => {
                    // 1. Actualizar estado de la orden y traer los items
                    const order = await tx.order.update({
                            where: { id: Number(orderId) },
                            data: { status: "COMPLETADO" },
                            include: { 
                                user: true,
                                items: true // Traemos los items para tener los variantId
                            }
                        });

                        // 2. Descontar stock de la VARIANTE (sabor)
                        for (const item of order.items) {
                            if (item.variantId) {
                                const idParaProbar = item.variantId;
                                await tx.productVariant.update({
                                    where: { id: idParaProbar },
                                    data: { stock: { decrement: item.quantity } }
                                });
                                console.log(`✅ Stock descontado para variante ID: ${item.variantId}`);
                            } else {
                                console.warn(`⚠️ El item con producto ID ${item.productId} no tiene variantId, no se descontó stock.`);
                            }
                        }

                        // Para los mails, necesitamos re-incluir los nombres de los productos
                        const orderWithProducts = await tx.order.findUnique({
                            where: { id: order.id },
                            include: {
                                user: true,
                                items: { include: { product: true } }
                            }
                        });

                        return [orderWithProducts]; 
                    });

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
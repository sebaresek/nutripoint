const { Router } = require('express');
const router = Router();

const TARIFAS_CORREO = [
    { hasta: 500, precio: 8500 },
    { hasta: 1000, precio: 10200 },
    { hasta: 5000, precio: 14500 },
    { hasta: 99999, precio: 25000 }
];

router.post('/estimate', async (req, res) => {
    try {
        const { destination_cp, weight } = req.body; 
        const totalWeight = parseInt(weight) || 1000; 
        let options = [];

        // 1. OPCIÓN: CORREO ARGENTINO (Solo si no es Posadas)
        if (destination_cp !== "3300") {
            const tarifa = TARIFAS_CORREO.find(t => totalWeight <= t.hasta) || TARIFAS_CORREO[TARIFAS_CORREO.length - 1];
            options.push({
                id: 'correo-argentino-manual',
                name: 'Correo Argentino',
                details: `Envío estándar a domicilio (${totalWeight}g)`,
                price: tarifa.precio,
                type: 'home'
            });
        }

        // 2. OPCIÓN: POSADAS (Local)
        if (destination_cp === "3300") {
            options.push({
                id: 'cadete-posadas',
                name: 'Motomandado NutriPoint',
                details: 'Entrega en el día en Posadas',
                price: 5000,
                type: 'home'
            });
        }

        // 3. OPCIÓN: PAGO EN DESTINO (Muy común para transportistas)
        // options.push({
        //     id: 'pago-destino',
        //     name: 'Envío a pagar en destino',
        //     details: 'Despachamos por Vía Cargo o Correo Argentino. Pagás el envío al recibirlo.',
        //     price: 0, // El costo en tu web es 0 porque lo paga allá
        //     type: 'branch'
        // });

        // 4. OPCIÓN: COORDINAR POR WHATSAPP
        options.push({
            id: 'coordinar-whatsapp',
            name: 'Coordinar envío por WhatsApp',
            details: 'Elegí esta opción si tenés un transporte de confianza o querés retirar.',
            price: 0,
            type: 'home'
        });

        res.json({ options });
    } catch (error) {
        console.error("Error en cálculo manual:", error);
        res.status(500).json({ error: 'Error al calcular el envío' });
    }
});

module.exports = router;
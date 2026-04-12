const { Router } = require('express');
const axios = require('axios');
const router = Router();

// URL Exteriorizada de Producción según la documentación oficial
const BASE_URL = 'https://api.correoargentino.com.ar/micorreo/v1';

async function getMiCorreoToken() {
    try {
        // La documentación especifica el uso de HTTP Basic Auth para obtener el token
        const response = await axios.post(`${BASE_URL}/token`, {}, {
            auth: {
                username: process.env.MICORREO_USER,
                password: process.env.MICORREO_PASSWORD
            },
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        return response.data.token;
    } catch (error) {
        // Log detallado para identificar si el problema son las credenciales
        console.error("Error detallado en Auth:", error.response?.status, error.response?.data);
        throw error;
    }
}

router.post('/estimate', async (req, res) => {
    const { destination_cp, weight = 1000, origin_cp = "3300" } = req.body; 

    try {
        const token = await getMiCorreoToken();
        
        const response = await axios.post(`${BASE_URL}/rates`, {
            customerId: process.env.MICORREO_CUSTOMER_ID, 
            postalCodeOrigin: origin_cp.toString(),
            postalCodeDestination: destination_cp.toString(),
            dimensions: {
                weight: parseInt(weight), // Peso en gramos (mínimo 1g)
                height: 10,
                width: 10,
                length: 10
            }
        }, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const options = response.data.rates.map(envio => ({
            id: `micorreo-${envio.productType}-${envio.deliveredType}`,
            name: envio.productName, 
            details: `Entrega estimada: ${envio.deliveryTimeMin} a ${envio.deliveryTimeMax} días`,
            price: parseFloat(envio.price),
            type: envio.deliveredType === 'D' ? 'home' : 'branch'
        }));

        // Lógica para envíos locales en Posadas
        if (destination_cp === "3300") {
            options.push({
                id: 'cadete-posadas',
                name: 'Motomandado NutriPoint',
                details: 'Entrega en el día',
                price: 5000,
                type: 'home'
            });
        }

        res.json({ options });

    } catch (error) {
        console.error("Error detallado al cotizar:", error.response?.status, error.response?.data);
        res.status(500).json({ error: 'No se pudo obtener la cotización de Correo Argentino' });
    }
});

module.exports = router;
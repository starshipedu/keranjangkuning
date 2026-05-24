const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const RAJAONGKIR_API_KEY = 'YOUR_API_KEY_HERE'; // Ganti dengan API Key RajaOngkir Anda

// Endpoint untuk cek status
app.get('/', (req, res) => {
    res.json({ status: 'active', message: 'RajaOngkir Proxy is running' });
});

// Endpoint untuk cari kota
app.post('/api/city', async (req, res) => {
    try {
        const response = await axios.get('https://pro.rajaongkir.com/api/city', {
            headers: { 'key': RAJAONGKIR_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint untuk hitung ongkir
app.post('/api/cost', async (req, res) => {
    try {
        const { origin, destination, weight, courier } = req.body;
        const response = await axios.post('https://pro.rajaongkir.com/api/cost', 
            {
                origin: origin,
                originType: 'city',
                destination: destination,
                destinationType: 'city',
                weight: weight,
                courier: courier
            },
            {
                headers: {
                    'key': RAJAONGKIR_API_KEY,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy running on port ${PORT}`);
});

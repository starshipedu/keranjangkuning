const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const RAJAONGKIR_API_KEY = 'zkGsG27bc3ae45c527b6df95biOJoRVf'; // Ganti dengan API Key Anda

// JSONP endpoint untuk cari kota
app.get('/api/city', async (req, res) => {
    try {
        const callback = req.query.callback || 'callback';
        const keyword = req.query.keyword || '';
        
        const response = await axios.get('https://pro.rajaongkir.com/api/city', {
            headers: { 'key': RAJAONGKIR_API_KEY }
        });
        
        let cities = response.data.rajaongkir.results;
        
        if (keyword && keyword.length >= 3) {
            cities = cities.filter(city => 
                city.city_name.toLowerCase().includes(keyword.toLowerCase()) ||
                city.province.toLowerCase().includes(keyword.toLowerCase())
            );
        }
        
        const result = { success: true, cities: cities.slice(0, 20) };
        res.send(`${callback}(${JSON.stringify(result)})`);
        
    } catch (error) {
        const result = { success: false, error: error.message };
        res.send(`${req.query.callback || 'callback'}(${JSON.stringify(result)})`);
    }
});

// JSONP endpoint untuk hitung ongkir
app.get('/api/cost', async (req, res) => {
    try {
        const callback = req.query.callback || 'callback';
        const { destination, weight, origin = '501' } = req.query;
        
        const couriers = ['jne', 'pos', 'tiki', 'sicepat', 'jnt', 'anteraja'];
        const allRates = [];
        
        for (const courier of couriers) {
            try {
                const formData = new URLSearchParams();
                formData.append('origin', origin);
                formData.append('originType', 'city');
                formData.append('destination', destination);
                formData.append('destinationType', 'city');
                formData.append('weight', weight);
                formData.append('courier', courier);
                
                const response = await axios.post('https://pro.rajaongkir.com/api/cost', formData, {
                    headers: {
                        'key': RAJAONGKIR_API_KEY,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                
                if (response.data.rajaongkir.results[0]?.costs) {
                    response.data.rajaongkir.results[0].costs.forEach(service => {
                        allRates.push({
                            courier_name: courier.toUpperCase(),
                            service_name: service.service,
                            cost: service.cost[0].value,
                            etd: service.cost[0].etd
                        });
                    });
                }
            } catch(err) {
                console.error(`Error ${courier}:`, err.message);
            }
        }
        
        allRates.sort((a, b) => a.cost - b.cost);
        const result = { success: true, rates: allRates };
        res.send(`${callback}(${JSON.stringify(result)})`);
        
    } catch (error) {
        const result = { success: false, error: error.message };
        res.send(`${req.query.callback || 'callback'}(${JSON.stringify(result)})`);
    }
});

// Endpoint GET untuk cek status
app.get('/', (req, res) => {
    res.json({ status: 'active', message: 'RajaOngkir Proxy with JSONP is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy running on port ${PORT}`);
});

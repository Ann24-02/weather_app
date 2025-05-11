const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors'); 
require('dotenv').config();

const app = express();
app.use(cors()); 
app.use(express.json());

const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'weather-app';

let db;
let client; 

async function connectToDB() {
    client = new MongoClient(mongoUrl);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(dbName);
        return db;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}


app.get('/api/weather/:city', async (req, res) => {
    try {
        const collection = db.collection('weather-history');
        const data = await collection.find({ city: req.params.city })
                                   .sort({ timestamp: -1 })
                                   .limit(5)
                                   .toArray();
        res.json(data);
    } catch (err) {
        console.error('Error fetching weather data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/api/weather', async (req, res) => {
    try {
        const { city, weatherData } = req.body;
        const collection = db.collection('weather-history');
        
        await collection.insertOne({
            city,
            ...weatherData,
            timestamp: new Date()
        });
        
        res.status(201).json({ message: 'Weather data saved' });
    } catch (err) {
        console.error('Error saving weather data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Обработка graceful shutdown
process.on('SIGINT', async () => {
    await client.close();
    process.exit();
});

connectToDB().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
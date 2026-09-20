// Load environment variables from .env file

require('dotenv').config();
 
const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3000;
 
// Middleware to parse incoming JSON data from ESP32

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
 
// 1. Define a Mongoose Schema & Model for Water Tank Logs

const tankSchema = new mongoose.Schema({

    slaveId: { type: String, default: "Master" },

    status: { type: String, required: true },

    level: { type: Number, required: true },

    timestamp: { type: Date, default: Date.now }

});
 
const TankLog = mongoose.model('TankLog', tankSchema);
 
// 2. Connect to MongoDB Atlas Cloud Database

mongoose.connect(process.env.MONGO_URI)

    .then(() => {

        console.log("✅ Successfully connected to MongoDB Atlas Cloud!");

    })

    .catch((err) => {

        console.error("❌ MongoDB connection error:", err);

    });
 
// 3. Root GET Route (Test if server is running)

app.get('/', (req, res) => {

    res.status(200).send('Water Tank Cloud Server is live and connected to MongoDB!');

});
 
// 4. API POST Route (Receives data from ESP32 and saves to Cloud DB)

app.post('/api/tank', async (req, res) => {

    try {

        const { slaveId, status, level } = req.body;
 
        // Validation check

        
        if (!status || level === undefined) {
            return res.status(400).json({ 
                success: false, 
                error: "Missing 'status' or 'level' field in request body." 
            });
        }

        // Create a new database document record

        const newLog = new TankLog({

            slaveId: slaveId || "Master-ESP32",

            status: status,

            level: level

        });
 
        // Save the log permanently to MongoDB Atlas Cloud

        await newLog.save();
 
        console.log(`[DATA SAVED] Slave: ${newLog.slaveId} | Status: ${status}`);
 
        if (status === "FULL") {

            console.log(`[DATA SAVED] Slave: ${newLog.slaveId} | Status: ${status} | Level: ${level}%`);

        }
 
        // Send confirmation back to ESP32

        res.status(200).json({ 

            success: true, 

            message: "Data successfully saved to MongoDB Atlas cloud.",

            data: newLog

        });
 
    } catch (error) {

        console.error("Error saving data to database:", error);

        res.status(500).json({ success: false, error: "Internal Server Error" });

    }

});

// 5. API GET Route (Sends the latest telemetry state for all tanks to React)
app.get('/api/telemetry', async (req, res) => {
    try {
        const tanks = await TankLog.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$slaveId",
                    latestLog: { $first: "$$ROOT" }
                }
            }
        ]);

        const formattedTanks = tanks.map(item => {
            const log = item.latestLog;
            const level = log.level || 50; // Fallback if level isn't posted yet
            return {
                id: log.slaveId,
                level: level,
                status: log.status,
                lastSeen: new Date(log.timestamp).toLocaleString(),
                isCritical: level > 90 || log.status === 'FULL'
            };
        });

        res.status(200).json({ success: true, data: formattedTanks });
    } catch (error) {
        console.error("Error fetching telemetry:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// 6. API GET Route (Sends event history logs to React frontend)
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await TankLog.find().sort({ timestamp: -1 }).limit(20);
        res.status(200).json({ success: true, logs: logs });
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Start the Express server

app.listen(PORT, () => {

    console.log(`🚀 Server is running and listening on port ${PORT}`);

});
 
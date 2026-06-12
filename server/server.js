require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Wrestler = require('./models/Wrestler');
const DEFAULT_WRESTLERS = require('./data/defaultWrestlers');
const fileDb = require('./fileDb');
const { getDbMode } = require('./db');

const wrestlerRoutes = require('./routes/wrestlers');
const setupRoutes = require('./routes/setup');
const simulationRoutes = require('./routes/simulations');
const predictRoutes = require('./routes/predict');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/royal-rumble';

// Fail fast instead of buffering queries for 10s when MongoDB is down
mongoose.set('bufferCommands', false);

global.dbMode = 'file';

app.use(cors());
app.use(express.json());

app.use('/api/wrestlers', wrestlerRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/predict', predictRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    dbMode: getDbMode(),
    message: 'Royal Rumble API is running'
  });
});

async function seedMongo() {
  const count = await Wrestler.countDocuments();
  if (count === 0) {
    await Wrestler.insertMany(DEFAULT_WRESTLERS);
    console.log('Seeded default wrestlers (30 wrestlers)');
  }
}

async function startServer() {
  const forceFile = process.env.USE_FILE_DB === 'true';

  if (forceFile) {
    global.dbMode = 'file';
    fileDb.getWrestlers();
    console.log('Using JSON file storage (USE_FILE_DB=true)');
  } else {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      global.dbMode = 'mongo';
      await seedMongo();
      console.log('Connected to MongoDB');
    } catch {
      global.dbMode = 'file';
      fileDb.getWrestlers();
      console.log('MongoDB not available — using JSON file storage (server/data/db.json)');
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database mode: ${getDbMode()}`);
  });
}

startServer();

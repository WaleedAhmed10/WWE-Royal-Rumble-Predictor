require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const store = require('./store');

const wrestlerRoutes = require('./routes/wrestlers');
const setupRoutes = require('./routes/setup');
const simulationRoutes = require('./routes/simulations');
const predictRoutes = require('./routes/predict');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/royal-rumble';

mongoose.set('bufferCommands', false);

app.use(cors());
app.use(express.json());

app.use('/api/wrestlers', wrestlerRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/predict', predictRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Royal Rumble API is running' });
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    store.useMongo();
    await store.seed();
  } catch {
    store.useFile();
    await store.init();
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

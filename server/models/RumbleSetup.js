const mongoose = require('mongoose');

const rumbleSetupSchema = new mongoose.Schema({
  wrestlers: [{
    wrestlerId: String,
    name: String,
    winProbability: Number,
    eliminationResistance: Number,
    brand: String,
    entryNumber: Number
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RumbleSetup', rumbleSetupSchema);

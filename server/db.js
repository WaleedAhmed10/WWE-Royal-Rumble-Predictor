const mongoose = require('mongoose');

// Use file storage when MongoDB is not connected or USE_FILE_DB=true is set
function useFile() {
  if (process.env.USE_FILE_DB === 'true') return true;
  if (global.dbMode === 'file') return true;
  // Mongo not actually connected — avoid buffering timeout errors
  return mongoose.connection.readyState !== 1;
}

function useMongo() {
  return !useFile();
}

function getDbMode() {
  if (process.env.USE_FILE_DB === 'true') return 'file (forced)';
  if (global.dbMode === 'file') return 'file';
  if (mongoose.connection.readyState === 1) return 'mongo';
  return 'file (mongo unavailable)';
}

module.exports = { useFile, useMongo, getDbMode };

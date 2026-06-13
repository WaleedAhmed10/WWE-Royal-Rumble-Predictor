const fileDb = require('../fileDb');

module.exports = {
  init: () => fileDb.getWrestlers(),
  seed: () => fileDb.getWrestlers(),

  wrestlers: {
    getAll: () => Promise.resolve(fileDb.getWrestlers()),
    add: (data) => Promise.resolve(fileDb.addWrestler(data)),
    update: (id, data) => Promise.resolve(fileDb.updateWrestler(id, data)),
    remove: (id) => Promise.resolve(fileDb.deleteWrestler(id)),
    reset: () => Promise.resolve(fileDb.resetWrestlers()),
    import: (list) => Promise.resolve(fileDb.importWrestlers(list))
  },

  setup: {
    get: () => Promise.resolve(fileDb.getSetup()),
    save: (wrestlers) => Promise.resolve(fileDb.saveSetup(wrestlers))
  },

  simulations: {
    getAll: () => Promise.resolve(fileDb.getSimulations()),
    getLatest: () => Promise.resolve(fileDb.getLatestSimulation()),
    save: (data) => Promise.resolve(fileDb.saveSimulation(data))
  }
};

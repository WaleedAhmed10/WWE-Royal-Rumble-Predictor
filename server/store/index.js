const fileStore = require('./fileStore');
const mongoStore = require('./mongoStore');

let active = fileStore;

function useFile() {
  active = fileStore;
  global.dbMode = 'file';
}

function useMongo() {
  active = mongoStore;
  global.dbMode = 'mongo';
}

module.exports = {
  useFile,
  useMongo,
  init: () => active.init(),
  seed: () => active.seed(),

  wrestlers: {
    getAll: () => active.wrestlers.getAll(),
    add: (data) => active.wrestlers.add(data),
    update: (id, data) => active.wrestlers.update(id, data),
    remove: (id) => active.wrestlers.remove(id),
    reset: () => active.wrestlers.reset(),
    import: (list) => active.wrestlers.import(list)
  },

  setup: {
    get: () => active.setup.get(),
    save: (wrestlers) => active.setup.save(wrestlers)
  },

  simulations: {
    getAll: () => active.simulations.getAll(),
    getLatest: () => active.simulations.getLatest(),
    save: (data) => active.simulations.save(data)
  }
};

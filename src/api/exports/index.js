const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { playlistService, exportService, validator }) => {
    const exportsHandler = new ExportsHandler(playlistService, exportService, validator);
    server.route(routes(exportsHandler));
  },
};

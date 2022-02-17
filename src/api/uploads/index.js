const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, { albumService, uploadService, validator }) => {
    const uploadsHandler = new UploadsHandler( albumService, uploadService, validator);
    server.route(routes(uploadsHandler));
  },
};

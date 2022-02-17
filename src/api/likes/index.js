const LikesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  version: '1.0.0',
  register: async (server, { albumService, likesService, cacheService }) => {
    const likesHandler = new LikesHandler( albumService, likesService, cacheService );
    server.route(routes(likesHandler));
  },
};

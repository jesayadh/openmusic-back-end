const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: handler.postSongToPlaylistByIdHandler,
    options: {
      auth: 'playlistsapp_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: handler.getSongFromPlaylistsHandler,
    options: {
      auth: 'playlistsapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: handler.deleteSongFromPlaylistsHandler,
    options: {
      auth: 'playlistsapp_jwt',
    },
  },
];

module.exports = routes;

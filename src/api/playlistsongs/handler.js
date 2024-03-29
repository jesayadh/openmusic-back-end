const ClientError = require('../../exceptions/ClientError');

class PlaylistSongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongToPlaylistByIdHandler = this.postSongToPlaylistByIdHandler.bind(this);
    this.getSongFromPlaylistsHandler = this.getSongFromPlaylistsHandler.bind(this);
    this.deleteSongFromPlaylistsHandler = this.deleteSongFromPlaylistsHandler.bind(this);
    this.getPlaylistActivityHandler = this.getPlaylistActivityHandler.bind(this);
  }
  
  async postSongToPlaylistByIdHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      
      await this._service.verifyPlaylistAccess(id, credentialId);
      await this._service.addSongToPlaylist(id, request.payload);
      await this._service.addPlaylistActivity(id, credentialId, "add", request.payload);

      const response = h.response({
        status: 'success',
        message: 'Song berhasil ditambahkan',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongFromPlaylistsHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      
      await this._service.verifyPlaylistAccess(id, credentialId);
      const playlist = await this._service.getSongFromPlaylists(id);
      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistActivityHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      
      await this._service.verifyPlaylistAccess(id, credentialId);
      const activity = await this._service.getPlaylistActivity(id);
      return {
        status: 'success',
        data: activity,
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteSongFromPlaylistsHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(id, credentialId);
      await this._service.deleteSongFromPlaylistById(id, request.payload);
      await this._service.addPlaylistActivity(id, credentialId, "delete", request.payload);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = PlaylistSongsHandler;

const ClientError = require('../../exceptions/ClientError');
     
class LikesHandler {
  constructor(albumService, likesService, cacheService) {
    this._albumService = albumService;
    this._likesService = likesService;
    this._cacheService = cacheService;
 
    this.likeAlbumByIdHandler = this.likeAlbumByIdHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
  }

  async likeAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const album = await this._albumService.getAlbumById(id);
      const result = await this._likesService.verifyLiker(id, credentialId);

      const response = h.response({
        status: 'success',
        message: result,
        data: {
          album,
        },
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

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id:albumId } = await this._albumService.getAlbumById(id);
      try {
        const likes = parseInt(await this._cacheService.get(`likes:${albumId}`));
        
        const response = h.response({
          status: 'success',
          data: {
            likes,
          },
        });
        response.header(`X-Data-Source`,'cache');
        return response;
      } catch (error) {
        const likes = await this._likesService.getLiker(albumId);
        const response = h.response({
          status: 'success',
          data: {
            likes,
          },
        });
        response.header(`X-Data-Source`,likes);
        return response;
      }
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

module.exports = LikesHandler;
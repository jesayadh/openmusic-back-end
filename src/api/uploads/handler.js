const ClientError = require('../../exceptions/ClientError');

class UploadsHandler {
  constructor(albumService, uploadService, validator) {
    this._albumService = albumService;
    this._uploadService = uploadService;
    this._validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    try {
      const { data } = request.payload;
      const { id } = request.params;
      const fileLocation = await this._uploadService.writeFile(data, data.hapi);
      this._validator.validateImageHeaders(data.hapi.headers);
      const { name, year } = await this._albumService.getAlbumById(id);
      await this._albumService.editAlbumById(id, {name, year, fileLocation});
      
      const response = h.response({
        status: 'success',
        message: "Sampul berhasil diunggah",
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
}

module.exports = UploadsHandler;

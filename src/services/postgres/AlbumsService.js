const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumToModel,mapSongsToModel } = require('../../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year, fileLocation }) {
    const id = "album-"+nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, name, year, fileLocation, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows.map(mapAlbumToModel);
  }

  async getAlbumById(id) {
    const queryAlbum = {
        text: `select 
                  *
                from albums
                where id = $1`,
        values: [id],
    };
    const resultAlbum = await this._pool.query(queryAlbum);
    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    
    const querySong = {
      text: `select 
                *
              from songs
              where "album_id" = $1`,
      values: [id],
    };
    const resultSong = await this._pool.query(querySong);
    const songs = resultSong.rows.map(mapSongsToModel);
    let album = resultAlbum.rows.map(mapAlbumToModel)[0];
    album.songs = songs;

    return album;
  }

  async editAlbumById(id, { name, year, fileLocation }) {
    const updatedAt = new Date().toISOString();
    
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, cover = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [name, year, fileLocation, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
        text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
        values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
        throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;

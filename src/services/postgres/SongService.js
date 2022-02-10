const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongToModel,mapSongsToModel } = require('../../utils');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = "song-"+nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);
 
    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs({title,performer}) {
    const baseQuery = `SELECT 
                          *
                        FROM songs`;
    const tempQuery = baseQuery.concat(" ",
                                        (title && performer) ? 
                                          'WHERE LOWER(title) ~ $1 and LOWER(performer) ~ $2' :
                                          (title) ? 'WHERE LOWER(title) ~ $1' :
                                          (performer) ? 'WHERE LOWER(performer) ~ $1' :
                                          '');
    const query = {text: tempQuery,
                    values: (title && performer) ? [title.toLowerCase(),performer.toLowerCase()] :
                            (title) ? [title.toLowerCase()] :
                            (performer) ? [performer.toLowerCase()] :
                            [],
                  };
    const result = await this._pool.query(query);
    return result.rows.map(mapSongsToModel);
  }

  async getSongById(id) {
    const query = {
        text: 'SELECT * FROM songs WHERE id = $1',
        values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
        throw new NotFoundError('Song tidak ditemukan');
    }

    return result.rows.map(mapSongToModel)[0];
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "albumId" = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
        text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
        values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
        throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongService;

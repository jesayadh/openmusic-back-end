const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const UsersService = require('./UsersService');
const { mapCountToModel, } = require('../../utils');

class LikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._user = new UsersService();
    this._cacheService = cacheService;
  }

  async addLike(albumId, userId) {
    await this._user.getUserById(userId);
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Like gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async deleteLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Like gagal dihapus');
    }
  }

  async getLiker(albumId) {
    const query = {
      text: `SELECT 
                COUNT(*) 
              FROM user_album_likes
              WHERE album_id = $1;`,
      values: [albumId],
    };
    const result = await this._pool.query(query);
    const likes = parseInt(result.rows.map(mapCountToModel)[0].likes)
    await this._cacheService.set(`likes:${albumId}`, parseInt(likes));

    return parseInt(likes);
  }

  async verifyLiker(albumId, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      await this.addLike(albumId, userId);
      await this._cacheService.delete(`likes:${albumId}`);
      return "Like berhasil ditambahkan";
    }else{
      await this.deleteLike(albumId, userId);
      await this._cacheService.delete(`likes:${albumId}`);
      return "Like berhasil dikurangkan";
    }
  }
}

module.exports = LikesService;

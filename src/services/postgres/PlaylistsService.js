const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapPlaylistToModel, } = require('../../utils');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({
    name, owner,
  }) {
    const id = "playlist-"+nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT 
                playlists.id,
                playlists.name,
                users.username as owner
              FROM playlists
              LEFT JOIN users ON playlists.owner = users.id
              LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
              WHERE playlists.owner = $1 OR collaborations.user_id = $1
              GROUP BY playlists.id,users.id`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapPlaylistToModel);
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT 
              p.id,
              p.name,
              u.username as owner
    FROM playlists
    JOIN users ON users.id = playlists.owner
    WHERE playlists.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return result.rows.map(mapPlaylistToModel)[0];
  }

  async editPlaylistById(id, { name }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE playlists SET title = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [name, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui playlist. Id tidak ditemukan');
    }
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const Playlist = result.rows[0];
    if (Playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async getUsersByUsername(username) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
      values: [`%${username}%`],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistsService;

const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const SongsService = require('./SongsService');
const { mapPlaylistToModel, mapSongsToModel, mapActivityPlaylistToModel } = require('../../utils');
const PlaylistsService = require('./PlaylistsService');

class PlaylistSongsService extends PlaylistsService {
  constructor(collaborationService) {
    super(collaborationService);
    this._pool = new Pool();
    this._song = new SongsService();
  }

  async addSongToPlaylist(playlistId,{songId}) {
    await this._song.getSongById(songId);
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO "playlistSongs" VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }
  
  async addPlaylistActivity(playlistId,userId,action,{songId}) {
    const id = nanoid(16);
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };
    
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist Activity gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylistActivity(playlistId) {
    const query = {
      text: `SELECT
                p.id,
                username,
                title,
                action,
                time
              FROM playlist_song_activities psa
              LEFT JOIN playlists p ON p.id = psa.playlist_id
              LEFT JOIN users u ON u.id = psa.user_id 
              LEFT JOIN songs s ON s.id = psa.song_id
              WHERE p.id = $1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    const activity = ({playlistId});
    activity.activities = result.rows.map(mapActivityPlaylistToModel);
    return activity;
  }
  
  async getSongFromPlaylists(playlistId) {
    const queryPlaylist = {
      text: `SELECT
                p.id,
                p.name,
                u.username as owner
              FROM playlists p
              INNER JOIN users u ON p."owner" = u.id
              WHERE p.id = $1`,
      values: [playlistId],
    };
    const resultPlaylist = await this._pool.query(queryPlaylist);
    if (!resultPlaylist.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const querySong = {
      text: `select 
                *
              from "playlistSongs" ps
              join songs s on ps.song_id = s.id
              where playlist_id = $1`,
      values: [playlistId],
    };
    const resultSong = await this._pool.query(querySong);
    const songs = resultSong.rows.map(mapSongsToModel);
    let playlist = resultPlaylist.rows.map(mapPlaylistToModel)[0];
    playlist.songs = songs;

    return playlist;
  }

  
  async deleteSongFromPlaylistById(playlistId,{songId}) {
    const query = {
      text: 'DELETE FROM "playlistSongs" WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongsService;

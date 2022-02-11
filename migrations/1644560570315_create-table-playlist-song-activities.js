/* eslint-disable camelcase */
    
exports.shorthands = undefined;
    
exports.up = (pgm) => {
    // membuat table collaborations
    pgm.createTable('playlist_song_activities', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        song_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        action: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        time: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    });
    
    /*
    Menambahkan constraint UNIQUE, kombinasi dari kolom playlist_id dan user_id.
    Guna menghindari duplikasi data antara nilai keduanya.
    */
    // pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)');
    
    // memberikan constraint foreign key pada kolom playlist_id dan user_id terhadap playlists.id dan users.id
    pgm.addConstraint('playlist_song_activities', 'fk_playlist_song_activities.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
};
    
exports.down = (pgm) => {
    // menghapus tabel collaborations
    pgm.dropTable('playlist_song_activities');
};
/* eslint-disable camelcase */
    
exports.shorthands = undefined;
    
exports.up = (pgm) => {
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
};
    
exports.down = (pgm) => {
    // menghapus tabel collaborations
    pgm.dropTable('playlist_song_activities');
};
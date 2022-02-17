const mapAlbumToModel = ({ 
    id,
    name,
    year,
    cover:coverUrl,
}) => ({
    id,
    name,
    year,
    coverUrl,
});

const mapCountToModel = ({
    count: likes,
}) => ({
    likes,
});

const mapSongToModel = ({ 
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
}) => ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
});

const mapSongsToModel = ({ 
    id,
    title,
    performer,
}) => ({
    id,
    title,
    performer,
});

const mapPlaylistToModel = ({
    id,
    name,
    owner,
}) => ({
    id,
    name,
    username : owner,
});

const mapActivityPlaylistToModel = ({
    username,
    title,
    action,
    time,
}) => ({
    username,
    title,
    action,
    time,
});

module.exports = { mapAlbumToModel,mapSongToModel,mapSongsToModel,mapPlaylistToModel,mapActivityPlaylistToModel,mapCountToModel };
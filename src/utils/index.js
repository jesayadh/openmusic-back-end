const mapAlbumToModel = ({ 
    id,
    name,
    year,
}) => ({
    id,
    name,
    year,
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
    title,
    body,
    tags,
    created_at,
    updated_at,
    username,
}) => ({
    id,
    title,
    body,
    tags,
    createdAt: created_at,
    updatedAt: updated_at,
    username,
});
   
module.exports = { mapAlbumToModel,mapSongToModel,mapSongsToModel };
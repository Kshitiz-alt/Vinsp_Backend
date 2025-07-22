import albumsData from '../../metadata/albums.json';
import songData from '../../metadata/songs.json';


export const albumMap = new Map(albumsData.album.map(a=> [a.id,a]));

let cachedSongs:any[] | null = null;

export const getCachedSongsWithAlbums = () => {
    if(!cachedSongs){
        cachedSongs = songData.song.map(song => ({
            ...song,
            album:albumMap.get(song.albumId) || null
        }))
    }
    return cachedSongs;
};


import albumsData from '../metadata/albums.json';
import songData from '../metadata/songs.json';

export function getPaginated<T>(data:T[],page:number = 1 , limit: number = 10):T[] {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return data.slice(startIndex, endIndex)
};

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


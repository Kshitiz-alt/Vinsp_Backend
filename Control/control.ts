import { Request, Response } from 'express'
import dotenv from "dotenv"

import songData from '../metadata/songs.json'
import albumsData from '../metadata/albums.json'
import artistData from '../metadata/artists.json'

dotenv.config();

export const getSongs = (req: Request, res: Response) => {
    try {
        const baseUrl = process.env.BUNNY_CDN;

        const songsWithURL = songData.song.map(song => ({
            ...song,
            audio: `${baseUrl}/${encodeURIComponent(song.audio)}`
        }));

        res.json({ song: songsWithURL });
        return;
    } catch (err) {
        console.error("error in getting songs:", err)
    }
};


export const getAlbumswithSongs = (req: Request, res: Response) => {
    try {

        const dataFromSongs = songData.song.map(song => {
            const dataFromAlbum = albumsData.album.find(a => a.id === song.albumId)
            return {
                ...song,
                album: dataFromAlbum || null
            }
        })
        res.json(dataFromSongs)
        return;
    } catch (err) {
        console.error('Error in getAlbumswithSongs', err)
    }
}

const getQueries = ({ title, artist, album, limit, query }: {
    title?: string,
    artist?: string,
    album?: string,
    limit?: number,
    query?: string
}) => {
    let songs = songData.song;
    try {
        if (typeof title === 'string') {

            songs = songs.filter(song => song.title.toLowerCase().includes(title.toLowerCase()))
        };

        if (typeof artist === 'string') {
            console.log("checking...", artist)
            songs = songs.filter(song => song.artist.toLowerCase().includes(artist.toLowerCase()))
        };

        if (typeof album === 'string') {
            songs = songs.filter(song => {
                const object = albumsData.album.find(a => a.id === song.albumId)
                return object?.title.toLowerCase().includes(album.toLowerCase())

            })
        };


        if (typeof query === 'string') {
            const lowerQuery = query.toLowerCase();
            songs = songs.filter(song => {
                const album = albumsData.album.find(a => a.id === song.albumId);
                return (
                    song.title.toLowerCase().includes(lowerQuery) ||
                    song.artist.toLowerCase().includes(lowerQuery) ||
                    album?.title.toLowerCase().includes(lowerQuery)
                );
            });
        };
        if (typeof limit === 'number' && !isNaN(limit)) {
            songs = songs.slice(0, Number(limit))
        };
        return songs;
    } catch (err) {
        console.error('Error in getSearchParams', err);
    }

}

export const getSearchParams = (req: Request, res: Response) => {
    try {
        const { title, artist, album, query, limit } = req.query;
        const songs = getQueries({
            title: title as string,
            artist: artist as string,
            album: album as string,
            query: query as string,
            limit: limit && !isNaN(Number(limit)) ? Number(limit) : undefined
        });
        res.json(songs);
        return;
    } catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }

};

export const getSearchArtistsParams = (req: Request, res: Response) => {
    try {
        const { artist, query } = req.query;
        const searchedArtist = (artist || query || "").toString().toLowerCase();

        const matchedArtists = artistData.artist.filter(a => a.title.toLowerCase().includes(searchedArtist))
        res.json(matchedArtists);
        return;
    } catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }

};

export const getSearchSongsParams = (req: Request, res: Response) => {
    try {
        const { title, query, limit } = req.query;
        const songs = getQueries({
            title: title as string,
            query: query as string,
            limit: limit && !isNaN(Number(limit)) ? Number(limit) : undefined
        });
        res.json(songs);
        return;
    } catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }

};

export const getSearchAlbumsParams = (req: Request, res: Response) => {
    try {
        const { album, query } = req.query;
        const songs = getQueries({
            album: album as string,
            query: query as string
        });

        const uniqueIds = Array.from(
            new Set(songs?.map(song => song.albumId))
        );

        const matchedAlbums = uniqueIds
            .map(id => albumsData.album.find(a => a.id === id))
            .filter(Boolean)


        res.json(matchedAlbums);
    } catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }

};
export const getAlbumsbyID = (req: Request, res: Response) => {
    try {
        const albumId = Number(req.params.albumId);
        if (isNaN(albumId) || !albumId) {
            res.status(400).json({ message: 'invalid AlbumID' })
            return;
        }
        
        const album = albumsData.album.find(a => a.id === albumId);
         const songs = songData.song.filter(s => s.albumId === albumId)

        if (!album) {
         res.status(404).json({ message: 'Album not found' }); // ✅ added check
         return;
        }

        res.json({
            album,
            songs
        })
    } catch (err) {
        console.error('Error in getAlbumsbyID', err)
        res.status(500).json({ message: 'Internal server error' });
        
    }
};

export const getArtistsbyID = (req:Request,res:Response) => {
    try{
        const artistId = Number(req.params.artistId);
        if(isNaN(artistId) || !artistId){
            res.status(400).json({message:'invalid artistID'})
            return;
        }
        const artist = artistData.artist.find(a => a.id === artistId);

        res.json({
            artist
        })
    }catch(err){
        console.error('error in getArtistsbyID',err)

    }
}
export const getArtistsSongsbyID = (req: Request, res: Response) => {
    try {
        const artistId = Number(req.params.artistId);
        if (isNaN(artistId) || !artistId) {
            res.status(400).json({ message: 'invalid artistID' })
            return;
        }

        const artist = artistData.artist.find(a => a.id === artistId);
        const songs = songData.song.filter(s => s.artist === artist?.title)


        res.json({
            ...artist,
            songs
        })
    } catch (err) {
        console.error('Error in getAlbumsbyID', err)
    }
};


export const getAlbumSongsbyID = (req: Request, res: Response) => {
    try {
        const albumId = Number(req.params.albumId);
        if (isNaN(albumId) || !albumId) {
            res.status(400).json({ message: 'invalid AlbumID' })
            return;
        }

        const album = albumsData.album.find(a => a.id === albumId);
        const songs = songData.song.filter(s => s.albumId === albumId)


        res.json({
            album,
            songs
        })
    } catch (err) {
        console.error('Error in getAlbumsbyID', err)
        res.status(500).json({message:"internal server (getAlbumSongsbyID)"})
        return;
    }
};

export const getSongsbyID = (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const songs = songData.song;
        const findingSong = songs.find((s) => s.id === id);
        if (findingSong) {
            res.json(findingSong)
        } else {
            res.status(404).json({ message: "songs not found" })
        };
    } catch (err) {
        console.error('Error in getSongsbyID', err)

    }

};


import { Request, Response } from 'express'
import dotenv from "dotenv"

import songData from '../metadata/songs.json'
import albumsData from '../metadata/albums.json'


dotenv.config();

export const getSongs = (req: Request, res: Response) => {
    try {
        const baseUrl = process.env.BUNNY_CDN;

        const songsWithURL = songData.song.map(song => ({
            ...song,
            audio: `${baseUrl}/${encodeURIComponent(song.audio)}`
        }));

        res.json({ song: songsWithURL });
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
            return
        }

        const songs = songData.song.filter(s => s.albumId === albumId)

        const album = albumsData.album.find(a => a.id === albumId);

        res.json({
            album,
            songs
        })
    } catch (err) {
        console.error('Error in getAlbumsbyID', err)
        res.status(400).json({ message: 'Internal error' })

    }
};

export const getAlbumSongsbyID = (req: Request, res: Response) => {
    try {
        const albumId = Number(req.params.albumId);
        if (isNaN(albumId)) {
            res.status(400).json({ message: 'invalid AlbumID' })
        }

        const album = albumsData.album.find(a => a.id === albumId);

        if (!albumId) {
            res.status(404).json({ message: "albumId not found" })
        }

        const songs = songData.song.filter(s => s.albumId === albumId)


        res.json({
            album,
            songs
        })
    } catch (err) {
        console.error('Error in getAlbumsbyID', err)
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
        res.json(findingSong)

    } catch (err) {
        console.error('Error in getSongsbyID', err)

    }

};


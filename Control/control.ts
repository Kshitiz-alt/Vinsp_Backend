import { Request, Response } from 'express';
import dotenv from "dotenv";
import cliProgress from "cli-progress";
import path from 'path';
import fs from 'fs/promises';

import songData from '../metadata/songs.json';
import albumsData from '../metadata/albums.json';
import artistData from '../metadata/artists.json';
import { albumMap, getCachedSongsWithAlbums } from './utils/caching';
import { getPaginated } from './utils/pagination'
import { getLyrics } from './utils/lyrics';


dotenv.config();

const getLimiter = (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10

    return {
        page,
        limit
    }
};

//to get global songs
export const getSongs = (req: Request, res: Response) => {
    try {
        const baseUrl = process.env.BUNNY_CDN;

        const { page, limit } = getLimiter(req, res)

        const songsWithURL = songData.song.map(song => ({
            ...song,
            audio: `${baseUrl}/${encodeURIComponent(song.audio)}`
        }));
        console.log("Original song count →", songData.song.length);
        const paginatedData = getPaginated(songsWithURL, page, limit)

        res.json({
            page,
            limit,
            total: songsWithURL.length,
            result: paginatedData

        });
        return;
    } catch (err) {
        console.error("error in getting songs:", err)
    }
};

//to get songs by their Ids
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



//to get albums with their songs
export const getAlbumswithSongs = (req: Request, res: Response) => {
    try {

        const { page, limit } = getLimiter(req, res)
        const dataFromSongs = getCachedSongsWithAlbums();

        const paginatedAlbum = getPaginated(dataFromSongs, page, limit)
        res.json({
            page,
            limit,
            total: dataFromSongs.length,
            result: paginatedAlbum
        })
        return;
    } catch (err) {
        console.error('Error in getAlbumswithSongs', err)
    }
};

//common function for search param 
const getQueries = ({ title, artist, album, query, language }: {
    title?: string,
    artist?: string,
    album?: string,
    language?: string,
    query?: string
}) => {
    let songs = songData.song;
    try {
        if (typeof title === 'string') {
            const lowerQuery = title.toLowerCase();
            songs = songs.filter(song => song.title.toLowerCase().includes(lowerQuery))
        };

        if (typeof artist === 'string') {
            const lowerQuery = artist.toLowerCase();
            songs = songs.filter(song => song.artist.toLowerCase().includes(lowerQuery))
        };

        if (typeof album === 'string') {
            songs = songs.filter(song => {
                const object = albumMap.get(song.albumId)
                return object?.title.toLowerCase().includes(album.toLowerCase())

            })
        };

        if (typeof language === "string") {
            const lowerQuery = language.toLowerCase();
            songs = songs.filter(song => song.language?.toLowerCase().includes(lowerQuery))
        }



        if (typeof query === 'string') {
            const lowerQuery = query.toLowerCase();
            songs = songs.filter(song => {
                const album = albumMap.get(song.albumId);
                return (
                    song.title.toLowerCase().includes(lowerQuery) ||
                    song.artist.toLowerCase().includes(lowerQuery) ||
                    album?.title.toLowerCase().includes(lowerQuery) ||
                    song.language.toLowerCase().includes(lowerQuery)

                );
            });
        };
        return songs;
    } catch (err) {
        console.error('Error in getSearchParams', err);
        return [];
    }

};

export const getSearchParams = (req: Request, res: Response) => {
    try {
        const { title, artist, album, query } = req.query;
        const { page, limit } = getLimiter(req, res)
        const songs = getQueries({
            title: title as string,
            artist: artist as string,
            album: album as string,
            query: query as string,
            // limit: limit && !isNaN(Number(limit)) ? Number(limit) : undefined
        });
        const paginatedSearch = getPaginated(songs, page, limit)

        res.json({
            page,
            limit,
            total: songs.length,
            result: paginatedSearch
        });
        return;
    } catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }

};

export const getSearchArtistsParams = (req: Request, res: Response) => {
    try {
        const { artist, query } = req.query;
        const { page, limit } = getLimiter(req, res)

        const searchedArtist = (artist || query || "").toString().trim().toLowerCase();

        // if (!searchedArtist) {
        //     return ({
        //         page,
        //         limit,
        //         total: 0,
        //         result: []
        //     });
        // }

        const matchedArtists = artistData.artist.filter(a => a.title.toLowerCase().includes(searchedArtist))
        const paginatedArtist = getPaginated(matchedArtists, page, limit)
        res.json({
            page,
            limit,
            total: matchedArtists.length,
            result: paginatedArtist
        });
        return;
    } catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }

};

export const getSearchSongsParams = (req: Request, res: Response) => {
    try {
        const { title, query } = req.query;
        const { page, limit } = getLimiter(req, res)
        const songs = getQueries({
            title: title as string,
            query: query as string,
        });

        const paginatedSongs = getPaginated(songs, page, limit)
        res.json({
            page,
            limit,
            total: songs.length,
            result: paginatedSongs
        });
        return;
    } catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }

};

export const getSearchAlbumsParams = (req: Request, res: Response) => {
    try {
        const { album, query } = req.query;
        const { page, limit } = getLimiter(req, res)

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

        const paginatedAlbums = getPaginated(matchedAlbums, page, limit)

        res.json({
            page,
            limit,
            total: matchedAlbums.length,
            result: paginatedAlbums
        });
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

export const getArtistsbyID = (req: Request, res: Response) => {
    try {
        const artistId = Number(req.params.artistId);
        if (isNaN(artistId) || !artistId) {
            res.status(400).json({ message: 'invalid artistID' })
            return;
        }
        const artist = artistData.artist.find(a => a.id === artistId);

        res.json({
            artist
        })
    } catch (err) {
        console.error('error in getArtistsbyID', err)

    }
};
export const getArtistsSongsbyID = (req: Request, res: Response) => {
    try {
        const artistId = Number(req.params.artistId);
        if (isNaN(artistId) || !artistId) {
            res.status(400).json({ message: 'invalid artistID' })
            return;
        }

        const artist = artistData.artist.find(a => a.id === artistId);
        const songs = songData.song.filter(s => s.artistId === artistId)
        console.log("songs...", songs)


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

        const {page, limit} = getLimiter(req,res)
        const albumId = Number(req.params.albumId);
        if (isNaN(albumId) || !albumId) {
            res.status(400).json({ message: 'invalid AlbumID' })
            return;
        }

        const album = albumsData.album.find(a => a.id === albumId);
        const songs = songData.song.filter(s => s.albumId === albumId)
        const paginatedSongs = getPaginated(songs,page,limit)


        res.json({
            page,
            limit,
            album,
            total:songs.length,
            result:paginatedSongs
        })
    } catch (err) {
        console.error('Error in getAlbumsbyID', err)
        res.status(500).json({ message: "internal server (getAlbumSongsbyID)" })
        return;
    }
};

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
const injectLyrics = async () => {
    const data = [];
    const total = songData.song.length;


    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(total, 0);
    

    for (const song of songData.song) {
        try {

            const lyrics = await getLyrics(song.artist, song.title);
            data.push({
                ...song,
                lyrics: lyrics
            })

            bar.update(data.length);
            
        } catch (err: any) {
            console.error(err.message)
            data.push({
                ...song,
                lyrics: "Lyrics not available",
            });
            bar.update(data.length);
        }
        await sleep(1500);
    }
    bar.stop()
    const output = path.join(__dirname, '../metadata/songs.json');
    await fs.writeFile(output, JSON.stringify(data, null, 2))
}

if (require.main === module) {
    injectLyrics().then(() => {
        console.log("✅ Lyrics injection complete!");
    }).catch(console.error);
}
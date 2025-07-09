"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumSongsbyID = exports.getArtistsSongsbyID = exports.getArtistsbyID = exports.getAlbumsbyID = exports.getSearchAlbumsParams = exports.getSearchSongsParams = exports.getSearchArtistsParams = exports.getSearchParams = exports.getAlbumswithSongs = exports.getSongsbyID = exports.getSongs = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const songs_json_1 = __importDefault(require("../metadata/songs.json"));
const albums_json_1 = __importDefault(require("../metadata/albums.json"));
const artists_json_1 = __importDefault(require("../metadata/artists.json"));
dotenv_1.default.config();
const getSongs = (req, res) => {
    try {
        const baseUrl = process.env.BUNNY_CDN;
        const songsWithURL = songs_json_1.default.song.map(song => ({
            ...song,
            audio: `${baseUrl}/${encodeURIComponent(song.audio)}`
        }));
        res.json({ song: songsWithURL });
        return;
    }
    catch (err) {
        console.error("error in getting songs:", err);
    }
};
exports.getSongs = getSongs;
const getSongsbyID = (req, res) => {
    try {
        const id = Number(req.params.id);
        const songs = songs_json_1.default.song;
        const findingSong = songs.find((s) => s.id === id);
        if (findingSong) {
            res.json(findingSong);
        }
        else {
            res.status(404).json({ message: "songs not found" });
        }
        ;
    }
    catch (err) {
        console.error('Error in getSongsbyID', err);
    }
};
exports.getSongsbyID = getSongsbyID;
const getAlbumswithSongs = (req, res) => {
    try {
        const dataFromSongs = songs_json_1.default.song.map(song => {
            const dataFromAlbum = albums_json_1.default.album.find(a => a.id === song.albumId);
            return {
                ...song,
                album: dataFromAlbum || null
            };
        });
        res.json(dataFromSongs);
        return;
    }
    catch (err) {
        console.error('Error in getAlbumswithSongs', err);
    }
};
exports.getAlbumswithSongs = getAlbumswithSongs;
const getQueries = ({ title, artist, album, limit, query }) => {
    let songs = songs_json_1.default.song;
    try {
        if (typeof title === 'string') {
            songs = songs.filter(song => song.title.toLowerCase().includes(title.toLowerCase()));
        }
        ;
        if (typeof artist === 'string') {
            console.log("checking...", artist);
            songs = songs.filter(song => song.artist.toLowerCase().includes(artist.toLowerCase()));
        }
        ;
        if (typeof album === 'string') {
            songs = songs.filter(song => {
                const object = albums_json_1.default.album.find(a => a.id === song.albumId);
                return object?.title.toLowerCase().includes(album.toLowerCase());
            });
        }
        ;
        if (typeof query === 'string') {
            const lowerQuery = query.toLowerCase();
            songs = songs.filter(song => {
                const album = albums_json_1.default.album.find(a => a.id === song.albumId);
                return (song.title.toLowerCase().includes(lowerQuery) ||
                    song.artist.toLowerCase().includes(lowerQuery) ||
                    album?.title.toLowerCase().includes(lowerQuery));
            });
        }
        ;
        if (typeof limit === 'number' && !isNaN(limit)) {
            songs = songs.slice(0, Number(limit));
        }
        ;
        return songs;
    }
    catch (err) {
        console.error('Error in getSearchParams', err);
    }
};
const getSearchParams = (req, res) => {
    try {
        const { title, artist, album, query, limit } = req.query;
        const songs = getQueries({
            title: title,
            artist: artist,
            album: album,
            query: query,
            limit: limit && !isNaN(Number(limit)) ? Number(limit) : undefined
        });
        res.json(songs);
        return;
    }
    catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSearchParams = getSearchParams;
const getSearchArtistsParams = (req, res) => {
    try {
        const { artist, query } = req.query;
        const searchedArtist = (artist || query || "").toString().toLowerCase();
        const matchedArtists = artists_json_1.default.artist.filter(a => a.title.toLowerCase().includes(searchedArtist));
        res.json(matchedArtists);
        return;
    }
    catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSearchArtistsParams = getSearchArtistsParams;
const getSearchSongsParams = (req, res) => {
    try {
        const { title, query, limit } = req.query;
        const songs = getQueries({
            title: title,
            query: query,
            limit: limit && !isNaN(Number(limit)) ? Number(limit) : undefined
        });
        res.json(songs);
        return;
    }
    catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSearchSongsParams = getSearchSongsParams;
const getSearchAlbumsParams = (req, res) => {
    try {
        const { album, query } = req.query;
        const songs = getQueries({
            album: album,
            query: query
        });
        const uniqueIds = Array.from(new Set(songs?.map(song => song.albumId)));
        const matchedAlbums = uniqueIds
            .map(id => albums_json_1.default.album.find(a => a.id === id))
            .filter(Boolean);
        res.json(matchedAlbums);
    }
    catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSearchAlbumsParams = getSearchAlbumsParams;
const getAlbumsbyID = (req, res) => {
    try {
        const albumId = Number(req.params.albumId);
        if (isNaN(albumId) || !albumId) {
            res.status(400).json({ message: 'invalid AlbumID' });
            return;
        }
        const album = albums_json_1.default.album.find(a => a.id === albumId);
        const songs = songs_json_1.default.song.filter(s => s.albumId === albumId);
        if (!album) {
            res.status(404).json({ message: 'Album not found' }); // ✅ added check
            return;
        }
        res.json({
            album,
            songs
        });
    }
    catch (err) {
        console.error('Error in getAlbumsbyID', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAlbumsbyID = getAlbumsbyID;
const getArtistsbyID = (req, res) => {
    try {
        const artistId = Number(req.params.artistId);
        if (isNaN(artistId) || !artistId) {
            res.status(400).json({ message: 'invalid artistID' });
            return;
        }
        const artist = artists_json_1.default.artist.find(a => a.id === artistId);
        res.json({
            artist
        });
    }
    catch (err) {
        console.error('error in getArtistsbyID', err);
    }
};
exports.getArtistsbyID = getArtistsbyID;
const getArtistsSongsbyID = (req, res) => {
    try {
        const artistId = Number(req.params.artistId);
        if (isNaN(artistId) || !artistId) {
            res.status(400).json({ message: 'invalid artistID' });
            return;
        }
        const artist = artists_json_1.default.artist.find(a => a.id === artistId);
        const songs = songs_json_1.default.song.filter(s => s.artist === artist?.title);
        res.json({
            ...artist,
            songs
        });
    }
    catch (err) {
        console.error('Error in getAlbumsbyID', err);
    }
};
exports.getArtistsSongsbyID = getArtistsSongsbyID;
const getAlbumSongsbyID = (req, res) => {
    try {
        const albumId = Number(req.params.albumId);
        if (isNaN(albumId) || !albumId) {
            res.status(400).json({ message: 'invalid AlbumID' });
            return;
        }
        const album = albums_json_1.default.album.find(a => a.id === albumId);
        const songs = songs_json_1.default.song.filter(s => s.albumId === albumId);
        res.json({
            album,
            songs
        });
    }
    catch (err) {
        console.error('Error in getAlbumsbyID', err);
        res.status(500).json({ message: "internal server (getAlbumSongsbyID)" });
        return;
    }
};
exports.getAlbumSongsbyID = getAlbumSongsbyID;

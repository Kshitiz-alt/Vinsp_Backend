"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlbumSongsbyID = exports.getArtistsSongsbyID = exports.getArtistsbyID = exports.getAlbumsbyID = exports.getSearchAlbumsParams = exports.getSearchSongsParams = exports.getSearchArtistsParams = exports.getSearchParams = exports.getAlbumswithSongs = exports.getSongsbyID = exports.getSongs = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const pagination_1 = require("./utils/pagination");
const db_1 = require("./utils/db");
dotenv_1.default.config();
//Static Url
const baseUrl = process.env.BUNNY_CDN;
//Limit the song data
const getLimiter = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    return {
        page,
        limit
    };
};
//to get global songs
const getSongs = async (req, res) => {
    try {
        const { page, limit } = getLimiter(req, res);
        const offSet = (page - 1) * limit;
        const totalCount = await db_1.pool.query(`SELECT COUNT(*) FROM songs`);
        const parse = parseInt(totalCount.rows[0].count);
        const { rows: songs } = await db_1.pool.query(`SELECT * FROM songs ORDER BY id LIMIT $1 OFFSET $2`, [limit, offSet]);
        const songsWithURL = songs.map(song => ({
            ...song,
            image: `${baseUrl}/${song.image}`,
            audio: `${baseUrl}/${song.audio}`
        }));
        res.json({
            page,
            limit,
            total: parse,
            result: songsWithURL
        });
        return;
    }
    catch (err) {
        console.error("error in getting songs:", err);
    }
};
exports.getSongs = getSongs;
//to get songs by their Ids
const getSongsbyID = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { rows } = await db_1.pool.query(`SELECT * FROM songs WHERE id = $1`, [id]);
        const song = rows[0];
        const songWithUrls = {
            ...song,
            audio: song.audio ? `${baseUrl}/${song.audio}` : null,
            image: song.image ? `${baseUrl}/${song.image}` : null,
        };
        res.json(songWithUrls);
    }
    catch (err) {
        console.error('Error in getSongsbyID', err);
    }
};
exports.getSongsbyID = getSongsbyID;
//to get albums with their songs
const getAlbumswithSongs = async (req, res) => {
    try {
        const { page, limit } = getLimiter(req, res);
        const { rows: albums } = await db_1.pool.query(`SELECT * FROM albums ORDER BY id`);
        const { rows: songs } = await db_1.pool.query(`SELECT * FROM songs ORDER BY id`);
        const albumMap = albums.map(album => {
            const albumSongs = songs
                .filter(song => song.albumid === album.id)
                .map(song => ({
                ...song,
                audio: `${baseUrl}/${song.audio}`,
                image: `${baseUrl}/${song.image}`
            }));
            return {
                ...album,
                songs: albumSongs
            };
        });
        const paginatedAlbum = (0, pagination_1.getPaginated)(albumMap, page, limit);
        res.json({
            page,
            limit,
            total: albumMap.length,
            result: paginatedAlbum
        });
    }
    catch (err) {
        console.error('Error in getAlbumswithSongs', err);
    }
};
exports.getAlbumswithSongs = getAlbumswithSongs;
//common function for search param 
const getQueries = async ({ title, artist, album, query, language }) => {
    const result = await db_1.pool.query('SELECT * FROM songs');
    let songs = result.rows;
    const albumRes = await db_1.pool.query("SELECT * FROM albums");
    const albumMap = new Map(albumRes.rows.map(a => [a.id, a]));
    try {
        if (title) {
            const lowerQuery = title.toLowerCase();
            songs = songs.filter(song => song.title.toLowerCase().includes(lowerQuery));
        }
        ;
        if (artist) {
            const lowerQuery = artist.toLowerCase();
            songs = songs.filter(song => song.artist.toLowerCase().includes(lowerQuery));
        }
        ;
        if (album) {
            songs = songs.filter(song => {
                const object = albumMap.get(song.albumId);
                return object?.title.toLowerCase().includes(album.toLowerCase());
            });
        }
        ;
        if (language) {
            const lowerQuery = language.toLowerCase();
            songs = songs.filter(song => song.language?.toLowerCase().includes(lowerQuery));
        }
        if (query) {
            const lowerQuery = query.toLowerCase();
            songs = songs.filter(song => {
                const album = albumMap.get(song.albumId);
                return (song.title.toLowerCase().includes(lowerQuery) ||
                    song.artist.toLowerCase().includes(lowerQuery) ||
                    album?.title.toLowerCase().includes(lowerQuery) ||
                    song.language.toLowerCase().includes(lowerQuery));
            });
        }
        ;
        return songs.map(song => ({
            ...song,
            audio: `${baseUrl}/${song.audio}`
        }));
    }
    catch (err) {
        console.error('Error in getSearchParams', err);
        return [];
    }
};
const getSearchParams = async (req, res) => {
    try {
        const { title, artist, album, query } = req.query;
        const { page, limit } = getLimiter(req, res);
        const songs = await getQueries({
            title: title,
            artist: artist,
            album: album,
            query: query,
        });
        const paginatedSearch = songs.length > limit ? (0, pagination_1.getPaginated)(songs, page, limit) : songs;
        res.json({
            page,
            limit,
            total: songs.length,
            result: paginatedSearch
        });
        return;
    }
    catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSearchParams = getSearchParams;
const getSearchArtistsParams = async (req, res) => {
    try {
        const { artist, query } = req.query;
        const { page, limit } = getLimiter(req, res);
        const searchedArtist = (artist || query || "").toString().trim().toLowerCase();
        const offset = (page - 1) * limit;
        const countQry = await db_1.pool.query(`SELECT COUNT(*) FROM artists WHERE title ILIKE $1`, [`%${searchedArtist}%`]);
        const total = Number(countQry.rows[0].count);
        const dataQuery = await db_1.pool.query(`SELECT * FROM artists WHERE title ILIKE $1 ORDER BY title ASC LIMIT $2 OFFSET $3`, [`%${searchedArtist}%`, limit, offset]);
        res.json({
            page,
            limit,
            total,
            result: dataQuery.rows
        });
    }
    catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSearchArtistsParams = getSearchArtistsParams;
const getSearchSongsParams = async (req, res) => {
    try {
        const { title, query } = req.query;
        const { page, limit } = getLimiter(req, res);
        const offset = (page - 1) * limit;
        const searchItem = (title || query || "").toString().trim();
        const result = await db_1.pool.query(`SELECT COUNT(*) FROM songs WHERE 
                title ILIKE $1 OR 
                artist ILIKE $1 OR 
                language ILIKE $1`, [`%${searchItem}%`]);
        const total = Number(result.rows[0].count);
        const dataResult = await db_1.pool.query(`SELECT * FROM songs WHERE 
                title ILIKE $1 OR 
                artist ILIKE $1 OR 
                language ILIKE $1
             ORDER BY id
             LIMIT $2 OFFSET $3`, [`%${searchItem}%`, limit, offset]);
        const songsWithURL = dataResult.rows.map(song => ({
            ...song,
            image: `${baseUrl}/${song.image}`,
            audio: `${baseUrl}/${song.audio}`
        }));
        res.json({
            page,
            limit,
            total,
            result: songsWithURL
        });
        return;
    }
    catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSearchSongsParams = getSearchSongsParams;
const getSearchAlbumsParams = async (req, res) => {
    try {
        const { album, query } = req.query;
        const { page, limit } = getLimiter(req, res);
        const offSet = (page - 1) * limit;
        const searchItem = (album || query || "").toString().trim();
        const albumIdResult = await db_1.pool.query(`SELECT DISTINCT albumId FROM songs
             WHERE title ILIKE $1 OR artist ILIKE $1 OR language ILIKE $1`, [`%${searchItem}%`]);
        const albumIds = albumIdResult.rows.map(row => row.albumid);
        if (albumIds.length === 0) {
            res.json({ page, limit, total: 0, result: [] });
            return;
        }
        const albumResult = await db_1.pool.query(`SELECT * FROM albums WHERE id = ANY($1::int[])
             LIMIT $2 OFFSET $3`, [albumIds, limit, offSet]);
        const countResult = await db_1.pool.query(`SELECT COUNT(*) FROM albums WHERE id = ANY($1::int[])`, [albumIds]);
        const total = Number(countResult.rows[0].count);
        const albumsWithImage = albumResult.rows.map(album => ({
            ...album,
            image: `${baseUrl}/${album.image}`
        }));
        const paginatedAlbums = (0, pagination_1.getPaginated)(albumsWithImage, page, limit);
        res.json({
            page,
            limit,
            total,
            result: paginatedAlbums
        });
    }
    catch (err) {
        console.error('Error in getSearchParams', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSearchAlbumsParams = getSearchAlbumsParams;
const getAlbumsbyID = async (req, res) => {
    try {
        const albumId = Number(req.params.albumId);
        if (isNaN(albumId) || !albumId) {
            res.status(400).json({ message: 'invalid AlbumID' });
            return;
        }
        const album = await db_1.pool.query(`SELECT * FROM albums WHERE id = $1`, [albumId]);
        if (album.rowCount === 0) {
            res.status(404).json({ message: "album not found" });
            return;
        }
        const albumRows = album.rows[0];
        const songs = await db_1.pool.query(`SELECT * FROM songs WHERE albumid = $1`, [albumId]);
        const songRows = songs.rows;
        albumRows.image = `${baseUrl}/${albumRows.image}`;
        const songsWithUrls = songRows.map(song => ({
            ...song,
            image: `${baseUrl}/${song.image}`,
            audio: `${baseUrl}/${song.audio}`
        }));
        res.json({
            album,
            songs: songsWithUrls
        });
    }
    catch (err) {
        console.error('Error in getAlbumsbyID', err);
        // res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAlbumsbyID = getAlbumsbyID;
const getArtistsbyID = async (req, res) => {
    try {
        const artistId = Number(req.params.artistId);
        if (isNaN(artistId) || !artistId) {
            res.status(400).json({ message: 'invalid artistID' });
            return;
        }
        const artist = await db_1.pool.query(`SELECT * FROM artists WHERE id = $1`);
        const artistRows = artist.rows[0];
        artistRows.image = `${baseUrl}/${artistRows.image}`;
        res.json({
            artist
        });
    }
    catch (err) {
        console.error('error in getArtistsbyID', err);
    }
};
exports.getArtistsbyID = getArtistsbyID;
const getArtistsSongsbyID = async (req, res) => {
    try {
        const artistId = Number(req.params.artistId);
        if (isNaN(artistId) || !artistId) {
            res.status(400).json({ message: 'invalid artistID' });
            return;
        }
        const artist = await db_1.pool.query(`SELECT * FROM artists WHERE id = $1`, [artistId]);
        const artistRows = artist.rows[0];
        const songs = await db_1.pool.query(`SELECT * FROM songs WHERE artistid = $1`, [artistId]);
        const songRows = songs.rows;
        artistRows.image = `${baseUrl}/${artistRows.image}`;
        songRows.forEach(song => {
            song.image = `${baseUrl}/${song.image}`,
                song.audio = `${baseUrl}/${song.audio}`;
        });
        res.json({
            ...artist,
            songs
        });
    }
    catch (err) {
        console.error('Error in getArtistSongsById=D', err);
    }
};
exports.getArtistsSongsbyID = getArtistsSongsbyID;
const getAlbumSongsbyID = async (req, res) => {
    try {
        const { page, limit } = getLimiter(req, res);
        const albumId = Number(req.params.albumId);
        if (isNaN(albumId) || !albumId) {
            res.status(400).json({ message: 'invalid AlbumID' });
            return;
        }
        const album = await db_1.pool.query(`SELECT * FROM albums WHERE id = $1`, [albumId]);
        const albumRows = album.rows[0];
        const songs = await db_1.pool.query(`SELECT * FROM songs WHERE albumid = $1 ORDER BY id ASC`, [albumId]);
        const allSongs = songs.rows;
        const paginatedSongs = (0, pagination_1.getPaginated)(allSongs, page, limit);
        albumRows.image = `${baseUrl}/${albumRows.image}`;
        paginatedSongs.forEach(song => {
            song.image = `${baseUrl}/${song.image}`;
            song.audio = `${baseUrl}/${song.audio}`;
        });
        res.json({
            page,
            limit,
            album,
            total: allSongs.length,
            result: paginatedSongs
        });
    }
    catch (err) {
        console.error('Error in getAlbumsbyID', err);
        res.status(500).json({ message: "internal server (getAlbumSongsbyID)" });
        return;
    }
};
exports.getAlbumSongsbyID = getAlbumSongsbyID;
// const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
// const injectLyrics = async () => {
//     const data = [];
//     const total = songData.song.length;
//     const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
//     bar.start(total, 0);
//     for (const song of songData.song) {
//         try {
//             const lyrics = await getLyrics(song.artist, song.title);
//             data.push({
//                 ...song,
//                 lyrics: lyrics
//             })
//             bar.update(data.length);
//         } catch (err: any) {
//             console.error(err.message)
//             data.push({
//                 ...song,
//                 lyrics: "Lyrics not available",
//             });
//             bar.update(data.length);
//         }
//         await sleep(1500);
//     }
//     bar.stop()
//     const output = path.join(__dirname, '../metadata/songs.json');
//     await fs.writeFile(output, JSON.stringify(data, null, 2))
// }
// if (require.main === module) {
//     injectLyrics().then(() => {
//         console.log("✅ Lyrics injection complete!");
//     }).catch(console.error);
// }

// import { pool } from "../db";
// import songData from '../../../metadata/songs.json';
// import dotenv from 'dotenv';
// dotenv.config();

// const songs = songData.song.filter(s => s.id >= 338 && s.id <= 353);


// async function stripBaseUrls() {
//   try {
//     for (const song of songs) {
//       console.log(`inserting ${song.id} with images:${song.image} & audio: ${song.audio}`);

//       await pool.query(
//          `INSERT INTO songs (id, title, artist, artistid, albumid, image, audio, duration, language, lyrics)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
//        ON CONFLICT (id) DO NOTHING`,
//         [song.id,song.title,song.artist,song.artistId,song.albumId,song.image,song.audio,song.duration,song.language,song.lyrics]
//       );
//     }

//     console.log('Successfull');
//   } catch (err) {
//     console.error('Failed to insert URLs:', err);
//   } finally {
//     await pool.end();
//   }
// }


// stripBaseUrls();

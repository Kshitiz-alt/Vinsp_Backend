import { pool } from "../db";
import songData from '../../../metadata/songs.json';
import dotenv from 'dotenv';
dotenv.config();

const songs = songData.song.filter(
  (song) => song.artist.trim().toLowerCase() === "the weeknd"
);

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
}

function sanitizeFilename(text: string) {
  return encodeURIComponent(text.replace(/[\/\\?%*:|"<>]/g, '').trim());
}

async function stripBaseUrls() {
  try {
    for (const song of songs) {
      console.log(`Updating ID ${song.id} with audio: ${song.audio}`);

      await pool.query(
        `UPDATE songs SET audio = $1 WHERE id = $2`,
        [song.audio, song.id]
      );
    }

    console.log('Successfully updated audio & image URLs.');
  } catch (err) {
    console.error('Failed to update URLs:', err);
  } finally {
    await pool.end();
  }
}


stripBaseUrls();

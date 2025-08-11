import { pool } from "../db";
import artistData from '../../../metadata/artists.json';
import songData from '../../../metadata/songs.json'
import dotenv from 'dotenv';
dotenv.config();

// const songs = songData.song;
const artists = artistData.artist.filter(a => a.id === 10012);
const songs = songData.song.filter(s => s.id >= 337);


async function Update() {
  try {
    for (const data of songs) {
      console.log(`inserting ${data.id} with images:${data.image} & duration: ${data.duration}`);

      await pool.query(
        `UPDATE songs
         SET duration = $1
         WHERE id = $2`,
        [data.duration,data.id]
      );
      console.log(`Successfull:${data.id}`);
    }

  } catch (err) {
    console.error('Failed to insert albums:', err);
  } finally {
    await pool.end();
  }
}
Update();

async function stripBaseUrls() {
  try {
    for (const song of songs) {
      console.log(`Updating ID ${song.id} with audio: ${song.audio} & image: ${song.image}`);

      await pool.query(
        `UPDATE songs
         SET audio = $1, image = $2
         WHERE id = $3`,
        [song.audio, song.image, song.id]
      );
    }

    console.log('✅ Successfully updated audio & image URLs.');
  } catch (err) {
    console.error('❌ Failed to update URLs:', err);
  } finally {
    await pool.end();
  }
}

// stripBaseUrls()

async function Insert() {
  try {
    for (const data of songs) {
      console.log(`Inserting data of ${data.id} with image:${data.image} & audio: ${data.audio}`)
      await pool.query(
        `INSERT INTO songs (id, title, artist, artistid, albumid, image, audio, duration, language, lyrics)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO NOTHING`,
        [
          data.id,
          data.title,
          data.artist,
          data.artistId,
          data.albumId,
          data.image,
          data.audio,
          data.duration,
          data.language,
          data.lyrics
        ]
      )

    }
  } catch (err) {
    console.error("Error in Inserting Data",err)

  }

}
// Insert()
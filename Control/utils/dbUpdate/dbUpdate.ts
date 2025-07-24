// updateUrls.ts
import { pool } from "../db";

import dotenv from 'dotenv';
dotenv.config();

export const oldBaseUrl = process.env.BUNNY_CDN;
async function stripBaseUrls() {
  try {

    // Update `audio`
    await pool.query(
      `UPDATE artists SET audio = REPLACE(audio, $1, '') WHERE audio LIKE $2`,
      [oldBaseUrl, `${oldBaseUrl}%`]
    );

    // Update `image`
    await pool.query(
      `UPDATE albums SET image = REPLACE(image, $1, '') WHERE image LIKE $2`,
      [oldBaseUrl, `${oldBaseUrl}%`]
    );

    console.log('Successfully stripped base URLs from audio and image.');
  } catch (err) {
    console.error('Failed to update URLs:', err);
  } finally {
    await pool.end();
  }
}

stripBaseUrls();


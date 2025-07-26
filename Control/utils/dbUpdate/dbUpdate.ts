// updateUrls.ts
import { pool } from "../db";

import dotenv from 'dotenv';
dotenv.config();

export const oldBaseUrl = process.env.BUNNY_CDN;
async function stripBaseUrls() {
  try {

    // Update `audio`
    // await pool.query(
    //   `UPDATE artists SET audio = REPLACE(audio, $1, '') WHERE audio LIKE $2`,
    //   [oldBaseUrl, `${oldBaseUrl}%`]
    // );

    // Update `image`
    await pool.query(
      `UPDATE albums SET image = REPLACE(image, $1, '') WHERE image LIKE $2`,
      [oldBaseUrl, `${oldBaseUrl}%`]
    );

    console.log('Successfully stripped base URLs from audio and image.');
  } catch (err) {
    console.error('Failed to update URLs:', err);
  }
};


async function updatedBunnyUrl() {
  try {

    await pool.query(`
       UPDATE albums SET image = '/images/theweekend/The%20Weeknd.jpg' 
         WHERE image = '/images/The%20Weeknd.jpg'
      `);

    await pool.query(
      `UPDATE albums SET image = '/images/theweekend/Gone%20(Explicit).jpg' 
         WHERE image = '/images/Gone%20(Explicit).jpg'`
    );

    await pool.query(
      `UPDATE songs 
   SET image = REPLACE(image, 'images/theweekend/The%20Weeknd.jpg','images/theweekend/Gone%20(Explicit).jpg') 
   WHERE title =  'Gone'`
    );
    console.log("successfully added folders")

  } catch (err) {
    console.error("error while replacing updatedUrl", err)
  } finally {
    await pool.end()
  }
};

async function main() {
  await stripBaseUrls()
  await updatedBunnyUrl()
}

main()


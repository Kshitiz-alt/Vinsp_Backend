"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oldBaseUrl = void 0;
// updateUrls.ts
const db_1 = require("../db");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.oldBaseUrl = process.env.BUNNY_CDN;
async function stripBaseUrls() {
    try {
        // Update `audio`
        await db_1.pool.query(`UPDATE artists SET audio = REPLACE(audio, $1, '') WHERE audio LIKE $2`, [exports.oldBaseUrl, `${exports.oldBaseUrl}%`]);
        // Update `image`
        await db_1.pool.query(`UPDATE albums SET image = REPLACE(image, $1, '') WHERE image LIKE $2`, [exports.oldBaseUrl, `${exports.oldBaseUrl}%`]);
        console.log('Successfully stripped base URLs from audio and image.');
    }
    catch (err) {
        console.error('Failed to update URLs:', err);
    }
    finally {
        await db_1.pool.end();
    }
}
stripBaseUrls();

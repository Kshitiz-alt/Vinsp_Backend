"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLyrics = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const cheerio = __importStar(require("cheerio"));
dotenv_1.default.config();
const geniusToken = process.env.GENIUS_ACCESS_TOKEN;
const lyricsCache = new Map();
;
const getLyrics = async (artist, title) => {
    const cacheKey = `${artist.toLowerCase()} - ${title.toLowerCase()}`;
    if (lyricsCache.has(cacheKey)) {
        return lyricsCache.get(cacheKey);
    }
    try {
        const searchQuery = `${title} ${artist}`;
        const res = await axios_1.default.get('https://api.genius.com/search', {
            headers: {
                Authorization: `Bearer ${geniusToken}`,
            },
            params: {
                q: searchQuery
            }
        });
        const hits = res.data.response.hits;
        if (hits.length === 0)
            return "length is 0";
        const songPath = hits[0].result.path;
        const songUrl = `https://genius.com${songPath}`;
        const pageHtml = await axios_1.default.get(songUrl).then(res => res.data);
        const $ = cheerio.load(pageHtml);
        const lyricsContainers = $('[data-lyrics-container="true"]');
        const lyrics = lyricsContainers
            .map((_, el) => $(el).text().trim())
            .get()
            .join("\n")
            .trim();
        if (lyrics.length > 0) {
            lyricsCache.set(cacheKey, lyrics);
            return lyrics;
        }
        return "lyrics not found in HTML";
    }
    catch (err) {
        console.error("error in getLyrics", err);
        return "lyrics not found";
    }
};
exports.getLyrics = getLyrics;

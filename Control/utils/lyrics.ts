import axios from "axios";
import dotenv from 'dotenv'
import * as cheerio from "cheerio";

dotenv.config()


const geniusToken = process.env.GENIUS_ACCESS_TOKEN;
const lyricsCache = new Map<string,string>();


interface lyricsTypes {
    response: {
        hits: {
            result: {
                path: string;
                full_title: string;
                [key: string]: any
            };
        }[];
    };
};




export const getLyrics = async(artist: string, title: string):Promise<string> => {

    const cacheKey = `${artist.toLowerCase()} - ${title.toLowerCase()}`
    if(lyricsCache.has(cacheKey)){
        return lyricsCache.get(cacheKey)!;  

    }
    try {

        const searchQuery = `${title} ${artist}`;
        const res = await axios.get<lyricsTypes>('https://api.genius.com/search', {
            headers: {
                Authorization: `Bearer ${geniusToken}`,
            },
            params: {
                q: searchQuery
            }
        })

        const hits = res.data.response.hits;

        if (hits.length === 0) return "length is 0";

        const songPath = hits[0].result.path;
        const songUrl = `https://genius.com${songPath}`

        const pageHtml = await axios.get(songUrl).then(res => res.data)
        const $ = cheerio.load(pageHtml as string);

        const lyricsContainers = $('[data-lyrics-container="true"]');
        const lyrics = lyricsContainers
            .map((_, el) => $(el).text().trim())
            .get()
            .join("\n")
            .trim();

        if(lyrics.length > 0){
            lyricsCache.set(cacheKey,lyrics);
            return lyrics;

        }
        return "lyrics not found in HTML"
    } catch (err) {
        console.error("error in getLyrics", err)
        return "lyrics not found"
    }
}
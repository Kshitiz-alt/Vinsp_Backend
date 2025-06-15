"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const archiver_1 = __importDefault(require("archiver"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
// router.use(express.json());
router.post("/api/download", async (req, res) => {
    const { songs } = req.body;
    const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
    res.attachment("playlist.zip");
    archive.pipe(res);
    await Promise.all(songs?.map(async (song) => {
        try {
            const response = await axios_1.default.get(song.audio, {
                responseType: "arraybuffer",
            });
            const safeTitle = (song.title || "track").replace(/[/\\?%*:|"<>]/g, "-");
            archive.append(Buffer.from(response.data), { name: `${safeTitle}.mp3` });
        }
        catch (error) {
            console.error(`failed to fetch songs:${song.title}`, error.message);
        }
    }));
    await archive.finalize();
    console.log("recieved songs", songs);
});
exports.default = router;

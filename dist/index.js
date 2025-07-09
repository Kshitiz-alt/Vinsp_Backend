"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const zipFold_1 = __importDefault(require("./routes/zipFold"));
const SongRoutes_1 = __importDefault(require("./routes/SongRoutes"));
const AlbumRoutes_1 = __importDefault(require("./routes/AlbumRoutes"));
const SearchRoutes_1 = __importDefault(require("./routes/SearchRoutes"));
const ArtistsRoutes_1 = __importDefault(require("./routes/ArtistsRoutes"));
const app = (0, express_1.default)();
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || [];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    credentials: true
}));
// app.use(cors())
const port = 5000;
app.use(express_1.default.json());
app.use('/api/search', SearchRoutes_1.default);
app.use('/api/albums', AlbumRoutes_1.default);
app.use('/api/artists', ArtistsRoutes_1.default);
app.use('/api/songs', SongRoutes_1.default);
app.use("/api", zipFold_1.default);
// Other routes, static files, etc.
app.listen(port, () => console.log(`Server running on port:${port}`));

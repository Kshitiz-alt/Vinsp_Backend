import express from 'express';
import 'dotenv/config';

import cors from 'cors'
import zip from './routes/zipFold';
import SongsRoutes from './routes/SongRoutes';
import AlbumRoutes from './routes/AlbumRoutes';
import SearchRoute from './routes/SearchRoutes';
import ArtistRoute from './routes/ArtistsRoutes';

const app = express();

const allowedOrigins = process.env.FRONTEND_URLS?.split(',') || [];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    credentials: true
}));
// app.use(cors())

const port = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/search', SearchRoute)
app.use('/api/albums', AlbumRoutes)
app.use('/api/artists', ArtistRoute)
app.use('/api/songs', SongsRoutes)
app.use("/api", zip);

// Other routes, static files, etc.
app.listen(port, () => console.log(`Server running on port:${port}`));
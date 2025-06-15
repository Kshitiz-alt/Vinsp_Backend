import express from 'express';
import 'dotenv/config';

import cors from 'cors'
import router from './routes/zipFold';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
}));

const port = process.env.PORT || 5000;

app.use(express.json());

// Register the ZIP route here
app.use(router);

// Other routes, static files, etc.
app.listen(port, () => console.log(`Server running on port:${port}`));
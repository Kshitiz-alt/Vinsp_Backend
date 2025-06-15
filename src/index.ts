import express from 'express';

import cors from 'cors'
import router from './routes/zipFold';

const app = express();

app.use(cors())

app.use(express.json());

// Register the ZIP route here
app.use(router);

// Other routes, static files, etc.
app.listen(process.env.PORT, () => console.log('Server running on https://m2-remastered.vercel.app/'));
import express from 'express';

import cors from 'cors'
import router from './routes/zipFold';

const app = express();
const port = 5000

app.use(cors())

app.use(express.json());

// Register the ZIP route here
app.use(router);

// Other routes, static files, etc.
app.listen(port, () => console.log('Server running on port 5173'));
import express from 'express';
import 'dotenv/config';

import cors from 'cors'
import router from './routes/zipFold';

const app = express();
const PORT = process.env.PORT || 5000

app.use(cors())

app.use(express.json());

// Register the ZIP route here
app.use(router);

// Other routes, static files, etc.
app.listen(PORT , () => console.log(`Server running on port:${PORT }`));
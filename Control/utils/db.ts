
import { Pool } from 'pg';
import dotenv from 'dotenv'

dotenv.config({
    path:'.env'
})

export const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT),
    ssl: process.env.DATABASE_URL?.includes('railway.internal') ?
        false :
        { rejectUnauthorized: false },
})




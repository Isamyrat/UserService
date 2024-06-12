import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});


app.use(express.json());

app.get('/history', async (req, res) => {
    console.log("Get all user action history");
    const { userId, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const result = await pool.query(
        'SELECT * FROM user_actions WHERE user_id = $1 LIMIT $2 OFFSET $3',
        [userId, limit, offset]
    );

    res.json(result.rows);
});

app.post('/history', async (req, res) => {
    console.log("Add user action");
    const { userId, action, timestamp } = req.body;
    await pool.query('INSERT INTO user_actions (user_id, action, timestamp) VALUES ($1, $2, $3)', [userId, action, timestamp]);
    res.status(201).send('Action logged');
});

app.listen(port, () => {
    console.log(`Action History service listening at http://localhost:${port}`);
});
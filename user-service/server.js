const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const app = express();
const port = 3000;

// Load environment variables from .env file
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(express.json());

app.post('/users', async (req, res) => {
    console.log("Add new user");
    const { name, email } = req.body;
    const result = await pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);
    res.json(result.rows[0]);
    await axios.post('http://localhost:3001/history', {
        userId: result.rows[0].id,
        action: 'create',
        timestamp: new Date()
    });
});

app.put('/users/:id', async (req, res) => {
    console.log("Get user by id");

    const { id } = req.params;
    const { name, email } = req.body;
    const result = await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, id]);
    res.json(result.rows[0]);

    await axios.post('http://localhost:3001/history', {
        userId: id,
        action: 'update',
        timestamp: new Date()
    });
});

app.get('/users', async (req, res) => {
    console.log("Get all users");
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
});


app.listen(port, () => {
    console.log(`User service listening at http://localhost:${port}`);
});
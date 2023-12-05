const { Pool } = require('pg');
const pool = new Pool({
    host: 'db',
    port: 5432,
    user: 'user123',
    password: 'password123',
    database: 'db123'
});

pool.on('connect', () => {
    console.log('Connected to the database');
});

// Log when an error occurs during the connection setup
pool.on('error', (err) => {
    console.error('Error during database connection setup:', err);
});

// Close the pool when the Node.js process exits
process.on('exit', () => {
    pool.end();
});

module.exports = pool;
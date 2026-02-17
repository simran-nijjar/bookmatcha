const mysql = require('mysql');

const pool = mysql.createPool(
    process.env.NODE_ENV === 'production'
        ? {
            host: process.env.MYSQLHOST,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQLDATABASE,
            port: process.env.MYSQLPORT,
            connectionLimit: 10,
          }
        : 
        {
            host: process.env.MYSQLHOST,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQLDATABASE
        }
);

// Test the connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.code, err.message, err);
    } else {
        console.log('Connected to MySQL');
        connection.release();
    }
});

module.exports = pool;
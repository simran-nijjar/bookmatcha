const mysql = require('mysql');

console.log('=== DB CONFIG DEBUG ===');
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLPORT:', process.env.MYSQLPORT);
console.log('MYSQLUSER:', process.env.MYSQLUSER);
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('======================');

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
const mysql = require('mysql');

// Connect to database
const connection = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

connection.connect((err) => {
    if (err) {
        process.exit(1);
    }
    console.log("Connected to MySQL");
});

module.exports = connection;
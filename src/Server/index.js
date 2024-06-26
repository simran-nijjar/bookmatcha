const express = require('express');
const app = express();

// Connect to database
var mysql = require('mysql');
var config = require('./config');
var connections = mysql .createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

// Connect to port
app.listen(8080, () => {
    connection.connect(function(err){
        if(err){
            console.log(err);
            throw err;
        }
        console.log('Listening on port 8080');
    });
});
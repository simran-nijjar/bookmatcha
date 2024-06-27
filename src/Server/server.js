const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mysql = require('mysql');
const config = require('../config');

// Connect to database
const connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

// Connect to port
app.listen(config.port, () => {
    connection.connect(function(err){
        if(err){
            console.log(err);
            throw err;
        }
        console.log('Listening on port ' + config.port);
    });
});


app.get('/', (request, response)=>{
    response.send('MyLibrary Application Setup Tested!')
;})

// Endpoint to handle user registration
app.post('/api/register', (request, response) => {
    const query = 'INSERT INTO MyLibraryApp.MyLibraryAppUser (Name, Email, Password) VALUES (?, ?, ?)';
    const values = [request.body['Name'],request.body['Email'],request.body['Password']];

    connection.query(query, values, function(err, results, fields) {
        if (err) {
            console.error('Failed to register user:', err);
            response.status(500).send('Failed to register user');
        } else {
            response.status(200).json('User registered successfully');
        }
    });
})
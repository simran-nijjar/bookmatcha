const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mysql = require('mysql');
const config = require('../config');
const saltRounds = 10;
const secretKey = config.jwt_key;

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
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            console.error('Error generating salt: ', err);
            response.status(500).json({ message: 'Error generating salt' });
            return;
        }
        // Hash the password
        bcrypt.hash(request.body['Password'], salt, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password: ', err);
                response.status(500).json({ message: 'Error hashing password' });
                return;
            }
            const checkEmailQuery = 'SELECT * FROM MyLibraryApp.MyLibraryAppUser WHERE Email = ?';

        connection.query(checkEmailQuery, request.body['Email'], (err, results, fields) => {
            if (err) {
                console.error('Error checking email: ', err);
                response.status(500).json({ message: 'Error checking email' });
                return;
            }
            if (results.length > 0) {
                response.status(400).json({ message: 'Email already exists' });
                return;
            }
            // Register user
            const query = 'INSERT INTO MyLibraryApp.MyLibraryAppUser (FirstName, LastName, Email, Password) VALUES (?, ?, ?, ?)';
            const values = [request.body['FirstName'], request.body['LastName'], request.body['Email'],hashedPassword];
        
            connection.query(query, values, function (err, result, fields){
                if (err) {
                    console.error('Failed to register user: ', err);
                    response.status(500).send('Failed to register user');
                } else {
                    response.status(200).json('User registered successfully');
                }
            });
        });
    });
});
});

const generateToken = (user) => {
    const payload = {
        email: user.Email
    };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

// Endpoint to handle user login
app.post('/api/login', (request, response) => {
    const query = 'SELECT * FROM MyLibraryApp.MyLibraryAppUser WHERE Email =?';
    const values = [request.body['Email'],request.body['Password']];

    connection.query(query, values, function(err, results, fields) {
        if (err) {
            console.error('Error checking for user: ', err);
            response.status(500).json({ message: 'Error checking for user' });
            return;
        }
        console.log('Results:', results);
        if (results.length == 0) {
            response.status(400).json({ message: 'User does not exist' });
            return;
        } 
        // Compared hashed password with user input password
        const user = results[0];
        bcrypt.compare(request.body['Password'], user.Password, function(err, isMatch) {
            if (err) {
                console.error('Error comparing passwords: ', err);
                response.status(500).json({ message: 'Error comparing passwords' });
                return;
            }
            if (!isMatch) {
                response.status(400).json({ message: 'Incorrect password' });
                return;
            }

            // Passwords match, send success response
            const token = generateToken(user);
            response.status(200).json({ message: 'Login successful', token });
        });
    });
});

app.post('/api/insertbook', (request, response) => {
    const query = 'INSERT INTO MyLibraryApp.Book (Name, BookID, Author) VALUES (?, ?, ?)';
    const values = [request.body['Name'], request.body['BookID'], request.body['Author']];

    connection.query(query, values, function (err, result, fields) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                console.log("Book already exists in the database.");
                response.status(200).send('Book already exists in the database.');
            } else {
                console.error("Error inserting book: ", err);
                response.status(500).send('Error inserting book');
            }
        } else {
            response.status(200).send('Book inserted successfully');
        }
    })
});

app.post('/api/savereview', (request, response) => {
    const query = 'INSERT INTO MyLibraryApp.BookReview (BookID, WrittenReview, Rating, ReviewerID, ReviewerName) VALUES (?, ?, ?, ?, ?)';
    const values = [request.body['BookID'], request.body['WrittenReview'], request.body['Rating'], request.body['ReviewerID'], request.body['ReviewerName']];

    connection.query(query, values, function(err, results, fields) {
        if (err) {
            console.error("Error inserting review: ", err);
            response.status(500).send('Error inserting review');
        } else {
            response.status(200).send('Review inserted successfully');
        }
    })
});
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

// Method to generate token for user
const generateToken = (user) => {
    const payload = {
        email: user.Email
    };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

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
                    return;
                }
                const user = {
                    Email: request.body['Email'],
                    FirstName: request.body['FirstName'],
                    LastName: request.body['LastName']
                };
                const token = generateToken(user);
                response.status(200).json({ message: 'User registered successfully', token });
            });
        });
    });
});
});

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

// Endpoint to handle inserting book when user clicks on the book
app.post('/api/insertbook', (request, response) => {
    const query = 'INSERT INTO MyLibraryApp.Book (Name, BookID, Author, ImageLink, Categories) VALUES (?, ?, ?, ?, ?)';
    const values = [request.body['Name'], request.body['BookID'], request.body['Author'], request.body['ImageLink'], request.body['Categories']];

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

// Endpoint to insert review of a book when a user saves it
app.post('/api/savereview', (request, response) => {
    const query = 'INSERT INTO MyLibraryApp.BookReview (BookID, WrittenReview, Rating, ReviewerID) VALUES (?, ?, ?, ?)';
    const values = [request.body['BookID'], request.body['WrittenReview'], request.body['Rating'], request.body['ReviewerID']];

    connection.query(query, values, function(err, results, fields) {
        if (err) {
            console.error("Error inserting review: ", err);
            response.status(500).send('Error inserting review');
        } else {
            response.status(200).send('Review inserted successfully');
        }
    })
});

// Endpoint to fetch reviews of a book when a user clicks a book
app.get('/api/fetchreviews', (request, response) => {
    console.log("Received request to fetch reviews with params: ", request.query);

    // Check if BookID is present in the request query
    if (!request.query.BookID) {
        console.error("BookID parameter is missing in the request query");
        return response.status(400).send('BookID parameter is required');
    }
    const query = 'SELECT * FROM MyLibraryApp.BookReview WHERE BookID=?';
    const values = [request.query.BookID];

    connection.query(query, values, function (err, results, fields){
        if (err) {
            console.error("Error fetching reviews: ", err);
            response.status(500).send('Error fetching reviews');
        } else {
            response.send(results);
        }
    });
});

// Endpoint to fetch name of reviewer for each review of a book
app.get('/api/fetchreviewername', (request, response) => {
    console.log("Received request to fetch reviewer names with params: ", request.query);

    // Check if BookID is present in the request query
    if (!request.query.BookID) {
        console.error("BookID parameter is missing in the request query");
        return response.status(400).send('BookID parameter is required');
    }

    const query = `
        SELECT BookReview.ReviewerID, MyLibraryAppUser.FirstName, MyLibraryAppUser.LastName
        FROM BookReview
        INNER JOIN MyLibraryAppUser ON BookReview.ReviewerID = MyLibraryAppUser.Email
        WHERE BookReview.BookID = ?
    `;
    const values = [request.query.BookID];

    connection.query(query, values, function (err, results) {
        if (err) {
            console.error("Error fetching reviewer names: ", err);
            response.status(500).send('Error fetching reviewer names');
        } else {
            response.send(results);
        }
    });
});

// Endpoint to fetch reviews posted by a user
app.get('/api/fetchuserreviews', (request, response) => {
    // Check if ReviewerID is present in the request query
    if (!request.query.ReviewerID) {
        console.error("ReviewerID parameter is missing in the request query");
        return response.status(400).send('ReviewerID parameter is required');
    }

    const query = `
        SELECT 
            BookReview.BookReviewID,
            BookReview.WrittenReview, 
            BookReview.RATING, 
            BookReview.BookID,
            BookReview.ReviewDate, 
            Book.Name AS bookTitle, 
            Book.Author AS bookAuthor
        FROM BookReview
        INNER JOIN MyLibraryAppUser ON BookReview.ReviewerID = MyLibraryAppUser.Email
        INNER JOIN Book on BookReview.BookID = Book.BookID
        WHERE BookReview.ReviewerID = ?
    `;
    const values = [request.query.ReviewerID];

    connection.query(query, values, function (err, results) {
        if (err) {
            console.error("Error fetching reviews ", err);
            response.status(500).send('Error fetching reviews');
        } else {
            response.send(results);
        } 
    });
});

// Endpoint to fetch user information
app.get('/api/fetchuserinfo', (request, response) => {
    if (!request.query.Email) {
        console.error("Email parameter is missing in the request query");
        return response.status(400).send('Email parameter is required');
    }

    const query = 'SELECT * FROM MyLibraryApp.MyLibraryAppUser WHERE Email = ?';
    const values = [request.query.Email];

    connection.query(query, values, function(err, result) {
        if (err) {
            console.error("Error fetching user info: ", err);
            response.status(500).send("Error fetching user info");
        } 
        
        if (result.length > 0) {
            response.send(result[0]); 
        } else {
            response.status(404).send("User not found");
        }
    })
});


// Endpoint to update first name
app.put('/api/updatefirstname', (request, response) => {
    // Extract data from request body
    const { FirstName, Email } = request.body;
    
    // Validate data
    if (!FirstName) {
        console.error("FirstName parameter is missing in the request body");
        return response.status(400).send('FirstName are required');
    }
    if (!Email) {
        console.error("Email parameter is missing in the request body");
        return response.status(400).send('Email is required');
    }

    // Define SQL query and values
    const query = 'UPDATE MyLibraryApp.MyLibraryAppUser SET FirstName=? WHERE Email=?';
    const values = [FirstName, Email];
    console.log("FirstName, Email: ", FirstName, Email);

    // Execute the query
    connection.query(query, values, function (err, result) {
        if (err) {
            console.error("Error updating user's first name: ", err);
            response.status(500).send("Error updating user's first name");
        } else if (result.affectedRows > 0) {
            response.json("Updated user's first name successfully");
        } else {
            console.log("result.affectedRows: ", result.affectedRows);
            response.status(404).send("User not found");
        }
    });
});

// Endpoint to update last name
app.put('/api/updatelastname', (request, response) => {
    // Extract data from request body
    const { LastName, Email } = request.body;
    
    // Validate data
    if (!LastName) {
        console.error("LastName parameter is missing in the request body");
        return response.status(400).send('LastName is required');
    }
    if (!Email) {
        console.error("Email parameter is missing in the request body");
        return response.status(400).send('Email is required');
    }

    // Define SQL query and values
    const query = 'UPDATE MyLibraryApp.MyLibraryAppUser SET LastName=? WHERE Email=?';
    const values = [LastName, Email];
    
    // Execute the query
    connection.query(query, values, function (err, result) {
        if (err) {
            console.error("Error updating user's last name: ", err);
            response.status(500).send("Error updating user's last name");
        } else if (result.affectedRows > 0) {
            response.json("Updated user's last name successfully");
        } else {
            response.status(404).send("User not found");
        }
    });
});

// Endpoint to delete review
app.delete('/api/deletereview/:id', (req, res) => {
    const reviewID = req.params.id;

    // Query to delete the review
    const query = 'DELETE FROM MyLibraryApp.BookReview WHERE BookReviewID = ?';

    connection.query(query, [reviewID], (err, result) => {
        if (err) {
            console.error('Error deleting review: ', err);
            return res.status(500).send('Error deleting review');
        }  

        if (result.affectedRows === 0) {
            return res.status(404).send('Review not found');
        }

        res.status(200).send('Review deleted successfully');
    });
});

// Endpoint to confirm password matches the backend
app.post('/api/validatepassword', (request, response) => {
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
                response.status(400).json({ message: 'Current password is not correct' });
                return;
            }
            response.status(200).json({ message: 'Password is valid'});
        });
    });
    
});

// Endpoint to update user's password
app.put('/api/updatepassword', (request, response) => {
    const { NewPassword, Email } = request.body;
    
    // Validate data
    if (!NewPassword) {
        console.error("NewPassword parameter is missing in the request body");
        return response.status(400).send('NewPassword is required');
    }
    if (!Email) {
        console.error("Email parameter is missing in the request body");
        return response.status(400).send('Email is required');
    }

    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            console.error('Error generating salt: ', err);
            response.status(500).json({ message: 'Error generating salt' });
            return;
        }

        // Hash the password
        bcrypt.hash(NewPassword, salt, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password: ', err);
                response.status(500).json({ message: 'Error hashing password' });
                return;
            }

            const query = 'UPDATE MyLibraryApp.MyLibraryAppUser SET Password=? WHERE Email =?';
            values = [hashedPassword, Email];

            connection.query(query, values, function(err, result) {
                if (err) {
                    console.error("Error updating user's last name: ", err);
                    response.status(500).send("Error updating user's last name");
                } else if (result.affectedRows > 0) {
                    response.json("Updated user's last name successfully");
                } else {
                    response.status(404).send("User not found");
                }
            })
        })
    })
});

app.get('/api/fetchusersbooks', (request, response) => {
    if (!request.query.ReviewerID) {
        console.error("ReviewerID parameter is missing in the request query");
        return response.status(400).send('ReviewerID parameter is required');
    }

    const query = `SELECT Book.BookID, Book.Name, Book.Author, BookReview.RATING FROM BOOK
                   INNER JOIN BookReview ON BookReview.BookID = Book.BookID
                   WHERE BookReview.ReviewerID=? AND BookReview.RATING >= 3`;
    const values = [request.query.ReviewerID];

    connection.query(query, values,  function(err, results) {
        if (err) {
            console.error("Error fetching books ", err);
            response.status(500).send('Error fetching books');
        } else {
            response.send(results);
        }
    })
});


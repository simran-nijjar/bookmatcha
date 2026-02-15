require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');

const corsOptions = {
    origin: process.env.FRONT_END_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  };

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Connect to port
app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + process.env.PORT);
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/google-books', require('./routes/googleBooksRoutes'));
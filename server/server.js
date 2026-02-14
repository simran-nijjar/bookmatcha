require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');

const corsOptions = {
    origin: process.env.FRONT_END_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

app.use(cors(corsOptions));
app.use(express.json());

// Connect to port
app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + process.env.PORT);
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/google-books', require('./routes/googleBooksRoutes'));
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connection = require('./config/db');

const corsOptions = {
    origin: process.env.FRONT_END_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  };

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/google-books', require('./routes/googleBooksRoutes'));
app.use('/api/shelves', require('./routes/shelfRoutes'));
app.use('/api/user-books', require('./routes/userBookRoutes'));
app.use('/api/reading-sessions', require('./routes/readingSessionRoutes'));

// Health check route for Railway
app.get('/', (req, res) => {
  res.send('Server is alive');
});

// Cleanup job - delete unverified accounts older than their verification token expiry date, runs once a day
setInterval(() => {
    const query = 'DELETE FROM users WHERE is_verified = FALSE AND verification_token_expiry < NOW()';
    connection.query(query, (err) => {
        if (err) console.error('Cleanup job failed:', err);
        else console.log('Expired unverified accounts cleaned up');
    });
}, 24 * 60 * 60 * 1000);

const PORT = process.env.PORT;

console.log("PORT ENV VALUE:", process.env.PORT);

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
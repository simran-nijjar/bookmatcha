const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');

router.post('/insertbook', auth, bookController.insertBook);
router.get('/users', auth, bookController.fetchUsersHighlyRatedBooks);
router.get('/users/recommended-books', bookController.getRecommendedBooks);
router.get('/top-rated', bookController.getTopRatedBooks);
router.get('/average-rating', bookController.getAverageRating);


module.exports = router;
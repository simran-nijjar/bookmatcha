const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.post('/insertbook', bookController.insertBook);
router.get('/users', bookController.fetchUsersHighlyRatedBooks);
router.get('/users/recommended-books', bookController.getRecommendedBooks);
router.get('/top-rated', bookController.getTopRatedBooks);
router.get('/average-rating', bookController.getAverageRating);


module.exports = router;
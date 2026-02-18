const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

router.post('/', auth, reviewController.addReview);
router.put('/', auth, reviewController.updateReview);
router.get('/', reviewController.getBookReviews);
router.delete('/:id', auth, reviewController.deleteReview);
router.get('/user', auth, reviewController.getUsersBookReviews);
router.get('/book/user', auth, reviewController.getReviewForBookByUser);

module.exports = router;
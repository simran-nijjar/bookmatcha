const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.post('/', reviewController.addReview);
router.put('/', reviewController.updateReview);
router.get('/', reviewController.getBookReviews);
router.delete('/:id', reviewController.deleteReview);
router.get('/user', reviewController.getUsersBookReviews);
router.get('/book/user', reviewController.getReviewForBookByUser);

module.exports = router;
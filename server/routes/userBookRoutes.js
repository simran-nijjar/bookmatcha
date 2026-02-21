const express = require('express');
const router = express.Router();
const userBookController = require('../controllers/userBookController');
const auth = require('../middleware/auth');

router.post('/', auth, userBookController.upsertUserBook);
router.get('/', auth, userBookController.getUserBooks);
router.get('/shelf/:shelfSlug', auth, userBookController.getBooksByShelf);
router.get('/:bookId', auth, userBookController.getShelfByBookId);
router.delete('/:bookId', auth, userBookController.removeBookFromShelf);

module.exports = router;


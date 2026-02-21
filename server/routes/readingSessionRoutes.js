const express = require('express');
const router = express.Router();
const readingSessionController = require('../controllers/readingSessionController');
const auth = require('../middleware/auth');

router.post('/', auth, readingSessionController.addReadingSession);
router.get('/', auth, readingSessionController.getUserReadingSessions);
router.get('/book/:bookId', auth, readingSessionController.getReadingSessionsByBook);
router.put('/:sessionId', auth, readingSessionController.updateReadingSession);
router.delete('/:sessionId', auth, readingSessionController.deleteReadingSession);

module.exports = router;
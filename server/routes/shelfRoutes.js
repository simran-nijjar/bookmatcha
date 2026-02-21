const express = require('express');
const router = express.Router();
const shelfController = require('../controllers/shelfController');
const auth = require('../middleware/auth');

router.get('/', auth, shelfController.getUserShelves);
router.post('/', auth, shelfController.createCustomShelf);
router.delete('/:shelfId', auth, shelfController.deleteShelf);

module.exports = router;
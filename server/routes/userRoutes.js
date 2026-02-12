const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.register);
router.post('/login', userController.login);
router.post('/validate-password', userController.validatePassword);
router.put('/password', userController.updatePassword);
router.get('/userid', userController.getUserInformation);
router.put('/userid', userController.updateUserInformation);

module.exports = router;
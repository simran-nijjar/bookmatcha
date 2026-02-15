const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/', userController.register);
router.post('/login', userController.login);
router.post('/request-password-reset', userController.requestPasswordReset);
router.post('/reset-password', userController.resetPassword);

router.post('/validate-password', auth, userController.validatePassword);
router.put('/password', auth, userController.updatePassword);
router.get('/userid', auth, userController.getUserInformation);
router.put('/userid', auth, userController.updateUserInformation);
router.post('/logout', auth, userController.logout);

module.exports = router;

const express = require('express');

const router = express.Router();

const { auth } = require('../middlewares/auth');

const {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  getUserAnalytics,
  getCurrentUserDetail,
  addEmailToUserBoard,
} = require('../controllers/user.controller');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.put('/update', auth, updateUser);
router.get('/analytics',auth, getUserAnalytics);
router.get('/userDetail', auth, getCurrentUserDetail);
router.post("/addToBoard",auth, addEmailToUserBoard);

module.exports = router;

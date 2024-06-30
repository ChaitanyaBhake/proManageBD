const express = require('express');

const router = express.Router();

const { auth } = require('../middlewares/auth');

const {
  getSingleTask,
  getTasks,
  createTask,
  updateSingleTask,
  deleteSingleTask,
} = require('../controllers/task.controller');

router.post('/createTask', auth, createTask);
router.get('/', auth, getTasks);
router.get('/:taskId', getSingleTask);
router.patch('/:taskId', auth, updateSingleTask);
router.delete('/:taskId', auth, deleteSingleTask);

module.exports = router;

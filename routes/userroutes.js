const express = require('express');
const router  = express.Router();

const { requireAdmin, requireRole, requireLogin } = require('../middleware/auth'); // ← add requireLogin

const { 
  getAllUsers, 
  getUser, 
  getUserMe,
  updateUser, 
  deleteUser, 
  createUser, 
  loginUser,
  logoutUser
} = require('../controllers/userController');

router.post('/',        createUser);
router.post('/login',   loginUser);
router.post('/logout',  logoutUser);
router.get('/me',       requireLogin,             getUserMe);   // ← before /:id
router.get('/',         requireAdmin,             getAllUsers);
router.get('/:id',      requireAdmin,             getUser);
router.put('/me',       requireRole('customer'),  updateUser);
router.delete('/:id',   requireAdmin,             deleteUser);

module.exports = router;
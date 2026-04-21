const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const { requireAdmin } = require('../middleware/auth');
const { addFood, getAllFood, getFood, updateFood, deleteFood } = require('../controllers/foodController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/',        requireAdmin,  upload.single('image'),  addFood);
router.get('/',                                                  getAllFood);
router.get('/:id',                                               getFood);
router.put('/:id', requireAdmin, upload.single('image'), updateFood);
router.delete('/:id',   requireAdmin,                            deleteFood);

module.exports = router;
const express    = require('express');
const router     = express.Router();
const { requireAdmin } = require('../middleware/auth');
const { requireLogin } = require('../middleware/auth');



const {
  loginRider,
  logoutRider,
  registerRider,
  getAllRiders,
  getRiderMe,
  getRider,
  updateRider,
  updateRiderStatus,
  deleteRider
} = require('../controllers/riderController');

router.post('/login',        loginRider); 
router.post('/logout',       logoutRider);                        
router.post('/',             requireAdmin,  registerRider);
router.get('/',              requireAdmin,  getAllRiders);
router.get('/me', requireLogin, getRiderMe);   
router.get('/:id',           requireAdmin,  getRider);
router.patch('/:id/status',  requireAdmin,  updateRiderStatus);
router.patch('/:id/all',  requireAdmin,  updateRider);
router.delete('/:id',        requireAdmin,  deleteRider);

module.exports = router;
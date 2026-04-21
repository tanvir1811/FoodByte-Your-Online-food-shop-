const express = require('express');
const router  = express.Router();
const { requireAdmin, requireRole, requireLogin } = require('../middleware/auth');
const {
  placeOrder, getAllOrders, getOrder,
  getMyOrders, getAvailableOrders, getMyDeliveries,
  acceptOrder, deliverOrder, cancelOrder, deleteOrder
} = require('../controllers/orderController');

router.post('/',               requireLogin,             placeOrder);         // any logged in user
router.get('/',                requireAdmin,             getAllOrders);
router.get('/mine',            requireRole('customer'),  getMyOrders);
router.get('/available',       requireRole('rider'),     getAvailableOrders);
router.get('/my-deliveries',   requireRole('rider'),     getMyDeliveries);
router.get('/:id',             requireAdmin,             getOrder);
router.patch('/:id/accept',    requireRole('rider'),     acceptOrder);
router.patch('/:id/deliver',   requireRole('rider'),     deliverOrder);
router.patch('/:id/cancel',    requireRole('customer'),  cancelOrder);
router.delete('/:id',          requireAdmin,           deleteOrder);

module.exports = router;
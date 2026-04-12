const { Router } = require('express');
const { createOrder, receiveWebhook, getOrders, updateTracking, deleteOrder } = require('../controllers/orderController');

const router = Router();

router.post('/', createOrder);
router.post('/webhook', receiveWebhook); // Esta es la URL que pondrás en MP
router.get('/', getOrders)
router.patch('/:id/tracking', updateTracking);
router.delete('/:id', deleteOrder);


module.exports = router;
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');

router.post('/', ctrl.create);
router.get('/restaurant/:restaurantId', ctrl.getByRestaurant);

module.exports = router;

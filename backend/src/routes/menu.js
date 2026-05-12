const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/menuController');

router.get('/item/:id', ctrl.getById);
router.get('/:restaurantId', ctrl.getByRestaurant);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
   
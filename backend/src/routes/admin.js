const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const orderCtrl = require('../controllers/orderController');
const { isAdmin } = require('../middleware');

router.get('/users', isAdmin, adminCtrl.getAll);
router.delete('/users/:id', isAdmin, adminCtrl.remove);
router.get('/orders', isAdmin, orderCtrl.getAll);

module.exports = router;
   
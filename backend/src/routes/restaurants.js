const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/restaurantController');

router.get('/', ctrl.getAll);
router.get('/owner/:ownerId', ctrl.getByOwner);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

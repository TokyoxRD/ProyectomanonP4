const { Order, OrderItem, User, Restaurant, MenuItem } = require('../models');

// POST /api/orders
exports.create = async (req, res) => {
  try {
    const { userId, restaurantId, total, deliveryTime, deliveryAddress, items } = req.body;
    if (!userId || !restaurantId || !total || !items || items.length === 0) {
      return res.status(400).json({ message: 'Datos del pedido incompletos' });
    }

    const order = await Order.create({
      userId,
      restaurantId,
      total,
      deliveryAddress,
      delivery_time: deliveryTime || 30,
      status: 'pendiente'
    });

    // Crear items del pedido
    const orderItems = items.map(i => ({
      orderId: order.id,
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      price: i.price
    }));
    await OrderItem.bulkCreate(orderItems);

    res.status(201).json({ success: true, orderId: order.id, message: 'Pedido creado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al crear pedido', error: err.message });
  }
};

// GET /api/orders/restaurant/:restaurantId
exports.getByRestaurant = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { restaurantId: req.params.restaurantId },
      include: [{ model: User, as: 'User', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

// GET /api/admin/orders (admin only)
exports.getAll = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'User', attributes: ['name'] },
        { model: Restaurant, as: 'Restaurant', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

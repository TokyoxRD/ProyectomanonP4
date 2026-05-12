const { Restaurant, User, MenuItem } = require('../models');
const { Op } = require('sequelize');

// GET /api/restaurants
exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${req.query.q}%` } },
        { address: { [Op.like]: `%${req.query.q}%` } }
      ];
    }
    const restaurants = await Restaurant.findAll({
      where,
      include: [{ model: User, as: 'User', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener restaurantes', error: err.message });
  }
};

// GET /api/restaurants/:id
exports.getById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [{ model: User, as: 'User', attributes: ['name', 'email'] }]
    });
    if (!restaurant) return res.status(404).json({ message: 'Restaurante no encontrado' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

// GET /api/restaurants/owner/:ownerId
exports.getByOwner = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { ownerId: req.params.ownerId },
      include: [{ model: MenuItem, as: 'MenuItems' }]
    });
    if (!restaurant) return res.status(404).json({ message: 'No tienes un negocio registrado' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

// POST /api/restaurants
exports.create = async (req, res) => {
  try {
    const { name, description, address, phone, lat, lng, ownerId, image } = req.body;
    if (!name || !address || !ownerId) {
      return res.status(400).json({ message: 'Nombre, dirección y dueño son requeridos' });
    }
    const existing = await Restaurant.findOne({ where: { ownerId } });
    if (existing) return res.status(400).json({ message: 'Ya tienes un negocio registrado' });

    const restaurant = await Restaurant.create({ name, description, address, phone, lat, lng, ownerId, image });
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear restaurante', error: err.message });
  }
};

// PUT /api/restaurants/:id
exports.update = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurante no encontrado' });
    await restaurant.update(req.body);
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar', error: err.message });
  }
};

// DELETE /api/restaurants/:id
exports.remove = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurante no encontrado' });
    await restaurant.destroy();
    res.json({ message: 'Restaurante eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar', error: err.message });
  }
};
   
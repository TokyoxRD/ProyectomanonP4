const { MenuItem } = require('../models');

// GET /api/menu/:restaurantId
exports.getByRestaurant = async (req, res) => {
  try {
    const items = await MenuItem.findAll({
      where: { restaurantId: req.params.restaurantId },
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener menú', error: err.message });
  }
};

// GET /api/menu/item/:id
exports.getById = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Plato no encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

// POST /api/menu
exports.create = async (req, res) => {
  try {
    const { name, description, price, category, restaurantId, image } = req.body;
    if (!name || !price || !category || !restaurantId) {
      return res.status(400).json({ message: 'Nombre, precio, categoría y restaurante son requeridos' });
    }
    if (isNaN(price) || parseFloat(price) < 0) {
      return res.status(400).json({ message: 'El precio debe ser un número válido' });
    }
    const item = await MenuItem.create({ name, description, price, category, restaurantId, image });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear plato', error: err.message });
  }
};

// PUT /api/menu/:id
exports.update = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Plato no encontrado' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar', error: err.message });
  }
};

// DELETE /api/menu/:id
exports.remove = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Plato no encontrado' });
    await item.destroy();
    res.json({ message: 'Plato eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar', error: err.message });
  }
};

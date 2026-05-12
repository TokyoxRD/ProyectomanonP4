const { User } = require('../models');

// GET /api/admin/users
exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.remove = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.email === 'admin@poyos.com') {
      return res.status(403).json({ message: 'No puedes eliminar al admin principal' });
    }
    await user.destroy();
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};
   
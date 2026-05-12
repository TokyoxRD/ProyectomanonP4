const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { notEmpty: { msg: 'El nombre del plato es requerido' } }
  },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: { args: [0], msg: 'El precio no puede ser negativo' } }
  },
  category: { type: DataTypes.STRING(80), allowNull: false },
  image: { type: DataTypes.STRING(255), allowNull: true },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'restaurants', key: 'id' }
  }
}, { tableName: 'menu_items', timestamps: true });

module.exports = MenuItem;
   
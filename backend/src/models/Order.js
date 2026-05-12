const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'restaurants', key: 'id' }
  },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  deliveryAddress: { type: DataTypes.STRING(255), allowNull: true },
  delivery_time: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
  status: {
    type: DataTypes.ENUM('pendiente', 'en camino', 'entregado'),
    defaultValue: 'pendiente'
  }
}, { tableName: 'orders', timestamps: true });

module.exports = Order;
   
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: {
    type: DataTypes.INTEGER,
    references: { model: 'orders', key: 'id' }
  },
  menuItemId: {
    type: DataTypes.INTEGER,
    references: { model: 'menu_items', key: 'id' }
  },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { tableName: 'order_items', timestamps: false });

module.exports = OrderItem;
   
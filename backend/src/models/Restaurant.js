const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Restaurant = sequelize.define('Restaurant', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { notEmpty: { msg: 'El nombre del negocio es requerido' } }
  },
  description: { type: DataTypes.TEXT, allowNull: true },
  address: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(30), allowNull: true },
  image: { type: DataTypes.STRING(255), allowNull: true },
  lat: { type: DataTypes.FLOAT, allowNull: true },
  lng: { type: DataTypes.FLOAT, allowNull: true },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  }
}, { tableName: 'restaurants', timestamps: true });

module.exports = Restaurant;

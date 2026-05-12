const bcrypt = require('bcryptjs');
const User = require('./User');
const Restaurant = require('./Restaurant');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const sequelize = require('../config/database');

// ── Asociaciones ───────────────────────────────────────────
User.hasOne(Restaurant, { foreignKey: 'ownerId', as: 'Restaurant' });
Restaurant.belongsTo(User, { foreignKey: 'ownerId', as: 'User' });

Restaurant.hasMany(MenuItem, { foreignKey: 'restaurantId', as: 'MenuItems', onDelete: 'CASCADE' });
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'Restaurant' });

User.hasMany(Order, { foreignKey: 'userId', as: 'Orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'User' });

Restaurant.hasMany(Order, { foreignKey: 'restaurantId', as: 'Orders' });
Order.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'Restaurant' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'OrderItems', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'MenuItem' });

// ── Sincronizar y crear admin por defecto ─────────────────
async function syncDB() {
  await sequelize.sync({ alter: true });

  // Crear admin por defecto si no existe
  const adminExists = await User.findOne({ where: { email: 'admin@poyos.com' } });
  if (!adminExists) {
    const hash = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@poyos.com',
      password: hash,
      role: 'admin'
    });
    console.log('✅ Admin creado: admin@poyos.com / admin123');
  }

  await seedPoyosDemoRestaurants();
}

/** Portadas y menú de ejemplo (archivos en frontend/public/uploads/seed-*.jpg) */
async function seedPoyosDemoRestaurants() {
  const demoHash = await bcrypt.hash('123456', 10);

  const first = await Restaurant.findOne({ order: [['id', 'ASC']] });
  if (first) {
    await first.update({ image: 'seed-rest-1.jpg' });
    const menuCount = await MenuItem.count({ where: { restaurantId: first.id } });
    if (menuCount === 0) {
      await MenuItem.bulkCreate([
        { restaurantId: first.id, name: 'Combo familiar', description: 'Piezas, papas y refresco', price: 18.99, category: 'Combos', image: 'seed-menu.jpg' },
        { restaurantId: first.id, name: 'Tenders x6', description: 'Crujientes con salsa', price: 9.5, category: 'Tenders', image: 'seed-menu.jpg' },
        { restaurantId: first.id, name: 'Ensalada César', description: 'Lechuga y pollo', price: 7.0, category: 'Extras', image: 'seed-menu.jpg' }
      ]);
    }
  }

  const demos = [
    {
      email: 'poyos-demo-bravo@example.com',
      ownerName: 'María Bravo',
      restName: 'Pollo Bravo RD',
      description: 'Pollo frito crujiente, ensalada y pan de ajo.',
      address: 'Av. 27 de Febrero 200, Santo Domingo',
      phone: '809-555-0101',
      lat: 18.4861,
      lng: -69.9312,
      image: 'seed-rest-2.jpg'
    },
    {
      email: 'poyos-demo-golden@example.com',
      ownerName: 'Carlos Golden',
      restName: 'Golden Wings Caribe',
      description: 'Alitas BBQ, picantes y papas caseras.',
      address: 'Calle Duarte 45, Santiago',
      phone: '809-555-0202',
      lat: 19.4512,
      lng: -70.6693,
      image: 'seed-rest-3.jpg'
    },
    {
      email: 'poyos-demo-fogon@example.com',
      ownerName: 'Ana del Fogon',
      restName: 'Pica Pollo El Fogón',
      description: 'Pica pollo dominicano, fritos y moro de habichuelas.',
      address: 'Av. Independencia 300, La Vega',
      phone: '809-555-0303',
      lat: 19.2223,
      lng: -70.5308,
      image: 'seed-rest-4.jpg'
    }
  ];

  for (const row of demos) {
    const [owner, ownerCreated] = await User.findOrCreate({
      where: { email: row.email },
      defaults: {
        name: row.ownerName,
        email: row.email,
        password: demoHash,
        role: 'business'
      }
    });
    if (!ownerCreated && owner.role !== 'business') {
      await owner.update({ role: 'business', password: demoHash });
    }

    const [rest] = await Restaurant.findOrCreate({
      where: { ownerId: owner.id },
      defaults: {
        name: row.restName,
        description: row.description,
        address: row.address,
        phone: row.phone,
        lat: row.lat,
        lng: row.lng,
        image: row.image,
        ownerId: owner.id
      }
    });
    await rest.update({
      name: row.restName,
      description: row.description,
      address: row.address,
      phone: row.phone,
      lat: row.lat,
      lng: row.lng,
      image: row.image
    });

    const n = await MenuItem.count({ where: { restaurantId: rest.id } });
    if (n === 0) {
      await MenuItem.bulkCreate([
        { restaurantId: rest.id, name: 'Combo 2 piezas', description: 'Papas medianas y bebida', price: 12.5, category: 'Combos', image: 'seed-menu.jpg' },
        { restaurantId: rest.id, name: 'Alitas x10', description: 'Salsa BBQ o picante', price: 11.0, category: 'Alitas', image: 'seed-menu.jpg' },
        { restaurantId: rest.id, name: 'Jugo natural', description: 'Naranja o chinola', price: 2.5, category: 'Bebidas', image: 'seed-menu.jpg' }
      ]);
    }
  }
}

module.exports = { User, Restaurant, MenuItem, Order, OrderItem, sequelize, syncDB };

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || 'http://localhost:3001';
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  app.set('trust proxy', 1);
}

// ── Carpeta de uploads ─────────────────────────────────────
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Multer (subida de imágenes al disco) ──────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e5);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

// ── Middleware ─────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));
app.use(session({
  secret: process.env.SESSION_SECRET || 'poyos_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    secure: isProd,
    sameSite: 'lax',
    httpOnly: true
  }
}));

// ── EJS ────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Helper: saludo dinámico ────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  const funny = ['klk va a compra pal de poyito?'];
  if (Math.random() < 0.2) return funny[0];
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// ── Middleware: pasar usuario a todas las vistas ───────────
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.greeting = getGreeting();
  next();
});

// ── Middleware: proteger rutas ─────────────────────────────
function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    if (!roles.includes(req.session.user.role)) return res.redirect('/');
    next();
  };
}

// ════════════════════════════════════════════════════════════
// RUTAS - AUTH
// ════════════════════════════════════════════════════════════

app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/login', { error: null });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    req.session.user = data.user;
    res.redirect('/');
  } catch (err) {
    const msg = err.response?.data?.message || 'Credenciales incorrectas';
    res.render('auth/login', { error: msg });
  }
});

app.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('auth/register', { error: null });
});

app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    await axios.post(`${API_URL}/api/auth/register`, { name, email, password, role });
    res.redirect('/login');
  } catch (err) {
    const msg = err.response?.data?.message || 'Error al registrarse';
    res.render('auth/register', { error: msg });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// ════════════════════════════════════════════════════════════
// RUTAS - HOME & RESTAURANTES (CLIENTE)
// ════════════════════════════════════════════════════════════

// ── PREVIEW MODE: mock user para ver la UI sin DB ────────
const MOCK_USER = { id: 0, name: 'Preview', email: 'preview@poyos.com', role: 'client' };

app.get('/', async (req, res) => {
  if (!req.session.user) req.session.user = MOCK_USER;
  res.locals.user = req.session.user;
  try {
    const { data } = await axios.get(`${API_URL}/api/restaurants`);
    res.render('client/home', { restaurants: data, query: '', activePage: 'home' });
  } catch {
    // Datos de ejemplo para preview
    const mockRestaurants = [
      { id: 1, name: 'El Rey del Pollo', address: 'Av. 27 de Febrero, Santo Domingo', image: null, description: 'El mejor pollo frito de la ciudad' },
      { id: 2, name: 'Pollo Feliz', address: 'C/ El Conde, Zona Colonial', image: null, description: 'Tenders crujientes y pica pollo dominicano' },
      { id: 3, name: 'La Casa del Tender', address: 'Av. Abraham Lincoln, Santiago', image: null, description: 'Especialistas en tenders y alitas' },
    ];
    res.render('client/home', { restaurants: mockRestaurants, query: '', activePage: 'home' });
  }
});

app.get('/restaurants', async (req, res) => {
  if (!req.session.user) req.session.user = MOCK_USER;
  res.locals.user = req.session.user;
  const q = req.query.q || '';
  try {
    const { data } = await axios.get(`${API_URL}/api/restaurants?q=${encodeURIComponent(q)}`);
    res.render('client/restaurants', { restaurants: data, query: q, activePage: 'restaurants' });
  } catch {
    const mockRestaurants = [
      { id: 1, name: 'El Rey del Pollo', address: 'Av. 27 de Febrero, Santo Domingo', image: null, description: 'El mejor pollo frito de la ciudad' },
      { id: 2, name: 'Pollo Feliz', address: 'C/ El Conde, Zona Colonial', image: null, description: 'Tenders crujientes y pica pollo dominicano' },
      { id: 3, name: 'La Casa del Tender', address: 'Av. Abraham Lincoln, Santiago', image: null, description: 'Especialistas en tenders y alitas' },
    ];
    res.render('client/restaurants', { restaurants: mockRestaurants, query: q, activePage: 'restaurants' });
  }
});

app.get('/restaurants/:id', requireAuth, async (req, res) => {
  try {
    const [restRes, menuRes] = await Promise.all([
      axios.get(`${API_URL}/api/restaurants/${req.params.id}`),
      axios.get(`${API_URL}/api/menu/${req.params.id}`)
    ]);
    res.render('client/restaurant-detail', {
      restaurant: restRes.data,
      menuItems: menuRes.data,
      activePage: 'restaurants'
    });
  } catch {
    res.redirect('/restaurants');
  }
});

// ════════════════════════════════════════════════════════════
// RUTAS - API PROXY (pedidos desde el frontend JS)
// ════════════════════════════════════════════════════════════

app.post('/api/orders', requireAuth, async (req, res) => {
  try {
    const { data } = await axios.post(`${API_URL}/api/orders`, {
      ...req.body,
      userId: req.session.user.id
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al crear pedido' });
  }
});

// ════════════════════════════════════════════════════════════
// RUTAS - NEGOCIO
// ════════════════════════════════════════════════════════════

app.get('/business/dashboard', requireRole('business', 'admin'), async (req, res) => {
  try {
    const ownerId = req.session.user.id;
    const { data: restaurant } = await axios.get(`${API_URL}/api/restaurants/owner/${ownerId}`).catch(() => ({ data: null }));
    let menuItems = [], orders = [], stats = { totalItems: 0, totalOrders: 0, totalRevenue: 0 };

    if (restaurant) {
      const [menuRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/api/menu/${restaurant.id}`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/orders/restaurant/${restaurant.id}`, {
          headers: { 'x-user-id': ownerId, 'x-user-role': req.session.user.role }
        }).catch(() => ({ data: [] }))
      ]);
      menuItems = menuRes.data;
      orders = ordersRes.data;
      stats.totalItems = menuItems.length;
      stats.totalOrders = orders.length;
      stats.totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
    }

    res.render('business/dashboard', { restaurant, menuItems, orders, stats, activePage: 'business' });
  } catch {
    res.render('business/dashboard', { restaurant: null, menuItems: [], orders: [], stats: { totalItems: 0, totalOrders: 0, totalRevenue: 0 }, activePage: 'business' });
  }
});

app.get('/business/create', requireRole('business', 'admin'), (req, res) => {
  res.render('business/form', { restaurant: null, error: null, activePage: 'business' });
});

app.post('/business/create', requireRole('business', 'admin'), upload.single('image'), async (req, res) => {
  try {
    const payload = { ...req.body, ownerId: req.session.user.id };
    if (req.file) payload.image = req.file.filename;
    await axios.post(`${API_URL}/api/restaurants`, payload);
    res.redirect('/business/dashboard');
  } catch (err) {
    const msg = err.response?.data?.message || 'Error al registrar negocio';
    res.render('business/form', { restaurant: null, error: msg, activePage: 'business' });
  }
});

app.get('/business/edit', requireRole('business', 'admin'), async (req, res) => {
  try {
    const { data: restaurant } = await axios.get(`${API_URL}/api/restaurants/owner/${req.session.user.id}`);
    res.render('business/form', { restaurant, error: null, activePage: 'business' });
  } catch {
    res.redirect('/business/dashboard');
  }
});

app.post('/business/edit', requireRole('business', 'admin'), upload.single('image'), async (req, res) => {
  try {
    const { data: restaurant } = await axios.get(`${API_URL}/api/restaurants/owner/${req.session.user.id}`);
    const payload = { ...req.body };
    if (req.file) payload.image = req.file.filename;
    await axios.put(`${API_URL}/api/restaurants/${restaurant.id}`, payload);
    res.redirect('/business/dashboard');
  } catch (err) {
    const msg = err.response?.data?.message || 'Error al actualizar';
    res.render('business/form', { restaurant: null, error: msg, activePage: 'business' });
  }
});

app.post('/business/delete', requireRole('business', 'admin'), async (req, res) => {
  try {
    const { data: restaurant } = await axios.get(`${API_URL}/api/restaurants/owner/${req.session.user.id}`);
    await axios.delete(`${API_URL}/api/restaurants/${restaurant.id}`);
  } catch {}
  res.redirect('/business/dashboard');
});

// ── Menu items ─────────────────────────────────────────────

app.get('/business/menu/new', requireRole('business', 'admin'), (req, res) => {
  res.render('business/menu-form', { item: null, error: null, activePage: 'business' });
});

app.post('/business/menu/new', requireRole('business', 'admin'), upload.single('image'), async (req, res) => {
  try {
    const { data: restaurant } = await axios.get(`${API_URL}/api/restaurants/owner/${req.session.user.id}`);
    const payload = { ...req.body, restaurantId: restaurant.id };
    if (req.file) payload.image = req.file.filename;
    await axios.post(`${API_URL}/api/menu`, payload);
    res.redirect('/business/dashboard');
  } catch (err) {
    const msg = err.response?.data?.message || 'Error al agregar plato';
    res.render('business/menu-form', { item: null, error: msg, activePage: 'business' });
  }
});

app.get('/business/menu/edit/:id', requireRole('business', 'admin'), async (req, res) => {
  try {
    const { data: item } = await axios.get(`${API_URL}/api/menu/item/${req.params.id}`);
    res.render('business/menu-form', { item, error: null, activePage: 'business' });
  } catch {
    res.redirect('/business/dashboard');
  }
});

app.post('/business/menu/edit/:id', requireRole('business', 'admin'), upload.single('image'), async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.file) payload.image = req.file.filename;
    await axios.put(`${API_URL}/api/menu/${req.params.id}`, payload);
    res.redirect('/business/dashboard');
  } catch (err) {
    const msg = err.response?.data?.message || 'Error al actualizar plato';
    res.render('business/menu-form', { item: null, error: msg, activePage: 'business' });
  }
});

app.post('/business/menu/delete/:id', requireRole('business', 'admin'), async (req, res) => {
  try { await axios.delete(`${API_URL}/api/menu/${req.params.id}`); } catch {}
  res.redirect('/business/dashboard');
});

// ════════════════════════════════════════════════════════════
// RUTAS - ADMIN
// ════════════════════════════════════════════════════════════

app.get('/admin', requireRole('admin'), async (req, res) => {
  try {
    const [usersRes, restsRes, ordersRes] = await Promise.all([
      axios.get(`${API_URL}/api/admin/users`, { headers: { 'x-user-role': 'admin' } }),
      axios.get(`${API_URL}/api/restaurants`),
      axios.get(`${API_URL}/api/admin/orders`, { headers: { 'x-user-role': 'admin' } })
    ]);
    const orders = ordersRes.data;
    const stats = {
      totalUsers: usersRes.data.length,
      totalRestaurants: restsRes.data.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + parseFloat(o.total || 0), 0)
    };
    res.render('admin/index', {
      users: usersRes.data,
      restaurants: restsRes.data,
      orders,
      stats,
      activePage: 'admin'
    });
  } catch {
    res.render('admin/index', { users: [], restaurants: [], orders: [], stats: {}, activePage: 'admin' });
  }
});

app.post('/admin/users/delete/:id', requireRole('admin'), async (req, res) => {
  try { await axios.delete(`${API_URL}/api/admin/users/${req.params.id}`, { headers: { 'x-user-role': 'admin' } }); } catch {}
  res.redirect('/admin');
});

app.post('/admin/restaurants/delete/:id', requireRole('admin'), async (req, res) => {
  try { await axios.delete(`${API_URL}/api/restaurants/${req.params.id}`); } catch {}
  res.redirect('/admin');
});

// ── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send(`
    <div style="font-family:Inter,sans-serif;text-align:center;padding:4rem;">
      <div style="font-size:4rem;">🍗</div>
      <h2>Página no encontrada</h2>
      <p style="color:#777;">No encontramos lo que buscabas.</p>
      <a href="/" style="color:#D62B2B;font-weight:700;">← Volver al inicio</a>
    </div>
  `);
});

app.listen(PORT, () => {
  const where = isProd ? `puerto ${PORT} (producción)` : `http://localhost:${PORT}`;
  console.log(`🍗 PoYos Frontend corriendo en ${where}`);
});
  
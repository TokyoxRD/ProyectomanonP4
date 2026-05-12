require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { logger, errorHandler } = require('./src/middleware');
const { syncDB } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// ── Middleware global ────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// ── Rutas ────────────────────────────────────────────────
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/restaurants', require('./src/routes/restaurants'));
app.use('/api/menu', require('./src/routes/menu'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/admin', require('./src/routes/admin'));

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🍗 PoYos API corriendo', timestamp: new Date() });
});

// ── 404 ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// ── Error handler global ─────────────────────────────────
app.use(errorHandler);

// ── Iniciar servidor ─────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const need = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  const missing = need.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
  if (missing.length) {
    console.error('❌ Faltan variables de entorno en el backend:', missing.join(', '));
    console.error('   Revisa Render → Environment (DB_*, NODE_ENV=production).');
    process.exit(1);
  }
}

app.listen(PORT, '0.0.0.0', () => {
  const hint = process.env.NODE_ENV === 'production' ? `puerto ${PORT}` : `http://localhost:${PORT}`;
  console.log(`🍗 PoYos API escuchando en ${hint}`);
  syncDB()
    .then(() => console.log('✅ Base de datos conectada y modelos sincronizados'))
    .catch((err) => {
      console.error('❌ Error al conectar / sincronizar la base de datos:', err.message);
      if (err.original) console.error('   Detalle:', err.original.message || err.original);
      console.error('   Comprueba DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME y SSL (NODE_ENV=production o DB_SSL=true).');
      process.exit(1);
    });
});

// Middleware para verificar rol de admin
exports.isAdmin = (req, res, next) => {
  const role = req.headers['x-user-role'];
  if (role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado: solo administradores' });
  }
  next();
};

// Middleware de logging de peticiones
exports.logger = (req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.path}`);
  next();
};

// Middleware de manejo de errores global
exports.errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor'
  });
};

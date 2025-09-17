const jwt = require('jsonwebtoken');
const JWT_SECRET = 'pixelgate_secret';

exports.requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Faça login para acessar esta página.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido. Faça login novamente.' });
  }
};

exports.requireAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Faça login.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role_id !== 2) { // 2 = Administrator
      return res.status(403).json({ error: 'Acesso permitido apenas para administradores.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};
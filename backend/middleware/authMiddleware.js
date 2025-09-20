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

exports.requirePermission = (permissionId) => async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Faça login para acessar esta página.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    // Verifica permissão no banco
    const db = require('../database');
    const hasPermission = await db.query(
      `SELECT 1 FROM role_permissions WHERE role_id = $1 AND permission_id = $2`,
      [decoded.role_id, permissionId]
    );
    if (hasPermission.rows.length === 0) {
      return res.status(403).json({ error: 'Você não tem permissão para esta ação.' });
    }
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido. Faça login novamente.' });
  }
};
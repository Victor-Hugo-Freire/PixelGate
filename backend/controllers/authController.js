const db = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "pixelgate_secret"; // Troque por variável de ambiente em produção

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    // Verifica se já existe um cookie de autenticação
    if (req.cookies && req.cookies.token) {
      return res.status(400).json({
        error:
          "Você já está logado. Faça logout para registrar um novo usuário.",
      });
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        error: "Nome, email e senha (mínimo 6 caracteres) são obrigatórios.",
      });
    }
    // Padroniza email
    if (!email.endsWith("@gmail.com")) {
      return res
        .status(400)
        .json({ error: "O email deve terminar com @gmail.com." });
    }

    // Verifica se já existe usuário com mesmo nome ou email
    const normalizedName = name.trim().replace(/\s+/g, " ").toLowerCase();
    const exists = await db.query(
      `SELECT 1 FROM users WHERE LOWER(TRIM(REPLACE(name, '  ', ' '))) = $1 OR email = $2`,
      [normalizedName, email]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Nome ou email já cadastrado." });
    }

    // Busca role_id do "Client"
    const roleResult = await db.query(
      "SELECT role_id FROM roles WHERE name = 'Client' LIMIT 1"
    );
    if (roleResult.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Role padrão 'Client' não encontrada." });
    }
    const role_id = roleResult.rows[0].role_id;

    // Gera hash da senha
    const password_hash = await bcrypt.hash(password, 10);

    // Cria usuário
    const userResult = await db.query(
      "INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role_id",
      [name, email, password_hash, role_id]
    );
    const user = userResult.rows[0];

    // Cria carrinho automaticamente
    await db.query("INSERT INTO carts (user_id) VALUES ($1)", [user.user_id]);

    // Gera token JWT para login automático
    const token = jwt.sign(
      { user_id: user.user_id, name: user.name, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Seta cookie HTTPOnly
    res.cookie("token", token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });

    res.status(201).json({
      message: "Usuário cadastrado e logado com sucesso!",
      user,
      token,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao cadastrar usuário", details: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    // Verifica se já existe um cookie de autenticação
    if (req.cookies && req.cookies.token) {
      return res.status(400).json({ error: "Você já está logado." });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios." });
    }

    // Busca usuário pelo email
    const userResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Usuário ou senha incorretos." });
    }
    const user = userResult.rows[0];

    // Verifica se o nome é igual
    if (user.name !== name) {
      return res.status(401).json({ error: "Usuário ou senha incorretos." });
    }

    // Verifica senha (hash)
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Usuário ou senha incorretos." });
    }

    // Gera token JWT
    const token = jwt.sign(
      { user_id: user.user_id, name: user.name, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Seta cookie HTTPOnly
    res.cookie("token", token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
    res.json({ message: "Login realizado com sucesso!", token });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao fazer login", details: err.message });
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  if (!req.cookies || !req.cookies.token) {
    return res.status(401).json({ error: "Você não está logado." });
  }
  res.clearCookie("token");
  res.json({ message: "Logout realizado com sucesso!" });
};

exports.requireAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Acesso negado. Faça login." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role_id !== 2) {
      // 2 = Administrator
      return res
        .status(403)
        .json({ error: "Acesso permitido apenas para administradores." });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido." });
  }
};

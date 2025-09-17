const db = require("../database");
const bcrypt = require("bcrypt");

// Listar todos os usuários
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT user_id, name, email, role_id FROM users"
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar usuários", details: err.message });
  }
};

// Buscar usuário por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT user_id, name, email, role_id FROM users WHERE user_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar usuário", details: err.message });
  }
};

// Criar usuário (apenas admin)
exports.create = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;
    if (!name || !email || !password || password.length < 6 || !role_id) {
      return res
        .status(400)
        .json({
          error:
            "Nome, email, senha (mínimo 6 caracteres) e role_id são obrigatórios.",
        });
    }

    // Verifica se já existe usuário com mesmo nome ou email
    const exists = await db.query(
      "SELECT 1 FROM users WHERE name = $1 OR email = $2",
      [name, email]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Nome ou email já cadastrado." });
    }

    // Gera hash da senha
    const password_hash = await bcrypt.hash(password, 10);

    // Cria usuário
    const userResult = await db.query(
      "INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role_id",
      [name, email, password_hash, role_id]
    );
    const user_id = userResult.rows[0].user_id;

    // Cria carrinho automaticamente
    await db.query("INSERT INTO carts (user_id) VALUES ($1)", [user_id]);

    res
      .status(201)
      .json({
        message: "Usuário criado com sucesso!",
        user: userResult.rows[0],
      });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao criar usuário", details: err.message });
  }
};

// Editar usuário
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role_id } = req.body;

    // Atualiza os dados do usuário
    const result = await db.query(
      "UPDATE users SET name = $1, email = $2, role_id = $3 WHERE user_id = $4 RETURNING user_id, name, email, role_id",
      [name, email, role_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json({
      message: "Usuário atualizado com sucesso!",
      user: result.rows[0],
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao atualizar usuário", details: err.message });
  }
};

// Deletar usuário
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING user_id, name, email, role_id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json({
      message: "Usuário deletado com sucesso!",
      user: result.rows[0],
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao deletar usuário", details: err.message });
  }
};

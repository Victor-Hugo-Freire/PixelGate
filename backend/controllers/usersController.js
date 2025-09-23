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

// Criar usuário
exports.create = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;
    if (!name || !email || !password || password.length < 6 || !role_id) {
      return res.status(400).json({
        error:
          "Nome, email, senha (mínimo 6 caracteres) e role_id são obrigatórios.",
      });
    }
    if (!email.endsWith("@gmail.com")) {
      return res
        .status(400)
        .json({ error: "O email deve terminar com @gmail.com." });
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

    res.status(201).json({
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
    let { name, email, role_id } = req.body;
    if (!email.endsWith("@gmail.com")) {
      return res
        .status(400)
        .json({ error: "O email deve terminar com @gmail.com." });
    }

    // Normaliza nome: remove espaços extras e converte para minúsculas
    const normalizedName = name.trim().replace(/\s+/g, " ").toLowerCase();

    // Previna o admin de editar sua própria conta
    if (parseInt(id) === req.user.user_id) {
      return res.status(403).json({
        error: "Você não pode editar sua própria conta pelo CRUD de usuários.",
      });
    }

    // Verifique se o usuário a ser editado é admin
    const userToEdit = await db.query(
      "SELECT role_id FROM users WHERE user_id = $1",
      [id]
    );
    if (userToEdit.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    if (userToEdit.rows[0].role_id === 2) {
      // 2 = Administrator
      const hasPermission = await db.query(
        `SELECT 1 FROM role_permissions rp
         JOIN users u ON u.role_id = rp.role_id
         WHERE rp.permission_id = 9 AND u.user_id = $1`,
        [req.user.user_id]
      );
      if (hasPermission.rows.length === 0) {
        return res.status(403).json({
          error: "Você não tem permissão para editar administradores.",
        });
      }
    }

    // Verifica duplicidade de nome ou email (normalizado)
    const exists = await db.query(
      `SELECT user_id FROM users
       WHERE (LOWER(TRIM(REPLACE(name, '  ', ' '))) = $1 OR email = $2)
       AND user_id <> $3`,
      [normalizedName, email, id]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Nome ou email já cadastrado." });
    }

    // Atualiza os dados do usuário
    const result = await db.query(
      "UPDATE users SET name = $1, email = $2, role_id = $3 WHERE user_id = $4 RETURNING user_id, name, email, role_id",
      [name.trim().replace(/\s+/g, " "), email, role_id, id]
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

    // Previna o admin de deletar sua própria conta
    if (parseInt(id) === req.user.user_id) {
      return res.status(403).json({
        error: "Você não pode deletar sua própria conta pelo CRUD de usuários.",
      });
    }

    // Antes de deletar, verifique se o usuário a ser deletado é admin
    const userToDelete = await db.query(
      "SELECT role_id FROM users WHERE user_id = $1",
      [id]
    );
    if (userToDelete.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    if (userToDelete.rows[0].role_id === 2) {
      // 2 = Administrator
      // Verifique se o usuário logado tem a permissão delete_admin_user
      const hasPermission = await db.query(
        `SELECT 1 FROM role_permissions rp
         JOIN users u ON u.role_id = rp.role_id
         WHERE rp.permission_id = 8 AND u.user_id = $1`,
        [req.user.user_id]
      );
      if (hasPermission.rows.length === 0) {
        return res.status(403).json({
          error: "Você não tem permissão para excluir administradores.",
        });
      }
    }

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

// Buscar permissões do usuário
exports.getPermissions = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await db.query(
      `SELECT p.permission_id
         FROM users u
         JOIN roles r ON u.role_id = r.role_id
         JOIN role_permissions rp ON r.role_id = rp.role_id
         JOIN permissions p ON rp.permission_id = p.permission_id
        WHERE u.user_id = $1`,
      [user_id]
    );
    res.json(result.rows.map((r) => r.permission_id));
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar permissões", details: err.message });
  }
};

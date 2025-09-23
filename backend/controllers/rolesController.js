const db = require("../database");

// GET /api/roles
exports.getAll = async (req, res) => {
  try {
    // Busca roles + permissões associadas
    const result = await db.query(`
      SELECT r.role_id, r.name, r.description,
        COALESCE(
          ARRAY_AGG(rp.permission_id) FILTER (WHERE rp.permission_id IS NOT NULL),
          '{}'
        ) AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      GROUP BY r.role_id
      ORDER BY r.role_id
    `);
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar roles", details: err.message });
  }
};

// GET /api/roles/:id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    // Busca role + permissões associadas
    const result = await db.query(
      `
      SELECT r.role_id, r.name, r.description,
        COALESCE(
          ARRAY_AGG(rp.permission_id) FILTER (WHERE rp.permission_id IS NOT NULL),
          '{}'
        ) AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      WHERE r.role_id = $1
      GROUP BY r.role_id
    `,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Role não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar role", details: err.message });
  }
};

// POST /api/roles
exports.create = async (req, res) => {
  try {
    const { name, description, permission_ids } = req.body;
    if (!name || name === "Client") {
      return res
        .status(400)
        .json({ error: "Não é permitido criar outro cargo 'Client'." });
    }
    // Cria role
    const result = await db.query(
      "INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING role_id, name, description",
      [name, description]
    );
    const role = result.rows[0];
    // Associa permissões
    if (Array.isArray(permission_ids)) {
      for (const pid of permission_ids) {
        await db.query(
          "INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [role.role_id, pid]
        );
      }
    }
    // Retorna role + permissões
    const roleWithPerms = await db.query(
      `
      SELECT r.role_id, r.name, r.description,
        COALESCE(
          ARRAY_AGG(rp.permission_id) FILTER (WHERE rp.permission_id IS NOT NULL),
          '{}'
        ) AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      WHERE r.role_id = $1
      GROUP BY r.role_id
    `,
      [role.role_id]
    );
    res.status(201).json(roleWithPerms.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar role", details: err.message });
  }
};

// PUT /api/roles/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permission_ids } = req.body;
    // Bloqueia edição da role "Client"
    const clientRole = await db.query(
      "SELECT role_id FROM roles WHERE name = 'Client' LIMIT 1"
    );
    if (clientRole.rows.length && parseInt(id) === clientRole.rows[0].role_id) {
      if (name !== "Client") {
        return res
          .status(400)
          .json({ error: "Não é permitido renomear o cargo padrão 'Client'." });
      }
      // Não permite alterar permissões do Client
      return res
        .status(400)
        .json({ error: "Não é permitido editar o cargo padrão 'Client'." });
    }
    // Atualiza role
    const result = await db.query(
      "UPDATE roles SET name = $1, description = $2 WHERE role_id = $3 RETURNING role_id, name, description",
      [name, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Role não encontrada" });
    }
    // Atualiza permissões
    await db.query("DELETE FROM role_permissions WHERE role_id = $1", [id]);
    if (Array.isArray(permission_ids)) {
      for (const pid of permission_ids) {
        await db.query(
          "INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [id, pid]
        );
      }
    }
    // Retorna role + permissões
    const roleWithPerms = await db.query(
      `
      SELECT r.role_id, r.name, r.description,
        COALESCE(
          ARRAY_AGG(rp.permission_id) FILTER (WHERE rp.permission_id IS NOT NULL),
          '{}'
        ) AS permissions
      FROM roles r
      LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
      WHERE r.role_id = $1
      GROUP BY r.role_id
    `,
      [id]
    );
    res.json(roleWithPerms.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao atualizar role", details: err.message });
  }
};

// DELETE /api/roles/:id
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    // Bloqueia exclusão da role "Client"
    const clientRole = await db.query(
      "SELECT role_id FROM roles WHERE name = 'Client' LIMIT 1"
    );
    if (clientRole.rows.length && parseInt(id) === clientRole.rows[0].role_id) {
      return res
        .status(400)
        .json({ error: "Não é permitido excluir o cargo padrão 'Client'." });
    }
    // Remove permissões associadas
    await db.query("DELETE FROM role_permissions WHERE role_id = $1", [id]);
    // Atualiza usuários para "Client"
    if (clientRole.rows.length) {
      await db.query("UPDATE users SET role_id = $1 WHERE role_id = $2", [
        clientRole.rows[0].role_id,
        id,
      ]);
    }
    // Exclui role
    const result = await db.query(
      "DELETE FROM roles WHERE role_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Role não encontrada" });
    }
    res.json({
      message:
        "Role excluída, permissões removidas e usuários reassociados para 'Client'",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao remover role", details: err.message });
  }
};

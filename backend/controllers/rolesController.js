const db = require('../database');

// GET /api/roles
exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM roles ORDER BY role_id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar roles', details: err.message });
  }
};

// GET /api/roles/:id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM roles WHERE role_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar role', details: err.message });
  }
};

// POST /api/roles
exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await db.query(
      'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar role', details: err.message });
  }
};

// PUT /api/roles/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const result = await db.query(
      'UPDATE roles SET name = $1, description = $2 WHERE role_id = $3 RETURNING *',
      [name, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar role', details: err.message });
  }
};

// DELETE /api/roles/:id
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Buscar o role_id da role padrão "Client"
    const clientRoleResult = await db.query(
      "SELECT role_id FROM roles WHERE name = 'Client' LIMIT 1"
    );
    if (clientRoleResult.rows.length === 0) {
      return res.status(400).json({ error: "Role padrão 'Client' não encontrada. Crie a role 'Client' antes de excluir outras roles." });
    }
    const clientRoleId = clientRoleResult.rows[0].role_id;

    // 2. Remover permissões associadas a esse role em role_permissions
    await db.query(
      "DELETE FROM role_permissions WHERE role_id = $1",
      [id]
    );

    // 3. Atualizar todos os usuários com a role a ser excluída para a role "Client"
    await db.query(
      "UPDATE users SET role_id = $1 WHERE role_id = $2",
      [clientRoleId, id]
    );

    // 4. Excluir a role
    const result = await db.query(
      "DELETE FROM roles WHERE role_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Role não encontrada" });
    }

    res.json({ message: "Role excluída, permissões removidas e usuários reassociados para 'Client'" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover role", details: err.message });
  }
};
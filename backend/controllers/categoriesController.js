const db = require("../database");

exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM categories ORDER BY category_id"
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar categorias", details: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT * FROM categories WHERE category_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar categoria", details: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Nome da categoria obrigatório." });
    }
    // Verifica duplicidade
    const exists = await db.query(
      "SELECT category_id FROM categories WHERE LOWER(name) = LOWER($1)",
      [name.trim()]
    );
    if (exists.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Já existe uma categoria com esse nome." });
    }
    // Cria nova categoria (agora aceita description)
    const result = await db.query(
      "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *",
      [name.trim(), description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao criar categoria", details: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Nome obrigatório" });
    }
    // Verifica duplicidade
    const exists = await db.query(
      "SELECT category_id FROM categories WHERE LOWER(name) = LOWER($1) AND category_id <> $2",
      [name.trim(), id]
    );
    if (exists.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Já existe uma categoria com esse nome." });
    }
    const result = await db.query(
      "UPDATE categories SET name = $1, description = $2 WHERE category_id = $3 RETURNING *",
      [name.trim(), description || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao atualizar categoria", details: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM categories WHERE category_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }
    res.json({
      message: "Categoria deletada com sucesso!",
      category: result.rows[0],
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao deletar categoria", details: err.message });
  }
};

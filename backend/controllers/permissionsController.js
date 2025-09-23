const db = require("../database");

// GET /api/permissions
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM permissions ORDER BY permission_id"
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar permissões", details: err.message });
  }
};

// GET /api/permissions/:id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT * FROM permissions WHERE permission_id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Permissão não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar permissão", details: err.message });
  }
};

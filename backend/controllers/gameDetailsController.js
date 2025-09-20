const db = require("../database");

// GET /api/game-details
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT gd.game_id, g.title, gd.min_requirements, gd.recommended_requirements
       FROM game_details gd
       JOIN games g ON gd.game_id = g.game_id
       ORDER BY gd.game_id`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar detalhes de jogos", details: err.message });
  }
};

// GET /api/game-details/:id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT gd.game_id, g.title, gd.min_requirements, gd.recommended_requirements
       FROM game_details gd
       JOIN games g ON gd.game_id = g.game_id
       WHERE gd.game_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Detalhes do jogo não encontrados" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar detalhes do jogo", details: err.message });
  }
};

// POST /api/game-details
exports.create = async (req, res) => {
  try {
    const { game_id, min_requirements, recommended_requirements } = req.body;
    if (!game_id || !min_requirements || !recommended_requirements) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }
    // Verifica se já existe detalhes para esse jogo
    const exists = await db.query(
      "SELECT 1 FROM game_details WHERE game_id = $1",
      [game_id]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Detalhes já cadastrados para este jogo." });
    }
    const result = await db.query(
      "INSERT INTO game_details (game_id, min_requirements, recommended_requirements) VALUES ($1, $2, $3) RETURNING *",
      [game_id, min_requirements, recommended_requirements]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar detalhes do jogo", details: err.message });
  }
};

// PUT /api/game-details/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { min_requirements, recommended_requirements } = req.body;
    if (!min_requirements || !recommended_requirements) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }
    const result = await db.query(
      "UPDATE game_details SET min_requirements = $1, recommended_requirements = $2 WHERE game_id = $3 RETURNING *",
      [min_requirements, recommended_requirements, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Detalhes do jogo não encontrados" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar detalhes do jogo", details: err.message });
  }
};

// DELETE /api/game-details/:id
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM game_details WHERE game_id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Detalhes do jogo não encontrados" });
    }
    res.json({ message: "Detalhes do jogo removidos com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover detalhes do jogo", details: err.message });
  }
};
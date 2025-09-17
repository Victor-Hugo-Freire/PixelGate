const db = require('../database');

// GET /api/library/:user_id
exports.getByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await db.query(
      `SELECT l.library_id, l.added_at, g.*
         FROM library l
         JOIN games g ON l.game_id = g.game_id
        WHERE l.user_id = $1
        ORDER BY l.added_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar biblioteca', details: err.message });
  }
};

// POST /api/library
exports.addGame = async (req, res) => {
  try {
    const { user_id, game_id } = req.body;
    // Verifica se já existe o jogo na biblioteca do usuário
    const exists = await db.query(
      'SELECT 1 FROM library WHERE user_id = $1 AND game_id = $2',
      [user_id, game_id]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Jogo já está na biblioteca do usuário.' });
    }
    const result = await db.query(
      'INSERT INTO library (user_id, game_id) VALUES ($1, $2) RETURNING *',
      [user_id, game_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar jogo à biblioteca', details: err.message });
  }
};
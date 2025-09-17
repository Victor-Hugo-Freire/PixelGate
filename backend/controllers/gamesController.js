const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/gamesController');
const db = require('../database');

// Exemplo de rota
router.get("/", (req, res) => {
  res.json({ message: "Rota de games funcionando!" });
});

router.get('/:id', gamesController.getById);

const db = require('../database');

// GET /api/games/:id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT g.*, gd.min_requirements, gd.recommended_requirements
      FROM games g
      LEFT JOIN game_details gd ON g.game_id = gd.game_id
      WHERE g.game_id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jogo não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar jogo', details: err.message });
  }
};

module.exports = router;
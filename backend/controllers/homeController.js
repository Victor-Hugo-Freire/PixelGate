const db = require('../database');

// Slider
exports.getSlider = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT hs.slider_id, hs.display_order, g.*
      FROM home_slider hs
      JOIN games g ON hs.game_id = g.game_id
      ORDER BY hs.display_order ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar slider', details: err.message });
  }
};

// Jogos agrupados por categoria
exports.getGamesByCategory = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.category_id, c.name AS category_name, 
             json_agg(
               json_build_object(
                 'game_id', g.game_id,
                 'title', g.title,
                 'image_path', g.image_path,
                 'price', g.price
               )
             ) AS games
      FROM categories c
      JOIN game_categories gc ON c.category_id = gc.category_id
      JOIN games g ON gc.game_id = g.game_id
      GROUP BY c.category_id, c.name
      ORDER BY c.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar jogos por categoria', details: err.message });
  }
};
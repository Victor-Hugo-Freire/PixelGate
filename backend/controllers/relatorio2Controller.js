const db = require("../database");

// GET /api/relatorio2?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD&order_by=total_vendas|receita_gerada
exports.getRelatorio2 = async (req, res) => {
  try {
    const { data_inicio, data_fim, order_by, categorias } = req.query;
    let where = "WHERE ci.paid = TRUE";
    const params = [];
    let paramIdx = 1;
    if (data_inicio && data_fim) {
      where += ` AND c.created_at BETWEEN $${paramIdx++} AND $${paramIdx++}`;
      params.push(data_inicio, data_fim);
    }
    if (categorias) {
      const cats = categorias
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number);
      if (cats.length > 0) {
        where += ` AND g.game_id IN (
          SELECT gc.game_id FROM game_categories gc
          WHERE gc.category_id = ANY($${paramIdx}::int[])
        )`;
        params.push(cats);
        paramIdx++;
      }
    }
    let order = "total_vendas DESC, g.title ASC";
    if (order_by === "receita_gerada")
      order = "receita_gerada DESC, g.title ASC";
    if (order_by === "total_vendas_asc")
      order = "total_vendas ASC, g.title ASC";
    if (order_by === "receita_gerada_asc")
      order = "receita_gerada ASC, g.title ASC";
    const result = await db.query(
      `
      SELECT
        g.title AS nome_jogo,
        COALESCE(STRING_AGG(DISTINCT cat.name, ', '), 'Sem categoria') AS categorias,
        SUM(ci.quantity) AS total_vendas,
        SUM(ci.quantity * g.price) AS receita_gerada
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.cart_id
      JOIN games g ON ci.game_id = g.game_id
      LEFT JOIN game_categories gc ON g.game_id = gc.game_id
      LEFT JOIN categories cat ON gc.category_id = cat.category_id
      ${where}
      GROUP BY g.game_id, g.title
      ORDER BY ${order}
      `,
      params
    );
    res.json({ ranking: result.rows });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao gerar relatório", details: err.message });
  }
};

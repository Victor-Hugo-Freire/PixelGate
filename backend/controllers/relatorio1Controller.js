const db = require("../database");

// GET /api/relatorio-clientes?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD&order_by=total_jogos|valor_gasto
exports.getRelatorioClientes = async (req, res) => {
  try {
    const { data_inicio, data_fim, order_by } = req.query;
    let where = "WHERE ci.paid = TRUE";
    const params = [];
    let paramIdx = 1;
    if (data_inicio && data_fim) {
      where += ` AND c.created_at BETWEEN $${paramIdx++} AND $${paramIdx++}`;
      params.push(data_inicio, data_fim);
    }
    let order = "total_jogos DESC, u.name ASC";
    if (order_by === "valor_gasto") order = "valor_gasto DESC, u.name ASC";
    if (order_by === "total_jogos_asc") order = "total_jogos ASC, u.name ASC";
    if (order_by === "valor_gasto_asc") order = "valor_gasto ASC, u.name ASC";
    const result = await db.query(
      `
      SELECT
        u.user_id,
        u.name AS nome_cliente,
        u.email,
        COUNT(DISTINCT ci.game_id) AS total_jogos,
        SUM(ci.quantity * g.price) AS valor_gasto
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.cart_id
      JOIN users u ON c.user_id = u.user_id
      JOIN games g ON ci.game_id = g.game_id
      ${where}
      GROUP BY u.user_id, u.name, u.email
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

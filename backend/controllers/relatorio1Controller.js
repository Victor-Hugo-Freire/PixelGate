const db = require("../database");

// GET /api/relatorio1?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD
exports.getRelatorio1 = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;
    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: "Informe data_inicio e data_fim" });
    }
    // Consulta vendas no período
    const result = await db.query(
      `
      SELECT
        g.title AS nome_jogo,
        ci.quantity,
        g.price AS valor_unitario,
        (ci.quantity * g.price) AS valor_total,
        u.name AS nome_cliente,
        c.created_at AS data_compra
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.cart_id
      JOIN users u ON c.user_id = u.user_id
      JOIN games g ON ci.game_id = g.game_id
      WHERE ci.paid = TRUE
        AND c.created_at BETWEEN $1 AND $2
      ORDER BY c.created_at DESC
    `,
      [data_inicio, data_fim]
    );

    // Totais
    const totalGeral = result.rows.reduce(
      (acc, row) => acc + Number(row.valor_total),
      0
    );
    const totalCompras = result.rows.length;

    res.json({
      vendas: result.rows,
      totalGeral,
      totalCompras,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao gerar relatório", details: err.message });
  }
};

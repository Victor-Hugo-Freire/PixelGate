const db = require('../database');

// POST /api/payment/checkout
exports.checkout = async (req, res) => {
  try {
    const { user_id } = req.body;

    // Busca o cart_id do usuário
    const cartResult = await db.query('SELECT cart_id FROM carts WHERE user_id = $1', [user_id]);
    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'Carrinho não encontrado.' });
    }
    const cart_id = cartResult.rows[0].cart_id;

    // Busca todos os itens não pagos do carrinho
    const itemsResult = await db.query(
      'SELECT game_id FROM cart_items WHERE cart_id = $1 AND paid = FALSE',
      [cart_id]
    );
    const gamesToAdd = itemsResult.rows.map(row => row.game_id);

    // Marca os itens como pagos
    await db.query(
      'UPDATE cart_items SET paid = TRUE WHERE cart_id = $1 AND paid = FALSE',
      [cart_id]
    );

    // Adiciona os jogos à biblioteca do usuário (se ainda não estiverem)
    for (const game_id of gamesToAdd) {
      await db.query(
        'INSERT INTO library (user_id, game_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [user_id, game_id]
      );
    }

    // Remove os itens pagos do carrinho
    await db.query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND paid = TRUE',
      [cart_id]
    );

    // Remove todos os itens do carrinho do usuário após pagamento
    await db.query(
      'DELETE FROM cart_items WHERE cart_id = $1',
      [cart_id]
    );

    res.json({ message: 'Pagamento realizado! Jogos adicionados à biblioteca e removidos do carrinho.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao finalizar compra', details: err.message });
  }
};

exports.test = (req, res) => {
  res.json({ message: "Rota de pagamento funcionando!" });
};

exports.getById = (req, res) => {
  res.status(501).json({ error: "Não implementado" });
};
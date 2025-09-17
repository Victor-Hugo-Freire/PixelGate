const db = require('../database');

// GET /api/cart/:user_id - Lista itens do carrinho do usuário
exports.getByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    // Busca o cart_id do usuário
    const cartResult = await db.query('SELECT cart_id FROM carts WHERE user_id = $1', [user_id]);
    if (cartResult.rows.length === 0) {
      return res.json([]); // Carrinho vazio
    }
    const cart_id = cartResult.rows[0].cart_id;
    // Busca os itens do carrinho
    const itemsResult = await db.query(
      `SELECT ci.item_id, ci.quantity, g.*
         FROM cart_items ci
         JOIN games g ON ci.game_id = g.game_id
        WHERE ci.cart_id = $1`,
      [cart_id]
    );
    res.json(itemsResult.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar carrinho', details: err.message });
  }
};

// POST /api/cart - Adiciona item ao carrinho
exports.addItem = async (req, res) => {
  try {
    const { user_id, game_id } = req.body;

    // Verifica se o usuário já possui o jogo na biblioteca
    const alreadyOwned = await db.query(
      'SELECT 1 FROM library WHERE user_id = $1 AND game_id = $2',
      [user_id, game_id]
    );
    if (alreadyOwned.rows.length > 0) {
      return res.status(400).json({ error: 'Você já possui este jogo na sua biblioteca.' });
    }

    // Busca ou cria o carrinho do usuário
    let cartResult = await db.query('SELECT cart_id FROM carts WHERE user_id = $1', [user_id]);
    let cart_id;
    if (cartResult.rows.length === 0) {
      const newCart = await db.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING cart_id', [user_id]);
      cart_id = newCart.rows[0].cart_id;
    } else {
      cart_id = cartResult.rows[0].cart_id;
    }

    // Verifica se o jogo já está no carrinho
    const exists = await db.query(
      'SELECT 1 FROM cart_items WHERE cart_id = $1 AND game_id = $2',
      [cart_id, game_id]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Jogo já está no carrinho.' });
    }

    // Adiciona o item
    const result = await db.query(
      'INSERT INTO cart_items (cart_id, game_id, quantity) VALUES ($1, $2, 1) RETURNING *',
      [cart_id, game_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar item ao carrinho', details: err.message });
  }
};

// DELETE /api/cart/:item_id - Remove item do carrinho
exports.removeItem = async (req, res) => {
  try {
    const { item_id } = req.params;
    const result = await db.query(
      'DELETE FROM cart_items WHERE cart_item_id = $1 RETURNING *',
      [item_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado no carrinho' });
    }
    res.json({ message: 'Item removido do carrinho' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover item do carrinho', details: err.message });
  }
};
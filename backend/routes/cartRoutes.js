const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { requireAuth } = require('../middleware/authMiddleware');

// Listar itens do carrinho do usuário (apenas logado)
router.get('/:user_id', requireAuth, cartController.getByUser);

// Adicionar item ao carrinho (apenas logado)
router.post('/', requireAuth, cartController.addItem);

// Remover item do carrinho (apenas logado)
router.delete('/:item_id', requireAuth, cartController.removeItem);

module.exports = router;
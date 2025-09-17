const express = require('express');
const router = express.Router();
const gamesController = require('../controllers/gamesController');

// Exemplo de rota para testar se está funcionando
router.get('/', (req, res) => {
  res.json({ message: 'Rota de games funcionando!' });
});

// Rota para buscar jogo por ID
router.get('/:id', gamesController.getById);

module.exports = router;

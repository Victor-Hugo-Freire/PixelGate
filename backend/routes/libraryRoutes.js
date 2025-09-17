const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { requireAuth } = require('../middleware/authMiddleware');

// Listar jogos da biblioteca do usuário (apenas logado)
router.get('/:user_id', requireAuth, libraryController.getByUser);

// Adicionar jogo à biblioteca (apenas logado)
router.post('/', requireAuth, libraryController.addGame);

module.exports = router;
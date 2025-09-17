const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { requireAdmin, requireAuth } = require('../middleware/authMiddleware');

// Listar todos os usuários (apenas admin)
router.get('/', requireAdmin, usersController.getAll);

// Buscar usuário por ID (apenas admin)
router.get('/:id', requireAdmin, usersController.getById);

// Criar usuário (apenas admin)
router.post('/', requireAdmin, usersController.create);

// Editar usuário (apenas admin)
router.put('/:id', requireAdmin, usersController.update);

// Deletar usuário (apenas admin)
router.delete('/:id', requireAdmin, usersController.delete);

module.exports = router;
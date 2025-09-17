const express = require("express");
const router = express.Router();
const gamesController = require("../controllers/gamesController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

// Listar jogos (apenas logado)
router.get("/", requireAuth, gamesController.test);

// Buscar jogo por ID (apenas logado)
router.get("/:id", requireAuth, gamesController.getById);

//Criar, editar, deletar jogos (apenas admin)
router.post("/", requireAdmin, gamesController.create);
router.put("/:id", requireAdmin, gamesController.update);
router.delete("/:id", requireAdmin, gamesController.delete);

module.exports = router;

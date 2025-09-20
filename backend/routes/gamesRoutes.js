const express = require("express");
const router = express.Router();
const gamesController = require("../controllers/gamesController");
const { requirePermission } = require("../middleware/authMiddleware");

// Home - público
router.get("/", gamesController.getAll);

// Buscar jogo por ID - público
router.get("/:id", requirePermission(7), gamesController.getById);

// Painel admin - exige permissão de painel
router.get("/admin/all", requirePermission(7), gamesController.getAll); // access_admin_painel

// Criar jogo - exige permissão específica
router.post("/", requirePermission(1), gamesController.create); // add_game

// Editar jogo
router.put("/:id", requirePermission(2), gamesController.update); // edit_game

// Deletar jogo
router.delete("/:id", requirePermission(3), gamesController.delete); // delete_game

module.exports = router;

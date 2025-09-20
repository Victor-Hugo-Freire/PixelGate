const express = require("express");
const router = express.Router();
const gameDetailsController = require("../controllers/gameDetailsController");
const { requirePermission } = require("../middleware/authMiddleware");

// Listar todos os detalhes (admin)
router.get("/", requirePermission(7), gameDetailsController.getAll); // view_game_details

// Buscar detalhes por ID (admin)
router.get("/:id", requirePermission(7), gameDetailsController.getById); // view_game_details

// Criar detalhes
router.post("/", requirePermission(16), gameDetailsController.create); // create_game_details

// Editar detalhes
router.put("/:id", requirePermission(17), gameDetailsController.update); // edit_game_details

// Deletar detalhes
router.delete("/:id", requirePermission(18), gameDetailsController.delete); // delete_game_details

module.exports = router;

const express = require("express");
const router = express.Router();
const gameDetailsController = require("../controllers/gameDetailsController");
const { requirePermission } = require("../middleware/authMiddleware");

// Listar todos os detalhes
router.get("/", gameDetailsController.getAll); // público

// Buscar detalhes por ID
router.get("/:id", gameDetailsController.getById); // público

// Criar detalhes
router.post("/", requirePermission(16), gameDetailsController.create); // create_game_details

// Editar detalhes
router.put("/:id", requirePermission(17), gameDetailsController.update); // edit_game_details

// Deletar detalhes
router.delete("/:id", requirePermission(18), gameDetailsController.delete); // delete_game_details

module.exports = router;

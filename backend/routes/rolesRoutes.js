const express = require("express");
const router = express.Router();
const rolesController = require("../controllers/rolesController");
const { requirePermission } = require("../middleware/authMiddleware");

// Visualizar roles (painel)
router.get("/", requirePermission(7), rolesController.getAll); // view_role
router.get("/:id", requirePermission(7), rolesController.getById); // view_role

// Criar role
router.post("/", requirePermission(13), rolesController.create); // create_role

// Editar role
router.put("/:id", requirePermission(14), rolesController.update); // edit_role

// Deletar role
router.delete("/:id", requirePermission(15), rolesController.remove); // delete_role

module.exports = router;

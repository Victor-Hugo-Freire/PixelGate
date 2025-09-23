const express = require("express");
const router = express.Router();
const permissionsController = require("../controllers/permissionsController");
const { requirePermission } = require("../middleware/authMiddleware");

// Visualizar permissões (painel)
router.get("/", requirePermission(7), permissionsController.getAll); // access_admin_painel
router.get("/:id", requirePermission(7), permissionsController.getById); // access_admin_painel

module.exports = router;

const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");
const { requirePermission } = require("../middleware/authMiddleware");

// Todas as rotas de categorias exigem permissão de painel
router.get("/", requirePermission(7), categoriesController.getAll); // access_admin_painel
router.get("/:id", requirePermission(7), categoriesController.getById); // access_admin_painel
router.post("/", requirePermission(10), categoriesController.create); // create_category
router.put("/:id", requirePermission(11), categoriesController.update); // edit_category
router.delete("/:id", requirePermission(12), categoriesController.delete); // delete_category

module.exports = router;

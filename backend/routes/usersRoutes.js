const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { requirePermission } = require("../middleware/authMiddleware");

// Todas as rotas de usuários exigem permissão de painel
router.get("/", requirePermission(7), usersController.getAll); // access_admin_painel
router.get("/:id", requirePermission(7), usersController.getById); // access_admin_painel
router.post("/", requirePermission(4), usersController.create); // add_user
router.put("/:id", requirePermission(5), usersController.update); // edit_user
router.delete("/:id", requirePermission(6), usersController.delete); // delete_user

module.exports = router;

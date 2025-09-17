const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController"); // Adicione esta linha!
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

// Listar categorias (apenas logado)
router.get("/", requireAuth, (req, res) => {
  res.json({ message: "Rota de categories funcionando!" });
});

// Criar, editar, deletar categorias (apenas admin)
router.post("/", requireAdmin, categoriesController.create);
router.put("/:id", requireAdmin, categoriesController.update);
router.delete("/:id", requireAdmin, categoriesController.delete);

module.exports = router;

const express = require("express");
const router = express.Router();
const relatorio1Controller = require("../controllers/relatorio1Controller");
const { requirePermission } = require("../middleware/authMiddleware");

// Permissão: 'view_reports' (id 19)
router.get(
  "/",
  requirePermission(19),
  relatorio1Controller.getRelatorioClientes
);

module.exports = router;

const express = require("express");
const router = express.Router();
const relatorio1Controller = require("../controllers/relatorio1Controller");
const { requirePermission } = require("../middleware/authMiddleware");

// Permissão: supondo que 'view_reports' seja permission_id = 99 (ajuste conforme seu banco)
router.get("/", requirePermission(99), relatorio1Controller.getRelatorio1);

module.exports = router;

const express = require("express");
const router = express.Router();
const relatorio2Controller = require("../controllers/relatorio2Controller");
const { requirePermission } = require("../middleware/authMiddleware");

// Permissão correta: 'view_reports' é permission_id = 19
router.get("/", requirePermission(19), relatorio2Controller.getRelatorio2);

module.exports = router;

const express = require("express");
const router = express.Router();
const rolesController = require("../controllers/rolesController");
const { requireAdmin } = require("../middleware/authMiddleware");

// CRUD de roles (apenas admin)
router.get("/", requireAdmin, rolesController.getAll);
router.get("/:id", requireAdmin, rolesController.getById);
router.post("/", requireAdmin, rolesController.create);
router.put("/:id", requireAdmin, rolesController.update);
router.delete("/:id", requireAdmin, rolesController.remove);

module.exports = router;

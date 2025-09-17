const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { requireAuth } = require("../middleware/authMiddleware");

// Checkout (apenas logado)
router.post("/checkout", requireAuth, paymentController.checkout);

// Exemplo de rotas protegidas
router.get("/", requireAuth, paymentController.test);
router.get("/:id", requireAuth, paymentController.getById);

module.exports = router;

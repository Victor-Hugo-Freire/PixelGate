const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// NÃO precisa de middleware nessas rotas
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;

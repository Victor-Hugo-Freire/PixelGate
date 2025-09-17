const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

// Slider e jogos por categoria (apenas logado)
router.get("/slider", homeController.getSlider);
router.get("/games-by-category", homeController.getGamesByCategory);

module.exports = router;

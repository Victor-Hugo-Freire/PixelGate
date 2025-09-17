const express = require("express");
const router = express.Router();

// Exemplo de rota
router.get("/", (req, res) => {
  res.json({ message: "Rota de roles funcionando!" });
});

module.exports = router;

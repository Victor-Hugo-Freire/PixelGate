const express = require("express");
const router = express.Router();
const gamesController = require("../controllers/gamesController");
const { requirePermission } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configuração do multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../frontend/assets/imgs"));
  },
  filename: function (req, file, cb) {
    // Salva como {game_id}.jpeg se for edição, ou temporário se for criação
    if (req.method === "PUT" && req.params.id) {
      cb(null, `${req.params.id}.jpeg`);
    } else {
      cb(null, `temp_${Date.now()}.jpeg`);
    }
  },
});
const upload = multer({ storage });

// Home - público
router.get("/", gamesController.getAll);

// Buscar jogo por ID - público
router.get("/:id", gamesController.getById);

// Painel admin - exige permissão de painel
router.get("/admin/all", requirePermission(7), gamesController.getAll); // access_admin_painel

// Criar jogo - exige permissão específica
router.post(
  "/",
  requirePermission(1),
  upload.single("image"),
  gamesController.create
); // add_game

// Editar jogo
router.put(
  "/:id",
  requirePermission(2),
  upload.single("image"),
  gamesController.update
); // edit_game

// Deletar jogo
router.delete("/:id", requirePermission(3), gamesController.delete); // delete_game

module.exports = router;

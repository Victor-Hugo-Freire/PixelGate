const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const db = require("./database");

const HOST = "localhost";
const PORT_FIXA = 3001;

const caminhoFrontend = path.join(__dirname, "../frontend");
console.log("Caminho frontend:", caminhoFrontend);

app.use(express.static(caminhoFrontend));
app.use(cookieParser());

app.use((req, res, next) => {
  const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:3000",
    "http://localhost:3001",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Cookie");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "JSON malformado",
      message: "Verifique a sintaxe do JSON enviado",
    });
  }
  next(err);
});

// Rotas (adicione suas rotas reais aqui)
const usersRoutes = require("./routes/usersRoutes");
const rolesRoutes = require("./routes/rolesRoutes");
const gamesRoutes = require("./routes/gamesRoutes");
const categoriesRoutes = require("./routes/categoriesRoutes");
const authRoutes = require("./routes/authRoutes");
const homeRoutes = require("./routes/homeRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const gameDetailsRoutes = require("./routes/gameDetailsRoutes");
const permissionsRoutes = require("./routes/permissionsRoutes");

app.use("/api/users", usersRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/game-details", gameDetailsRoutes);
app.use("/api/permissions", permissionsRoutes);

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "O server está funcionando - essa é a rota raiz!",
    database: "PostgreSQL",
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get("/health", async (req, res) => {
  try {
    const connectionTest = await db.testConnection();
    if (connectionTest) {
      res.status(200).json({
        status: "OK",
        message: "Servidor e banco de dados funcionando",
        database: "PostgreSQL",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(500).json({
        status: "ERROR",
        message: "Problema na conexão com o banco de dados",
        database: "PostgreSQL",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Erro no health check:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Erro interno do servidor",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({
    error: "Erro interno do servidor",
    message:
      process.env.NODE_ENV === "development" ? err.message : "Algo deu errado",
    timestamp: new Date().toISOString(),
  });
});

// Middleware para rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    message: `A rota ${req.originalUrl} não existe`,
    timestamp: new Date().toISOString(),
  });
});

// Inicialização do servidor
const startServer = async () => {
  try {
    console.log(caminhoFrontend);
    console.log("Testando conexão com PostgreSQL...");
    const connectionTest = await db.testConnection();

    if (!connectionTest) {
      console.error("❌ Falha na conexão com PostgreSQL");
      process.exit(1);
    }

    console.log("✅ PostgreSQL conectado com sucesso");

    const PORT = process.env.PORT || PORT_FIXA;

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
      console.log(
        `📊 Health check disponível em http://${HOST}:${PORT}/health`
      );
      console.log(`🗄️ Banco de dados: PostgreSQL`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
};

// Encerramento graceful
process.on("SIGINT", async () => {
  console.log("\n🔄 Encerrando servidor...");
  try {
    await db.pool.end();
    console.log("✅ Conexões com PostgreSQL encerradas");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao encerrar conexões:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("\n🔄 SIGTERM recebido, encerrando servidor...");
  try {
    await db.pool.end();
    console.log("✅ Conexões com PostgreSQL encerradas");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao encerrar conexões:", error);
    process.exit(1);
  }
});

startServer();

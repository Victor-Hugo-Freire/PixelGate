const { Pool } = require("pg");

const dbConfig = {
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "admin@123",
  database: "PixelGate",
  ssl: false,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const schema = "public";

const pool = new Pool({
  ...dbConfig,
  max: 10,
  min: 0,
  idle: 10000,
  acquire: 30000,
  evict: 1000,
});

pool.on("error", (err) => {
  console.error("Erro inesperado no pool de conexões:", err);
  process.exit(-1);
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query("SET search_path TO " + schema);
    client.release();
    return true;
  } catch (err) {
    console.error("Erro ao conectar com o PostgreSQL:", err);
    return false;
  }
};

const query = async (text, params) => {
  const client = await pool.connect();
  try {
    await client.query("SET search_path TO public");
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error("Erro ao executar query:", error);
    throw error;
  } finally {
    client.release();
  }
};

const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET search_path TO public");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro na transação:", error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
};

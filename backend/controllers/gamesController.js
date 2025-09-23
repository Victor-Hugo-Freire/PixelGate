const db = require("../database");
const path = require("path");
const fs = require("fs");

// GET /api/games
exports.getAll = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT g.*, 
        ARRAY_AGG(c.name) AS categories
      FROM games g
      LEFT JOIN game_categories gc ON g.game_id = gc.game_id
      LEFT JOIN categories c ON gc.category_id = c.category_id
      GROUP BY g.game_id
      ORDER BY g.game_id
    `);
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar jogos", details: err.message });
  }
};

// GET /api/games/:id
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `
      SELECT g.*, 
        ARRAY_AGG(c.name) AS categories
      FROM games g
      LEFT JOIN game_categories gc ON g.game_id = gc.game_id
      LEFT JOIN categories c ON gc.category_id = c.category_id
      WHERE g.game_id = $1
      GROUP BY g.game_id
    `,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao buscar jogo", details: err.message });
  }
};

// Exemplo de rota para testar se está funcionando (opcional)
exports.test = (req, res) => {
  res.json({ message: "Rota de games funcionando!" });
};

// POST /api/games
exports.create = async (req, res) => {
  try {
    const { title, description, developer, price, release_date, size_gb } =
      req.body;
    let category_ids = req.body.category_ids;
    if (typeof category_ids === "string") category_ids = [category_ids];

    // Validações
    if (!title || title.length > 150) {
      return res
        .status(400)
        .json({ error: "Título obrigatório e até 150 caracteres." });
    }
    if (!description || description.length < 20) {
      return res
        .status(400)
        .json({ error: "Descrição obrigatória e mínimo 20 caracteres." });
    }
    if (!developer || developer.length > 100) {
      return res
        .status(400)
        .json({ error: "Desenvolvedor obrigatório e até 100 caracteres." });
    }
    if (!price || isNaN(price) || price < 0) {
      return res
        .status(400)
        .json({ error: "Preço deve ser um número positivo." });
    }
    if (!release_date || !/^\d{4}-\d{2}-\d{2}$/.test(release_date)) {
      return res.status(400).json({ error: "Data de lançamento inválida." });
    }
    if (!size_gb || isNaN(size_gb) || size_gb < 0) {
      return res
        .status(400)
        .json({ error: "Tamanho deve ser decimal positivo." });
    }

    // Cria o jogo sem imagem
    const gameResult = await db.query(
      `INSERT INTO games (title, description, developer, price, release_date, size_gb)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING game_id`,
      [title, description, developer, price, release_date, size_gb]
    );
    const game_id = gameResult.rows[0].game_id;

    // Se veio imagem, salva como {game_id}.jpeg
    if (req.file) {
      const destPath = path.join(
        __dirname,
        "../../frontend/assets/imgs",
        `${game_id}.jpeg`
      );
      fs.renameSync(req.file.path, destPath);
      await db.query("UPDATE games SET image_path = $1 WHERE game_id = $2", [
        `./imgs/${game_id}.jpeg`,
        game_id,
      ]);
    }

    // Associa categorias
    if (Array.isArray(category_ids)) {
      for (const catId of category_ids) {
        await db.query(
          "INSERT INTO game_categories (game_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [game_id, catId]
        );
      }
    }

    res.status(201).json({ message: "Jogo criado com sucesso!", game_id });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar jogo", details: err.message });
  }
};

// PUT /api/games/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, developer, price, release_date, size_gb } =
      req.body;
    let category_ids = req.body.category_ids;
    if (typeof category_ids === "string") category_ids = [category_ids];

    // Validações (igual ao seu código)
    // ...

    // Atualiza dados do jogo
    let image_path = null;
    let query, params;
    if (req.file) {
      image_path = `./imgs/${id}.jpeg`;
      query = `UPDATE games SET title = $1, description = $2, developer = $3, price = $4, release_date = $5, size_gb = $6, image_path = $7 WHERE game_id = $8`;
      params = [
        title,
        description,
        developer,
        price,
        release_date,
        size_gb,
        image_path,
        id,
      ];
    } else {
      query = `UPDATE games SET title = $1, description = $2, developer = $3, price = $4, release_date = $5, size_gb = $6 WHERE game_id = $7`;
      params = [
        title,
        description,
        developer,
        price,
        release_date,
        size_gb,
        id,
      ];
    }
    await db.query(query, params);

    // Atualiza categorias
    await db.query("DELETE FROM game_categories WHERE game_id = $1", [id]);
    if (Array.isArray(category_ids)) {
      for (const catId of category_ids) {
        await db.query(
          "INSERT INTO game_categories (game_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [id, catId]
        );
      }
    }

    res.json({ message: "Jogo atualizado com sucesso!" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao atualizar jogo", details: err.message });
  }
};

// DELETE /api/games/:id
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    // Remove o jogo (ON DELETE CASCADE cuida das associações)
    const result = await db.query(
      "DELETE FROM games WHERE game_id = $1 RETURNING game_id, title",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }
    res.json({ message: "Jogo removido com sucesso!", game: result.rows[0] });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao remover jogo", details: err.message });
  }
};

// DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // Remove a categoria (ON DELETE CASCADE cuida das associações)
    const result = await db.query(
      "DELETE FROM categories WHERE category_id = $1 RETURNING category_id, title",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }
    res.json({
      message: "Categoria removida com sucesso!",
      category: result.rows[0],
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao remover categoria", details: err.message });
  }
};

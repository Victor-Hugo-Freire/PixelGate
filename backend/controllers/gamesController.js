const db = require("../database");

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
    const {
      title,
      description,
      developer,
      price,
      image_path,
      release_date,
      size_gb,
      category_ids,
    } = req.body;

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

    // Impede duplicidade de título
    const exists = await db.query(
      "SELECT game_id FROM games WHERE LOWER(title) = LOWER($1)",
      [title.trim()]
    );
    if (exists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Já existe um jogo com esse título." });
    }

    // Cria o jogo
    const gameResult = await db.query(
      `INSERT INTO games (title, description, developer, price, image_path, release_date, size_gb)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING game_id, title, description, developer, price, image_path, release_date, size_gb`,
      [
        title,
        description,
        developer,
        price,
        image_path || null,
        release_date,
        size_gb,
      ]
    );
    const game_id = gameResult.rows[0].game_id;

    // Associa categorias
    let allCategoryIds = Array.isArray(category_ids) ? [...category_ids] : [];
    for (const catId of allCategoryIds) {
      await db.query(
        "INSERT INTO game_categories (game_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [game_id, catId]
      );
    }

    res.status(201).json({
      message: "Jogo criado com sucesso!",
      game: gameResult.rows[0],
      categories: allCategoryIds,
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar jogo", details: err.message });
  }
};

// PUT /api/games/:id
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      developer,
      price,
      image_path,
      release_date,
      size_gb,
      category_ids,
      new_category,
    } = req.body;

    // Validações (igual ao create)
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

    // Atualiza o jogo
    const result = await db.query(
      `UPDATE games SET title = $1, description = $2, developer = $3, price = $4, image_path = $5, release_date = $6, size_gb = $7
       WHERE game_id = $8
       RETURNING game_id, title, description, developer, price, image_path, release_date, size_gb`,
      [
        title,
        description,
        developer,
        price,
        image_path || null,
        release_date,
        size_gb,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    // Atualiza categorias
    let allCategoryIds = Array.isArray(category_ids) ? [...category_ids] : [];
    if (new_category && new_category.trim()) {
      // Verifica se já existe
      const catResult = await db.query(
        "SELECT category_id FROM categories WHERE LOWER(name) = LOWER($1)",
        [new_category.trim()]
      );
      let newCatId;
      if (catResult.rows.length === 0) {
        // Cria nova categoria (sem informar category_id)
        const insertCat = await db.query(
          "INSERT INTO categories (name) VALUES ($1) RETURNING category_id",
          [new_category.trim()]
        );
        newCatId = insertCat.rows[0].category_id;
      } else {
        newCatId = catResult.rows[0].category_id;
      }
      allCategoryIds.push(newCatId);
    }

    // Remove associações antigas e insere novas
    await db.query("DELETE FROM game_categories WHERE game_id = $1", [id]);
    for (const catId of allCategoryIds) {
      await db.query(
        "INSERT INTO game_categories (game_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [id, catId]
      );
    }

    res.json({
      message: "Jogo atualizado com sucesso!",
      game: result.rows[0],
      categories: allCategoryIds,
    });
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

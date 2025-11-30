const API_BASE_URL = "http://localhost:3001/api";

function showMessage(text, type = "info") {
  const msgEl = document.getElementById("messageContainer");
  msgEl.innerHTML = `<div class="message ${type}">${text}</div>`;
  setTimeout(() => {
    msgEl.innerHTML = "";
  }, 3500);
}

// Protege área administrativa
async function protectAdminArea() {
  const user = await getCurrentUser();
  if (!user || !user.user_id) {
    window.location.href =
      "../../login/login.html?redirect=crud_games-categories/games-categories.html";
    return false;
  }
  const res = await fetch(`${API_BASE_URL}/users/${user.user_id}/permissions`, {
    credentials: "include",
  });
  if (!res.ok) {
    window.location.href =
      "../../login/login.html?redirect=crud_games-categories/games-categories.html";
    return false;
  }
  const permissions = await res.json();
  if (!permissions.includes(7)) {
    window.location.href = "../../index.html";
    return false;
  }
  return permissions;
}

// Header ADM com dropdown
async function showUserHeader() {
  const user = await getCurrentUser();
  if (user && user.user_id) {
    const headerActions = document.getElementById("header-actions");
    const permissions = await fetch(
      `${API_BASE_URL}/users/${user.user_id}/permissions`,
      { credentials: "include" }
    ).then((r) => (r.ok ? r.json() : []));
    const hasReport = Array.isArray(permissions)
      ? permissions.includes(19)
      : false;
    headerActions.innerHTML = `
      <div class="user-dropdown">
        <button class="user-btn" id="userBtn">
          <img src="../../assets/icons/userIcon.svg" alt="Usuário" style="width:28px;height:28px;vertical-align:middle;">
          <span style="font-weight:bold;color:var(--accent);font-size:1.1em;">${
            user.name
          }</span>
          <span style="margin-left:6px;">▼</span>
        </button>
        <div class="user-dropdown-content" id="userDropdownContent" style="display:none;">
          <a href="../../index.html">Voltar para área do usuário</a>
          ${
            hasReport
              ? `<a href="../relatorio2/relatorio2.html">Relatório: Jogos Mais Vendidos</a>\n<a href="../relatorio1/relatorio1.html">Relatório: Clientes que Mais Compraram</a>`
              : ""
          }
          <a href="#" id="logoutBtn">Logout</a>
        </div>
      </div>
    `;
    const userBtn = document.getElementById("userBtn");
    const dropdown = document.getElementById("userDropdownContent");
    userBtn.onclick = (e) => {
      e.stopPropagation();
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    };
    document.body.addEventListener("click", () => {
      dropdown.style.display = "none";
    });
    document.getElementById("logoutBtn").onclick = async (e) => {
      e.preventDefault();
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "../../index.html";
    };
  }
}

async function getCurrentUser() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
}

// Busca todos os jogos
async function fetchAllGames() {
  try {
    const res = await fetch(`${API_BASE_URL}/games`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

// Busca jogo por ID
async function fetchGameById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/games/${id}`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

// Busca todas as categorias
async function fetchAllCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

// Insere novo jogo
async function insertGame(data, imageFile) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else {
      formData.append(key, value);
    }
  });
  if (imageFile) formData.append("image", imageFile);

  const res = await fetch(`${API_BASE_URL}/games`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (res.ok) return true;
  const err = await res.json();
  showMessage(err.error || "Erro ao inserir jogo", "error");
  return false;
}

// Edita jogo
async function updateGame(id, data, imageFile) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else {
      formData.append(key, value);
    }
  });
  // Só envia imagem se o usuário selecionar uma nova
  if (imageFile) formData.append("image", imageFile);

  const res = await fetch(`${API_BASE_URL}/games/${id}`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  if (res.ok) return true;
  const err = await res.json();
  showMessage(err.error || "Erro ao editar jogo", "error");
  return false;
}

// Deleta jogo
async function deleteGame(id) {
  const res = await fetch(`${API_BASE_URL}/games/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.ok) return true;
  const err = await res.json();
  // Erro de FK cart_items
  if (
    err.code === "23503" ||
    (err.detail && err.detail.includes("cart_items"))
  ) {
    showMessage(
      "Não é possível excluir: o jogo está no carrinho de algum usuário.",
      "error"
    );
    return false;
  }
  showMessage(err.error || "Erro ao excluir jogo", "error");
  return false;
}

// Estado do CRUD
let crudState = {
  mode: "idle", // idle | searching | inserting | editing | deleting
  currentId: "",
  currentGame: null,
  permissions: [],
};

// Renderiza o formulário do CRUD
async function renderCrudForm() {
  const formEl = document.getElementById("gamesCategoriesForm");
  let html = "";
  const categories = await fetchAllCategories();

  function categoriesCheckboxList(selectedIds = []) {
    return `
      <label>Categorias:</label>
      <div class="categories-list">
        ${categories
          .map(
            (cat) => `
            <label class="category-checkbox">
              <input type="checkbox" value="${cat.category_id}" ${
              selectedIds.includes(cat.name) ||
              selectedIds.includes(cat.category_id)
                ? "checked"
                : ""
            }>
              ${cat.category_id} (${cat.name})
            </label>
          `
          )
          .join("")}
      </div>
    `;
  }

  if (crudState.mode === "idle" || crudState.mode === "searching") {
    html = `
      <div class="search-container">
        <label for="searchId">
          <img src="../../assets/icons/searchIDIcon.svg" style="width:22px;vertical-align:middle;margin-right:6px;">
          Buscar categoria por ID:
        </label>
        <div class="input-group">
          <input type="number" id="searchId" name="searchId" min="1" required placeholder="Digite o ID da categoria" autocomplete="off" ${
            crudState.mode !== "idle" ? "disabled" : ""
          }>
          <button type="button" class="icon-btn" id="btnBuscar">
            <img src="../../assets/icons/searchIDIcon.svg" alt="Buscar">
          </button>
        </div>
      </div>
    `;
  } else if (crudState.mode === "inserting") {
    html = `
      <label for="insertTitle">Título:</label>
      <input type="text" id="insertTitle" name="insertTitle" maxlength="150" required autocomplete="off">
      <label for="insertDescription">Descrição:</label>
      <textarea id="insertDescription" name="insertDescription" minlength="20" required></textarea>
      <label for="insertDeveloper">Desenvolvedor:</label>
      <input type="text" id="insertDeveloper" name="insertDeveloper" maxlength="100" required autocomplete="off">
      <label for="insertPrice">Preço:</label>
      <input type="number" id="insertPrice" name="insertPrice" min="0" step="0.01" required>
      <label for="insertReleaseDate">Data de lançamento:</label>
      <input type="date" id="insertReleaseDate" name="insertReleaseDate" required>
      <label for="insertSize">Tamanho (GB):</label>
      <input type="number" id="insertSize" name="insertSize" min="0" step="0.01" required>
      <label for="insertImage">Imagem:</label>
      <input type="file" id="insertImage" name="insertImage" accept="image/jpeg">
      ${categoriesCheckboxList([])}
      <div class="form-actions">
        <button type="button" id="btnSalvar">Salvar</button>
        <button type="button" class="btn-cancel" id="btnCancelar">Cancelar</button>
      </div>
    `;
  } else if (crudState.mode === "editing" && crudState.currentGame) {
    html = `
      <label>ID:</label>
      <input type="text" value="${crudState.currentGame.game_id}" disabled>
      <label for="editTitle">Título:</label>
      <input type="text" id="editTitle" name="editTitle" maxlength="150" required value="${
        crudState.currentGame.title
      }" autocomplete="off">
      <label for="editDescription">Descrição:</label>
      <textarea id="editDescription" name="editDescription" minlength="20" required>${
        crudState.currentGame.description
      }</textarea>
      <label for="editDeveloper">Desenvolvedor:</label>
      <input type="text" id="editDeveloper" name="editDeveloper" maxlength="100" required value="${
        crudState.currentGame.developer
      }" autocomplete="off">
      <label for="editPrice">Preço:</label>
      <input type="number" id="editPrice" name="editPrice" min="0" step="0.01" required value="${
        crudState.currentGame.price
      }">
      <label for="editReleaseDate">Data de lançamento:</label>
      <input type="date" id="editReleaseDate" name="editReleaseDate" required value="${
        crudState.currentGame.release_date
          ? crudState.currentGame.release_date.slice(0, 10)
          : ""
      }">
      <label for="editSize">Tamanho (GB):</label>
      <input type="number" id="editSize" name="editSize" min="0" step="0.01" required value="${
        crudState.currentGame.size_gb
      }">
      <label for="editImage">Imagem:</label>
      <input type="file" id="editImage" name="editImage" accept="image/jpeg">
      ${categoriesCheckboxList(crudState.currentGame.categories || [])}
      <div class="form-actions">
        <button type="button" id="btnSalvar">Salvar</button>
        <button type="button" class="btn-cancel" id="btnCancelar">Cancelar</button>
        <button type="button" class="btn-danger" id="btnExcluir">
          <img src="../../assets/icons/trashDeleteIcon.svg" style="width:18px;vertical-align:middle;margin-right:4px;">Excluir
        </button>
      </div>
    `;
  } else if (crudState.mode === "deleting" && crudState.currentGame) {
    html = `
      <div class="crud-delete-confirm">
        <p>
          <img src="../../assets/icons/trashDeleteIcon.svg" style="width:22px;vertical-align:middle;margin-right:6px;">
          Tem certeza que deseja excluir o jogo <b>${crudState.currentGame.title}</b> (ID ${crudState.currentGame.game_id})?
        </p>
        <div class="form-actions">
          <button type="button" class="btn-danger" id="btnConfirmDelete">
            <img src="../../assets/icons/trashDeleteIcon.svg" style="width:18px;vertical-align:middle;margin-right:4px;">
            Confirmar exclusão
          </button>
          <button type="button" class="btn-cancel" id="btnCancelar">Cancelar</button>
        </div>
      </div>
    `;
  }

  formEl.innerHTML = html;

  const searchIdInput = document.getElementById("searchId");
  if (searchIdInput) {
    searchIdInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "");
    });
  }

  // Eventos do formulário
  if (crudState.mode === "idle" || crudState.mode === "searching") {
    document.getElementById("btnBuscar").onclick = async () => {
      const id = document.getElementById("searchId").value.trim();
      if (!id) return showMessage("Digite um ID para buscar", "warning");
      crudState.mode = "searching";
      crudState.currentId = id;
      crudState.currentGame = null;
      renderCrudForm();
      const game = await fetchGameById(id);
      if (game) {
        crudState.currentGame = game;
        crudState.mode = "editing";
        showMessage("Jogo encontrado!", "success");
      } else {
        crudState.mode = "inserting";
        showMessage("Jogo não encontrado. Você pode inserir um novo.", "info");
      }
      renderCrudForm();
      renderCrudTable();
    };
  }
  if (crudState.mode === "inserting") {
    document.getElementById("btnSalvar").onclick = async () => {
      const title = document.getElementById("insertTitle").value.trim();
      const description = document
        .getElementById("insertDescription")
        .value.trim();
      const developer = document.getElementById("insertDeveloper").value.trim();
      const price = document.getElementById("insertPrice").value;
      const release_date = document.getElementById("insertReleaseDate").value;
      const size_gb = document.getElementById("insertSize").value;
      const imageFile = document.getElementById("insertImage").files[0];
      const category_ids = Array.from(
        document.querySelectorAll(
          ".categories-list input[type='checkbox']:checked"
        )
      ).map((el) => el.value);

      if (!title || title.length > 150)
        return showMessage(
          "Título obrigatório e até 150 caracteres.",
          "warning"
        );
      if (!description || description.length < 20)
        return showMessage(
          "Descrição obrigatória e mínimo 20 caracteres.",
          "warning"
        );
      if (!developer || developer.length > 100)
        return showMessage(
          "Desenvolvedor obrigatório e até 100 caracteres.",
          "warning"
        );
      if (!price || isNaN(price) || price < 0)
        return showMessage("Preço deve ser um número positivo.", "warning");
      if (!release_date || !/^\d{4}-\d{2}-\d{2}$/.test(release_date))
        return showMessage("Data de lançamento inválida.", "warning");
      if (!size_gb || isNaN(size_gb) || size_gb < 0)
        return showMessage("Tamanho deve ser decimal positivo.", "warning");
      if (!imageFile)
        return showMessage("Selecione uma imagem JPEG.", "warning");

      const ok = await insertGame(
        {
          title,
          description,
          developer,
          price,
          release_date,
          size_gb,
          category_ids,
        },
        imageFile
      );
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentGame = null;
        showMessage("Jogo inserido com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentGame = null;
      renderCrudForm();
      renderCrudTable();
    };
  }
  if (crudState.mode === "editing" && crudState.currentGame) {
    document.getElementById("btnSalvar").onclick = async () => {
      const title = document.getElementById("editTitle").value.trim();
      const description = document
        .getElementById("editDescription")
        .value.trim();
      const developer = document.getElementById("editDeveloper").value.trim();
      const price = document.getElementById("editPrice").value;
      const release_date = document.getElementById("editReleaseDate").value;
      const size_gb = document.getElementById("editSize").value;
      const imageFile = document.getElementById("editImage").files[0];
      const category_ids = Array.from(
        document.querySelectorAll(
          ".categories-list input[type='checkbox']:checked"
        )
      ).map((el) => el.value);

      if (!title || title.length > 150)
        return showMessage(
          "Título obrigatório e até 150 caracteres.",
          "warning"
        );
      if (!description || description.length < 20)
        return showMessage(
          "Descrição obrigatória e mínimo 20 caracteres.",
          "warning"
        );
      if (!developer || developer.length > 100)
        return showMessage(
          "Desenvolvedor obrigatório e até 100 caracteres.",
          "warning"
        );
      if (!price || isNaN(price) || price < 0)
        return showMessage("Preço deve ser um número positivo.", "warning");
      if (!release_date || !/^\d{4}-\d{2}-\d{2}$/.test(release_date))
        return showMessage("Data de lançamento inválida.", "warning");
      if (!size_gb || isNaN(size_gb) || size_gb < 0)
        return showMessage("Tamanho deve ser decimal positivo.", "warning");

      const ok = await updateGame(
        crudState.currentGame.game_id,
        {
          title,
          description,
          developer,
          price,
          release_date,
          size_gb,
          category_ids,
        },
        imageFile
      );
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentGame = null;
        showMessage("Jogo alterado com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentGame = null;
      renderCrudForm();
      renderCrudTable();
    };
    document.getElementById("btnExcluir").onclick = () => {
      crudState.mode = "deleting";
      renderCrudForm();
      renderCrudTable();
    };
  }
  if (crudState.mode === "deleting" && crudState.currentGame) {
    document.getElementById("btnConfirmDelete").onclick = async () => {
      const ok = await deleteGame(crudState.currentGame.game_id);
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentGame = null;
        showMessage("Jogo excluído com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentGame = null;
      renderCrudForm();
      renderCrudTable();
    };
  }
}

// Renderiza tabela de jogos e categorias
async function renderCrudTable() {
  const tableEl = document.getElementById("gamesCategoriesTable");
  const games = await fetchAllGames();
  let html = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Imagem</th>
          <th>Título</th>
          <th>Desenvolvedor</th>
          <th>Preço</th>
          <th>Data</th>
          <th>Tamanho</th>
          <th>Categorias</th>
        </tr>
      </thead>
      <tbody>
        ${
          games.length
            ? games
                .map(
                  (g) => `
            <tr>
              <td>
                <button class="btn-id" onclick="window.selectGameFromTable && window.selectGameFromTable(${
                  g.game_id
                })">${g.game_id}</button>
              </td>
              <td>
                <img src="${
                  g.image_path && g.image_path.startsWith("./imgs/")
                    ? "../../assets/imgs/" + g.image_path.replace("./imgs/", "")
                    : "../../assets/icons/gameIcon.svg"
                }" alt="Imagem do jogo">
              </td>
              <td>${g.title}</td>
              <td>${g.developer}</td>
              <td>R$ ${parseFloat(g.price).toFixed(2)}</td>
              <td>${g.release_date ? g.release_date.slice(0, 10) : ""}</td>
              <td>${g.size_gb} GB</td>
              <td>${
                Array.isArray(g.categories)
                  ? g.categories
                      .filter(Boolean)
                      .map((c, i) => `<span>${c}</span>`)
                      .join(", ")
                  : ""
              }</td>
            </tr>
          `
                )
                .join("")
            : `<tr><td colspan="8" style="text-align:center;color:var(--muted);">Nenhum jogo cadastrado.</td></tr>`
        }
      </tbody>
    </table>
  `;
  tableEl.innerHTML = html;
  // Seleção rápida pelo botão de ID
  window.selectGameFromTable = async (id) => {
    crudState.mode = "searching";
    crudState.currentId = id;
    crudState.currentGame = null;
    renderCrudForm();
    const game = await fetchGameById(id);
    if (game) {
      crudState.currentGame = game;
      crudState.mode = "editing";
      showMessage("Jogo encontrado!", "success");
    } else {
      crudState.mode = "inserting";
      showMessage("Jogo não encontrado. Você pode inserir um novo.", "info");
    }
    renderCrudForm();
    renderCrudTable();
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  const permissions = await protectAdminArea();
  if (!permissions) return;
  crudState.permissions = permissions;
  showUserHeader();
  renderCrudForm();
  renderCrudTable();
});

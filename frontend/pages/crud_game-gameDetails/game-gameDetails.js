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
      "../../login/login.html?redirect=crud_game-gameDetails/game-gameDetails.html";
    return false;
  }
  const res = await fetch(`${API_BASE_URL}/users/${user.user_id}/permissions`, {
    credentials: "include",
  });
  if (!res.ok) {
    window.location.href =
      "../../login/login.html?redirect=crud_game-gameDetails/game-gameDetails.html";
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
    headerActions.innerHTML = `
      <div class="user-dropdown">
        <button class="user-btn" id="userBtn">
          <img src="../../assets/icons/userIcon.svg" alt="Usuário" style="width:28px;height:28px;vertical-align:middle;">
          <span style="font-weight:bold;color:var(--accent);font-size:1.1em;">${user.name}</span>
          <span style="margin-left:6px;">▼</span>
        </button>
        <div class="user-dropdown-content" id="userDropdownContent" style="display:none;">
          <a href="../../index.html" id="goHomeBtn">Voltar para área do usuário</a>
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
    document.getElementById("goHomeBtn").onclick = (e) => {
      e.preventDefault();
      window.location.href = "../../index.html";
    };
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

// Busca todos os detalhes
async function fetchAllGameDetails() {
  try {
    const res = await fetch(`${API_BASE_URL}/game-details`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

// Busca detalhes por ID
async function fetchGameDetailsById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/game-details/${id}`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

// Insere detalhes
async function insertGameDetails(data) {
  const res = await fetch(`${API_BASE_URL}/game-details`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (res.ok) return true;
  const err = await res.json();
  showMessage(err.error || "Erro ao inserir detalhes", "error");
  return false;
}

// Edita detalhes
async function updateGameDetails(id, data) {
  const res = await fetch(`${API_BASE_URL}/game-details/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (res.ok) return true;
  const err = await res.json();
  showMessage(err.error || "Erro ao editar detalhes", "error");
  return false;
}

// Deleta detalhes
async function deleteGameDetails(id) {
  const res = await fetch(`${API_BASE_URL}/game-details/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.ok) return true;
  const err = await res.json();
  showMessage(err.error || "Erro ao excluir detalhes", "error");
  return false;
}

// Estado do CRUD
let crudState = {
  mode: "idle", // idle | searching | inserting | editing | deleting
  currentId: "",
  currentDetails: null,
  foundGame: null,
  permissions: [],
};

// Renderiza o formulário do CRUD
async function renderCrudForm() {
  const formEl = document.getElementById("gameDetailsForm");
  let html = "";
  let games = await fetchAllGames();

  // Helper para montar o select de jogos
  function gameSelect(name, selectedId, onlyOne = null) {
    if (onlyOne) {
      return `
        <label for="${name}">Jogo:</label>
        <select id="${name}" name="${name}" required>
          <option value="${onlyOne.game_id}" selected>${onlyOne.game_id} (${onlyOne.title})</option>
        </select>
      `;
    }
    return `
      <label for="${name}">Jogo:</label>
      <select id="${name}" name="${name}" required>
        <option value="">Selecione...</option>
        ${games
          .map(
            (game) =>
              `<option value="${game.game_id}" ${
                game.game_id == selectedId ? "selected" : ""
              }>${game.game_id} (${game.title})</option>`
          )
          .join("")}
      </select>
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
    // Se veio de busca, só mostra o jogo encontrado
    if (crudState.foundGame) {
      html = `
        <label for="insertGameId">ID do Jogo:</label>
        <input type="text" value="${crudState.foundGame.game_id}" disabled>
        <label for="insertGameTitle">Título do Jogo:</label>
        <input type="text" value="${crudState.foundGame.title}" readonly>
        ${gameSelect(
          "insertGameId",
          crudState.foundGame.game_id,
          crudState.foundGame
        )}
        <label for="insertMinReq">Requisitos mínimos:</label>
        <textarea id="insertMinReq" name="insertMinReq" required></textarea>
        <label for="insertRecReq">Requisitos recomendados:</label>
        <textarea id="insertRecReq" name="insertRecReq" required></textarea>
        <div class="form-actions">
          <button type="button" id="btnSalvar">Salvar</button>
          <button type="button" class="btn-cancel" id="btnCancelar">Cancelar</button>
        </div>
      `;
    } else {
      html = `
        ${gameSelect("insertGameId", "")}
        <label for="insertMinReq">Requisitos mínimos:</label>
        <textarea id="insertMinReq" name="insertMinReq" required></textarea>
        <label for="insertRecReq">Requisitos recomendados:</label>
        <textarea id="insertRecReq" name="insertRecReq" required></textarea>
        <div class="form-actions">
          <button type="button" id="btnSalvar">Salvar</button>
          <button type="button" class="btn-cancel" id="btnCancelar">Cancelar</button>
        </div>
      `;
    }
  } else if (crudState.mode === "editing" && crudState.currentDetails) {
    html = `
      <label>ID do Jogo:</label>
      <input type="text" value="${crudState.currentDetails.game_id}" disabled>
      <label for="editGameTitle">Título do Jogo:</label>
      <input type="text" value="${crudState.currentDetails.title}" readonly>
      <label for="editMinReq">Requisitos mínimos:</label>
      <textarea id="editMinReq" name="editMinReq" required>${crudState.currentDetails.min_requirements}</textarea>
      <label for="editRecReq">Requisitos recomendados:</label>
      <textarea id="editRecReq" name="editRecReq" required>${crudState.currentDetails.recommended_requirements}</textarea>
      <div class="form-actions">
        <button type="button" id="btnSalvar">Salvar</button>
        <button type="button" class="btn-cancel" id="btnCancelar">Cancelar</button>
        <button type="button" class="btn-danger" id="btnExcluir">
          <img src="../../assets/icons/trashDeleteIcon.svg" style="width:18px;vertical-align:middle;margin-right:4px;">Excluir
        </button>
      </div>
    `;
  } else if (crudState.mode === "deleting" && crudState.currentDetails) {
    html = `
      <div class="crud-delete-confirm">
        <p>
          <img src="../../assets/icons/trashDeleteIcon.svg" style="width:22px;vertical-align:middle;margin-right:6px;">
          Tem certeza que deseja excluir os detalhes do jogo <b>${crudState.currentDetails.title}</b> (ID ${crudState.currentDetails.game_id})?
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
      crudState.currentDetails = null;
      crudState.foundGame = null;
      renderCrudForm();
      // Busca detalhes
      const details = await fetchGameDetailsById(id);
      if (details) {
        crudState.currentDetails = details;
        crudState.mode = "editing";
        showMessage("Detalhes encontrados!", "success");
      } else {
        // Busca jogo
        const game = await fetchGameById(id);
        if (game) {
          crudState.foundGame = game;
          crudState.mode = "inserting";
          showMessage("Jogo encontrado! Insira os detalhes.", "info");
        } else {
          showMessage(
            "Jogo não cadastrado. Redirecionando para cadastro...",
            "warning"
          );
          setTimeout(() => {
            window.location.href =
              "../crud_games-categories/games-categories.html";
          }, 1800);
          return;
        }
      }
      renderCrudForm();
      renderCrudTable();
    };
  }
  if (crudState.mode === "inserting") {
    document.getElementById("btnSalvar").onclick = async () => {
      let game_id;
      if (crudState.foundGame) {
        game_id = crudState.foundGame.game_id;
      } else {
        game_id = document.getElementById("insertGameId").value;
      }
      const min_requirements = document
        .getElementById("insertMinReq")
        .value.trim();
      const recommended_requirements = document
        .getElementById("insertRecReq")
        .value.trim();
      if (!game_id || !min_requirements || !recommended_requirements)
        return showMessage("Preencha todos os campos!", "warning");
      const ok = await insertGameDetails({
        game_id,
        min_requirements,
        recommended_requirements,
      });
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentDetails = null;
        crudState.foundGame = null;
        showMessage("Detalhes inseridos com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentDetails = null;
      crudState.foundGame = null;
      renderCrudForm();
      renderCrudTable();
    };
  }
  if (crudState.mode === "editing" && crudState.currentDetails) {
    document.getElementById("btnSalvar").onclick = async () => {
      const min_requirements = document
        .getElementById("editMinReq")
        .value.trim();
      const recommended_requirements = document
        .getElementById("editRecReq")
        .value.trim();
      if (!min_requirements || !recommended_requirements)
        return showMessage("Preencha todos os campos!", "warning");
      const ok = await updateGameDetails(crudState.currentDetails.game_id, {
        min_requirements,
        recommended_requirements,
      });
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentDetails = null;
        crudState.foundGame = null;
        showMessage("Detalhes alterados com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentDetails = null;
      crudState.foundGame = null;
      renderCrudForm();
      renderCrudTable();
    };
    document.getElementById("btnExcluir").onclick = () => {
      crudState.mode = "deleting";
      renderCrudForm();
      renderCrudTable();
    };
  }
  if (crudState.mode === "deleting" && crudState.currentDetails) {
    document.getElementById("btnConfirmDelete").onclick = async () => {
      const ok = await deleteGameDetails(crudState.currentDetails.game_id);
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentDetails = null;
        crudState.foundGame = null;
        showMessage("Detalhes excluídos com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentDetails = null;
      crudState.foundGame = null;
      renderCrudForm();
      renderCrudTable();
    };
  }
}

// Renderiza tabela de detalhes dos jogos
async function renderCrudTable() {
  const tableEl = document.getElementById("gameDetailsTable");
  const details = await fetchAllGameDetails();
  let html = `
    <table>
      <thead>
        <tr>
          <th>ID do Jogo</th>
          <th>Título</th>
          <th>Requisitos Mínimos</th>
          <th>Requisitos Recomendados</th>
        </tr>
      </thead>
      <tbody>
        ${
          details.length
            ? details
                .map(
                  (d) => `
            <tr>
              <td>
                <button class="btn-id" onclick="window.selectDetailsFromTable && window.selectDetailsFromTable(${d.game_id})">${d.game_id}</button>
              </td>
              <td>${d.title}</td>
              <td>${d.min_requirements}</td>
              <td>${d.recommended_requirements}</td>
            </tr>
          `
                )
                .join("")
            : `<tr><td colspan="4" style="text-align:center;color:var(--muted);">Nenhum detalhe cadastrado.</td></tr>`
        }
      </tbody>
    </table>
  `;
  tableEl.innerHTML = html;
  // Seleção rápida pelo botão de ID
  window.selectDetailsFromTable = async (id) => {
    crudState.mode = "searching";
    crudState.currentId = id;
    crudState.currentDetails = null;
    crudState.foundGame = null;
    renderCrudForm();
    const details = await fetchGameDetailsById(id);
    if (details) {
      crudState.currentDetails = details;
      crudState.mode = "editing";
      showMessage("Detalhes encontrados!", "success");
    } else {
      // Busca jogo
      const game = await fetchGameById(id);
      if (game) {
        crudState.foundGame = game;
        crudState.mode = "inserting";
        showMessage("Jogo encontrado! Insira os detalhes.", "info");
      } else {
        showMessage(
          "Jogo não cadastrado. Redirecionando para cadastro...",
          "warning"
        );
        setTimeout(() => {
          window.location.href =
            "../crud_games-categories/games-categories.html";
        }, 1800);
        return;
      }
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

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
      "../../login/login.html?redirect=crud_categories/categories.html";
    return false;
  }
  const res = await fetch(`${API_BASE_URL}/users/${user.user_id}/permissions`, {
    credentials: "include",
  });
  if (!res.ok) {
    window.location.href =
      "../../login/login.html?redirect=crud_categories/categories.html";
    return false;
  }
  const permissions = await res.json();
  if (!permissions.includes(7)) {
    window.location.href = "../library/library.html";
    return false;
  }
  return true;
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
          <a href="../library/library.html">Voltar para área do usuário</a>
          ${
            hasReport
              ? `<a href="../relatorio1/relatorio1.html">Relatório: Comprados por Período</a>
          <a href="../relatorio2/relatorio2.html">Relatório: Mais Vendidos</a>`
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
      window.location.href = "../library/library.html";
    };
  }
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

// Busca categoria por ID
async function fetchCategoryById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

// Insere nova categoria
async function insertCategory(data) {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (res.ok) return await res.json();
  const err = await res.json();
  showMessage(err.error || "Erro ao inserir categoria", "error");
  return false;
}

// Edita categoria
async function updateCategory(id, data) {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (res.ok) return await res.json();
  const err = await res.json();
  showMessage(err.error || "Erro ao editar categoria", "error");
  return false;
}

// Deleta categoria
async function deleteCategory(id) {
  const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.ok) return true;
  const err = await res.json();
  showMessage(err.error || "Erro ao excluir categoria", "error");
  return false;
}

// Estado do CRUD
let crudState = {
  mode: "idle", // idle | searching | inserting | editing | deleting
  currentId: "",
  currentCategory: null,
};

// Renderiza o formulário do CRUD
async function renderCrudForm() {
  const formEl = document.getElementById("categoriesForm");
  let html = "";

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
      <label for="insertName">Nome da Categoria:</label>
      <input type="text" id="insertName" name="insertName" maxlength="50" required autocomplete="off">
      <label for="insertDescription">Descrição:</label>
      <textarea id="insertDescription" name="insertDescription" required></textarea>
      <div class="form-actions">
        <button type="button" id="btnSalvar">Salvar</button>
        <button type="button" class="btn-cancel" id="btnCancelar">Cancelar</button>
      </div>
    `;
  } else if (crudState.mode === "editing" && crudState.currentCategory) {
    html = `
      <label>ID:</label>
      <input type="text" value="${
        crudState.currentCategory.category_id
      }" disabled>
      <label for="editName">Nome da Categoria:</label>
      <input type="text" id="editName" name="editName" maxlength="50" required value="${
        crudState.currentCategory.name
      }" autocomplete="off">
      <label for="editDescription">Descrição:</label>
      <textarea id="editDescription" name="editDescription" required>${
        crudState.currentCategory.description || ""
      }</textarea>
      <div class="form-actions">
        <button type="button" id="btnSalvar">Salvar</button>
        <button type="button" class="btn-cancel" id="btnCancelar">Cancelar</button>
        <button type="button" class="btn-danger" id="btnExcluir">
          <img src="../../assets/icons/trashDeleteIcon.svg" style="width:18px;vertical-align:middle;margin-right:4px;">Excluir
        </button>
      </div>
    `;
  } else if (crudState.mode === "deleting" && crudState.currentCategory) {
    html = `
      <div class="crud-delete-confirm">
        <p>
          <img src="../../assets/icons/trashDeleteIcon.svg" style="width:22px;vertical-align:middle;margin-right:6px;">
          Tem certeza que deseja excluir a categoria <b>${crudState.currentCategory.name}</b> (ID ${crudState.currentCategory.category_id})?
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
      crudState.currentCategory = null;
      renderCrudForm();
      const category = await fetchCategoryById(id);
      if (category) {
        crudState.currentCategory = category;
        crudState.mode = "editing";
        showMessage("Categoria encontrada!", "success");
      } else {
        crudState.mode = "inserting";
        showMessage(
          "Categoria não encontrada. Você pode inserir uma nova.",
          "info"
        );
      }
      renderCrudForm();
      renderCrudTable();
    };
  }
  if (crudState.mode === "inserting") {
    document.getElementById("btnSalvar").onclick = async () => {
      const name = document.getElementById("insertName").value.trim();
      const description = document
        .getElementById("insertDescription")
        .value.trim();

      if (!name || name.length > 50)
        return showMessage("Nome obrigatório e até 50 caracteres.", "warning");
      if (!description) return showMessage("Descrição obrigatória.", "warning");

      const ok = await insertCategory({ name, description });
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentCategory = null;
        showMessage("Categoria inserida com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentCategory = null;
      renderCrudForm();
      renderCrudTable();
    };
  }
  if (crudState.mode === "editing" && crudState.currentCategory) {
    document.getElementById("btnSalvar").onclick = async () => {
      const name = document.getElementById("editName").value.trim();
      const description = document
        .getElementById("editDescription")
        .value.trim();

      if (!name || name.length > 50)
        return showMessage("Nome obrigatório e até 50 caracteres.", "warning");
      if (!description) return showMessage("Descrição obrigatória.", "warning");

      const ok = await updateCategory(crudState.currentCategory.category_id, {
        name,
        description,
      });
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentCategory = null;
        showMessage("Categoria alterada com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentCategory = null;
      renderCrudForm();
      renderCrudTable();
    };
    document.getElementById("btnExcluir").onclick = () => {
      crudState.mode = "deleting";
      renderCrudForm();
      renderCrudTable();
    };
  }
  if (crudState.mode === "deleting" && crudState.currentCategory) {
    document.getElementById("btnConfirmDelete").onclick = async () => {
      const ok = await deleteCategory(crudState.currentCategory.category_id);
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentCategory = null;
        showMessage("Categoria excluída com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentCategory = null;
      renderCrudForm();
      renderCrudTable();
    };
  }
}

// Renderiza tabela de categorias
async function renderCrudTable() {
  const tableEl = document.getElementById("categoriesTable");
  const categories = await fetchAllCategories();
  let html = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Descrição</th>
        </tr>
      </thead>
      <tbody>
        ${
          categories.length
            ? categories
                .map(
                  (c) => `
            <tr>
              <td>
                <button class="btn-id" onclick="window.selectCategoryFromTable && window.selectCategoryFromTable(${
                  c.category_id
                })">${c.category_id}</button>
              </td>
              <td>${c.name}</td>
              <td>${c.description || ""}</td>
            </tr>
          `
                )
                .join("")
            : `<tr><td colspan="3" style="text-align:center;color:var(--muted);">Nenhuma categoria cadastrada.</td></tr>`
        }
      </tbody>
    </table>
  `;
  tableEl.innerHTML = html;
  window.selectCategoryFromTable = async (id) => {
    crudState.mode = "searching";
    crudState.currentId = id;
    crudState.currentCategory = null;
    renderCrudForm();
    const category = await fetchCategoryById(id);
    if (category) {
      crudState.currentCategory = category;
      crudState.mode = "editing";
      showMessage("Categoria encontrada!", "success");
    } else {
      crudState.mode = "inserting";
      showMessage(
        "Categoria não encontrada. Você pode inserir uma nova.",
        "info"
      );
    }
    renderCrudForm();
    renderCrudTable();
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!(await protectAdminArea())) return;
  showUserHeader();
  renderCrudForm();
  renderCrudTable();
});

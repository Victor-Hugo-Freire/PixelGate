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
    window.location.href = "../library/library.html";
    return false;
  }
  const res = await fetch(`${API_BASE_URL}/users/${user.user_id}/permissions`, {
    credentials: "include",
  });
  if (!res.ok) {
    window.location.href = "../library/library.html";
    return false;
  }
  const permissions = await res.json();
  if (!permissions.includes(7)) {
    window.location.href = "../library/library.html";
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
          <a href="../library/library.html" id="goHomeBtn">Voltar para área do usuário</a>
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
      window.location.href = "../library/library.html";
    };
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

// Busca todas as roles
async function fetchAllRoles() {
  try {
    const res = await fetch(`${API_BASE_URL}/roles`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

// Busca role por ID
async function fetchRoleById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/roles/${id}`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

// Busca todas as permissões
async function fetchAllPermissions() {
  try {
    const res = await fetch(`${API_BASE_URL}/permissions`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

// Insere nova role
async function insertRole(data) {
  const res = await fetch(`${API_BASE_URL}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (res.ok) return await res.json();
  const err = await res.json();
  showMessage(err.error || "Erro ao inserir cargo", "error");
  return false;
}

// Edita role
async function updateRole(id, data) {
  const res = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (res.ok) return await res.json();
  const err = await res.json();
  showMessage(err.error || "Erro ao editar cargo", "error");
  return false;
}

// Deleta role
async function deleteRole(id) {
  const res = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.ok) return true;
  const err = await res.json();
  showMessage(err.error || "Erro ao excluir cargo", "error");
  return false;
}

// Estado do CRUD
let crudState = {
  mode: "idle", // idle | searching | inserting | editing | deleting
  currentId: "",
  currentRole: null,
  permissions: [],
};

// Renderiza o formulário do CRUD
async function renderCrudForm() {
  const formEl = document.getElementById("crudRolesForm");
  let html = "";
  const allPermissions = await fetchAllPermissions();

  function permissionsCheckboxList(selectedIds = []) {
    return `
      <label>Permissões:</label>
      <div class="categories-list">
        ${allPermissions
          .map(
            (perm) => `
            <label class="category-checkbox">
              <input type="checkbox" value="${perm.permission_id}" ${
              selectedIds.includes(perm.permission_id) ? "checked" : ""
            }>
              ${perm.permission_id} (${perm.name})
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
      <label for="insertName">Nome do Cargo:</label>
      <input type="text" id="insertName" name="insertName" maxlength="50" required autocomplete="off">
      <label for="insertDescription">Descrição:</label>
      <textarea id="insertDescription" name="insertDescription" required></textarea>
      ${permissionsCheckboxList([])}
      <div class="form-actions">
        <button type="button" id="btnSalvar">Salvar</button>
        <button type="button" class="btn-cancel" id="btnCancelar">Cancelar</button>
      </div>
    `;
  } else if (crudState.mode === "editing" && crudState.currentRole) {
    html = `
      <label>ID:</label>
      <input type="text" value="${crudState.currentRole.role_id}" disabled>
      <label for="editName">Nome do Cargo:</label>
      <input type="text" id="editName" name="editName" maxlength="50" required value="${
        crudState.currentRole.name
      }" autocomplete="off">
      <label for="editDescription">Descrição:</label>
      <textarea id="editDescription" name="editDescription" required>${
        crudState.currentRole.description || ""
      }</textarea>
      ${permissionsCheckboxList(crudState.currentRole.permissions || [])}
      <div class="form-actions">
        <button type="button" id="btnSalvar">Salvar</button>
        <button type="button" class="btn-cancel" id="btnCancelar">Cancelar</button>
        ${
          crudState.currentRole.name === "Client"
            ? ""
            : `<button type="button" class="btn-danger" id="btnExcluir">
                <img src="../../assets/icons/trashDeleteIcon.svg" style="width:18px;vertical-align:middle;margin-right:4px;">Excluir
              </button>`
        }
      </div>
    `;
  } else if (crudState.mode === "deleting" && crudState.currentRole) {
    html = `
      <div class="crud-delete-confirm">
        <p>
          <img src="../../assets/icons/trashDeleteIcon.svg" style="width:22px;vertical-align:middle;margin-right:6px;">
          Tem certeza que deseja excluir o cargo <b>${crudState.currentRole.name}</b> (ID ${crudState.currentRole.role_id})?
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
      crudState.currentRole = null;
      renderCrudForm();
      const role = await fetchRoleById(id);
      if (role) {
        crudState.currentRole = role;
        crudState.mode = "editing";
        showMessage("Cargo encontrado!", "success");
      } else {
        crudState.mode = "inserting";
        showMessage("Cargo não encontrado. Você pode inserir um novo.", "info");
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
      const permission_ids = Array.from(
        document.querySelectorAll(
          ".categories-list input[type='checkbox']:checked"
        )
      ).map((el) => el.value);

      if (!name || name.length > 50)
        return showMessage("Nome obrigatório e até 50 caracteres.", "warning");
      if (!description) return showMessage("Descrição obrigatória.", "warning");
      if (name === "Client")
        return showMessage(
          "Não é permitido criar outro cargo 'Client'.",
          "error"
        );

      const ok = await insertRole({ name, description, permission_ids });
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentRole = null;
        showMessage("Cargo inserido com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentRole = null;
      renderCrudForm();
      renderCrudTable();
    };
  }
  if (crudState.mode === "editing" && crudState.currentRole) {
    document.getElementById("btnSalvar").onclick = async () => {
      const name = document.getElementById("editName").value.trim();
      const description = document
        .getElementById("editDescription")
        .value.trim();
      const permission_ids = Array.from(
        document.querySelectorAll(
          ".categories-list input[type='checkbox']:checked"
        )
      ).map((el) => el.value);

      if (!name || name.length > 50)
        return showMessage("Nome obrigatório e até 50 caracteres.", "warning");
      if (!description) return showMessage("Descrição obrigatória.", "warning");
      if (crudState.currentRole.name === "Client" && name !== "Client")
        return showMessage(
          "Não é permitido renomear o cargo padrão 'Client'.",
          "error"
        );

      const ok = await updateRole(crudState.currentRole.role_id, {
        name,
        description,
        permission_ids,
      });
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentRole = null;
        showMessage("Cargo alterado com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentRole = null;
      renderCrudForm();
      renderCrudTable();
    };
    if (crudState.currentRole.name !== "Client") {
      document.getElementById("btnExcluir").onclick = () => {
        crudState.mode = "deleting";
        renderCrudForm();
        renderCrudTable();
      };
    }
  }
  if (crudState.mode === "deleting" && crudState.currentRole) {
    document.getElementById("btnConfirmDelete").onclick = async () => {
      const ok = await deleteRole(crudState.currentRole.role_id);
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentRole = null;
        showMessage("Cargo excluído com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentRole = null;
      renderCrudForm();
      renderCrudTable();
    };
  }
}

// Renderiza tabela de roles e permissões
async function renderCrudTable() {
  const tableEl = document.getElementById("crudRolesTable");
  const roles = await fetchAllRoles();
  let html = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Descrição</th>
          <th>Permissões</th>
        </tr>
      </thead>
      <tbody>
        ${
          roles.length
            ? roles
                .map(
                  (r) => `
            <tr>
              <td>
                <button class="btn-id" onclick="window.selectRoleFromTable && window.selectRoleFromTable(${
                  r.role_id
                })">${r.role_id}</button>
              </td>
              <td>${r.name}</td>
              <td>${r.description || ""}</td>
              <td>${
                Array.isArray(r.permissions)
                  ? r.permissions.map((p) => `<span>${p}</span>`).join(", ")
                  : ""
              }</td>
            </tr>
          `
                )
                .join("")
            : `<tr><td colspan="4" style="text-align:center;color:var(--muted);">Nenhum cargo cadastrado.</td></tr>`
        }
      </tbody>
    </table>
  `;
  tableEl.innerHTML = html;
  window.selectRoleFromTable = async (id) => {
    crudState.mode = "searching";
    crudState.currentId = id;
    crudState.currentRole = null;
    renderCrudForm();
    const role = await fetchRoleById(id);
    if (role) {
      crudState.currentRole = role;
      crudState.mode = "editing";
      showMessage("Cargo encontrado!", "success");
    } else {
      crudState.mode = "inserting";
      showMessage("Cargo não encontrado. Você pode inserir um novo.", "info");
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

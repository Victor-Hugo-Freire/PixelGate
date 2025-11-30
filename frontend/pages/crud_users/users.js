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
      "../../login/login.html?redirect=crud_users/users.html";
    return false;
  }
  const res = await fetch(`${API_BASE_URL}/users/${user.user_id}/permissions`, {
    credentials: "include",
  });
  if (!res.ok) {
    window.location.href =
      "../../login/login.html?redirect=crud_users/users.html";
    return false;
  }
  const permissions = await res.json();
  if (!permissions.includes(7)) {
    window.location.href = "../library/library.html";
    return false;
  }
  return true;
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

// Busca usuário por ID
async function fetchUserById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

// Lista todos os usuários
async function fetchAllUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/users`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

// Insere novo usuário
async function insertUser(data) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data), // NÃO force role_id: 1 aqui!
  });
  if (res.ok) return true;
  const err = await res.json();
  showMessage(err.error || "Erro ao inserir usuário", "error");
  return false;
}

// Edita usuário
async function updateUser(id, data) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data), // NÃO force role_id: 1 aqui!
  });
  if (res.ok) return true;
  const err = await res.json();
  showMessage(err.error || "Erro ao editar usuário", "error");
  return false;
}

// Deleta usuário
async function deleteUser(id) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.ok) return true;
  const err = await res.json();
  showMessage(err.error || "Erro ao excluir usuário", "error");
  return false;
}

// Busca todos os cargos (roles)
async function fetchAllRoles() {
  try {
    const res = await fetch(`${API_BASE_URL}/roles`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

// Estado do CRUD
let crudState = {
  mode: "idle", // idle | searching | inserting | editing | deleting
  currentId: "",
  currentUser: null,
  showPassword: false,
};

// Renderiza o formulário do CRUD
async function renderCrudForm() {
  const formEl = document.getElementById("crudUsersForm");
  let html = "";
  const roles = await fetchAllRoles();

  // Helper para montar o select de roles
  function roleSelect(name, selectedId) {
    return `
      <label for="${name}">Cargo:</label>
      <select id="${name}" name="${name}" required>
        ${roles
          .map(
            (role) =>
              `<option value="${role.role_id}" ${
                role.role_id == selectedId ? "selected" : ""
              }>${role.role_id} (${role.name})</option>`
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
          Buscar usuário por ID:
        </label>
        <div class="input-group">
          <input type="number" id="searchId" name="searchId" min="1" required placeholder="Digite o ID do usuário" autocomplete="off" ${
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
      <label for="insertName">Nome:</label>
      <input type="text" id="insertName" name="insertName" required autocomplete="off">
      <label for="insertEmail">Email:</label>
      <input type="email" id="insertEmail" name="insertEmail" required autocomplete="off">
      <label for="insertPassword">Senha:</label>
      <input type="password" id="insertPassword" name="insertPassword" required autocomplete="off">
      ${roleSelect("insertRole", 1)}
      <div class="form-actions">
        <button type="button" id="btnSalvar">Salvar</button>
        <button type="button" class="btn-cancel" id="btnCancelar">Cancelar</button>
      </div>
    `;
  } else if (crudState.mode === "editing" && crudState.currentUser) {
    html = `
      <label>ID:</label>
      <input type="text" value="${crudState.currentUser.user_id}" disabled>
      <label for="editName">Nome:</label>
      <input type="text" id="editName" name="editName" required value="${
        crudState.currentUser.name
      }" autocomplete="off">
      <label for="editEmail">Email:</label>
      <input type="email" id="editEmail" name="editEmail" required value="${
        crudState.currentUser.email
      }" autocomplete="off">
      <label for="editPassword">Senha (nova):</label>
      <input type="password" id="editPassword" name="editPassword" autocomplete="off" placeholder="Deixe em branco para não alterar">
      ${roleSelect("editRole", crudState.currentUser.role_id)}
      <div class="form-actions">
        <button type="button" id="btnSalvar">Salvar</button>
        <button type="button" class="btn-cancel" id="btnCancelar">Cancelar</button>
        <button type="button" class="btn-danger" id="btnExcluir">
          <img src="../../assets/icons/trashDeleteIcon.svg" style="width:18px;vertical-align:middle;margin-right:4px;">Excluir
        </button>
      </div>
    `;
  } else if (crudState.mode === "deleting" && crudState.currentUser) {
    html = `
      <div class="crud-delete-confirm">
        <p>
          <img src="../../assets/icons/trashDeleteIcon.svg" style="width:22px;vertical-align:middle;margin-right:6px;">
          Tem certeza que deseja excluir o usuário <b>${crudState.currentUser.name}</b> (ID ${crudState.currentUser.user_id})?
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
      crudState.currentUser = null;
      renderCrudForm();
      const user = await fetchUserById(id);
      if (user) {
        crudState.currentUser = user;
        crudState.mode = "editing";
        showMessage("Usuário encontrado!", "success");
      } else {
        crudState.mode = "inserting";
        showMessage(
          "Usuário não encontrado. Você pode inserir um novo.",
          "info"
        );
      }
      renderCrudForm();
      renderCrudTable();
    };
  }
  if (crudState.mode === "inserting") {
    const btnSalvar = document.getElementById("btnSalvar");
    if (btnSalvar)
      btnSalvar.onclick = async () => {
        const name = document.getElementById("insertName").value.trim();
        const email = document.getElementById("insertEmail").value.trim();
        const password = document.getElementById("insertPassword").value;
        const role_id = parseInt(document.getElementById("insertRole").value);
        if (!name || !email || !password)
          return showMessage("Preencha todos os campos!", "warning");
        if (password.length < 6)
          return showMessage(
            "Senha deve ter pelo menos 6 caracteres!",
            "warning"
          );
        if (!email.endsWith("@gmail.com"))
          return showMessage("Email deve terminar com @gmail.com!", "warning");
        // Verifica se nome ou email já existem
        const users = await fetchAllUsers();
        if (users.some((u) => u.name === name))
          return showMessage("Nome já cadastrado!", "warning");
        if (users.some((u) => u.email === email))
          return showMessage("Email já cadastrado!", "warning");
        const ok = await insertUser({ name, email, password, role_id });
        if (ok) {
          crudState.mode = "idle";
          crudState.currentId = "";
          crudState.currentUser = null;
          crudState.showPassword = false;
          showMessage("Usuário inserido com sucesso!", "success");
          renderCrudForm();
          renderCrudTable();
        }
      };
    const btnCancelar = document.getElementById("btnCancelar");
    if (btnCancelar)
      btnCancelar.onclick = () => {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentUser = null;
        crudState.showPassword = false;
        renderCrudForm();
        renderCrudTable();
      };
  }
  if (crudState.mode === "editing" && crudState.currentUser) {
    const btnSalvar = document.getElementById("btnSalvar");
    if (btnSalvar)
      btnSalvar.onclick = async () => {
        const name = document.getElementById("editName").value.trim();
        const email = document.getElementById("editEmail").value.trim();
        const password = document.getElementById("editPassword").value;
        const role_id = parseInt(document.getElementById("editRole").value);
        if (!name || !email)
          return showMessage("Preencha todos os campos!", "warning");
        if (password && password.length < 6)
          return showMessage(
            "Senha deve ter pelo menos 6 caracteres!",
            "warning"
          );
        if (!email.endsWith("@gmail.com"))
          return showMessage("Email deve terminar com @gmail.com!", "warning");
        // Verifica se nome ou email já existem (exceto o próprio)
        const users = await fetchAllUsers();
        if (
          users.some(
            (u) =>
              u.name === name && u.user_id !== crudState.currentUser.user_id
          )
        )
          return showMessage("Nome já cadastrado!", "warning");
        if (
          users.some(
            (u) =>
              u.email === email && u.user_id !== crudState.currentUser.user_id
          )
        )
          return showMessage("Email já cadastrado!", "warning");
        const data = { name, email, role_id };
        if (password) data.password = password;
        const ok = await updateUser(crudState.currentUser.user_id, data);
        if (ok) {
          crudState.mode = "idle";
          crudState.currentId = "";
          crudState.currentUser = null;
          crudState.showPassword = false;
          showMessage("Usuário alterado com sucesso!", "success");
          renderCrudForm();
          renderCrudTable();
        }
      };
    const btnCancelar = document.getElementById("btnCancelar");
    if (btnCancelar)
      btnCancelar.onclick = () => {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentUser = null;
        crudState.showPassword = false;
        renderCrudForm();
        renderCrudTable();
      };
    const btnExcluir = document.getElementById("btnExcluir");
    if (btnExcluir)
      btnExcluir.onclick = () => {
        crudState.mode = "deleting";
        renderCrudForm();
        renderCrudTable();
      };
  }
  if (crudState.mode === "deleting" && crudState.currentUser) {
    document.getElementById("btnConfirmDelete").onclick = async () => {
      const ok = await deleteUser(crudState.currentUser.user_id);
      if (ok) {
        crudState.mode = "idle";
        crudState.currentId = "";
        crudState.currentUser = null;
        crudState.showPassword = false;
        showMessage("Usuário excluído com sucesso!", "success");
        renderCrudForm();
        renderCrudTable();
      }
    };
    document.getElementById("btnCancelar").onclick = () => {
      crudState.mode = "idle";
      crudState.currentId = "";
      crudState.currentUser = null;
      crudState.showPassword = false;
      renderCrudForm();
      renderCrudTable();
    };
  }
}

// Renderiza tabela de usuários
async function renderCrudTable() {
  const tableEl = document.getElementById("crudUsersTable");
  const users = await fetchAllUsers();
  let html = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Email</th>
          <th>Role</th>
          <th>Senha</th>
        </tr>
      </thead>
      <tbody>
        ${
          users.length
            ? users
                .map(
                  (u) => `
            <tr>
              <td>
                <button class="btn-id" onclick="window.selectUserFromTable && window.selectUserFromTable(${
                  u.user_id
                })">${u.user_id}</button>
              </td>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td>${u.role_id === 2 ? "Administrador" : "Cliente"}</td>
              <td class="hidden-password">
                *******
              </td>
            </tr>
          `
                )
                .join("")
            : `<tr><td colspan="5" style="text-align:center;color:var(--muted);">Nenhum usuário cadastrado.</td></tr>`
        }
      </tbody>
    </table>
  `;
  tableEl.innerHTML = html;
  // Seleção rápida pelo botão de ID
  window.selectUserFromTable = async (id) => {
    crudState.mode = "searching";
    crudState.currentId = id;
    crudState.currentUser = null;
    renderCrudForm();
    const user = await fetchUserById(id);
    if (user) {
      crudState.currentUser = user;
      crudState.mode = "editing";
      showMessage("Usuário encontrado!", "success");
    } else {
      crudState.mode = "inserting";
      showMessage("Usuário não encontrado. Você pode inserir um novo.", "info");
    }
    renderCrudForm();
    renderCrudTable();
  };
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

document.addEventListener("DOMContentLoaded", async () => {
  if (!(await protectAdminArea())) return;
  showUserHeader();
  renderCrudForm();
  renderCrudTable();
});

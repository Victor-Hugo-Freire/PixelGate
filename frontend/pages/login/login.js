const API_BASE_URL = "http://localhost:3001/api";

let mode = "login"; // "login" ou "register"

const loginForm = document.getElementById("loginForm");
const submitBtn = document.getElementById("submitBtn");
const loginMessage = document.getElementById("loginMessage");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");
const eyeSlashedIcon = document.getElementById("eyeSlashedIcon");
const switchText = document.getElementById("switchText");
const switchLink = document.getElementById("switchLink");

function setMode(newMode) {
  mode = newMode;
  if (mode === "login") {
    submitBtn.textContent = "Entrar";
    switchText.textContent = "Não tem uma conta?";
    switchLink.textContent = "Criar conta";
  } else {
    submitBtn.textContent = "Registrar-se";
    switchText.textContent = "Já tem uma conta?";
    switchLink.textContent = "Entrar";
  }
  loginMessage.textContent = "";
  loginMessage.className = "login-message";
}

switchLink.onclick = (e) => {
  e.preventDefault();
  setMode(mode === "login" ? "register" : "login");
};

togglePasswordBtn.onclick = () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.style.display = "none";
    eyeSlashedIcon.style.display = "inline";
  } else {
    passwordInput.type = "password";
    eyeIcon.style.display = "inline";
    eyeSlashedIcon.style.display = "none";
  }
};

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  loginMessage.textContent = "";
  loginMessage.className = "login-message";

  const name = loginForm.name.value.trim();
  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;

  if (!name || !email || !password) {
    showMsg("Preencha todos os campos.", "error");
    return;
  }
  if (password.length < 6) {
    showMsg("A senha deve ter pelo menos 6 caracteres.", "error");
    return;
  }

  submitBtn.disabled = true;

  try {
    let res;
    if (mode === "login") {
      res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
    } else {
      res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
    }
    const data = await res.json();
    if (res.ok) {
      showMsg(data.message || "Sucesso!", "success");
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        // Corrige caminho para não duplicar /pages/
        if (redirect) {
          let path = redirect.replace(/^(\.\/|\.\.\/)+/, "");
          if (!path.startsWith("pages/")) path = "pages/" + path;
          window.location.href = "../../" + path;
        } else {
          window.location.href = "../../index.html";
        }
      }, 1200);
    } else {
      showMsg(data.error || "Erro ao autenticar.", "error");
    }
  } catch (err) {
    showMsg("Erro de conexão.", "error");
  }
  submitBtn.disabled = false;
};

function showMsg(msg, type) {
  loginMessage.textContent = msg;
  loginMessage.className = `login-message show ${type}`;
}

// Header dinâmico igual às outras telas
async function showUserHeader() {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) return;
  const user = await res.json();
  const headerActions = document.getElementById("header-actions");
  if (user && user.name) {
    const isAdmin = user.role_id === 2;
    headerActions.innerHTML = `
      <div class="user-dropdown">
        <button class="user-btn" id="userBtn">
          <img src="../../assets/icons/userIcon.svg" alt="Usuário" style="width:28px;height:28px;vertical-align:middle;">
          <span style="font-weight:bold;color:var(--accent);font-size:1.1em;">${user.name}</span>
          <span style="margin-left:6px;">▼</span>
        </button>
        <div class="user-dropdown-content" id="userDropdownContent" style="display:none;">
          <a href="../crud_users/users.html">Painel administrativo</a>
          <a href="#" id="logoutBtn">Logout</a>
        </div>
      </div>
    `;
    // Dropdown toggle
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
    // Logout handler
    document.getElementById("logoutBtn").onclick = async (e) => {
      e.preventDefault();
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.reload();
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get("mode");
  setMode(modeParam === "register" ? "register" : "login");
  showUserHeader();
});

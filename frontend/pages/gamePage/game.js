const API_BASE_URL = "http://localhost:3001/api";

// Função para obter usuário logado via cookie JWT
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

// Função para obter permissões do usuário
async function getUserPermissions(user_id) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${user_id}/permissions`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
    return [];
  } catch {
    return [];
  }
}

// Verifica se o jogo está na biblioteca do usuário
async function isGameInLibrary(user_id, game_id) {
  try {
    const res = await fetch(`${API_BASE_URL}/library/${user_id}`, {
      credentials: "include",
    });
    if (res.ok) {
      const games = await res.json();
      return games.some((g) => String(g.game_id) === String(game_id));
    }
  } catch {}
  return false;
}

// Verifica se o jogo está no carrinho do usuário
async function isGameInCart(user_id, game_id) {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/${user_id}`, {
      credentials: "include",
    });
    if (res.ok) {
      const items = await res.json();
      return items.some((item) => String(item.game_id) === String(game_id));
    }
  } catch {}
  return false;
}

// Função para carregar dados do jogo e renderizar página
async function loadGame() {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get("id");
  if (!gameId) return;

  const section = document.getElementById("game-section");
  section.innerHTML = "<div>Carregando...</div>";

  try {
    const res = await fetch(`${API_BASE_URL}/games/${gameId}`);
    if (!res.ok) {
      section.innerHTML = "<div>Jogo não encontrado.</div>";
      return;
    }
    const game = await res.json();

    // Carregue categorias, requisitos, etc. conforme seu backend
    const categories = game.categories || [];
    let requirements = {};
    try {
      const reqRes = await fetch(`${API_BASE_URL}/game-details/${gameId}`);
      if (reqRes.ok) {
        requirements = await reqRes.json();
      }
    } catch {}

    // Verifica status do usuário
    const user = await getCurrentUser();
    let btnHtml = "";
    let btnDisabled = false;
    let btnText = "Adicionar ao Carrinho";
    let btnClass = "btn-primary";
    let btnAction = null;

    if (user && user.user_id) {
      const [inLibrary, inCart] = await Promise.all([
        isGameInLibrary(user.user_id, gameId),
        isGameInCart(user.user_id, gameId),
      ]);
      if (inLibrary) {
        btnText = "Comprado";
        btnDisabled = true;
        btnClass += " bought";
      } else if (inCart) {
        btnText = "Adicionado ao Carrinho";
        btnDisabled = true;
        btnClass += " added";
      } else {
        btnDisabled = false;
        btnClass = "btn-primary";
        btnAction = async () => {
          await fetch(`${API_BASE_URL}/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ game_id: gameId }),
          });
          const btn = document.getElementById("addToCartBtn");
          btn.classList.add("added");
          btn.textContent = "Adicionado ao Carrinho";
          btn.disabled = true;
          setTimeout(() => (window.location.href = "../cart/cart.html"), 1200);
        };
      }
    } else {
      btnAction = () => {
        window.location.href = "../login/login.html?redirect=cart/cart.html";
      };
    }

    btnHtml = `<button class="${btnClass}" id="addToCartBtn" ${
      btnDisabled ? "disabled" : ""
    }>${btnText}</button>`;

    section.innerHTML = `
      <div class="game-main-row">
        <div class="game-img-block">
          <img class="game-img" src="../../assets/imgs/${
            game.game_id
          }.jpeg" alt="${game.title}" />
        </div>
        <div class="game-info">
          <div class="game-title">${game.title}</div>
          <div class="game-desc">${game.description}</div>
          <div class="game-categories">Categorias: ${
            categories.length ? categories.join(", ") : "Nenhuma"
          }</div>
          <div class="game-developer">Desenvolvedora: ${game.developer}</div>
          <div class="game-release">Lançamento: ${game.release_date}</div>
          <div class="game-size">Tamanho: ${Number(game.size_gb).toFixed(
            2
          )} GB</div>
          <div class="game-info-footer">
            <div class="game-price">R$ ${Number(game.price).toFixed(2)}</div>
            ${btnHtml}
          </div>
        </div>
      </div>
      <div class="game-requirements-row">
        ${
          requirements.min_requirements
            ? `
          <div class="requirements-block">
            <div class="requirements-title">Requisitos Mínimos</div>
            <div class="requirements-list">${requirements.min_requirements}</div>
          </div>
        `
            : ""
        }
        ${
          requirements.recommended_requirements
            ? `
          <div class="requirements-block">
            <div class="requirements-title">Requisitos Recomendados</div>
            <div class="requirements-list">${requirements.recommended_requirements}</div>
          </div>
        `
            : ""
        }
      </div>
    `;

    // Adicionar ao carrinho (apenas se permitido)
    if (btnAction && !btnDisabled) {
      document.getElementById("addToCartBtn").onclick = btnAction;
    }
  } catch (err) {
    section.innerHTML = "<div>Erro ao carregar jogo.</div>";
  }
}

// Formata requisitos para exibir cada campo destacado
function formatRequirements(reqStr) {
  const labels = ["SO", "CPU", "RAM", "GPU"];
  const parts = reqStr.split(",").map((s) => s.trim());
  let html = "";
  for (let i = 0; i < parts.length; i++) {
    html += `<b>${labels[i] || "Outro"}:</b> ${parts[i]}<br>`;
  }
  return html;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR");
}

// Header dinâmico igual às outras telas
async function showUserHeader() {
  const user = await getCurrentUser();
  if (user && user.user_id) {
    const permissions = await getUserPermissions(user.user_id);
    const isAdmin = permissions.includes(7);
    const headerActions = document.getElementById("header-actions");
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
          ${
            isAdmin
              ? `<a href="../crud_users/users.html">Painel administrativo</a>`
              : ""
          }
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

// Toast estilizado
function showToast(msg, type = "success") {
  let toast = document.createElement("div");
  toast.className = "custom-toast " + type;
  toast.textContent = msg;
  toast.style.position = "fixed";
  toast.style.top = "1.5em";
  toast.style.right = "2em";
  toast.style.zIndex = "9999";
  toast.style.padding = "1em 2em";
  toast.style.borderRadius = "8px";
  toast.style.background = type === "success" ? "#09c184" : "#e74c3c";
  toast.style.color = "#0d192b";
  toast.style.fontWeight = "bold";
  toast.style.boxShadow = "0 2px 16px #0008";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1800);
}

// Protege links do header
function protectHeaderLinks() {
  const libraryLink = document.getElementById("libraryLink");
  const cartLink = document.getElementById("cartLink");
  if (libraryLink) {
    libraryLink.onclick = async (e) => {
      e.preventDefault();
      const user = await getCurrentUser();
      if (!user) {
        window.location.href =
          "../login/login.html?redirect=library/library.html";
      } else {
        window.location.href = "../library/library.html";
      }
    };
  }
  if (cartLink) {
    cartLink.onclick = async (e) => {
      e.preventDefault();
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "../login/login.html?redirect=cart/cart.html";
      } else {
        window.location.href = "../cart/cart.html";
      }
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showUserHeader();
  protectHeaderLinks();
  loadGame();
});

const API_BASE_URL = "http://localhost:3001/api";

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

async function showUserHeader() {
  const user = await getCurrentUser();
  if (user && user.user_id) {
    const permissions = await getUserPermissions(user.user_id);
    const isAdmin = permissions.includes(7);
    const hasReport = permissions.includes(19);
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
            hasReport
              ? `<a href="../relatorio2/relatorio2.html">Relatório: Jogos Mais Vendidos</a>
          <a href="../relatorio1/relatorio1.html">Relatório: Jogos Comprados por Período</a>`
              : ""
          }
          ${
            isAdmin
              ? `<a href="../crud_users/users.html">Painel administrativo</a>`
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
      window.location.reload();
    };
  }
}

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

async function fetchGameCategories(game_id) {
  try {
    const res = await fetch(`${API_BASE_URL}/games/${game_id}`, {
      credentials: "include",
    });
    if (res.ok) {
      const game = await res.json();
      return game.categories || [];
    }
  } catch {}
  return [];
}

async function loadLibrary() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "../login/login.html?redirect=library/library.html";
    return;
  }
  const listEl = document.getElementById("libraryList");
  const detailsEl = document.getElementById("libraryDetails");
  listEl.innerHTML = "<div>Carregando...</div>";

  try {
    const res = await fetch(`${API_BASE_URL}/library/${user.user_id}`, {
      credentials: "include",
    });
    if (!res.ok) {
      listEl.innerHTML = "<div>Erro ao carregar biblioteca.</div>";
      return;
    }
    const games = await res.json();
    if (!games.length) {
      listEl.innerHTML =
        "<div style='color:var(--muted);padding:2em;'>Nenhum jogo comprado ainda.</div>";
      detailsEl.innerHTML = `<div class="library-placeholder">Selecione um jogo à esquerda para ver detalhes.</div>`;
      return;
    }
    listEl.innerHTML = games
      .map(
        (g, idx) =>
          `<button class="library-game-title" data-idx="${idx}">${g.title}</button>`
      )
      .join("");
    detailsEl.innerHTML = `<div class="library-placeholder">Selecione um jogo à esquerda para ver detalhes.</div>`;

    // Clique nos títulos
    const btns = listEl.querySelectorAll(".library-game-title");
    btns.forEach((btn) => {
      btn.onclick = async () => {
        // Se já está selecionado, desmarca e limpa detalhes
        if (btn.classList.contains("selected")) {
          btn.classList.remove("selected");
          detailsEl.innerHTML = `<div class="library-placeholder">Selecione um jogo à esquerda para ver detalhes.</div>`;
          return;
        }
        btns.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        const game = games[btn.dataset.idx];
        // Busca categorias do jogo
        game.categories = await fetchGameCategories(game.game_id);
        showGameDetails(game);
      };
    });
  } catch (err) {
    listEl.innerHTML = "<div>Erro ao carregar biblioteca.</div>";
  }
}

async function showGameDetails(game) {
  const detailsEl = document.getElementById("libraryDetails");
  let requirements = {};
  try {
    const reqRes = await fetch(`${API_BASE_URL}/game-details/${game.game_id}`);
    if (reqRes.ok) {
      requirements = await reqRes.json();
    }
  } catch {}
  detailsEl.innerHTML = `
    <img class="library-game-img" src="../../assets/imgs/${
      game.game_id
    }.jpeg" alt="${game.title}" />
    <div class="library-game-title-details">${game.title}</div>
    <div class="library-game-desc">${game.description}</div>
    <div class="library-game-categories">Categorias: ${
      game.categories && game.categories.length
        ? game.categories.join(", ")
        : "Nenhuma"
    }</div>
    <div class="library-game-developer">Desenvolvedora: ${game.developer}</div>
    <div class="library-game-release">Lançamento: ${game.release_date}</div>
    <div class="library-game-size">Tamanho: ${Number(game.size_gb).toFixed(
      2
    )} GB</div>
    <div class="library-game-info-footer">
      <div class="library-game-price">R$ ${Number(game.price).toFixed(2)}</div>
      <button class="library-game-bought-btn" disabled>Comprado</button>
    </div>
    <div class="library-game-requirements-row">
      ${
        requirements.min_requirements
          ? `<div class="requirements-block">
              <div class="requirements-title">Requisitos Mínimos</div>
              <div class="requirements-list">${requirements.min_requirements}</div>
            </div>`
          : ""
      }
      ${
        requirements.recommended_requirements
          ? `<div class="requirements-block">
              <div class="requirements-title">Requisitos Recomendados</div>
              <div class="requirements-list">${requirements.recommended_requirements}</div>
            </div>`
          : ""
      }
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  showUserHeader();
  protectHeaderLinks();
  loadLibrary();
});

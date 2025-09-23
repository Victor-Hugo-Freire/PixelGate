const API_BASE_URL = "http://localhost:3001/api";

async function loadSlider() {
  const res = await fetch(`${API_BASE_URL}/home/slider`);
  const slides = await res.json();
  const sliderDiv = document.getElementById("slider");
  sliderDiv.innerHTML = "";

  slides.forEach((slide, idx) => {
    const preco = Number(slide.price) || 0;
    const item = document.createElement("div");
    item.className = "slider-item" + (idx === 0 ? " active" : "");
    item.innerHTML = `
      <img class="slider-img" src="assets/imgs/${slide.game_id}.jpeg" alt="${
      slide.title
    }" />
      <div class="slider-info">
        <div class="slider-title">${slide.title}</div>
        <div class="slider-desc">${slide.description}</div>
        <div class="slider-price">R$ ${preco.toFixed(2)}</div>
        <button class="btn-primary" onclick="window.location.href='pages/gamePage/game.html?id=${
          slide.game_id
        }'">Ver detalhes</button>
      </div>
    `;
    sliderDiv.appendChild(item);
  });

  let current = 0;
  setInterval(() => {
    const items = sliderDiv.querySelectorAll(".slider-item");
    items.forEach((el, i) => el.classList.toggle("active", i === current));
    current = (current + 1) % items.length;
  }, 5000);
}

async function loadCategories() {
  const res = await fetch(`${API_BASE_URL}/home/games-by-category`);
  const categories = await res.json();
  const section = document.getElementById("categories-section");
  section.innerHTML = "";

  categories.forEach((cat) => {
    const row = document.createElement("div");
    row.className = "category-row";
    row.innerHTML = `
      <div class="category-title">${cat.category_name}</div>
      <div class="category-slider">
        ${cat.games
          .map((game) => {
            const preco = Number(game.price) || 0;
            return `
            <div class="category-game" tabindex="0" role="button" aria-label="Ver detalhes de ${
              game.title
            }">
              <img src="assets/imgs/${game.game_id}.jpeg" alt="${game.title}" />
              <div class="category-game-title">${game.title}</div>
              <div class="category-game-price">R$ ${preco.toFixed(2)}</div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
    section.appendChild(row);

    setTimeout(() => {
      row.querySelectorAll(".category-game").forEach((card, idx) => {
        card.onclick = () => {
          const game = cat.games[idx];
          window.location.href = `pages/gamePage/game.html?id=${game.game_id}`;
        };
      });
    }, 0);
  });
}

// Use em qualquer página para obter o usuário logado
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
  const headerActions = document.getElementById("header-actions");
  if (user && user.user_id) {
    const permissions = await getUserPermissions(user.user_id);
    const isAdmin = permissions.includes(7);
    headerActions.innerHTML = `
      <div class="user-dropdown">
        <button class="user-btn" id="userBtn">
          <img src="assets/icons/userIcon.svg" alt="Usuário" style="width:28px;height:28px;vertical-align:middle;">
          <span style="font-weight:bold;color:var(--accent);font-size:1.1em;">${
            user.name
          }</span>
          <span style="margin-left:6px;">▼</span>
        </button>
        <div class="user-dropdown-content" id="userDropdownContent" style="display:none;">
          ${
            isAdmin
              ? `<a href="pages/crud_users/users.html">Painel administrativo</a>`
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
          "pages/login/login.html?redirect=library/library.html";
      } else {
        window.location.href = "pages/library/library.html";
      }
    };
  }
  if (cartLink) {
    cartLink.onclick = async (e) => {
      e.preventDefault();
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "pages/login/login.html?redirect=cart/cart.html";
      } else {
        window.location.href = "pages/cart/cart.html";
      }
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadSlider();
  loadCategories();
  showUserHeader();
  protectHeaderLinks();
});

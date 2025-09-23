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

async function showUserHeader() {
  const user = await getCurrentUser();
  let isAdmin = false;
  if (user && user.user_id) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/users/${user.user_id}/permissions`,
        { credentials: "include" }
      );
      if (res.ok) {
        const permissions = await res.json();
        isAdmin = permissions.includes(7);
      }
    } catch {}
    const headerActions = document.getElementById("header-actions");
    if (user && user.name) {
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
}

async function loadCart() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "../login/login.html?redirect=cart/cart.html";
    return;
  }
  const cartItemsDiv = document.getElementById("cartItems");
  const cartTotalSpan = document.getElementById("cartTotal");
  const cartTitlesDiv = document.getElementById("cartTitles");
  const cartMessage = document.getElementById("cartMessage");

  cartItemsDiv.innerHTML = "<div>Carregando...</div>";
  cartTitlesDiv.innerHTML = "";
  let total = 0;

  try {
    const res = await fetch(`${API_BASE_URL}/cart/${user.user_id}`, {
      credentials: "include",
    });
    const items = await res.json();

    if (!items.length) {
      cartItemsDiv.innerHTML =
        "<div class='cart-empty'>Seu carrinho está vazio.</div>";
      cartTitlesDiv.innerHTML =
        "<div class='cart-title-item'>Nenhum item no carrinho</div>";
      cartTotalSpan.textContent = "R$ 0,00";
      document.getElementById("checkoutBtn").disabled = true;
      return;
    }

    cartItemsDiv.innerHTML = "";
    cartTitlesDiv.innerHTML = "";
    items.forEach((item) => {
      total += Number(item.price);
      const itemDiv = document.createElement("div");
      itemDiv.className = "cart-item";
      itemDiv.innerHTML = `
        <img class="cart-item-img" src="../../assets/imgs/${
          item.game_id
        }.jpeg" alt="${item.title}">
        <div>
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">R$ ${Number(item.price).toFixed(2)}</div>
        </div>
        <button class="cart-item-remove" data-id="${
          item.item_id
        }">Remover</button>
      `;
      cartItemsDiv.appendChild(itemDiv);

      const titleDiv = document.createElement("div");
      titleDiv.className = "cart-title-item";
      titleDiv.textContent = item.title;
      cartTitlesDiv.appendChild(titleDiv);
    });

    cartTotalSpan.textContent = "R$ " + total.toFixed(2);

    document.querySelectorAll(".cart-item-remove").forEach((btn) => {
      btn.onclick = async () => {
        btn.disabled = true;
        try {
          const res = await fetch(`${API_BASE_URL}/cart/${btn.dataset.id}`, {
            method: "DELETE",
            credentials: "include",
          });
          const data = await res.json();
          showCartMsg(data.message || "Item removido!", "success");
          loadCart();
        } catch (err) {
          showCartMsg("Erro ao remover item!", "error");
        }
      };
    });

    document.getElementById("checkoutBtn").disabled = false;
  } catch (err) {
    cartItemsDiv.innerHTML =
      "<div class='cart-empty'>Erro ao carregar carrinho.</div>";
    cartTitlesDiv.innerHTML =
      "<div class='cart-title-item'>Erro ao carregar</div>";
    cartTotalSpan.textContent = "R$ 0,00";
    document.getElementById("checkoutBtn").disabled = true;
  }
}

function showCartMsg(msg, type = "error") {
  const cartMessage = document.getElementById("cartMessage");
  cartMessage.textContent = msg;
  cartMessage.className = "cart-message show " + type;
  setTimeout(() => {
    cartMessage.className = "cart-message";
    cartMessage.textContent = "";
  }, 1800);
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

document.addEventListener("DOMContentLoaded", () => {
  showUserHeader();
  protectHeaderLinks();
  loadCart();

  document.getElementById("checkoutBtn").onclick = () => {
    window.location.href = "../payment/payment.html";
  };
});

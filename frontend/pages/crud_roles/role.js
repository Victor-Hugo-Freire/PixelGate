// ...no topo do arquivo...
async function protectAdminArea() {
  const user = await getCurrentUser();
  if (!user || !user.user_id) {
    window.location.href = "../../login/login.html?redirect=crud_users/users.html";
    return false;
  }
  // Verifique permissão administrativa (role_id === 2 ou permission 7)
  const res = await fetch(`${API_BASE_URL}/users/${user.user_id}/permissions`, { credentials: "include" });
  if (!res.ok) {
    window.location.href = "../../login/login.html?redirect=crud_users/users.html";
    return false;
  }
  const permissions = await res.json();
  if (!permissions.includes(7)) {
    window.location.href = "../../library/library.html";
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!(await protectAdminArea())) return;
  showUserHeader();
  // ...restante do código...
});

// ...dentro de showUserHeader...
headerActions.innerHTML = `
  <div class="user-dropdown">
    <button class="user-btn" id="userBtn">
      <img src="../../assets/icons/userIcon.svg" alt="Usuário" style="width:28px;height:28px;vertical-align:middle;">
      <span style="font-weight:bold;color:var(--accent);font-size:1.1em;">${user.name}</span>
      <span style="margin-left:6px;">▼</span>
    </button>
    <div class="user-dropdown-content" id="userDropdownContent" style="display:none;">
      <a href="../../library/library.html">Voltar para área do usuário</a>
      <a href="#" id="logoutBtn">Logout</a>
    </div>
  </div>
`;
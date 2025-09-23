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
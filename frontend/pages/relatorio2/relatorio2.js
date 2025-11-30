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

// Proteção igual ao backend: só mostra a página se o backend liberar
async function protectReportPage() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/relatorio2?data_inicio=2000-01-01&data_fim=2000-01-02`,
      { credentials: "include" }
    );
    if (res.status === 401) {
      document.querySelector("main").innerHTML =
        '<div class="message erro">Faça login para acessar esta página.</div>';
      return false;
    }
    if (res.status === 403) {
      document.querySelector("main").innerHTML =
        '<div class="message erro">Acesso negado: você não tem permissão para relatórios.</div>';
      return false;
    }
    return true;
  } catch {
    document.querySelector("main").innerHTML =
      '<div class="message erro">Erro ao verificar permissão.</div>';
    return false;
  }
}

// Header com link correto para home
async function showUserHeader() {
  const user = await getCurrentUser();
  const headerActions = document.getElementById("header-actions");
  if (user && user.user_id) {
    const permissions = await getUserPermissions(user.user_id);
    const hasReport = permissions.includes(19);
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

async function fetchCategorias() {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    credentials: "include",
  });
  if (res.ok) return await res.json();
  return [];
}

function formatCurrency(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Mensagem no topo igual aos cruds
function showMensagem(msg, type = "erro") {
  let el = document.getElementById("mensagem-flutuante");
  if (!el) {
    el = document.createElement("div");
    el.id = "mensagem-flutuante";
    el.className = "message-container-flutuante";
    document.body.appendChild(el);
  }
  el.innerHTML = msg ? `<div class="message ${type}">${msg}</div>` : "";
  el.style.display = msg ? "block" : "none";
  if (msg) {
    setTimeout(() => {
      el.style.display = "none";
      el.innerHTML = "";
    }, 3500);
  }
}

// Torna o select de categoria múltiplo, estilizado e seguro
function updateCategorySelect(isAdmin) {
  const categoriaSelect = document.getElementById("categoriaFiltro");
  if (!categoriaSelect) return;
  if (isAdmin) {
    categoriaSelect.setAttribute("multiple", "multiple");
    categoriaSelect.size = 5;
    document.getElementById("categoriaHelper").style.display = "block";
  } else {
    categoriaSelect.removeAttribute("multiple");
    categoriaSelect.size = 1;
    document.getElementById("categoriaHelper").style.display = "none";
  }
}

async function carregarCategorias() {
  const categorias = await fetchCategorias();
  const container = document.getElementById("categoriasCheckboxes");
  if (!container) return;
  let html = `<label class='categoria-checkbox'><input type='checkbox' value='' checked> Todas</label>`;
  categorias.forEach((cat) => {
    html += `<label class='categoria-checkbox'><input type='checkbox' value='${cat.category_id}'> ${cat.name}</label>`;
  });
  container.innerHTML = html;
  // Lógica: se "Todas" for marcada, desmarca as outras e vice-versa
  const todas = container.querySelector("input[value='']");
  const outros = Array.from(
    container.querySelectorAll("input[type='checkbox']:not([value=''])")
  );
  todas.addEventListener("change", () => {
    if (todas.checked) outros.forEach((cb) => (cb.checked = false));
  });
  outros.forEach((cb) => {
    cb.addEventListener("change", () => {
      if (cb.checked) todas.checked = false;
      if (!outros.some((c) => c.checked)) todas.checked = true;
    });
  });
}

// Preenche anos no filtro (últimos 5 anos até o atual)
function preencherAnos() {
  const select = document.getElementById("anoFiltro");
  const anoAtual = new Date().getFullYear();
  for (let a = anoAtual; a >= anoAtual - 5; a--) {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    select.appendChild(opt);
  }
}

function getFiltroPeriodo() {
  const anoEl = document.getElementById("anoFiltro");
  const mesEl = document.getElementById("mesFiltro");
  if (!anoEl || !mesEl) return null;
  const ano = anoEl.value;
  const mes = mesEl.value;
  if (!ano) return null;
  let data_inicio, data_fim;
  if (!mes) {
    data_inicio = `${ano}-01-01`;
    data_fim = `${ano}-12-31`;
  } else {
    data_inicio = `${ano}-${mes}-01`;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    data_fim = `${ano}-${mes}-${ultimoDia}`;
  }
  return { data_inicio, data_fim };
}

function getSelectedCategories() {
  const container = document.getElementById("categoriasCheckboxes");
  if (!container) return [];
  const todas = container.querySelector("input[value='']");
  if (todas && todas.checked) return [];
  return Array.from(
    container.querySelectorAll("input[type='checkbox']:not([value='']):checked")
  ).map((cb) => cb.value);
}

// Adiciona ordenação pelos menos vendidos/lucrativos
function preencherOrderBy() {
  const select = document.getElementById("orderByFiltro");
  if (!select) return;
  select.innerHTML = `
    <option value="total_vendas">Mais vendidos</option>
    <option value="total_vendas_asc">Menos vendidos</option>
    <option value="receita_gerada">Mais lucrativos</option>
    <option value="receita_gerada_asc">Menos lucrativos</option>
  `;
}

async function buscarRelatorio(e) {
  if (e) e.preventDefault();
  showMensagem("");
  const periodo = getFiltroPeriodo();
  if (!periodo) {
    showMensagem("Selecione o ano e mês.", "erro");
    return;
  }
  const categorias = getSelectedCategories();
  let orderBy = document.getElementById("orderByFiltro").value;
  let orderParam = orderBy;
  if (orderBy === "total_vendas_asc") orderParam = "total_vendas_asc";
  if (orderBy === "receita_gerada_asc") orderParam = "receita_gerada_asc";
  let url = `${API_BASE_URL}/relatorio2?data_inicio=${periodo.data_inicio}&data_fim=${periodo.data_fim}&order_by=${orderParam}`;
  if (categorias.length) {
    url += `&categorias=${categorias.join(",")}`;
  }
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    let msg = "Erro ao buscar relatório.";
    try {
      msg = (await res.json()).error || msg;
    } catch {}
    showMensagem(msg, "erro");
    return;
  }
  const { ranking } = await res.json();
  renderTabela(ranking);
  document.getElementById("relatorioContainer").style.display = "block";
  document.getElementById("btnExportarPDF").disabled = false;
}

function renderTabela(dados) {
  const tbody = document.querySelector("#tabelaRelatorio tbody");
  tbody.innerHTML = "";
  if (!dados.length) {
    tbody.innerHTML = `<tr><td colspan="4">Nenhum resultado para o filtro.</td></tr>`;
    return;
  }
  dados.forEach((jogo) => {
    tbody.innerHTML += `
      <tr>
        <td>${jogo.nome_jogo}</td>
        <td>${jogo.categorias}</td>
        <td>${jogo.total_vendas}</td>
        <td>${formatCurrency(Number(jogo.receita_gerada))}</td>
      </tr>
    `;
  });
}

// PDF/Impressão nativa
async function exportarPDF() {
  const periodo = getFiltroPeriodo();
  const container = document.getElementById("categoriasCheckboxes");
  let categoriasSelecionadas = [];
  if (container) {
    const todas = container.querySelector("input[value='']");
    if (todas && todas.checked) {
      categoriasSelecionadas = ["Todas"];
    } else {
      categoriasSelecionadas = Array.from(
        container.querySelectorAll(
          "input[type='checkbox']:not([value='']):checked"
        )
      ).map((cb) => cb.parentElement.textContent.trim());
      if (!categoriasSelecionadas.length) categoriasSelecionadas = ["Todas"];
    }
  }
  const categoriasTexto = categoriasSelecionadas.join(", ");
  const orderBy =
    document.getElementById("orderByFiltro").selectedOptions[0].textContent;
  const tabela = document.getElementById("tabelaRelatorio");
  const mes = document.getElementById("mesFiltro").value;
  const user = await getCurrentUser();
  let nomeRelatorio = `relatorio`;
  if (mes) {
    nomeRelatorio += `_${periodo.data_inicio}_a_${periodo.data_fim}`;
  } else {
    nomeRelatorio += `_${periodo.data_inicio}_a_${periodo.data_fim}`;
  }
  nomeRelatorio += `_jogos_vendidos.pdf`;
  // Cria uma nova janela só com a tabela e filtros
  const win = window.open("", "", "width=900,height=700");
  win.document.write("<html><head><title>Relatório</title>");
  win.document.write('<link rel="stylesheet" href="../../global.css" />');
  win.document.write('<link rel="stylesheet" href="relatorio2.css" />');
  win.document.write("</head><body>");
  win.document.write(
    `<div style='font-size:1.2em;font-weight:bold;margin-bottom:0.7em;'>Relatório gerado por: ${
      user ? user.name : "Usuário"
    }</div>`
  );
  win.document.write(`<h2>Relatório: Jogos Vendidos</h2>`);
  win.document.write(
    `<div style=\"margin-bottom:1em;\"><b>Período:</b> ${periodo.data_inicio} a ${periodo.data_fim} <b>Categorias:</b> ${categoriasTexto} <b>Ordenação:</b> ${orderBy}</div>`
  );
  win.document.write(tabela.outerHTML);
  win.document.write("</body></html>");
  win.document.close();
  win.print();
  setTimeout(() => win.close(), 1000);
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!(await protectReportPage())) return;
  showUserHeader();
  await carregarCategorias();
  preencherAnos();
  preencherOrderBy();
  document.getElementById("filtroForm").onsubmit = buscarRelatorio;
  document.getElementById("btnExportarPDF").onclick = exportarPDF;
});

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
              ? `<a href="../relatorio2/relatorio2.html">Relatório: Jogos Mais Vendidos</a>
          <a href="../relatorio1/relatorio1.html">Relatório: Jogos Comprados por Período</a>`
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

// Torna o select de categoria múltiplo e corrige filtro para funcionar com IDs
async function carregarCategorias() {
  const categorias = await fetchCategorias();
  const select = document.getElementById("categoriaFiltro");
  select.multiple = true;
  select.size = Math.min(6, categorias.length + 1); // visual melhor
  select.innerHTML = '<option value="">Todas</option>';
  categorias.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.category_id;
    opt.textContent = cat.name;
    select.appendChild(opt);
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
  const ano = document.getElementById("anoFiltro").value;
  const mes = document.getElementById("mesFiltro").value;
  if (!ano) return null;
  if (!mes) {
    // Qualquer mês do ano
    return {
      data_inicio: `${ano}-01-01`,
      data_fim: `${ano}-12-31`,
    };
  }
  const data_inicio = `${ano}-${mes}-01`;
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const data_fim = `${ano}-${mes}-${ultimoDia}`;
  return { data_inicio, data_fim };
}

function getSelectedCategories() {
  const select = document.getElementById("categoriaFiltro");
  return Array.from(select.selectedOptions)
    .map((opt) => opt.value)
    .filter((v) => v && v !== "");
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
  const orderBy = document.getElementById("orderByFiltro").value;
  let url = `${API_BASE_URL}/relatorio2?data_inicio=${periodo.data_inicio}&data_fim=${periodo.data_fim}&order_by=${orderBy}`;
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
  const categoria =
    document.getElementById("categoriaFiltro").selectedOptions[0].textContent;
  const orderBy =
    document.getElementById("orderByFiltro").selectedOptions[0].textContent;
  const tabela = document.getElementById("tabelaRelatorio");
  const mes = document.getElementById("mesFiltro").value;
  const user = await getCurrentUser();
  let nomeRelatorio = `relatorio`;
  if (mes) {
    nomeRelatorio += `_${mes}`;
  } else {
    nomeRelatorio += `_anual`;
  }
  nomeRelatorio += `_jogos_vendidos.pdf`;
  // Cria uma nova janela só com a tabela e filtros
  const win = window.open("", "", "width=900,height=700");
  win.document.write("<html><head><title>Relatório</title>");
  win.document.write('<link rel="stylesheet" href="../../global.css" />');
  win.document.write('<link rel="stylesheet" href="relatorio2.css" />');
  win.document.write("</head><body>");
  win.document.write(`<h2>Relatório: Jogos Vendidos</h2>`);
  win.document.write(
    `<div style="margin-bottom:1em;"><b>Período:</b> ${periodo.data_inicio} a ${periodo.data_fim} <b>Categoria:</b> ${categoria} <b>Ordenação:</b> ${orderBy}</div>`
  );
  win.document.write(tabela.outerHTML);
  win.document.write(
    `<div style="margin-top:1em;"><b>Relatório gerado por:</b> ${
      user ? user.name : "Usuário"
    }</div>`
  );
  win.document.write("</body></html>");
  win.document.close();
  win.print();
  setTimeout(() => win.close(), 1000);
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!(await protectReportPage())) return;
  showUserHeader();
  carregarCategorias();
  preencherAnos();
  document.getElementById("filtroForm").onsubmit = buscarRelatorio;
  document.getElementById("btnExportarPDF").onclick = exportarPDF;
  document.getElementById("btnExportarPDF").disabled = true;
  const select = document.getElementById("categoriaFiltro");
  if (select) select.multiple = true;
});

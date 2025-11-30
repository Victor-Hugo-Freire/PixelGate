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

async function protectReportPage() {
  try {
    const res = await fetch(
      `${API_BASE_URL}/relatorio1?data_inicio=2000-01-01&data_fim=2000-01-02`,
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

function formatCurrency(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

function preencherOrderBy() {
  const select = document.getElementById("orderByFiltro");
  if (!select) return;
  select.innerHTML = `
    <option value="total_jogos">Mais jogos comprados</option>
    <option value="total_jogos_asc">Menos jogos comprados</option>
    <option value="valor_gasto">Mais valor gasto</option>
    <option value="valor_gasto_asc">Menos valor gasto</option>
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
  let orderBy = document.getElementById("orderByFiltro").value;
  let orderParam = orderBy;
  let url = `${API_BASE_URL}/relatorio1?data_inicio=${periodo.data_inicio}&data_fim=${periodo.data_fim}&order_by=${orderParam}`;
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
  dados.forEach((cli) => {
    tbody.innerHTML += `
      <tr>
        <td>${cli.nome_cliente}</td>
        <td>${cli.email}</td>
        <td>${cli.total_jogos}</td>
        <td>${formatCurrency(Number(cli.valor_gasto))}</td>
      </tr>
    `;
  });
}

async function exportarPDF() {
  const periodo = getFiltroPeriodo();
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
  nomeRelatorio += `_clientes_mais_compraram.pdf`;
  const win = window.open("", "", "width=900,height=700");
  win.document.write("<html><head><title>Relatório</title>");
  win.document.write('<link rel="stylesheet" href="../../global.css" />');
  win.document.write('<link rel="stylesheet" href="relatorio1.css" />');
  win.document.write("</head><body>");
  win.document.write(
    `<div style='font-size:1.2em;font-weight:bold;margin-bottom:0.7em;'>Relatório gerado por: ${
      user ? user.name : "Usuário"
    }</div>`
  );
  win.document.write(`<h2>Relatório: Clientes que Mais Compraram</h2>`);
  win.document.write(
    `<div style=\"margin-bottom:1em;\"><b>Período:</b> ${periodo.data_inicio} a ${periodo.data_fim} <b>Ordenação:</b> ${orderBy}</div>`
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
  preencherAnos();
  preencherOrderBy();
  document.getElementById("filtroForm").onsubmit = buscarRelatorio;
  document.getElementById("btnExportarPDF").onclick = exportarPDF;
});

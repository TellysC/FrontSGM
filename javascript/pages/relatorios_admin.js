import { fetchWithAuth } from "../services/api.js";

const tabelaRelatoriosTecnicos = document.querySelector(
  "#tabelaRelatoriosTecnicosAdminView tbody"
);
const tabelaLogs = document.querySelector("#tabelaRelatorios tbody");

/**
 * Renderiza a tabela de relatórios criados pelos técnicos.
 */
async function renderTecnicoReportsTable() {
  tabelaRelatoriosTecnicos.innerHTML =
    '<tr><td colspan="4" style="text-align:center;">Carregando relatórios...</td></tr>';
  try {
    const response = await fetchWithAuth("/relatorio");
    if (!response.ok)
      throw new Error("Falha ao carregar relatórios dos técnicos.");

    const relatorios = await response.json();
    tabelaRelatoriosTecnicos.innerHTML = "";
    if (relatorios.length === 0) {
      tabelaRelatoriosTecnicos.innerHTML =
        '<tr><td colspan="4" style="text-align: center;">Nenhum relatório técnico encontrado.</td></tr>';
      return;
    }

    relatorios.forEach((relatorio) => {
      const row = tabelaRelatoriosTecnicos.insertRow();
      const creationDate = new Date(relatorio.createdAt).toLocaleString(
        "pt-BR",
        { timeZone: "UTC" }
      );

      row.insertCell().textContent = creationDate;
      row.insertCell().textContent =
        relatorio.ordemServico?.funcionario?.nome || "Técnico não informado";
      row.insertCell().textContent = relatorio.titulo;
      row.insertCell().textContent =
        relatorio.descricao.substring(0, 100) + "...";
    });
  } catch (error) {
    tabelaRelatoriosTecnicos.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">${error.message}</td></tr>`;
  }
}

/**
 * Exibe uma mensagem placeholder na tabela de logs, já que a funcionalidade não existe.
 */
function renderLogsPlaceholder() {
  tabelaLogs.innerHTML =
    '<tr><td colspan="4" style="text-align: center; font-style: italic;">Funcionalidade de logs do sistema ainda não implementada.</td></tr>';
}

// Garante que o código rode apenas nesta página
if (tabelaRelatoriosTecnicos && tabelaLogs) {
  renderTecnicoReportsTable();
  renderLogsPlaceholder();
}

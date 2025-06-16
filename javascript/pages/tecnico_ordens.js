import { fetchWithAuth } from "../services/api.js";
import { showMessage } from "../UI/feedback.js";

/**
 * Busca as ordens de serviço abertas no back-end e as renderiza na tabela.
 */
async function renderOpenOrdersTable() {
  const tabelaBody = document.querySelector(
    "#tabelaOrdensServicoTecnico tbody"
  );
  const messageEl = document.getElementById("ordensTecnicoMessage");

  // Verifica se os elementos da página existem antes de prosseguir
  if (!tabelaBody || !messageEl) return;

  tabelaBody.innerHTML =
    '<tr><td colspan="7" style="text-align:center;">Carregando ordens de serviço...</td></tr>';

  try {
    // Busca os dados do endpoint protegido
    const response = await fetchWithAuth("/ordem-servico/abertas");
    if (!response.ok) {
      throw new Error("Não foi possível carregar as ordens de serviço.");
    }

    const orders = await response.json();
    tabelaBody.innerHTML = ""; // Limpa a tabela

    if (orders.length === 0) {
      showMessage(
        messageEl.id,
        "Nenhuma ordem de serviço aberta no momento.",
        "success"
      );
      return;
    }

    // Para cada ordem, cria uma linha na tabela
    orders.forEach((order) => {
      const row = tabelaBody.insertRow();

      // Formata a data para o padrão brasileiro
      const creationDate = new Date(order.createdAt).toLocaleDateString(
        "pt-BR",
        { timeZone: "UTC" }
      );

      row.insertCell().textContent = creationDate;
      row.insertCell().textContent = order.id;
      row.insertCell().textContent =
        order.funcionario?.nome || "Cliente não atribuído";
      row.insertCell().textContent = order.descricao;
      row.insertCell().textContent =
        order.equipamento?.nome || "Não especificado";
      row.insertCell().textContent = order.tipoManuntencao;
      row.insertCell().textContent = order.status;
    });
  } catch (error) {
    showMessage(messageEl.id, error.message, "error");
    tabelaBody.innerHTML = ""; // Limpa a tabela em caso de erro
  }
}

// Executa a função para carregar os dados assim que o script for importado pelo main.js
renderOpenOrdersTable();

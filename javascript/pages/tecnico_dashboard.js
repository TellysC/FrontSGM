import { fetchWithAuth } from "../services/api.js";

async function loadTechnicianDashboardData() {
  console.log(
    "Dashboard do Técnico: Tentando buscar dados das ordens abertas..."
  );
  try {
    const countOpenOrdersEl = document.getElementById(
      "count-ordens-abertas-tecnico"
    );
    // Se o card não existir na página, não faz nada.
    if (!countOpenOrdersEl) {
      console.log(
        "Elemento do card de ordens não encontrado, pulando a busca de dados."
      );
      return;
    }

    // ESTA LINHA ACIONA A SEGURANÇA!
    const response = await fetchWithAuth("/ordem-servico/abertas");

    if (response.ok) {
      const openOrders = await response.json();
      countOpenOrdersEl.textContent = openOrders.length;
      console.log(
        `Dados do dashboard carregados: ${openOrders.length} ordens abertas.`
      );
    } else {
      countOpenOrdersEl.textContent = "Erro";
    }
  } catch (error) {
    // Se fetchWithAuth falhar por falta de token, ele já redireciona.
    // Este catch é para outros erros de rede.
    console.error("Falha ao carregar dados do dashboard do técnico:", error);
    const countOpenOrdersEl = document.getElementById(
      "count-ordens-abertas-tecnico"
    );
    if (countOpenOrdersEl) countOpenOrdersEl.textContent = "X";
  }
}

// Garante que a lógica para carregar os dados do dashboard
// rode assim que este módulo for importado pelo main.js
loadTechnicianDashboardData();

import { fetchWithAuth } from "../services/api.js";

/**
 * Busca os dados dos principais endpoints e atualiza os cards do dashboard.
 */
async function loadDashboardData() {
  try {
    // Seleciona os elementos HTML onde os números serão exibidos
    const countUsersEl = document.getElementById("count-users");
    const countMaterialsEl = document.getElementById("count-materials");
    const countOrdersEl = document.getElementById("count-total-service-orders");

    // Garante que o script não quebre se estiver em outra página sem esses elementos
    if (!countUsersEl || !countMaterialsEl || !countOrdersEl) return;

    // Faz as três chamadas à API em paralelo para mais eficiência
    const [usersResponse, materialsResponse, ordersResponse] =
      await Promise.all([
        fetchWithAuth("/funcionario"),
        fetchWithAuth("/equipamento"),
        fetchWithAuth("/ordem-servico"),
      ]);

    // Atualiza cada card com o tamanho da lista recebida
    if (usersResponse.ok) {
      countUsersEl.textContent = (await usersResponse.json()).length;
    }

    if (materialsResponse.ok) {
      countMaterialsEl.textContent = (await materialsResponse.json()).length;
    }

    if (ordersResponse.ok) {
      countOrdersEl.textContent = (await ordersResponse.json()).length;
    }
  } catch (error) {
    console.error("Falha ao carregar dados do dashboard:", error);
    // Em caso de erro, exibe 'X' nos cards para feedback visual
    document
      .querySelectorAll(".card-info h3")
      .forEach((el) => (el.textContent = "X"));
  }
}

// Executa a função para carregar os dados assim que o script for importado
loadDashboardData();

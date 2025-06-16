import { fetchWithAuth } from "../services/api.js";

export async function initAdminDashboardPage() {
  const totalFuncionariosEl = document.getElementById("total-funcionarios");
  const totalEquipamentosEl = document.getElementById("total-equipamentos");
  const totalOrdensEl = document.getElementById("total-ordens");

  if (!totalFuncionariosEl) return;

  try {
    const [funcResponse, equipResponse] = await Promise.all([
      fetchWithAuth("/funcionario"),
      fetchWithAuth("/equipamento"),
    ]);

    const funcionarios = await funcResponse.json();
    const equipamentos = await equipResponse.json();

    if (totalFuncionariosEl)
      totalFuncionariosEl.textContent = funcionarios.length;
    if (totalEquipamentosEl)
      totalEquipamentosEl.textContent = equipamentos.length;
    if (totalOrdensEl) totalOrdensEl.textContent = "N/A";
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
  }
}

import { fetchWithAuth } from "../services/api.js";
import { showMessage } from "../ui/feedback.js";

export async function initTecnicoOrdensPage() {
  const tabelaBody = document.querySelector("#tabelaOrdensTecnico tbody");
  if (!tabelaBody) return;

  // ATENÇÃO: Seu back-end precisa de um endpoint como '/ordem-servico/tecnico' para isto funcionar.
  try {
    const response = await fetchWithAuth("/ordem-servico/tecnico");
    if (!response.ok) throw new Error("Não foi possível carregar as ordens.");

    const ordens = await response.json();
    tabelaBody.innerHTML = "";
    ordens.forEach((ordem) => {
      const row = tabelaBody.insertRow();
      // ... preencha a tabela com os dados da ordem ...
    });
  } catch (error) {
    showMessage("ordensMessage", "Erro: " + error.message, "error");
  }
}

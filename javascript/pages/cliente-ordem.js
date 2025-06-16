import { fetchWithAuth } from "../services/api.js";
import { showMessage } from "../ui/feedback.js";

export function initClienteOrdemPage() {
  const form = document.getElementById("formCriarOrdem"); // Seu formulário precisa ter este ID
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      // Pegue os dados do formulário
      descricaoProblema: document.getElementById("descricaoProblema").value,
      equipamentoId: document.getElementById("selectEquipamento").value,
      // ... outros campos que seu formulário de ordem tiver
    };

    // ATENÇÃO: Seu back-end precisa de um endpoint como '/ordem-servico/criar' para isto funcionar.
    try {
      const response = await fetchWithAuth("/ordem-servico/criar", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Falha ao criar ordem de serviço.");

      showMessage(
        "ordemMessage",
        "Ordem de serviço criada com sucesso!",
        "success"
      );
      form.reset();
    } catch (error) {
      showMessage("ordemMessage", "Erro: " + error.message, "error");
    }
  });
}

import { fetchWithAuth } from "../services/api.js";
import { showMessage } from "../UI/feedback.js";

// Função para popular o select de equipamentos
async function populateEquipments() {
  try {
    const response = await fetchWithAuth("/equipamento");
    if (!response.ok) return;

    const equipamentos = await response.json();
    const equipamentoTextarea = document.getElementById("ordemEquipamento");

    // Substitui a textarea por um select para melhor usabilidade
    const selectEquipamento = document.createElement("select");
    selectEquipamento.id = "ordemEquipamento";
    selectEquipamento.name = "ordemEquipamento";
    equipamentoTextarea.parentNode.replaceChild(
      selectEquipamento,
      equipamentoTextarea
    );

    selectEquipamento.innerHTML =
      '<option value="">Selecione um equipamento (opcional)</option>';
    equipamentos.forEach((equip) => {
      selectEquipamento.innerHTML += `<option value="${equip.id}">${equip.nome} - ${equip.descricao}</option>`;
    });
  } catch (error) {
    console.error("Falha ao carregar equipamentos", error);
  }
}

const form = document.getElementById("formCriarOrdem");

// Garante que o código rode apenas nesta página
if (form) {
  // Adiciona o listener para o envio do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // NOTA: O payload foi simplificado para o que um cliente realmente enviaria.
    // O seu back-end precisa ser ajustado para receber este formato mais simples.
    const payload = {
      descricao: document.getElementById("ordemDescricao").value,
      equipamentoId: document.getElementById("ordemEquipamento").value
        ? parseInt(document.getElementById("ordemEquipamento").value)
        : null,
    };

    try {
      const response = await fetchWithAuth("/ordem-servico/criar", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (response.status === 201) {
        showMessage(
          "ordemMessage",
          "Ordem de serviço criada com sucesso!",
          "success"
        );
        form.reset();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Falha ao criar ordem de serviço."
        );
      }
    } catch (error) {
      showMessage("ordemMessage", `Erro: ${error.message}`, "error");
    }
  });

  // Popula a lista de equipamentos assim que o script carrega
  populateEquipments();
}

import { fetchWithAuth } from "../services/api.js";
import { showMessage } from "../ui/feedback.js";

export async function initAdminMaquinasPage() {
  const form = document.getElementById("formCadastrarEquipamento");
  const tabelaBody = document.querySelector("#tabelaEquipamentos tbody");
  if (!form || !tabelaBody) return;

  async function renderTabela() {
    try {
      const response = await fetchWithAuth("/equipamento");
      const equipamentos = await response.json();
      tabelaBody.innerHTML = "";
      equipamentos.forEach((equip) => {
        const row = tabelaBody.insertRow();
        row.insertCell().textContent = equip.id;
        row.insertCell().textContent = equip.nome;
        row.insertCell().textContent = equip.descricao;
        const actionsCell = row.insertCell();
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remover";
        removeBtn.classList.add("action-btn", "danger");
        removeBtn.onclick = () => apagarEquipamento(equip.id, equip.nome);
        actionsCell.appendChild(removeBtn);
      });
    } catch (error) {
      showMessage(
        "equipamentoMessage",
        "Falha ao carregar equipamentos.",
        "error"
      );
    }
  }

  async function apagarEquipamento(id, nome) {
    if (confirm(`Tem certeza que deseja apagar o equipamento "${nome}"?`)) {
      try {
        await fetchWithAuth(`/equipamento/${id}`, { method: "DELETE" });
        showMessage(
          "equipamentoMessage",
          `Equipamento "${nome}" apagado.`,
          "success"
        );
        await renderTabela();
      } catch (error) {
        showMessage(
          "equipamentoMessage",
          "Erro ao apagar equipamento.",
          "error"
        );
      }
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      nome: document.getElementById("nomeEquipamento").value,
      descricao: document.getElementById("modeloEquipamento").value,
    };
    try {
      await fetchWithAuth("/equipamento/criar", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showMessage(
        "equipamentoMessage",
        "Máquina cadastrada com sucesso!",
        "success"
      );
      form.reset();
      await renderTabela();
    } catch (error) {
      showMessage("equipamentoMessage", "Erro ao cadastrar máquina.", "error");
    }
  });

  await renderTabela();
}

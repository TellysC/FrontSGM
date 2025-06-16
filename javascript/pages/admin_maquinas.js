import { fetchWithAuth } from "../services/api.js";
import { showMessage } from "../UI/feedback.js";

const form = document.getElementById("formCadastrarEquipamento");
const tabelaBody = document.querySelector("#tabelaEquipamentos tbody");
const messageEl = document.getElementById("equipamentoMessage");

/**
 * Busca os equipamentos no back-end e os renderiza na tabela.
 */
async function renderTabelaEquipamentos() {
  tabelaBody.innerHTML =
    '<tr><td colspan="3" style="text-align:center;">Carregando equipamentos...</td></tr>';
  try {
    const response = await fetchWithAuth("/equipamento");
    if (!response.ok) throw new Error("Erro ao buscar equipamentos.");

    const equipamentos = await response.json();
    tabelaBody.innerHTML = "";

    if (equipamentos.length > 0) {
      equipamentos.forEach((equip) => {
        const row = tabelaBody.insertRow();
        row.insertCell().textContent = equip.id;
        row.insertCell().textContent = equip.nome;
        row.insertCell().textContent = equip.descricao;
      });
    } else {
      tabelaBody.innerHTML =
        '<tr><td colspan="3" style="text-align:center;">Nenhum equipamento cadastrado.</td></tr>';
    }
  } catch (error) {
    tabelaBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:red;">${error.message}</td></tr>`;
  }
}

/**
 * Adiciona o listener de evento para o envio do formulário de cadastro.
 */
function setupFormListener() {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      nome: document.getElementById("nomeEquipamento").value,
      descricao: document.getElementById("descriçõesEquipamento").value, // O ID no HTML é "descriçõesEquipamento"
    };

    try {
      const response = await fetchWithAuth("/equipamento/criar", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (response.status === 201) {
        showMessage(messageEl.id, "Máquina cadastrada com sucesso!", "success");
        form.reset();
        await renderTabelaEquipamentos();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao cadastrar máquina.");
      }
    } catch (error) {
      showMessage(messageEl.id, `Erro: ${error.message}`, "error");
    }
  });
}

// Garante que o código rode apenas nesta página
if (form && tabelaBody && messageEl) {
  renderTabelaEquipamentos();
  setupFormListener();
}

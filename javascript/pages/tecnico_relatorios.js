import { fetchWithAuth } from "../services/api.js";
import { showMessage } from "../UI/feedback.js";

const form = document.getElementById("formCriarRelatorioTecnico");
const tabelaBody = document.querySelector("#tabelaRelatoriosTecnico tbody");
const messageEl = document.getElementById("relatoriosTecnicoMessage");

/**
 * Busca as ordens de serviço abertas e as popula em um campo <select> no formulário.
 */
async function populateOpenOrdersSelect() {
  try {
    const response = await fetchWithAuth("/ordem-servico/abertas");
    if (!response.ok)
      throw new Error("Falha ao carregar ordens de serviço para o relatório.");

    const ordens = await response.json();

    // Cria dinamicamente o campo de seleção
    let select = document.getElementById("ordemServicoSelect");
    if (!select) {
      const selectGroup = document.createElement("div");
      selectGroup.className = "input-group";
      selectGroup.innerHTML = `
                <label for="ordemServicoSelect">Associar à Ordem de Serviço (Obrigatório):</label>
                <select id="ordemServicoSelect" required></select>
            `;
      form.insertBefore(selectGroup, form.firstChild);
      select = document.getElementById("ordemServicoSelect");
    }

    select.innerHTML =
      '<option value="">-- Selecione uma ordem de serviço --</option>';
    ordens.forEach((ordem) => {
      select.innerHTML += `<option value="${ordem.id}">OS #${ordem.id} - ${ordem.equipamento.nome}</option>`;
    });
  } catch (error) {
    showMessage(messageEl.id, error.message, "error");
  }
}

/**
 * Busca os relatórios existentes e os renderiza na tabela.
 */
async function renderRelatoriosTable() {
  tabelaBody.innerHTML =
    '<tr><td colspan="4" style="text-align:center;">Carregando relatórios...</td></tr>';
  try {
    const response = await fetchWithAuth("/relatorio");
    if (!response.ok) throw new Error("Falha ao carregar relatórios.");

    const relatorios = await response.json();
    tabelaBody.innerHTML = "";

    if (relatorios.length === 0) {
      tabelaBody.innerHTML =
        '<tr><td colspan="4" style="text-align: center;">Nenhum relatório criado.</td></tr>';
      return;
    }

    relatorios.forEach((relatorio) => {
      const row = tabelaBody.insertRow();
      const creationDate = new Date(relatorio.createdAt).toLocaleString(
        "pt-BR",
        { timeZone: "UTC" }
      );
      row.insertCell().textContent = creationDate;
      row.insertCell().textContent = relatorio.titulo;
      row.insertCell().textContent =
        relatorio.descricao.substring(0, 70) + "...";
      row.insertCell().innerHTML = `<button class="action-btn" disabled>Ver</button>`; // Ação de ver não implementada
    });
  } catch (error) {
    showMessage(messageEl.id, error.message, "error");
    tabelaBody.innerHTML = "";
  }
}

// Adiciona o listener para o envio do formulário de criação de relatório
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      titulo: document.getElementById("relatorioTitulo").value,
      descricao: document.getElementById("relatorioConteudo").value,
      ordemServicoId: parseInt(
        document.getElementById("ordemServicoSelect")?.value
      ),
    };

    if (!payload.ordemServicoId) {
      showMessage(
        messageEl.id,
        "Por favor, selecione uma ordem de serviço para associar ao relatório.",
        "error"
      );
      return;
    }

    try {
      const response = await fetchWithAuth("/relatorio/ordem-servico", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        showMessage(messageEl.id, "Relatório salvo com sucesso!", "success");
        form.reset();
        await renderRelatoriosTable(); // Atualiza a lista de relatórios
      } else {
        throw new Error(
          (await response.json()).message || "Erro ao salvar relatório."
        );
      }
    } catch (error) {
      showMessage(messageEl.id, `Erro: ${error.message}`, "error");
    }
  });
}

// Garante que o código rode apenas se os elementos da página existirem
if (tabelaBody && form && messageEl) {
  // Inicializa a página carregando os dados necessários
  populateOpenOrdersSelect();
  renderRelatoriosTable();
}

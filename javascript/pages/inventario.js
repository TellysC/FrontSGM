import { fetchWithAuth } from "../services/api.js";

// Variável para guardar a lista completa, otimizando a filtragem no front-end
let todosEquipamentos = [];

const tabelaBody = document.querySelector("#tabelaInventario tbody");
const formFiltro = document.getElementById("formFiltrarMateriais");
const btnLimpar = document.getElementById("btnLimparFiltro");
const btnRemover = document.getElementById("btnRemoverSelecionados");

/**
 * Renderiza a tabela com base na lista de equipamentos, aplicando filtros se houver.
 */
function renderInventarioTable(filtros = {}) {
  tabelaBody.innerHTML = "";

  const equipamentosFiltrados = todosEquipamentos.filter((equip) => {
    const nomeMatch =
      !filtros.nome ||
      equip.nome.toLowerCase().includes(filtros.nome.toLowerCase());
    const descMatch =
      !filtros.descricao ||
      equip.descricao.toLowerCase().includes(filtros.descricao.toLowerCase());
    return nomeMatch && descMatch;
  });

  if (equipamentosFiltrados.length === 0) {
    tabelaBody.innerHTML =
      '<tr><td colspan="3" style="text-align: center;">Nenhum equipamento encontrado.</td></tr>';
    return;
  }

  equipamentosFiltrados.forEach((equip) => {
    const row = tabelaBody.insertRow();
    row.insertCell().innerHTML = `<input type="checkbox" class="equip-checkbox" value="${equip.id}">`;
    row.insertCell().textContent = equip.nome;
    row.insertCell().textContent = equip.descricao;
  });
}

/**
 * Carrega a lista inicial de equipamentos do back-end.
 */
async function carregarInventario() {
  tabelaBody.innerHTML =
    '<tr><td colspan="3" style="text-align:center;">Carregando inventário...</td></tr>';
  try {
    const response = await fetchWithAuth("/equipamento");
    if (!response.ok) throw new Error("Falha ao carregar o inventário.");
    todosEquipamentos = await response.json();
    renderInventarioTable(); // Renderiza a tabela completa
  } catch (error) {
    alert(error.message);
  }
}

// Garante que o código rode apenas nesta página
if (tabelaBody && formFiltro) {
  // Carrega os dados iniciais
  carregarInventario();

  // Configura o formulário de filtro
  formFiltro.addEventListener("submit", (e) => {
    e.preventDefault();
    const filtros = {
      nome: document.getElementById("filtroItem").value,
      descricao: document.getElementById("filtroDescricao").value,
    };
    renderInventarioTable(filtros);
  });

  // Configura o botão de limpar filtro
  btnLimpar.addEventListener("click", () => {
    formFiltro.reset();
    renderInventarioTable();
  });

  // Configura o botão de remover selecionados
  btnRemover.addEventListener("click", async () => {
    const checkboxes = document.querySelectorAll(".equip-checkbox:checked");
    if (checkboxes.length === 0) {
      alert("Selecione pelo menos um equipamento para remover.");
      return;
    }
    if (
      !confirm(
        `Tem certeza que deseja remover ${checkboxes.length} equipamento(s)?`
      )
    ) {
      return;
    }

    const idsParaRemover = Array.from(checkboxes).map((cb) => cb.value);
    const promessasDeRemocao = idsParaRemover.map((id) =>
      fetchWithAuth(`/equipamento/${id}`, { method: "DELETE" })
    );

    try {
      await Promise.all(promessasDeRemocao);
      alert("Equipamento(s) removido(s) com sucesso!");
      await carregarInventario(); // Recarrega a lista do back-end
    } catch (error) {
      alert("Ocorreu um erro ao remover os equipamentos.");
    }
  });
}

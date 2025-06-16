import { fetchWithAuth } from "../services/api.js";
import { showMessage } from "../ui/feedback.js";

export async function initAdminUsuariosPage() {
  const form = document.getElementById("formCadastroUsuario");
  const tabelaBody = document.querySelector("#tabelaUsuarios tbody");
  if (!form || !tabelaBody) return;

  async function renderTabela() {
    try {
      const response = await fetchWithAuth("/funcionario");
      if (!response.ok) throw new Error("Erro ao buscar funcionários.");
      const funcionarios = await response.json();

      tabelaBody.innerHTML = "";
      funcionarios.forEach((func) => {
        const row = tabelaBody.insertRow();
        row.insertCell().textContent = func.id;
        row.insertCell().textContent = func.nome;
        row.insertCell().textContent = func.cpf;
        row.insertCell().textContent = func.cargo;
        row.insertCell().textContent = func.usuario
          ? func.usuario.email
          : "N/A";
      });
    } catch (error) {
      showMessage(
        "userMessage",
        "Não foi possível carregar os funcionários.",
        "error"
      );
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const senha = document.getElementById("senhaUsuario").value;
    if (senha !== document.getElementById("confirmarSenhaUsuario").value) {
      return showMessage("userMessage", "As senhas não coincidem!", "error");
    }

    const payload = {
      nome: document.getElementById("nomeCompleto").value,
      cpf: document.getElementById("cpf").value,
      cargo: document.querySelector('input[name="userRoleForm"]:checked').value,
      usuario: {
        email: document.getElementById("emailUsuario").value,
        senha: senha,
      },
      contato: {
        celular: document.getElementById("celular").value,
        telefone: document.getElementById("telefone").value,
        codigoDistancia: { id: 1 }, // Exemplo: você precisará buscar ou definir o ID do DDD
      },
      endereco: {
        cep: document.getElementById("cep").value,
        logradouro: document.getElementById("logradouro").value,
        numero: parseInt(document.getElementById("numero").value) || 0,
        bairro: document.getElementById("bairro").value,
        cidade: document.getElementById("cidade").value,
        estado: document.getElementById("estado").value,
        pais: document.getElementById("pais").value,
      },
    };

    try {
      const response = await fetchWithAuth("/funcionario/criar", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (response.status !== 201) throw new Error("Erro ao cadastrar.");

      showMessage(
        "userMessage",
        "Funcionário cadastrado com sucesso!",
        "success"
      );
      form.reset();
      await renderTabela();
    } catch (error) {
      showMessage("userMessage", `Erro: ${error.message}`, "error");
    }
  });

  await renderTabela();
}

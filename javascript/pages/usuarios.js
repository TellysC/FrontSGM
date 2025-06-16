// javascript/pages/usuarios.js

import { fetchWithAuth } from "../services/api.js";
import { showMessage } from "../UI/feedback.js";

// Seleciona os elementos principais da página
const form = document.getElementById("formCadastroUsuario");
const tabelaBody = document.querySelector("#tabelaUsuarios tbody");

// Função para buscar os dados do back-end e renderizar a tabela
async function renderTabelaUsuarios() {
  // Exibe uma mensagem de carregamento
  tabelaBody.innerHTML =
    '<tr><td colspan="5" style="text-align:center;">Carregando funcionários...</td></tr>';

  try {
    const response = await fetchWithAuth("/funcionario");
    if (!response.ok) {
      throw new Error("Falha ao buscar dados dos funcionários.");
    }

    const funcionarios = await response.json();

    // Limpa a tabela antes de adicionar os novos dados
    tabelaBody.innerHTML = "";

    if (funcionarios.length === 0) {
      tabelaBody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;">Nenhum funcionário cadastrado.</td></tr>';
      return;
    }

    // Para cada funcionário retornado, cria uma linha na tabela
    funcionarios.forEach((func) => {
      const row = tabelaBody.insertRow();
      row.insertCell().textContent = func.id;
      row.insertCell().textContent = func.nome;
      row.insertCell().textContent = func.cpf;
      row.insertCell().textContent = func.usuario?.role || "N/A"; // Usando o ?. para evitar erros se o usuário for nulo
      row.insertCell().textContent = func.usuario?.email || "N/A";
    });
  } catch (error) {
    tabelaBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">${error.message}</td></tr>`;
  }
}

// Adiciona o listener de evento para o envio do formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Impede o recarregamento padrão da página

  const senha = document.getElementById("senhaUsuario").value;
  const confirmarSenha = document.getElementById("confirmarSenhaUsuario").value;

  if (senha !== confirmarSenha) {
    showMessage("userMessage", "As senhas não coincidem!", "error");
    return;
  }

  // Monta o objeto (payload) para enviar ao back-end, espelhando o DTO
  const payload = {
    nome: document.getElementById("nomeCompleto").value,
    cpf: document.getElementById("cpf").value,
    usuario: {
      email: document.getElementById("emailUsuario").value,
      senha: senha,
      role: document
        .querySelector('input[name="userRoleForm"]:checked')
        .value.toUpperCase(),
    },
    contato: {
      celular: document.getElementById("celular").value,
      telefone: document.getElementById("telefone").value,
      codigoDistanciaCreateDTO: {
        numero: document.getElementById("ddd").value,
        estado: document.getElementById("estado").value,
      },
    },
    endereco: {
      cep: document.getElementById("cep").value,
      logradouro: document.getElementById("logradouro").value,
      numero: document.getElementById("numero").value,
      bairro: document.getElementById("bairro").value,
      cidade: document.getElementById("cidade").value,
      estado: document.getElementById("estado").value,
      pais: document.getElementById("pais").value,
    },
  };

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Cadastrando...";

  try {
    const response = await fetchWithAuth("/funcionario/criar", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response.status === 201) {
      showMessage(
        "userMessage",
        "Funcionário cadastrado com sucesso!",
        "success"
      );
      form.reset(); // Limpa o formulário
      await renderTabelaUsuarios(); // Recarrega a tabela com o novo usuário
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          "Erro no cadastro. Verifique os dados e tente novamente."
      );
    }
  } catch (error) {
    showMessage("userMessage", `Erro: ${error.message}`, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Cadastrar Funcionário";
  }
});

// Ponto de entrada do script da página:
// Garante que o código só vai rodar se os elementos principais existirem.
if (form && tabelaBody) {
  // Carrega a tabela de usuários assim que o script é executado.
  renderTabelaUsuarios();
}

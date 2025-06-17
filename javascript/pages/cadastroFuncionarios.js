// javascript/pages/cadastroFuncionarios.js
import { api } from '../api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Obter referências aos elementos do formulário de cadastro
    const formCadastroUsuario = document.getElementById('formCadastroUsuario');
    const emailUsuarioInput = document.getElementById('emailUsuario');
    const senhaUsuarioInput = document.getElementById('senhaUsuario');
    const confirmarSenhaUsuarioInput = document.getElementById('confirmarSenhaUsuario');
    const nomeCompletoInput = document.getElementById('nomeCompleto');
    const cpfInput = document.getElementById('cpf');
    const roleClienteRadio = document.getElementById('roleCliente');
    const roleTecnicoRadio = document.getElementById('roleTecnico');
    const roleAdminRadio = document.getElementById('roleAdmin');
    const dddInput = document.getElementById('ddd');
    const celularInput = document.getElementById('celular');
    const telefoneInput = document.getElementById('telefone');
    const cepInput = document.getElementById('cep');
    const logradouroInput = document.getElementById('logradouro');
    const numeroInput = document.getElementById('numero');
    const bairroInput = document.getElementById('bairro');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado'); // Estado do ENDEREÇO
    const paisInput = document.getElementById('pais');
    const estadoDddInput = document.getElementById('estadoDdd'); // Campo para Estado (DDD)
    const userMessage = document.getElementById('userMessage'); // Mensagem do formulário

    // Obter referências aos elementos da tabela de listagem
    const funcionariosTableBody = document.getElementById('funcionariosTableBody');
    const funcionariosListMessage = document.getElementById('funcionariosListMessage'); // Mensagem da lista

    // Obter referências a elementos comuns do layout
    const logoutButton = document.getElementById('logoutButton');
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const appContainer = document.querySelector('.app-container');

    // --- Extrair role do JWT para verificação de acesso ---
    let userRole = null;
    const token = localStorage.getItem('jwt_token');
    if (token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decodedToken = JSON.parse(jsonPayload);
            userRole = decodedToken.role;
            console.log('Cadastro Funcionário - Role do Usuário logado:', userRole);

            // Verificar se o usuário é ADMINISTRADOR
            if (userRole !== 'ADMINISTRADOR') {
                alert('Acesso negado. Você não tem permissão para acessar esta página.');
                localStorage.removeItem('jwt_token');
                window.location.href = './login.html';
                return;
            }

        } catch (e) {
            console.error("Cadastro Funcionário - Erro ao decodificar JWT:", e);
            alert('Sessão inválida ou expirada. Faça login novamente.');
            localStorage.removeItem('jwt_token');
            window.location.href = './login.html';
            return;
        }
    } else {
        alert('Você não está logado. Faça login para acessar esta página.');
        window.location.href = './login.html';
        return;
    }


    // --- Funções Comuns do Layout ---
    // Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('jwt_token');
            window.location.href = './login.html';
        });
    }

    // Dark Mode Toggle
    if (darkModeSwitch) {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        darkModeSwitch.checked = isDarkMode;

        darkModeSwitch.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', darkModeSwitch.checked);
            localStorage.setItem('darkMode', darkModeSwitch.checked);
        });
    }

    // Sidebar Toggle
    if (sidebarToggleBtn && appContainer) {
        sidebarToggleBtn.addEventListener('click', () => {
            appContainer.classList.toggle('sidebar-collapsed');
        });
    }


    // --- Função para Cadastro de Funcionário ---
    if (formCadastroUsuario) {
        formCadastroUsuario.addEventListener('submit', handleCadastroFuncionario);
    }

    async function handleCadastroFuncionario(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        userMessage.textContent = ''; // Limpa mensagens anteriores
        userMessage.className = 'message'; // Reseta a classe da mensagem

        const email = emailUsuarioInput.value.trim();
        const senha = senhaUsuarioInput.value.trim();
        const confirmarSenha = confirmarSenhaUsuarioInput.value.trim();
        const nome = nomeCompletoInput.value.trim();
        const cpf = cpfInput.value.trim();
        const selectedRoleElement = document.querySelector('input[name="userRoleForm"]:checked');
        const role = selectedRoleElement ? selectedRoleElement.value.toUpperCase().replace('É', 'E').replace('Ç', 'C').replace(' ', '') : ''; // Converte para o formato do enum 'CLIENTE', 'TECNICO', 'ADMINISTRADOR'

        // Contato
        const ddd = dddInput.value.trim();
        const celular = celularInput.value.trim();
        const telefone = telefoneInput.value.trim(); // Opcional
        const estadoDdd = estadoDddInput.value.trim(); // Campo para Estado (DDD)

        // Endereço
        const cep = cepInput.value.trim();
        const logradouro = logradouroInput.value.trim();
        const numero = numeroInput.value.trim();
        const bairro = bairroInput.value.trim();
        const cidade = cidadeInput.value.trim();
        const estado = estadoInput.value.trim(); // Este é o estado do ENDEREÇO
        const pais = paisInput.value.trim();


        // Validações básicas (além do 'required' do HTML)
        if (senha !== confirmarSenha) {
            userMessage.textContent = 'As senhas não coincidem!';
            userMessage.className = 'message error';
            return;
        }
        if (!role) {
            userMessage.textContent = 'Por favor, selecione uma função (cargo) para o funcionário.';
            userMessage.className = 'message error';
            return;
        }
        if (cpf.length !== 11 || !/^\d+$/.test(cpf)) {
            userMessage.textContent = 'CPF inválido. Deve conter 11 dígitos numéricos.';
            userMessage.className = 'message error';
            return;
        }
        if (!celular || !/^\d+$/.test(celular) || celular.length < 8) { // Celular com DDD é mais comum, mas aqui só o número
             userMessage.textContent = 'Celular inválido. Deve conter apenas números e ter pelo menos 8 dígitos.';
             userMessage.className = 'message error';
             return;
         }
        // Validar DDD
        if (!ddd || !/^\d+$/.test(ddd) || ddd.length !== 2) {
             userMessage.textContent = 'DDD inválido. Deve conter 2 dígitos numéricos.';
             userMessage.className = 'message error';
             return;
         }
        // Validar CEP
        if (!cep || !/^\d+$/.test(cep) || cep.length !== 8) {
            userMessage.textContent = 'CEP inválido. Deve conter 8 dígitos numéricos.';
            userMessage.className = 'message error';
            return;
        }
        // Validar Estado do DDD
        if (!estadoDdd || estadoDdd.length === 0) { // Agora espera uma string, ex: "RN"
            userMessage.textContent = 'Estado (DDD) inválido. Não pode ser vazio.';
            userMessage.className = 'message error';
            return;
        }


        // Estrutura o DTO aninhado conforme a API espera
        const funcionarioData = {
            nome: nome,
            cpf: cpf,
            usuarioRegisterDTO: {
                email: email,
                senha: senha,
                role: role // 'CLIENTE', 'TECNICO', 'ADMINISTRADOR'
            },
            enderecoCreateDTO: {
                logradouro: logradouro,
                numero: numero, // MANTÉM COMO STRING - Endereco.numero é String no Java
                bairro: bairro,
                cidade: cidade,
                estado: estado, // ESTADO DO ENDEREÇO
                cep: cep,
                pais: pais
            },
            contatoCreateDTO: {
                telefone: telefone,
                celular: celular,
                codigoDistanciaCreateDTO: {
                    numero: ddd, // DDD (String)
                    estado: estadoDdd // Usa o campo separado para o Estado do DDD (String)
                }
            }
        };

        try {
            userMessage.textContent = 'Cadastrando funcionário...';
            userMessage.className = 'message info';
            const response = await api.post('/funcionario/criar', funcionarioData);
            console.log('Funcionário cadastrado com sucesso:', response.data);
            userMessage.textContent = `Funcionário "${nome}" cadastrado com sucesso!`;
            userMessage.className = 'message success';
            formCadastroUsuario.reset(); // Limpa o formulário
            await loadFuncionarios(); // Recarrega a lista de funcionários

        } catch (error) {
            console.error('Erro ao cadastrar funcionário:', error);
            let errorMessage = 'Erro ao cadastrar funcionário. Verifique os dados.';
            if (error.response) {
                if (error.response.status === 400 && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data && error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else {
                    errorMessage = `Erro: ${error.response.status} - ${error.response.statusText}`;
                }
            } else if (error.request) {
                errorMessage = 'Não foi possível conectar ao servidor.';
            }
            userMessage.textContent = errorMessage;
            userMessage.className = 'message error';
        }
    }


    // --- Função para Listar Funcionários ---
    async function loadFuncionarios() {
        funcionariosTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Carregando funcionários...</td></tr>';
        funcionariosListMessage.textContent = '';

        try {
            const response = await api.get('/funcionario');
            const funcionarios = response.data;

            funcionariosTableBody.innerHTML = '';

            if (funcionarios.length === 0) {
                funcionariosTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum funcionário cadastrado.</td></tr>';
                return;
            }

            
            // ... (dentro do loadFuncionarios function) ...

            funcionarios.forEach(funcionario => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${funcionario.id}</td>
                    <td>${funcionario.nome}</td>
                    <td>${funcionario.cpf}</td>
                    <td>${funcionario.usuario ? funcionario.usuario.role.toLowerCase() : 'N/A'}</td>
                    <td>${funcionario.usuario ? funcionario.usuario.email : 'N/A'}</td>
                    <td>
                        <button class="action-btn view-details-btn" data-funcionario-id="${funcionario.id}">Detalhes</button>
                    </td>
                `;
                funcionariosTableBody.appendChild(row);
            });

            // Adiciona event listeners para os botões "Detalhes"
            document.querySelectorAll('.view-details-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const funcId = event.target.dataset.funcionarioId;
                    // Redireciona para a nova página de detalhes do funcionário
                    window.location.href = `./detalheFuncionario.html?id=${funcId}`;
                });
            });

            // ... (resto do código do cadastroFuncionarios.js) ...

        } catch (error) {
            console.error('Erro ao carregar funcionários:', error);
            funcionariosListMessage.textContent = `Erro ao carregar lista de funcionários.`;
            funcionariosListMessage.className = 'message error';
            funcionariosTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Erro ao carregar funcionários.</td></tr>';
        }
    }

    // Carregar a lista de funcionários ao carregar a página
    await loadFuncionarios();


    // --- Funções Comuns do Layout ---
    // Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('jwt_token');
            window.location.href = './login.html';
        });
    }

    // Dark Mode Toggle
    if (darkModeSwitch) {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        darkModeSwitch.checked = isDarkMode;

        darkModeSwitch.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', darkModeSwitch.checked);
            localStorage.setItem('darkMode', darkModeSwitch.checked);
        });
    }

    // Sidebar Toggle
    if (sidebarToggleBtn && appContainer) {
        sidebarToggleBtn.addEventListener('click', () => {
            appContainer.classList.toggle('sidebar-collapsed');
        });
    }
});
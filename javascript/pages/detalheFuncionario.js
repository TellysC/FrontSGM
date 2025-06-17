// javascript/pages/detalheFuncionario.js
import { api } from '../api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Obter o ID do funcionário da URL (ex: detalheFuncionario.html?id=123)
    const funcionarioId = new URLSearchParams(window.location.search).get('id');
    if (!funcionarioId) {
        alert('ID do Funcionário não fornecido.');
        window.location.href = './cadastroUsuarios.html'; // Redireciona de volta
        return;
    }

    // Referências aos elementos do formulário (todos)
    const formFuncionarioDetails = document.getElementById('formFuncionarioDetails');
    const funcionarioDetailsFormContainer = document.getElementById('funcionarioDetailsFormContainer');
    const funcionarioIdInput = document.getElementById('funcionarioId'); // ID do funcionário para exibição
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
    const estadoInput = document.getElementById('estado'); // Estado do Endereço
    const paisInput = document.getElementById('pais');
    const estadoDddInput = document.getElementById('estadoDdd'); // Estado do DDD
    const funcionarioMessage = document.getElementById('funcionarioMessage'); // Mensagem para o formulário

    // Botões de ação
    const editButton = document.getElementById('editButton');
    const deleteButton = document.getElementById('deleteButton');
    const backToListButton = document.getElementById('backToListButton');

    // Elementos comuns do layout
    const logoutButton = document.getElementById('logoutButton');
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const appContainer = document.querySelector('.app-container');

    let isEditing = false; // Estado para controlar o modo de edição

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

            if (userRole !== 'ADMINISTRADOR') { //
                alert('Acesso negado. Você não tem permissão para acessar esta página.');
                localStorage.removeItem('jwt_token');
                window.location.href = './login.html';
                return;
            }

        } catch (e) {
            console.error("Detalhes Funcionário - Erro ao decodificar JWT:", e);
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


    // --- Carregar Detalhes do Funcionário ---
    async function loadFuncionarioDetails() {
        try {
            const response = await api.get(`/funcionario/${funcionarioId}`); //
            const funcionario = response.data;

            // Preencher os campos do formulário com os dados do funcionário
            funcionarioIdInput.value = funcionario.id;
            emailUsuarioInput.value = funcionario.usuario ? funcionario.usuario.email : '';
            senhaUsuarioInput.value = '';
            confirmarSenhaUsuarioInput.value = '';
            senhaUsuarioInput.placeholder = 'NOVA SENHA OBRIGATÓRIA';
            confirmarSenhaUsuarioInput.placeholder = 'CONFIRME NOVA SENHA';

            nomeCompletoInput.value = funcionario.nome;
            cpfInput.value = funcionario.cpf;

            // Selecionar o radio button da role
            if (funcionario.usuario) {
                const role = funcionario.usuario.role.toLowerCase();
                if (role === 'cliente') roleClienteRadio.checked = true;
                else if (role === 'tecnico') roleTecnicoRadio.checked = true;
                else if (role === 'administrador') roleAdminRadio.checked = true;
            }

            if (funcionario.contato) {
                dddInput.value = funcionario.contato.codigoDistancia ? funcionario.contato.codigoDistancia.numero : '';
                celularInput.value = funcionario.contato.celular;
                telefoneInput.value = funcionario.contato.telefone || '';
                estadoDddInput.value = funcionario.contato.codigoDistancia ? funcionario.contato.codigoDistancia.estado : '';
            }

            if (funcionario.endereco) {
                cepInput.value = funcionario.endereco.cep;
                logradouroInput.value = funcionario.endereco.logradouro;
                numeroInput.value = funcionario.endereco.numero;
                bairroInput.value = funcionario.endereco.bairro;
                cidadeInput.value = funcionario.endereco.cidade;
                estadoInput.value = funcionario.endereco.estado;
                paisInput.value = funcionario.endereco.pais;
            }

            setFormReadOnly(true); // Inicializa o formulário como somente leitura

        } catch (error) {
            console.error(`Erro ao carregar detalhes do funcionário ID ${funcionarioId}:`, error);
            funcionarioMessage.textContent = 'Não foi possível carregar os detalhes do funcionário.';
            funcionarioMessage.className = 'message error';
        }
    }

    // --- Gerenciar Modo Edição/Leitura ---
    function setFormReadOnly(readOnly) {
        // Campos de Acesso
        emailUsuarioInput.readOnly = readOnly;
        senhaUsuarioInput.readOnly = readOnly;
        confirmarSenhaUsuarioInput.readOnly = readOnly;
        senhaUsuarioInput.required = !readOnly;
        confirmarSenhaUsuarioInput.required = !readOnly;

        // Campos Pessoais
        nomeCompletoInput.readOnly = readOnly;
        cpfInput.readOnly = readOnly;
        roleClienteRadio.disabled = readOnly;
        roleTecnicoRadio.disabled = readOnly;
        roleAdminRadio.disabled = readOnly;

        // Contato
        dddInput.readOnly = readOnly;
        celularInput.readOnly = readOnly;
        telefoneInput.readOnly = readOnly;
        estadoDddInput.readOnly = readOnly;

        // Endereço
        cepInput.readOnly = readOnly;
        logradouroInput.readOnly = readOnly;
        numeroInput.readOnly = readOnly;
        bairroInput.readOnly = readOnly;
        cidadeInput.readOnly = readOnly;
        estadoInput.readOnly = readOnly;
        paisInput.readOnly = readOnly;

        // Adiciona/remove classe para estilos CSS adicionais
        if (readOnly) {
            funcionarioDetailsFormContainer.classList.add('read-only');
        } else {
            funcionarioDetailsFormContainer.classList.remove('read-only');
        }
    }

    // --- Lógica do Botão Editar/Salvar ---
    editButton.addEventListener('click', async () => {
        if (!isEditing) {
            isEditing = true;
            editButton.textContent = 'Salvar Alterações';
            editButton.classList.remove('btn-edit');
            editButton.classList.add('btn-save');
            deleteButton.style.display = 'none';
            setFormReadOnly(false);
        } else {
            await handleUpdateFuncionario();
        }
    });

    // --- Lógica do Botão Excluir ---
    deleteButton.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja excluir este funcionário? Esta ação é irreversível.')) {
            await handleDeleteFuncionario();
        }
    });

    // --- Lógica do Botão Voltar para a Lista ---
    backToListButton.addEventListener('click', () => {
        window.location.href = './cadastroUsuarios.html';
    });


    // --- Função para Atualizar Funcionário ---
    async function handleUpdateFuncionario() {
        funcionarioMessage.textContent = '';
        funcionarioMessage.className = 'message';

        const email = emailUsuarioInput.value.trim();
        const novaSenha = senhaUsuarioInput.value.trim();
        const confirmarNovaSenha = confirmarSenhaUsuarioInput.value.trim();
        const nome = nomeCompletoInput.value.trim();
        const cpf = cpfInput.value.trim();
        const selectedRoleElement = document.querySelector('input[name="userRoleForm"]:checked');
        const role = selectedRoleElement ? selectedRoleElement.value.toUpperCase().replace('É', 'E').replace('Ç', 'C').replace(' ', '') : '';

        const ddd = dddInput.value.trim();
        const celular = celularInput.value.trim();
        const telefone = telefoneInput.value.trim();
        const estadoDdd = estadoDddInput.value.trim();

        const cep = cepInput.value.trim();
        const logradouro = logradouroInput.value.trim();
        const numero = numeroInput.value.trim();
        const bairro = bairroInput.value.trim();
        const cidade = cidadeInput.value.trim();
        const estado = estadoInput.value.trim();
        const pais = paisInput.value.trim();


        // Validações
        if (novaSenha !== confirmarNovaSenha) {
            funcionarioMessage.textContent = 'As novas senhas não coincidem!';
            funcionarioMessage.className = 'message error';
            return;
        }
        if (!novaSenha) {
            funcionarioMessage.textContent = 'A nova senha é obrigatória.';
            funcionarioMessage.className = 'message error';
            return;
        }
        if (!role) {
            funcionarioMessage.textContent = 'Por favor, selecione uma função (cargo) para o funcionário.';
            funcionarioMessage.className = 'message error';
            return;
        }
        if (cpf.length !== 11 || !/^\d+$/.test(cpf)) {
            funcionarioMessage.textContent = 'CPF inválido. Deve conter 11 dígitos numéricos.';
            funcionarioMessage.className = 'message error';
            return;
        }
        if (!celular || !/^\d+$/.test(celular) || celular.length < 8) {
             funcionarioMessage.textContent = 'Celular inválido. Deve conter apenas números e ter pelo menos 8 dígitos.';
             funcionarioMessage.className = 'message error';
             return;
         }
        if (!ddd || !/^\d+$/.test(ddd) || ddd.length !== 2) {
             funcionarioMessage.textContent = 'DDD inválido. Deve conter 2 dígitos numéricos.';
             funcionarioMessage.className = 'message error';
             return;
         }
        // Telefone é opcional, só valida se preenchido
        if (telefone && (telefone.length < 8 || !/^\d+$/.test(telefone))) {
            funcionarioMessage.textContent = 'Telefone inválido. Deve conter apenas números e ter pelo menos 8 dígitos.';
            funcionarioMessage.className = 'message error';
            return;
        }
        if (!cep || !/^\d+$/.test(cep) || cep.length !== 8) {
            funcionarioMessage.textContent = 'CEP inválido. Deve conter 8 dígitos numéricos.';
            funcionarioMessage.className = 'message error';
            return;
        }
        // Validação do Número do Endereço - Remover verificação de ser apenas numérico
        if (!numero || numero.length === 0) {
            funcionarioMessage.textContent = 'Número do endereço não pode ser vazio.';
            funcionarioMessage.className = 'message error';
            return;
        }
        if (!bairro || bairro.length === 0) {
            funcionarioMessage.textContent = 'Bairro não pode ser vazio.';
            funcionarioMessage.className = 'message error';
            return;
        }
        if (!cidade || cidade.length === 0) {
            funcionarioMessage.textContent = 'Cidade não pode ser vazia.';
            funcionarioMessage.className = 'message error';
            return;
        }
        if (!estado || estado.length === 0) {
            funcionarioMessage.textContent = 'Estado do endereço não pode ser vazio.';
            funcionarioMessage.className = 'message error';
            return;
        }
        if (!pais || pais.length === 0) {
            funcionarioMessage.textContent = 'País não pode ser vazio.';
            funcionarioMessage.className = 'message error';
            return;
        }
        // Validação de formato de email
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            funcionarioMessage.textContent = 'Email inválido.';
            funcionarioMessage.className = 'message error';
            return;
        }
        // Validação Estado (DDD)
        if (!estadoDdd || estadoDdd.length === 0) {
            funcionarioMessage.textContent = 'Estado (DDD) inválido. Não pode ser vazio.';
            funcionarioMessage.className = 'message error';
            return;
        }


        // Estrutura o DTO de atualização
        const funcionarioUpdateData = {
            nome: nome,
            cpf: cpf,
            usuarioRegisterDTO: {
                email: email,
                senha: novaSenha, // Sempre envia a novaSenha (que é obrigatória)
                role: role
            },
            enderecoUpdateDTO: {
                logradouro: logradouro,
                numero: numero,
                bairro: bairro,
                cidade: cidade,
                estado: estado,
                cep: cep,
                pais: pais
            },
            contatoUpdateDTO: {
                telefone: telefone,
                celular: celular,
                codigoDistanciaUpdateDTO: {
                    numero: ddd,
                    estado: estadoDdd
                }
            }
        };

        try {
            funcionarioMessage.textContent = 'Salvando alterações...';
            funcionarioMessage.className = 'message info';
            const response = await api.put(`/funcionario/${funcionarioId}`, funcionarioUpdateData); //
            console.log('Funcionário atualizado com sucesso:', response.data);
            funcionarioMessage.textContent = `Funcionário "${nome}" atualizado com sucesso!`;
            funcionarioMessage.className = 'message success';

            isEditing = false; // Sai do modo de edição
            editButton.textContent = 'Editar';
            editButton.classList.remove('btn-save');
            editButton.classList.add('btn-edit');
            deleteButton.style.display = 'inline-block'; // Mostra o botão de excluir
            setFormReadOnly(true); // Torna os campos somente leitura novamente
            senhaUsuarioInput.value = ''; // Limpa os campos de senha após salvar (por segurança)
            confirmarSenhaUsuarioInput.value = '';
            senhaUsuarioInput.placeholder = 'NOVA SENHA OBRIGATÓRIA'; // Restaura placeholders
            confirmarSenhaUsuarioInput.placeholder = 'CONFIRME NOVA SENHA';


        } catch (error) {
            console.error('Erro ao atualizar funcionário:', error);
            let errorMessage = 'Erro ao atualizar funcionário. Verifique os dados.';
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
            funcionarioMessage.textContent = errorMessage;
            funcionarioMessage.className = 'message error';
        }
    }

        // --- Função para Deletar Funcionário ---
        async function handleDeleteFuncionario() {
            funcionarioMessage.textContent = '';
            funcionarioMessage.className = 'message';

            try {
                funcionarioMessage.textContent = 'Excluindo funcionário...';
                funcionarioMessage.className = 'message info';
                await api.delete(`/funcionario/${funcionarioId}`); //
                console.log(`Funcionário ${funcionarioId} excluído com sucesso.`);
                alert('Funcionário excluído com sucesso!');
                window.location.href = './cadastroUsuarios.html'; // Redireciona de volta para a lista

            } catch (error) {
                console.error(`Erro ao excluir funcionário ${funcionarioId}:`, error);
                let errorMessage = `Erro ao excluir funcionário #${funcionarioId}.`;
                if (error.response) {
                    if (error.response.status === 400 && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else {
                        errorMessage = `Erro: ${error.response.status} - ${error.response.statusText}`;
                    }
                } else if (error.request) {
                    errorMessage = 'Não foi possível conectar ao servidor.';
                }
                funcionarioMessage.textContent = errorMessage;
                funcionarioMessage.className = 'message error';
            }
        }


        // Carregar detalhes do funcionário ao iniciar a página
        await loadFuncionarioDetails();
    });
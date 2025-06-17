// javascript/pages/cadastroEquipamentos.js
import { api } from '../api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Referências aos elementos do formulário de cadastro
    const formCadastrarEquipamento = document.getElementById('formCadastrarEquipamento');
    const nomeEquipamentoInput = document.getElementById('nomeEquipamento');
    const descricaoEquipamentoInput = document.getElementById('descricaoEquipamento');
    const equipamentoMessage = document.getElementById('equipamentoMessage'); // Mensagem do formulário
    const submitEquipamentoBtn = document.getElementById('submitEquipamentoBtn'); // Botão de submit do formulário

    // Referências aos elementos da tabela de listagem
    const equipamentosTableBody = document.getElementById('equipamentosTableBody');
    const equipamentoListMessage = document.getElementById('equipamentoListMessage'); // Mensagem da lista

    // Referência ao campo hidden para o ID do equipamento em edição
    const editEquipamentoIdInput = document.getElementById('editEquipamentoId');


    // Elementos comuns do layout
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
            console.log('Cadastro Equipamentos - Role do Usuário logado:', userRole);

            // Verificar se o usuário é ADMINISTRADOR
            if (userRole !== 'ADMINISTRADOR') {
                alert('Acesso negado. Você não tem permissão para acessar esta página.');
                localStorage.removeItem('jwt_token');
                window.location.href = './login.html';
                return;
            }

        } catch (e) {
            console.error("Cadastro Equipamentos - Erro ao decodificar JWT:", e);
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


    // --- Função para Cadastro/Atualização de Equipamento ---
    if (formCadastrarEquipamento) {
        formCadastrarEquipamento.addEventListener('submit', async (event) => {
            event.preventDefault();

            equipamentoMessage.textContent = '';
            equipamentoMessage.className = 'message';

            const nome = nomeEquipamentoInput.value.trim();
            const descricao = descricaoEquipamentoInput.value.trim();

            const isEditing = editEquipamentoIdInput.value !== ''; // Verifica se estamos no modo de edição
            const equipamentoId = editEquipamentoIdInput.value; // ID se estiver editando

            // Validação básica
            if (!nome || nome.length === 0) {
                equipamentoMessage.textContent = 'O nome do equipamento é obrigatório.';
                equipamentoMessage.className = 'message error';
                return;
            }
            if (!descricao || descricao.length === 0) {
                equipamentoMessage.textContent = 'A descrição do equipamento é obrigatória.';
                equipamentoMessage.className = 'message error';
                return;
            }

            const equipamentoData = {
                nome: nome,
                descricao: descricao
            };

            let url = '/equipamento/criar';
            let method = 'post';
            let successMessage = `Equipamento "${nome}" cadastrado com sucesso!`;

            if (isEditing) {
                url = `/equipamento/${equipamentoId}`; // Endpoint PUT para edição
                method = 'put';
                successMessage = `Equipamento "${nome}" atualizado com sucesso!`;
            }

            try {
                equipamentoMessage.textContent = isEditing ? 'Atualizando equipamento...' : 'Cadastrando equipamento...';
                equipamentoMessage.className = 'message info';
                
                let response;
                if (method === 'post') {
                    response = await api.post(url, equipamentoData); //
                } else { // method === 'put'
                    response = await api.put(url, equipamentoData); //
                }

                console.log(successMessage, response.data);
                equipamentoMessage.textContent = successMessage;
                equipamentoMessage.className = 'message success';
                formCadastrarEquipamento.reset(); // Limpa o formulário
                editEquipamentoIdInput.value = ''; // Limpa o ID de edição
                submitEquipamentoBtn.textContent = 'Cadastrar Máquina'; // Volta o texto do botão
                await loadEquipamentos(); // Recarrega a lista

            } catch (error) {
                console.error('Erro na operação:', error);
                let errorMessage = isEditing ? 'Erro ao atualizar equipamento. Verifique os dados.' : 'Erro ao cadastrar equipamento. Verifique os dados.';
                if (error.response) {
                    if (error.response.status === 400 && error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.data && error.response.data.error) {
                        errorMessage = error.response.data.error;
                    } else {
                        errorMessage = `Erro: ${error.response.status} - ${error.response.statusText}`;
                    }
                } else if (error.request) {
                    errorMessage = 'Não foi possível conectar ao servidor.';
                }
                equipamentoMessage.textContent = errorMessage;
                equipamentoMessage.className = 'message error';
            }
        });
    }


    // --- Função para Carregar e Listar Equipamentos ---
    async function loadEquipamentos() {
        equipamentosTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Carregando equipamentos...</td></tr>';
        equipamentoListMessage.textContent = '';

        try {
            const response = await api.get('/equipamento'); //
            const equipamentos = response.data;

            equipamentosTableBody.innerHTML = '';

            if (equipamentos.length === 0) {
                equipamentosTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nenhum equipamento cadastrado.</td></tr>';
                return;
            }

            equipamentos.forEach(equipamento => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${equipamento.id}</td>
                    <td>${equipamento.nome}</td>
                    <td>${equipamento.descricao}</td>
                    <td>
                        <button class="action-btn edit-equipamento-btn" data-equipamento-id="${equipamento.id}">Editar</button>
                        <button class="action-btn delete-equipamento-btn danger" data-equipamento-id="${equipamento.id}">Excluir</button>
                    </td>
                `;
                equipamentosTableBody.appendChild(row);
            });

            // Adiciona listeners para os botões "Editar" e "Excluir"
            document.querySelectorAll('.edit-equipamento-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const equipId = event.target.dataset.equipamentoId;
                    await handleEditEquipamento(equipId);
                });
            });

            document.querySelectorAll('.delete-equipamento-btn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const equipId = event.target.dataset.equipamentoId;
                    // Usa o CONFIRM() padrão do navegador aqui
                    if (confirm('Tem certeza que deseja excluir este equipamento? Esta ação é irreversível.')) {
                        await handleDeleteEquipamento(equipId);
                    } else {
                        equipamentoMessage.textContent = 'Exclusão cancelada.';
                        equipamentoMessage.className = 'message info';
                    }
                });
            });


        } catch (error) {
            console.error('Erro ao carregar equipamentos:', error);
            equipamentoListMessage.textContent = `Erro ao carregar lista de equipamentos.`;
            equipamentoListMessage.className = 'message error';
            equipamentosTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Erro ao carregar equipamentos.</td></tr>';
        }
    }

    // Função para preencher o formulário no modo de edição
    async function handleEditEquipamento(equipId) {
        equipamentoMessage.textContent = 'Carregando dados para edição...';
        equipamentoMessage.className = 'message info';
        try {
            const response = await api.get(`/equipamento/${equipId}`);
            const equipamento = response.data;

            editEquipamentoIdInput.value = equipamento.id; // Guarda o ID para a atualização
            nomeEquipamentoInput.value = equipamento.nome;
            descricaoEquipamentoInput.value = equipamento.descricao;

            submitEquipamentoBtn.textContent = 'Salvar Alterações'; // Muda o texto do botão de submit
            equipamentoMessage.textContent = 'Dados carregados para edição.';
            equipamentoMessage.className = 'message info';

        } catch (error) {
            console.error(`Erro ao carregar dados do equipamento ${equipId} para edição:`, error);
            equipamentoMessage.textContent = 'Erro ao carregar dados para edição.';
            equipamentoMessage.className = 'message error';
        }
    }

    // Função para Deletar Equipamento
    async function handleDeleteEquipamento(equipIdToDelete) {
        equipamentoMessage.textContent = '';
        equipamentoMessage.className = 'message';

        try {
            equipamentoMessage.textContent = 'Excluindo equipamento...';
            equipamentoMessage.className = 'message info';
            await api.delete(`/equipamento/${equipIdToDelete}`);
            console.log(`Equipamento ${equipIdToDelete} excluído com sucesso.`);
            alert('Equipamento excluído com sucesso!'); // Alerta final de sucesso
            await loadEquipamentos(); // Recarrega a lista
            equipamentoMessage.textContent = `Equipamento #${equipIdToDelete} excluído com sucesso.`;
            equipamentoMessage.className = 'message success';

        } catch (error) {
            console.error(`Erro ao excluir equipamento ${equipIdToDelete}:`, error);
            let errorMessage = `Erro ao excluir equipamento #${equipIdToDelete}.`;
            if (error.response) {
                if (error.response.status === 400 && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data && error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else {
                    errorMessage = `Erro: ${error.response.status} - ${error.response.statusText}`;
                }
            } else if (error.request) {
                errorMessage = 'Não foi possível conectar ao servidor.';
            }
            equipamentoMessage.textContent = errorMessage;
            equipamentoMessage.className = 'message error';
        }
    }


    // Removidas as declarações duplicadas do modal. A estrutura do modal HTML ainda é necessária.
    // Funções para o Modal de Confirmação de Exclusão (manter as funções, mas não as declarações const)
    /*
    const deleteConfirmModal = document.getElementById('deleteConfirmModal'); // REMOVER ESTA DECLARAÇÃO
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn'); // REMOVER ESTA DECLARAÇÃO
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn'); // REMOVER ESTA DECLARAÇÃO
    let currentEquipIdToDelete = null; // Remover esta variável se não for usar o modal customizado.
    */
    // A função showDeleteConfirmModal não será mais chamada, o confirm() nativo é usado diretamente.
    /*
    function showDeleteConfirmModal(equipId) {
        currentEquipIdToDelete = equipId;
        deleteConfirmModal.classList.add('show');
    }
    // Listeners para os botões do modal (REMOVER estes listeners, pois o modal customizado não será usado)
    confirmDeleteBtn.addEventListener('click', async () => { ... });
    cancelDeleteBtn.addEventListener('click', () => { ... });
    */


    // Carregar a lista de equipamentos ao carregar a página
    await loadEquipamentos();


    // --- Funções Comuns do Layout (Logout, Dark Mode, Sidebar Toggle) ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('jwt_token');
            window.location.href = './login.html';
        });
    }

    if (darkModeSwitch) {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        darkModeSwitch.checked = isDarkMode;

        darkModeSwitch.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', darkModeSwitch.checked);
            localStorage.setItem('darkMode', darkModeSwitch.checked);
        });
    }

    if (sidebarToggleBtn && appContainer) {
        sidebarToggleBtn.addEventListener('click', () => {
            appContainer.classList.toggle('sidebar-collapsed');
        });
    }
});
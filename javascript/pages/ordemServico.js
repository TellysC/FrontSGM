// javascript/pages/ordemServico.js
import { api } from '../api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const formCriarOrdem = document.getElementById('formCriarOrdem');
    const ordemDescricaoInput = document.getElementById('ordemDescricao');
    const ordemEquipamentoSelect = document.getElementById('ordemEquipamento');
    const tipoManutencaoSelect = document.getElementById('tipoManutencao'); // NOVO: Referência ao select de Tipo Manutenção
    const ordemMessage = document.getElementById('ordemMessage');
    const logoutButton = document.getElementById('logoutButton');
    const ordensTableBody = document.getElementById('ordensTableBody');
    const listMessage = document.getElementById('listMessage');
    const filterAbertasBtn = document.getElementById('filterAbertas');
    const filterConcluidasBtn = document.getElementById('filterConcluidas');
    const filterTodasBtn = document.getElementById('filterTodas');

    console.log('Botão Abertas:', filterAbertasBtn);
    console.log('Botão Concluídas:', filterConcluidasBtn);
    console.log('Botão Todas:', filterTodasBtn);
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('jwt_token');
            window.location.href = './login.html';
        });
    }

    // --- Extrair funcionario_id do JWT ---
    let funcionarioId = null;
    let usuarioId = null;
    const token = localStorage.getItem('jwt_token');
    if (token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decodedToken = JSON.parse(jsonPayload);
            funcionarioId = decodedToken.funcionario_id;
            usuarioId = decodedToken.id;
            console.log('ID do Funcionário logado:', funcionarioId);
            console.log('ID do Usuário logado:', usuarioId);
        } catch (e) {
            console.error("Erro ao decodificar JWT para obter IDs:", e);
            ordemMessage.textContent = 'Erro ao carregar dados do usuário. Faça login novamente.';
            ordemMessage.className = 'message error';
            listMessage.textContent = 'Erro ao carregar dados do usuário. Faça login novamente.';
            listMessage.className = 'message error';
            localStorage.removeItem('jwt_token');
            window.location.href = './login.html';
            return;
        }
    } else {
        window.location.href = './login.html';
        return;
    }


    // --- Carregar Equipamentos ---
    async function loadEquipamentos() {
        try {
            const response = await api.get('/equipamento'); //
            const equipamentos = response.data;
            ordemEquipamentoSelect.innerHTML = '<option value="">Selecione um equipamento</option>';

            equipamentos.forEach(equipamento => {
                const option = document.createElement('option');
                option.value = equipamento.id;
                option.textContent = `${equipamento.nome} (${equipamento.descricao})`;
                ordemEquipamentoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar equipamentos:', error);
            ordemEquipamentoSelect.innerHTML = '<option value="">Erro ao carregar equipamentos</option>';
            ordemMessage.textContent = 'Não foi possível carregar a lista de equipamentos.';
            ordemMessage.className = 'message error';
        }
    }

    await loadEquipamentos();


    // --- Envio do Formulário de Criação de Ordem de Serviço ---
    if (formCriarOrdem) {
        formCriarOrdem.addEventListener('submit', handleCreateOrdemServico);
    }

    async function handleCreateOrdemServico(event) {
        event.preventDefault();

        const descricao = ordemDescricaoInput.value;
        const equipamentoId = ordemEquipamentoSelect.value;
        const tipoManutencao = tipoManutencaoSelect.value; // NOVO: Pega o valor selecionado

        if (!funcionarioId) {
            ordemMessage.textContent = 'Erro: ID do funcionário não disponível. Tente fazer login novamente.';
            ordemMessage.className = 'message error';
            return;
        }

        if (!equipamentoId) {
            ordemMessage.textContent = 'Por favor, selecione um equipamento.';
            ordemMessage.className = 'message error';
            return;
        }

        if (!tipoManutencao) { // NOVO: Validação para o tipo de manutenção
            ordemMessage.textContent = 'Por favor, selecione o tipo de manutenção.';
            ordemMessage.className = 'message error';
            return;
        }


        const data = {
            descricao: descricao,
            status: "ABERTA", // O backend define como ABERTA
            tipoManuntencao: tipoManutencao, // NOVO: Usa o valor selecionado pelo usuário
            funcionario: { id: funcionarioId },
            equipamento: { id: equipamentoId }
        };

        try {
            const response = await api.post('/ordem-servico/criar', data); //
            console.log('Ordem de Serviço criada com sucesso:', response.data);
            ordemMessage.textContent = 'Ordem de serviço enviada com sucesso!';
            ordemMessage.className = 'message success';
            formCriarOrdem.reset();
            ordemEquipamentoSelect.value = '';
            tipoManutencaoSelect.value = ''; // Reseta o select do tipo de manutenção
            await loadMinhasOrdens(); // Recarrega a lista de ordens após a criação

        } catch (error) {
            console.error('Erro ao criar ordem de serviço:', error);
            let errorMessage = 'Erro ao enviar ordem de serviço. Tente novamente.';
            if (error.response) {
                if (error.response.status === 400 && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data && error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else {
                    errorMessage = `Erro: ${error.response.status} - ${error.response.statusText}`;
                }
            } else if (error.request) {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
            }
            ordemMessage.textContent = errorMessage;
            ordemMessage.className = 'message error';
        }
    }

    // --- Funções para carregar e exibir Ordens de Serviço ---
    // (O restante do código para listar as ordens permanece o mesmo)
    async function fetchOrdensServico(filterType = 'todas') {
        if (!funcionarioId) {
            listMessage.textContent = 'Erro: ID do funcionário não disponível para listar ordens.';
            listMessage.className = 'message error';
            return [];
        }

        let endpoint = '';
        if (filterType === 'abertas') {
            endpoint = '/ordem-servico/minhas-abertas';
        } else if (filterType === 'concluidas') {
            endpoint = '/ordem-servico/minhas-concluidas';
        } else {
            endpoint = '/ordem-servico/minhas-criadas';
        }

        try {
            const response = await api.get(endpoint);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar ordens de serviço (${filterType}):`, error);
            listMessage.textContent = `Erro ao carregar suas ordens de serviço.`;
            listMessage.className = 'message error';
            return [];
        }
    }

    async function loadMinhasOrdens(filterType = 'todas') {
        ordensTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Carregando suas ordens...</td></tr>';
        listMessage.textContent = '';

        const ordens = await fetchOrdensServico(filterType);

        ordensTableBody.innerHTML = '';

        if (ordens.length === 0) {
            ordensTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhuma ordem de serviço encontrada.</td></tr>';
            return;
        }

        ordens.forEach(ordem => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ordem.id}</td>
                <td>${ordem.descricao}</td>
                <td><span class="status-${ordem.status.toLowerCase()}">${ordem.status}</span></td>
                <td>${ordem.tipoManuntencao}</td>
                <td>${ordem.equipamento ? ordem.equipamento.nome : 'N/A'}</td>
                <td>${new Date(ordem.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn view-report-btn" data-ordem-id="${ordem.id}" ${ordem.status === 'ABERTA' ? 'disabled' : ''}>Ver Relatório</button>
                </td>
            `;
            ordensTableBody.appendChild(row);
        });

        document.querySelectorAll('.view-report-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const ordemId = event.target.dataset.ordemId;
                alert(`Visualizar relatório para Ordem de Serviço ID: ${ordemId}`);
            });
        });
    }

    // --- Filtros ---
    if (filterAbertasBtn) {
        filterAbertasBtn.addEventListener('click', () => loadMinhasOrdens('abertas'));
    }
    if (filterConcluidasBtn) {
        filterConcluidasBtn.addEventListener('click', () => loadMinhasOrdens('concluidas'));
    }
    if (filterTodasBtn) {
        filterTodasBtn.addEventListener('click', () => loadMinhasOrdens('todas'));
    }

    await loadMinhasOrdens();

    // --- Dark Mode Toggle (se presente, do seu HTML inicial) ---
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    if (darkModeSwitch) {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        darkModeSwitch.checked = isDarkMode;

        darkModeSwitch.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', darkModeSwitch.checked);
            localStorage.setItem('darkMode', darkModeSwitch.checked);
        });
    }

    // --- Estilos para o Status na Tabela ---
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
        .status-aberta { color: #ffc107; font-weight: bold; }
        .status-concluida { color: #28a745; font-weight: bold; }
    `;
    document.head.appendChild(styleTag);
});
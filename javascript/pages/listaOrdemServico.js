// javascript/pages/listaOrdemServico.js
import { api } from '../api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Obter referências aos elementos HTML
    const ordensTableBodyTecnico = document.getElementById('ordensTableBodyTecnico');
    const ordensTecnicoMessage = document.getElementById('ordensTecnicoMessage');
    const logoutButton = document.getElementById('logoutButton');
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const appContainer = document.querySelector('.app-container');

    const filterAbertasBtn = document.getElementById('filterAbertasTecnico');
    const filterConcluidasBtn = document.getElementById('filterConcluidasTecnico');
    const filterTodasBtn = document.getElementById('filterTodasTecnico');


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
            console.log('Lista Ordens - Role do Usuário logado:', userRole);

            if (userRole !== 'TECNICO' && userRole !== 'ADMINISTRADOR') { //
                alert('Acesso negado. Você não tem permissão para acessar esta página.');
                localStorage.removeItem('jwt_token');
                window.location.href = './login.html';
                return;
            }

        } catch (e) {
            console.error("Lista Ordens - Erro ao decodificar JWT:", e);
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


    // --- Funções Comuns do Dashboard ---
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


    // --- Funções para carregar e exibir Ordens de Serviço ---

    async function fetchOrdensServico(filterType = 'todas') {
        let endpoint = '';
        if (filterType === 'abertas') {
            endpoint = '/ordem-servico/abertas'; //
        } else if (filterType === 'concluidas') {
            endpoint = '/ordem-servico'; // Pega todas as ordens
        } else { // 'todas'
            endpoint = '/ordem-servico'; // Pega todas as ordens
        }

        try {
            const response = await api.get(endpoint);
            let ordens = response.data;

            if (filterType === 'concluidas' && endpoint === '/ordem-servico') {
                ordens = ordens.filter(ordem => ordem.status === 'CONCLUIDA'); //
            }

            return ordens;
        } catch (error) {
            console.error(`Erro ao buscar ordens de serviço (${filterType}):`, error);
            ordensTecnicoMessage.textContent = `Erro ao carregar ordens de serviço.`;
            ordensTecnicoMessage.className = 'message error';
            return [];
        }
    }

    async function loadOrdensServico(filterType = 'todas') {
        ordensTableBodyTecnico.innerHTML = '<tr><td colspan="8" style="text-align: center;">Carregando ordens de serviço...</td></tr>';
        ordensTecnicoMessage.textContent = ''; // Limpa mensagens anteriores

        const ordens = await fetchOrdensServico(filterType);

        ordensTableBodyTecnico.innerHTML = ''; // Limpa o conteúdo da tabela

        if (ordens.length === 0) {
            ordensTableBodyTecnico.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhuma ordem de serviço encontrada.</td></tr>';
            return;
        }

        ordens.forEach(ordem => {
            const row = document.createElement('tr');
            const isConcluida = ordem.status === 'CONCLUIDA'; //

            row.innerHTML = `
                <td>${new Date(ordem.createdAt).toLocaleDateString()}</td>
                <td>${ordem.id}</td>
                <td>${ordem.funcionario ? ordem.funcionario.nome : 'N/A'}</td> <td>${ordem.descricao}</td>
                <td>${ordem.equipamento ? ordem.equipamento.nome : 'N/A'}</td>
                <td>${ordem.tipoManuntencao}</td>
                <td><span class="status-${ordem.status.toLowerCase()}">${ordem.status}</span></td>
                <td>
                    <button class="action-btn view-details-btn" data-ordem-id="${ordem.id}">
                        ${isConcluida ? 'Ver Detalhes' : 'Ver Detalhes/Concluir'}
                    </button>
                </td>
            `;
            ordensTableBodyTecnico.appendChild(row);
        });

        // Adiciona event listeners para os botões "Ver Detalhes/Concluir"
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const ordemId = event.target.dataset.ordemId;
                // Redireciona para a nova página de detalhes da ordem
                window.location.href = `./detalheOrdemServicoTecnico.html?id=${ordemId}`;
            });
        });
    }

    // --- Filtros ---
    if (filterAbertasBtn) {
        filterAbertasBtn.addEventListener('click', () => loadOrdensServico('abertas'));
    }
    if (filterConcluidasBtn) {
        filterConcluidasBtn.addEventListener('click', () => loadOrdensServico('concluidas'));
    }
    if (filterTodasBtn) {
        filterTodasBtn.addEventListener('click', () => loadOrdensServico('todas'));
    }

    // Carregar ordens de serviço ao iniciar a página (todas por padrão)
    await loadOrdensServico('todas');

    // --- Estilos para o Status na Tabela (pode ser global em componentes.css) ---
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
        .status-aberta { color: #ffc107; font-weight: bold; }
        .status-concluida { color: #28a745; font-weight: bold; }
    `;
    document.head.appendChild(styleTag);
});
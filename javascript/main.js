// javascript/main.js
import { api } from './api.js'; // Importa a instância do Axios configurada

document.addEventListener('DOMContentLoaded', async () => {
    // Obter referências aos elementos HTML
    const countOrdensAbertasTecnico = document.getElementById('count-ordens-abertas-tecnico');
    const countUsuariosCadastrados = document.getElementById('count-usuarios-cadastrados');
    const countEquipamentosCadastrados = document.getElementById('count-equipamentos-cadastrados');
    const logoutButton = document.getElementById('logoutButton');
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const appContainer = document.querySelector('.app-container');

    // --- Extrair funcionario_id e usuarioId do JWT (necessário para buscar ordens do técnico) ---
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
            console.log('Dashboard Técnico - ID do Funcionário logado:', funcionarioId);
            console.log('Dashboard Técnico - ID do Usuário logado:', usuarioId);

            // Verificar se o usuário é realmente um TÉCNICO
            if (decodedToken.role !== 'TECNICO') {
                alert('Acesso negado. Você não tem permissão para acessar este dashboard.');
                localStorage.removeItem('jwt_token');
                window.location.href = './login.html';
                return;
            }

        } catch (e) {
            console.error("Dashboard Técnico - Erro ao decodificar JWT:", e);
            alert('Sessão inválida ou expirada. Faça login novamente.');
            localStorage.removeItem('jwt_token');
            window.location.href = './login.html';
            return;
        }
    } else {
        alert('Você não está logado. Faça login para acessar o dashboard.');
        window.location.href = './login.html';
        return;
    }


    // --- Funções para buscar contagens da API ---

    // Contagem de Ordens Abertas/Em Andamento (DE TODOS os usuários)
    async function fetchOpenOrdersCount() {
        try {
            // CORREÇÃO: Chamando o endpoint /ordem-servico/abertas para pegar TODAS as abertas
            const response = await api.get(`/ordem-servico/abertas`);
            return response.data.length;
        } catch (error) {
            console.error('Dashboard Técnico - Erro ao buscar contagem de ordens abertas (todas):', error);
            return 'Erro';
        }
    }

    // Contagem de Usuários Cadastrados
    async function fetchUserCount() {
        try {
            const response = await api.get('/usuario'); //
            return response.data.length;
        } catch (error) {
            console.error('Dashboard Técnico - Erro ao buscar contagem de usuários:', error);
            return 'Erro';
        }
    }

    // Contagem de Equipamentos Cadastrados
    async function fetchEquipmentCount() {
        try {
            const response = await api.get('/equipamento'); //
            return response.data.length;
        } catch (error) {
            console.error('Dashboard Técnico - Erro ao buscar contagem de equipamentos:', error);
            return 'Erro';
        }
    }

    // --- Função para carregar todas as contagens ---
    async function loadDashboardCounts() {
        // Inicializa com um placeholder
        countOrdensAbertasTecnico.textContent = '...';
        countUsuariosCadastrados.textContent = '...';
        countEquipamentosCadastrados.textContent = '...';

        // Carrega todas as contagens em paralelo
        const [openOrders, userCount, equipmentCount] = await Promise.all([
            fetchOpenOrdersCount(),
            fetchUserCount(),
            fetchEquipmentCount()
        ]);

        // Atualiza o texto dos elementos
        countOrdensAbertasTecnico.textContent = openOrders;
        countUsuariosCadastrados.textContent = userCount;
        countEquipamentosCadastrados.textContent = equipmentCount;
    }

    await loadDashboardCounts(); // Carregar as contagens ao carregar a página

    // --- Logout ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('jwt_token');
            window.location.href = './login.html';
        });
    }

    // --- Dark Mode Toggle ---
    if (darkModeSwitch) {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', isDarkMode);
        darkModeSwitch.checked = isDarkMode;

        darkModeSwitch.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', darkModeSwitch.checked);
            localStorage.setItem('darkMode', darkModeSwitch.checked);
        });
    }

    // --- Sidebar Toggle ---
    if (sidebarToggleBtn && appContainer) {
        sidebarToggleBtn.addEventListener('click', () => {
            appContainer.classList.toggle('sidebar-collapsed');
        });
    }
});
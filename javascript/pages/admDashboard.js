// javascript/pages/admDashboard.js
import { api } from '../api.js'; //

document.addEventListener('DOMContentLoaded', async () => {
    // Obter referências aos elementos HTML dos cards
    const countEquipamentosCadastrados = document.getElementById('count-materials');
    const countUsuariosCadastrados = document.getElementById('count-users');
    const countOrdensAbertas = document.getElementById('count-total-service-orders');

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
            console.log('Admin Dashboard - Role do Usuário logado:', userRole);

            // Verificar se o usuário é ADMINISTRADOR
            if (userRole !== 'ADMINISTRADOR') { //
                alert('Acesso negado. Você não tem permissão para acessar este dashboard.');
                localStorage.removeItem('jwt_token');
                window.location.href = './login.html';
                return;
            }

        } catch (e) {
            console.error("Admin Dashboard - Erro ao decodificar JWT:", e);
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

    // Contagem de Equipamentos Cadastrados (TODOS)
    async function fetchEquipmentsCount() {
        try {
            const response = await api.get('/equipamento'); //
            return response.data.length;
        } catch (error) {
            console.error('Admin Dashboard - Erro ao buscar contagem de equipamentos:', error);
            return 'Erro';
        }
    }

    // Contagem de Usuários Cadastrados (TODOS)
    async function fetchUsersCount() {
        try {
            const response = await api.get('/usuario'); //
            return response.data.length;
        } catch (error) {
            console.error('Admin Dashboard - Erro ao buscar contagem de usuários:', error);
            return 'Erro';
        }
    }

    // Contagem de Ordens de Serviço Abertas (TODAS)
    async function fetchOpenServiceOrdersCount() {
        try {
            const response = await api.get('/ordem-servico/abertas'); //
            return response.data.length;
        } catch (error) {
            console.error('Admin Dashboard - Erro ao buscar contagem de ordens abertas:', error);
            return 'Erro';
        }
    }


    // --- Função para carregar todas as contagens no dashboard ---
    async function loadDashboardCounts() {
        // Inicializa com um placeholder
        countEquipamentosCadastrados.textContent = '...';
        countUsuariosCadastrados.textContent = '...';
        countOrdensAbertas.textContent = '...';

        // Carrega todas as contagens em paralelo
        const [equipmentsCount, usersCount, openOrdersCount] = await Promise.all([
            fetchEquipmentsCount(),
            fetchUsersCount(),
            fetchOpenServiceOrdersCount()
        ]);

        // Atualiza o texto dos elementos
        countEquipamentosCadastrados.textContent = equipmentsCount;
        countUsuariosCadastrados.textContent = usersCount;
        countOrdensAbertas.textContent = openOrdersCount;
    }

    // Carregar as contagens ao carregar a página
    await loadDashboardCounts();


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
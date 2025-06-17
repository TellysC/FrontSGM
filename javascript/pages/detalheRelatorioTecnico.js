// javascript/pages/detalheRelatorioTecnico.js
import { api } from '../api.js'; //

document.addEventListener('DOMContentLoaded', async () => {
    const relatorioId = new URLSearchParams(window.location.search).get('id'); // Pega o ID da URL
    if (!relatorioId) {
        alert('ID do Relatório não fornecido.');
        window.location.href = './tecRelatorios.html'; // Redireciona de volta
        return;
    }

    // Obter referências aos elementos HTML de detalhes do relatório
    const relatorioIdDisplay = document.getElementById('relatorioIdDisplay');
    const dataCriacaoDisplay = document.getElementById('dataCriacaoDisplay');
    const tituloDisplay = document.getElementById('tituloDisplay');
    const conteudoDisplay = document.getElementById('conteudoDisplay');
    const ordemServicoIdDisplay = document.getElementById('ordemServicoIdDisplay');
    const ordemServicoStatusDisplay = document.getElementById('ordemServicoStatusDisplay');
    const relatorioDetalheMessage = document.getElementById('relatorioDetalheMessage');
    const backToListButton = document.getElementById('backToListButton');

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
            console.log('Detalhes Relatório - Role do Usuário logado:', userRole);

            // Verificar se o usuário é TÉCNICO ou ADMINISTRADOR
            if (userRole !== 'TECNICO' && userRole !== 'ADMINISTRADOR') { //
                alert('Acesso negado. Você não tem permissão para acessar esta página.');
                localStorage.removeItem('jwt_token');
                window.location.href = './login.html';
                return;
            }

        } catch (e) {
            console.error("Detalhes Relatório - Erro ao decodificar JWT:", e);
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


    // --- Carregar Detalhes do Relatório ---
    async function loadRelatorioDetalhes() {
        try {
            const response = await api.get(`/relatorio/${relatorioId}`); //
            const relatorio = response.data;

            // Preencher os detalhes do relatório
            relatorioIdDisplay.textContent = relatorio.id;
            dataCriacaoDisplay.textContent = new Date(relatorio.createdAt).toLocaleDateString();
            tituloDisplay.textContent = relatorio.titulo;
            conteudoDisplay.textContent = relatorio.descricao; // Use textContent para exibir o conteúdo

            // Preencher detalhes da Ordem de Serviço vinculada, se existir
            if (relatorio.ordemServico) { //
                ordemServicoIdDisplay.textContent = relatorio.ordemServico.id;
                ordemServicoStatusDisplay.innerHTML = `<span class="status-tag status-${relatorio.ordemServico.status.toLowerCase()}">${relatorio.ordemServico.status}</span>`; //
            } else {
                ordemServicoIdDisplay.textContent = 'N/A';
                ordemServicoStatusDisplay.textContent = 'N/A';
            }

        } catch (error) {
            console.error(`Erro ao carregar detalhes do relatório ID ${relatorioId}:`, error);
            relatorioDetalheMessage.textContent = 'Não foi possível carregar os detalhes do relatório.';
            relatorioDetalheMessage.className = 'message error';
        }
    }

    // Botão Voltar para a Lista
    if (backToListButton) {
        backToListButton.addEventListener('click', () => {
            window.location.href = './tecRelatorios.html';
        });
    }

    // Carregar detalhes do relatório ao iniciar a página
    await loadRelatorioDetalhes();
});
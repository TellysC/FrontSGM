// javascript/pages/detalheOrdemServicoTecnico.js
import { api } from '../api.js'; //

document.addEventListener('DOMContentLoaded', async () => {
    const ordemId = new URLSearchParams(window.location.search).get('id'); // Pega o ID da URL
    if (!ordemId) {
        alert('ID da Ordem de Serviço não fornecido.');
        window.location.href = './listaOrdemServico.html'; // Redireciona de volta
        return;
    }

    // Obter referências aos elementos HTML de detalhes da ordem
    const ordemIdDisplay = document.getElementById('ordemIdDisplay');
    const dataCriacaoDisplay = document.getElementById('dataCriacaoDisplay');
    const clienteDisplay = document.getElementById('clienteDisplay');
    const equipamentoDisplay = document.getElementById('equipamentoDisplay');
    const tipoManutencaoDisplay = document.getElementById('tipoManutencaoDisplay');
    const statusDisplay = document.getElementById('statusDisplay');
    const descricaoDisplay = document.getElementById('descricaoDisplay');
    const ordemDetalheMessage = document.getElementById('ordemDetalheMessage');

    // Obter referências aos elementos do formulário de relatório
    const reportSection = document.getElementById('reportSection');
    const formConcluirOrdem = document.getElementById('formConcluirOrdem');
    const relatorioTituloInput = document.getElementById('relatorioTitulo');
    const relatorioDescricaoInput = document.getElementById('relatorioDescricao');
    const concluirOsSubmitBtn = document.getElementById('concluirOsSubmitBtn');
    const reportStatusMessage = document.getElementById('reportStatusMessage');

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
            console.log('Detalhes OS - Role do Usuário logado:', userRole);

            // Verificar se o usuário é TÉCNICO ou ADMINISTRADOR
            if (userRole !== 'TECNICO' && userRole !== 'ADMINISTRADOR') {
                alert('Acesso negado. Você não tem permissão para acessar esta página.');
                localStorage.removeItem('jwt_token');
                window.location.href = './login.html';
                return;
            }

        } catch (e) {
            console.error("Detalhes OS - Erro ao decodificar JWT:", e);
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


    // --- Carregar Detalhes da Ordem de Serviço ---
    async function loadOrdemDetalhes() {
        try {
            const response = await api.get(`/ordem-servico/${ordemId}`); //
            const ordem = response.data;

            // Preencher os detalhes da ordem
            ordemIdDisplay.textContent = ordem.id;
            dataCriacaoDisplay.textContent = new Date(ordem.createdAt).toLocaleDateString();
            clienteDisplay.textContent = ordem.funcionario ? ordem.funcionario.nome : 'N/A'; // Nome do Cliente/Criador
            equipamentoDisplay.textContent = ordem.equipamento ? ordem.equipamento.nome : 'N/A';
            tipoManutencaoDisplay.textContent = ordem.tipoManuntencao;
            statusDisplay.innerHTML = `<span class="status-tag status-${ordem.status.toLowerCase()}">${ordem.status}</span>`;
            descricaoDisplay.textContent = ordem.descricao;

            // Gerenciar a seção de relatório (só mostrar se a ordem não estiver concluída)
            if (ordem.status === 'CONCLUIDA') { //
                reportSection.style.display = 'none'; // Esconde a seção de relatório
                ordemDetalheMessage.textContent = 'Esta ordem de serviço já foi concluída.';
                ordemDetalheMessage.className = 'message success';
            } else {
                reportSection.style.display = 'block'; // Mostra a seção de relatório
            }

        } catch (error) {
            console.error(`Erro ao carregar detalhes da ordem de serviço ID ${ordemId}:`, error);
            ordemDetalheMessage.textContent = 'Não foi possível carregar os detalhes da ordem de serviço.';
            ordemDetalheMessage.className = 'message error';
        }
    }

    // --- Função para Concluir Ordem de Serviço e Criar Relatório ---
    if (formConcluirOrdem) {
        formConcluirOrdem.addEventListener('submit', handleConcluirOrdemServico);
    }

    async function handleConcluirOrdemServico(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        const relatorioTitulo = relatorioTituloInput.value.trim();
        const relatorioDescricao = relatorioDescricaoInput.value.trim();

        // Validação dos campos do relatório
        if (!relatorioTitulo) {
            reportStatusMessage.textContent = 'Por favor, digite o título do relatório.';
            reportStatusMessage.className = 'message error';
            return;
        }
        if (!relatorioDescricao) {
            reportStatusMessage.textContent = 'Por favor, digite a descrição do relatório.';
            reportStatusMessage.className = 'message error';
            return;
        }

        reportStatusMessage.textContent = 'Processando...';
        reportStatusMessage.className = 'message';

        try {
            // 1. Fechar/Concluir a Ordem de Serviço
            const fecharResponse = await api.put(`/ordem-servico/${ordemId}/fechar`); //
            console.log(`Ordem de Serviço ${ordemId} fechada com sucesso!`, fecharResponse.data);

            // 2. Criar o Relatório
            const relatorioData = {
                titulo: relatorioTitulo,
                descricao: relatorioDescricao,
                ordemServicoId: ordemId
            };
            const relatorioResponse = await api.post('/relatorio/ordem-servico', relatorioData); //
            console.log(`Relatório para OS ${ordemId} criado com sucesso!`, relatorioResponse.data);

            reportStatusMessage.textContent = `Ordem #${ordemId} concluída e relatório criado com sucesso!`;
            reportStatusMessage.className = 'message success';
            formConcluirOrdem.reset(); // Limpa o formulário
            await loadOrdemDetalhes(); // Recarrega os detalhes para atualizar o status (esconder formulário de relatório)

        } catch (error) {
            console.error(`Erro ao concluir OS ${ordemId} ou criar relatório:`, error);
            let errorMessage = `Erro ao processar Ordem de Serviço #${ordemId}.`;
            if (error.response) {
                if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else {
                    errorMessage = `Erro: ${error.response.status} - ${error.response.statusText}`;
                }
            } else if (error.request) {
                errorMessage = 'Não foi possível conectar ao servidor.';
            }
            reportStatusMessage.textContent = errorMessage;
            reportStatusMessage.className = 'message error';
        }
    }

    // Carregar detalhes da ordem ao iniciar a página
    await loadOrdemDetalhes();
});
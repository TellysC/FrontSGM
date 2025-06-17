// javascript/pages/tecRelatorios.js
import { api } from '../api.js'; //

document.addEventListener('DOMContentLoaded', async () => {
    // Obter referências aos elementos HTML
    const relatoriosTableBody = document.getElementById('relatoriosTableBody');
    const relatoriosListMessage = document.getElementById('relatoriosListMessage'); // Agora refere-se ao p#relatoriosListMessage

    const logoutButton = document.getElementById('logoutButton');
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const appContainer = document.querySelector('.app-container');

    // Referências do formulário (ignoradas por enquanto, mas mantidas se o HTML for usado para criar)
    const formCriarRelatorioTecnico = document.getElementById('formCriarRelatorioTecnico');
    const relatorioTituloInput = document.getElementById('relatorioTitulo');
    const relatorioConteudoInput = document.getElementById('relatorioConteudo');


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
            console.log('Meus Relatórios - Role do Usuário logado:', userRole);

            // Verificar se o usuário é TÉCNICO ou ADMINISTRADOR
            if (userRole !== 'TECNICO' && userRole !== 'ADMINISTRADOR') { //
                alert('Acesso negado. Você não tem permissão para acessar esta página.');
                localStorage.removeItem('jwt_token');
                window.location.href = './login.html';
                return;
            }

        } catch (e) {
            console.error("Meus Relatórios - Erro ao decodificar JWT:", e);
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


    // --- Função para carregar e exibir Relatórios ---

    async function loadRelatoriosConcluidos() {
        relatoriosTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Carregando relatórios...</td></tr>';
        relatoriosListMessage.textContent = ''; // Limpa mensagens anteriores

        try {
            const response = await api.get('/relatorio'); // Pega todos os relatórios
            const allRelatorios = response.data;

            // Filtra apenas os relatórios vinculados a uma Ordem de Serviço CONCLUIDA
            const relatoriosConcluidos = allRelatorios.filter(relatorio =>
                relatorio.ordemServico && relatorio.ordemServico.status === 'CONCLUIDA' //
            );

            relatoriosTableBody.innerHTML = ''; // Limpa o conteúdo da tabela

            if (relatoriosConcluidos.length === 0) {
                relatoriosTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum relatório concluído encontrado.</td></tr>';
                return;
            }

            // LOOP ÚNICO para renderizar as linhas da tabela
            relatoriosConcluidos.forEach(relatorio => {
                const row = document.createElement('tr');
                const previewContent = relatorio.descricao.length > 50 ?
                                       relatorio.descricao.substring(0, 50) + '...' :
                                       relatorio.descricao;

                row.innerHTML = `
                    <td>${new Date(relatorio.createdAt).toLocaleDateString()}</td>
                    <td>${relatorio.titulo}</td>
                    <td>${previewContent}</td>
                    <td>${relatorio.ordemServico ? relatorio.ordemServico.id : 'N/A'}</td> <td><span class="status-tag status-${relatorio.ordemServico.status.toLowerCase()}">${relatorio.ordemServico.status}</span></td> <td>
                        <button class="action-btn view-report-details-btn" data-relatorio-id="${relatorio.id}">Ver Detalhes</button>
                    </td>
                `;
                relatoriosTableBody.appendChild(row);
            });

            // Adiciona event listeners para os botões "Ver Detalhes" do relatório (FORA DO LOOP)
            document.querySelectorAll('.view-report-details-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const relatorioId = event.target.dataset.relatorioId;
                    // REDIRECIONA PARA A NOVA PÁGINA DE DETALHES
                    window.location.href = `./detalheRelatorioTecnico.html?id=${relatorioId}`;
                });
            });

        } catch (error) {
            console.error(`Erro ao buscar relatórios:`, error);
            relatoriosListMessage.textContent = `Erro ao carregar relatórios.`;
            relatoriosListMessage.className = 'message error';
            relatoriosTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Erro ao carregar relatórios.</td></tr>';
        }
    }

    // Carregar relatórios ao iniciar a página
    await loadRelatoriosConcluidos();

    // --- Estilos para o Status na Tabela (pode ser global em componentes.css) ---
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
        .status-aberta { background-color: #ffc107; color: white; padding: 3px 6px; border-radius: 3px; }
        .status-concluida { background-color: #28a745; color: white; padding: 3px 6px; border-radius: 3px; }
    `;
    document.head.appendChild(styleTag);

    // --- Lógica para o formulário "Criar Novo Relatório" (ignorada por enquanto, como discutido) ---
    // Este formulário espera um `ordemServicoId` para criar um relatório, mas a tela não oferece essa opção.
    // Se precisar de relatórios avulsos, o backend precisaria de um novo endpoint /relatorio/criar
    if (formCriarRelatorioTecnico) { // Apenas executa se o elemento existir
        formCriarRelatorioTecnico.addEventListener('submit', (event) => {
            event.preventDefault();
            // Lembre-se: Para criar relatórios avulsos, a API precisaria de um endpoint diferente
            // ou este formulário precisaria de um campo para selecionar uma Ordem de Serviço existente e concluída.
            alert('A funcionalidade de "Salvar Relatório" ainda não está implementada para relatórios avulsos.');
        });
    }

});
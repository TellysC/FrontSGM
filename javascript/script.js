/* ==========================================================================
   MEU SCRIPT PRINCIPAL - SGM (Versão Corrigida)
   ==========================================================================
   Este ficheiro controla toda a parte inteligente e interativa do meu site.
   Ele é carregado em todas as páginas.
*/

// Garante que meu código só vai rodar depois que a página HTML carregar completamente.
document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------------------------
    // 1. DADOS GLOBAIS E CONSTANTES
    // --------------------------------------------------------------------------

    // A URL base da sua API. Altere a porta se o seu back-end estiver a correr noutra.
    const API_BASE_URL = 'http://localhost:8080';

    // Informações do utilizador logado, salvas no navegador.
    let loggedInUser = localStorage.getItem('loggedInUser') || 'usuarioteste@email.com';
    let userRole = localStorage.getItem('userRole') || '';

    // DADOS SIMULADOS (serão substituídos por chamadas de API no futuro)
    // Usamos o localStorage como um "banco de dados" temporário no navegador.
    let serviceOrders = JSON.parse(localStorage.getItem('serviceOrders')) || [];
    let technicianReports = JSON.parse(localStorage.getItem('technicianReports')) || [];


    // --------------------------------------------------------------------------
    // 2. FUNÇÕES GERAIS (Disponíveis em todas as páginas)
    // --------------------------------------------------------------------------

    /**
     * Mostra uma mensagem de feedback para o utilizador na tela.
     */
    function showMessage(elementId, text, type = 'success') {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = text;
            el.className = `message ${type}`;
            setTimeout(() => {
                el.textContent = '';
                el.className = 'message';
            }, 4000);
        }
    }

    /**
     * Configura o botão de Logout.
     */
    function setupLogoutButton() {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.clear(); // Limpa tudo ao fazer logout para segurança
                window.location.href = 'login.html';
            });
        }
    }

    /**
     * Configura o botão de Dark Mode.
     */
    function setupDarkModeToggle() {
        const darkModeSwitch = document.getElementById('darkModeSwitch');
        if (darkModeSwitch) {
            // Aplica o estado inicial ao carregar a página
            if (localStorage.getItem('darkMode') === 'enabled') {
                document.body.classList.add('dark-mode');
                darkModeSwitch.checked = true;
            }
            // Adiciona o evento de mudança
            darkModeSwitch.addEventListener('change', () => {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('darkMode', darkModeSwitch.checked ? 'enabled' : 'disabled');
            });
        }
    }

    /**
     * Configura o botão que esconde e mostra a sidebar.
     */
    function setupSidebarToggle() {
        const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
        const appContainer = document.querySelector('.app-container');
        if (sidebarToggleBtn && appContainer) {
            if (localStorage.getItem('sidebarState') === 'collapsed') {
                appContainer.classList.add('sidebar-collapsed');
            }
            sidebarToggleBtn.addEventListener('click', () => {
                appContainer.classList.toggle('sidebar-collapsed');
                const newState = appContainer.classList.contains('sidebar-collapsed') ? 'collapsed' : 'expanded';
                localStorage.setItem('sidebarState', newState);
            });
        }
    }

    /**
     * Destaca o link da página atual na sidebar para eu saber onde estou.
     */
    function highlightActiveNavLink() {
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (sidebarNav) {
            const currentPath = window.location.pathname.split("/").pop();
            sidebarNav.querySelectorAll('.nav-item').forEach(link => {
                const linkPath = link.getAttribute('href').replace('./', '');
                link.classList.toggle('active', linkPath === currentPath);
            });
        }
    }


    // --------------------------------------------------------------------------
    // 3. FUNÇÕES ESPECÍFICAS DE CADA PÁGINA
    // --------------------------------------------------------------------------
    /**
     * Prepara a página de Gerenciamento de Utilizadores (Cadastro de Funcionário).
     * ESTA FUNÇÃO AGORA ESTÁ 100% CONECTADA AO BACK-END.
     */
    async function iniciarPaginaAdminUsuarios() {
        const form = document.getElementById('formCadastroUsuario');
        const tabelaBody = document.querySelector('#tabelaUsuarios tbody');
        if (!form || !tabelaBody) return;

        // Função para buscar e desenhar a tabela de funcionários a partir do back-end
        async function renderTabela() {
            try {
                const response = await fetch(`${API_BASE_URL}/funcionario`);
                if (!response.ok) throw new Error('Erro ao buscar funcionários.');

                const funcionarios = await response.json();

                tabelaBody.innerHTML = '';
                funcionarios.forEach(func => {
                    const row = tabelaBody.insertRow();
                    row.insertCell().textContent = func.id;
                    row.insertCell().textContent = func.nome;
                    row.insertCell().textContent = func.cpf;
                    row.insertCell().textContent = func.cargo;
                    // O email está dentro do objeto 'usuario' aninhado
                    row.insertCell().textContent = func.usuario ? func.usuario.email : 'N/A';
                });

            } catch (error) {
                console.error("Falha ao renderizar tabela de funcionários:", error);
                showMessage('userMessage', 'Não foi possível carregar os funcionários.', 'error');
            }
        }

        // Evento de envio do formulário de cadastro
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const senha = document.getElementById('senhaUsuario').value;
            const confirmarSenha = document.getElementById('confirmarSenhaUsuario').value;
            if (senha !== confirmarSenha) {
                return showMessage('userMessage', 'As senhas não coincidem!', 'error');
            }

            // Monta o objeto complexo que a API /funcionario/criar espera
            const payload = {
                nome: document.getElementById('nomeCompleto').value,
                cpf: document.getElementById('cpf').value,
                cargo: document.querySelector('input[name="userRoleForm"]:checked').value,
                usuario: {
                    email: document.getElementById('emailUsuario').value,
                    senha: senha
                },
                contato: {
                    celular: document.getElementById('celular').value,
                    telefone: document.getElementById('telefone').value,
                    codigoDistanciaCreateDTO: {
                        numero: parseInt(document.getElementById('ddd').value) || 0,
                        estado: document.getElementById('estado').value // Usando o estado do endereço
                    }
                },
                endereco: {
                    cep: document.getElementById('cep').value,
                    logradouro: document.getElementById('logradouro').value,
                    numero: parseInt(document.getElementById('numero').value) || 0,
                    bairro: document.getElementById('bairro').value,
                    cidade: document.getElementById('cidade').value,
                    estado: document.getElementById('estado').value,
                    pais: document.getElementById('pais').value
                }
            };

            const submitButton = form.querySelector('button[type="submit"]');
            try {
                submitButton.textContent = 'Aguarde...';
                submitButton.disabled = true;

                // Envia os dados para a API usando fetch
                const response = await fetch(`${API_BASE_URL}/funcionario/criar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.status === 201) { // 201 Created
                    showMessage('userMessage', 'Funcionário cadastrado com sucesso!', 'success');
                    form.reset();
                    await renderTabela();
                } else {
                    const errorData = await response.json();
                    const errorMessage = errorData.message || 'Erro ao cadastrar funcionário.';
                    throw new Error(errorMessage);
                }

            } catch (error) {
                console.error("Falha ao criar funcionário:", error);
                showMessage('userMessage', `Erro: ${error.message}`, 'error');
            } finally {
                submitButton.textContent = 'Cadastrar Funcionário';
                submitButton.disabled = false;
            }
        });

        // Desenha a tabela assim que a página carrega
        await renderTabela();
    }

    /**
     * Prepara a página de Cadastro de Máquinas do Admin.
     * ESTA FUNÇÃO AGORA ESTÁ 100% CONECTADA AO BACK-END.
     */
    async function iniciarPaginaAdminCadastrarMaquinas() {
        const form = document.getElementById('formCadastrarEquipamento');
        const tabelaBody = document.querySelector('#tabelaEquipamentos tbody');
        if (!form || !tabelaBody) return;

        async function renderTabela() {
            try {
                const response = await fetch(`${API_BASE_URL}/equipamento`);
                if (!response.ok) throw new Error('Erro ao buscar equipamentos.');
                const equipamentos = await response.json();
                tabelaBody.innerHTML = '';
                equipamentos.forEach(equip => {
                    const row = tabelaBody.insertRow();
                    row.insertCell().textContent = equip.id;
                    row.insertCell().textContent = equip.nome;
                    row.insertCell().textContent = equip.descricao;

                    const actionsCell = row.insertCell();
                    const removeBtn = document.createElement('button');
                    removeBtn.textContent = 'Remover';
                    removeBtn.classList.add('action-btn', 'danger');
                    removeBtn.onclick = () => apagarEquipamento(equip.id, equip.nome);
                    actionsCell.appendChild(removeBtn);
                });
            } catch (error) {
                showMessage('equipamentoMessage', 'Falha ao carregar equipamentos.', 'error');
                console.error(error);
            }
        }

        async function apagarEquipamento(id, nome) {
            if (confirm(`Tem certeza que deseja apagar o equipamento "${nome}"?`)) {
                try {
                    const response = await fetch(`${API_BASE_URL}/equipamento/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Falha ao apagar.');
                    showMessage('equipamentoMessage', `Equipamento "${nome}" apagado.`, 'success');
                    await renderTabela();
                } catch (error) {
                    showMessage('equipamentoMessage', 'Erro ao apagar equipamento.', 'error');
                }
            }
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('nomeEquipamento').value,
                descricao: document.getElementById('modeloEquipamento').value,
            };
            const submitButton = form.querySelector('button[type="submit"]');
            try {
                submitButton.textContent = 'Aguarde...';
                submitButton.disabled = true;
                const response = await fetch(`${API_BASE_URL}/equipamento/criar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error('Erro ao criar equipamento.');
                showMessage('equipamentoMessage', 'Máquina cadastrada com sucesso!', 'success');
                form.reset();
                await renderTabela();
            } catch (error) {
                showMessage('equipamentoMessage', 'Erro ao cadastrar máquina.', 'error');
            } finally {
                submitButton.textContent = 'Cadastrar Máquina';
                submitButton.disabled = false;
            }
        });
        await renderTabela();
    }

    // --- O restante das funções de inicialização permanecem aqui ---
    function iniciarPaginaCliente() { /* Lógica futura */ }
    function iniciarPaginaTecnicoDashboard() { /* Lógica futura */ }
    function iniciarPaginaTecnicoOrdens() { /* Lógica futura */ }
    function iniciarPaginaTecnicoRelatorios() { /* Lógica futura */ }
    function iniciarPaginaAdminDashboard() { /* Lógica futura */ }
    function iniciarPaginaAdminInventario() { /* Lógica futura */ }
    function iniciarPaginaAdminRelatorios() { /* Lógica futura */ }


    // --------------------------------------------------------------------------
    // 4. O ROTEADOR - A "MÁGICA" COMEÇA AQUI
    // --------------------------------------------------------------------------

    function iniciarPaginaAtual() {
        // Primeiro, eu configuro as coisas que existem em quase todas as páginas.
        setupLogoutButton();
        setupDarkModeToggle();
        setupSidebarToggle();
        highlightActiveNavLink();

        const paginaAtual = window.location.pathname.split("/").pop();

        switch (paginaAtual) {
            case 'usuarios.html':
                iniciarPaginaAdminUsuarios(); // Conectada ao Back-end
                break;
            case 'admin_cadastrar_maquinas.html':
                iniciarPaginaAdminCadastrarMaquinas(); // Conectada ao Back-end
                break;
            case 'inventario.html':
                // Temporariamente, podemos fazer a listagem do inventário aqui também
                iniciarPaginaAdminCadastrarMaquinas(); // Reutiliza a função que lista
                break;
            // O resto continua a usar localStorage por enquanto...
            case 'cliente_criar_ordem.html':      iniciarPaginaCliente(); break;
            case 'tecnico_dashboard.html':        iniciarPaginaTecnicoDashboard(); break;
            case 'tecnico_ordens_servico.html':   iniciarPaginaTecnicoOrdens(); break;
            case 'tecnico_relatorios.html':       iniciarPaginaTecnicoRelatorios(); break;
            case 'admin_dashboard.html':          iniciarPaginaAdminDashboard(); break;
            case 'relatorios_admin.html':         iniciarPaginaAdminRelatorios(); break;
            default: console.log("Nenhuma lógica específica para:", paginaAtual);
        }
    }

    // Finalmente, eu chamo o roteador para começar tudo!
    iniciarPaginaAtual();

});

document.addEventListener('DOMContentLoaded', () => {
    // --- INICIALIZAÇÃO DE DADOS E ESTADO ---
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let materials = JSON.parse(localStorage.getItem('materials')) || []; // Usaremos para equipamentos também
    let containers = JSON.parse(localStorage.getItem('containers')) || [];
    let movementLog = JSON.parse(localStorage.getItem('movementLog')) || [];
    let serviceOrders = JSON.parse(localStorage.getItem('serviceOrders')) || [];
    let technicianReports = JSON.parse(localStorage.getItem('technicianReports')) || [];
    let loggedInUser = localStorage.getItem('loggedInUser') || 'Usuário Teste';
    let userRole = localStorage.getItem('userRole') || ''; // Pega a função do usuário

    // --- LÓGICA PARA TOGGLE DA SIDEBAR ---
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const appContainer = document.querySelector('.app-container');

    if (sidebarToggleBtn && appContainer) {
        if (localStorage.getItem('sidebarState') === 'collapsed') {
            appContainer.classList.add('sidebar-collapsed');
        }
        sidebarToggleBtn.addEventListener('click', () => {
            appContainer.classList.toggle('sidebar-collapsed');
            if (appContainer.classList.contains('sidebar-collapsed')) {
                localStorage.setItem('sidebarState', 'collapsed');
            } else {
                localStorage.setItem('sidebarState', 'expanded');
            }
        });
    }

    // --- DARK MODE ---
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    if (darkModeSwitch) {
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeSwitch.checked = true;
        }
        darkModeSwitch.addEventListener('change', () => {
            if (darkModeSwitch.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }

    // --- LOGOUT ---
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('userRole'); // Limpar a função também
            window.location.href = 'login.html';
        });
    }

    // Verifica se está logado (exceto na página de login)
    // e se a função é apropriada para a página (exemplo básico)
    if (!loggedInUser && !window.location.pathname.endsWith('login.html')) {
        // window.location.href = 'login.html';
    } else {
        const currentPageFile = window.location.pathname.split("/").pop();
        if (userRole === 'btnCliente' && !currentPageFile.startsWith('cliente_') && !currentPageFile.endsWith('login.html')) {
            // window.location.href = 'cliente_criar_ordem.html'; // Força para a página do cliente
        } else if (userRole === 'btnTecnico' && !currentPageFile.startsWith('tecnico_') && !currentPageFile.endsWith('login.html')) {
            // window.location.href = 'tecnico_dashboard.html'; // Força para a página do técnico
        } else if (userRole === 'btnAdmin' && !currentPageFile.startsWith('admin_') &&
            !['usuarios.html', 'inventario.html', 'relatorios.html', 'adicionar-materiais.html', 'conteineres.html', 'dashboard.html'].includes(currentPageFile) &&
            !currentPageFile.endsWith('login.html') ) {
            // window.location.href = 'admin_dashboard.html'; // Força para a página do admin
        }
    }


    // --- FUNÇÕES AUXILIARES ---
    function saveData() {
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('materials', JSON.stringify(materials)); // Equipamentos/Máquinas
        localStorage.setItem('containers', JSON.stringify(containers));
        localStorage.setItem('movementLog', JSON.stringify(movementLog));
        localStorage.setItem('serviceOrders', JSON.stringify(serviceOrders));
        localStorage.setItem('technicianReports', JSON.stringify(technicianReports));
    }

    function logAction(action, entityType, entityName, details = '', quantity = null) {
        const logEntry = {
            date: new Date().toISOString(),
            user: loggedInUser, // Idealmente, o email ou ID do usuário logado
            sector: userRole, // Poderia ser mais específico se necessário
            action: action,
            entityType: entityType,
            entityName: entityName,
            details: details,
            quantity: quantity
        };
        movementLog.unshift(logEntry);
        saveData();
        // Atualiza a tabela de relatórios se estiver na página correta e a função existir
        if (typeof renderRelatoriosTable === "function" && document.getElementById('tabelaRelatorios')) {
            renderRelatoriosTable();
        }
    }

    function showMessage(elementId, text, type = 'success', duration = 3000) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = text;
            el.className = `message ${type}`;
            setTimeout(() => {
                el.textContent = '';
                el.className = 'message';
            }, duration);
        }
    }

    // --- NAVEGAÇÃO ATIVA NA SIDEBAR (para páginas com sidebar) ---
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        const currentPath = window.location.pathname.split("/").pop();
        if (currentPath) {
            const activeNavItem = sidebarNav.querySelector(`a[href="${currentPath}"]`);
            if (activeNavItem) {
                // Remove 'active' de todos os itens primeiro
                sidebarNav.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
                // Adiciona 'active' ao item correto
                activeNavItem.classList.add('active');
            } else {
                // Fallback para dashboards principais se a URL for a raiz do dashboard da role
                if (currentPath === 'admin_dashboard.html' || (userRole === 'btnAdmin' && currentPath === 'dashboard.html')) {
                    sidebarNav.querySelector(`a[href$="dashboard.html"], a[href$="admin_dashboard_main.html"], a[href$="admin_dashboard.html"]`)?.classList.add('active');
                } else if (currentPath === 'tecnico_dashboard.html' || currentPath === 'tecnico_dashboard_main.html') {
                    sidebarNav.querySelector(`a[href$="tecnico_dashboard_main.html"], a[href$="tecnico_dashboard.html"]`)?.classList.add('active');
                }
                // Clientes não têm sidebar neste modelo
            }
        }
    }

    // --- LÓGICA ESPECÍFICA DE CADA PÁGINA ---

    // PÁGINA: CLIENTE - CRIAR ORDEM (cliente_criar_ordem.html)
    const formCriarOrdem = document.getElementById('formCriarOrdem');
    if (formCriarOrdem) {
        formCriarOrdem.addEventListener('submit', function(e) {
            e.preventDefault();
            const descricao = document.getElementById('ordemDescricao').value;
            const equipamento = document.getElementById('ordemEquipamento').value;
            const local = document.getElementById('ordemLocal').value;

            if (!descricao) {
                showMessage('ordemMessage', 'Por favor, descreva o problema.', 'error');
                return;
            }
            const newOrder = {
                id: Date.now(),
                clientId: loggedInUser,
                clientName: loggedInUser.split('@')[0],
                descricao: descricao,
                equipamento: equipamento,
                local: local,
                status: 'Aberta',
                dataCriacao: new Date().toISOString(),
                tecnicoAtribuido: null,
                dataConclusao: null,
                notasTecnico: ''
            };
            serviceOrders.push(newOrder);
            saveData();
            logAction('Criação de OS', 'Ordem de Serviço', `ID: ${newOrder.id}`, `Cliente: ${newOrder.clientId}, Local: ${local}`);
            showMessage('ordemMessage', 'Ordem de serviço criada com sucesso!', 'success');
            formCriarOrdem.reset();
        });
    }

    // PÁGINA: DASHBOARD TÉCNICO (tecnico_dashboard.html ou tecnico_dashboard_main.html)
    if (document.getElementById('tecnicoDashboardContent') || window.location.pathname.includes('tecnico_dashboard')) {
        const countOrdensAbertasTecnico = document.getElementById('count-ordens-abertas-tecnico');
        const countOrdensConcluidasTecnico = document.getElementById('count-ordens-concluidas-tecnico');

        if (countOrdensAbertasTecnico) {
            countOrdensAbertasTecnico.textContent = serviceOrders.filter(order => order.status === 'Aberta' || order.status === 'Em Andamento').length;
        }
        if (countOrdensConcluidasTecnico) {
            const hoje = new Date().toISOString().slice(0,10);
            countOrdensConcluidasTecnico.textContent = serviceOrders.filter(order => order.status === 'Concluída' && order.dataConclusao?.slice(0,10) === hoje).length;
        }
    }

    // PÁGINA: ORDENS DE SERVIÇO TÉCNICO (tecnico_ordens_servico.html)
    const tabelaOrdensServicoTecnicoBody = document.querySelector('#tabelaOrdensServicoTecnico tbody');
    if (tabelaOrdensServicoTecnicoBody) {
        function renderOrdensServicoTecnicoTable() {
            tabelaOrdensServicoTecnicoBody.innerHTML = '';
            // Idealmente, filtrar ordens não concluídas ou atribuídas ao técnico
            const ordensParaTecnico = serviceOrders.filter(order => order.status !== 'Concluída' && order.status !== 'Cancelada');

            ordensParaTecnico.forEach(order => {
                const row = tabelaOrdensServicoTecnicoBody.insertRow();
                row.insertCell().textContent = new Date(order.dataCriacao).toLocaleDateString('pt-BR');
                row.insertCell().textContent = order.id;
                row.insertCell().textContent = order.clientName || order.clientId;
                row.insertCell().textContent = order.descricao;
                row.insertCell().textContent = order.equipamento || '-';
                row.insertCell().textContent = order.local || '-';
                row.insertCell().textContent = order.status;

                const actionsCell = row.insertCell();
                if (order.status === 'Aberta' || order.status === 'Em Andamento') {
                    const btnFinalizar = document.createElement('button');
                    btnFinalizar.textContent = 'Finalizar';
                    btnFinalizar.classList.add('action-btn'); // Adicione uma classe para estilização se necessário
                    btnFinalizar.onclick = () => finalizarOrdem(order.id);
                    actionsCell.appendChild(btnFinalizar);
                } else {
                    actionsCell.textContent = '-';
                }
            });
        }

        function finalizarOrdem(orderId) {
            const notas = prompt("Adicionar notas de conclusão para a ordem " + orderId + ":");
            const order = serviceOrders.find(o => o.id === orderId);
            if (order) {
                order.status = 'Concluída';
                order.dataConclusao = new Date().toISOString();
                order.notasTecnico = notas || 'Serviço concluído.';
                order.tecnicoAtribuido = loggedInUser; // Atribui o técnico que finalizou
                saveData();
                logAction('Finalização de OS', 'Ordem de Serviço', `ID: ${order.id}`, `Técnico: ${loggedInUser}, Notas: ${order.notasTecnico}`);
                renderOrdensServicoTecnicoTable(); // Re-renderiza a tabela
                showMessage('ordensTecnicoMessage', `Ordem ${orderId} finalizada com sucesso!`, 'success'); // Supondo que existe um <p id="ordensTecnicoMessage"></p>
            }
        }
        renderOrdensServicoTecnicoTable();
    }

    // PÁGINA: RELATÓRIOS TÉCNICO (tecnico_relatorios.html)
    const formCriarRelatorioTecnico = document.getElementById('formCriarRelatorioTecnico');
    const tabelaRelatoriosTecnicoBody = document.querySelector('#tabelaRelatoriosTecnico tbody');
    if (formCriarRelatorioTecnico || tabelaRelatoriosTecnicoBody) {
        function renderRelatoriosTecnicoTable() {
            if (!tabelaRelatoriosTecnicoBody) return;
            tabelaRelatoriosTecnicoBody.innerHTML = '';
            const meusRelatorios = technicianReports.filter(report => report.technicianId === loggedInUser);

            meusRelatorios.forEach(report => {
                const row = tabelaRelatoriosTecnicoBody.insertRow();
                row.insertCell().textContent = new Date(report.creationDate).toLocaleDateString('pt-BR');
                row.insertCell().textContent = report.title;
                // row.insertCell().textContent = report.content.substring(0, 50) + (report.content.length > 50 ? '...' : ''); // Preview
                const contentCell = row.insertCell(); // Para formatar o conteúdo
                const pre = document.createElement('pre'); // Mantém a formatação do texto
                pre.style.whiteSpace = 'pre-wrap'; // Quebra de linha
                pre.style.wordBreak = 'break-word'; // Quebra de palavra
                pre.textContent = report.content;
                contentCell.appendChild(pre);


                const actionsCell = row.insertCell();
                const btnApagar = document.createElement('button');
                btnApagar.textContent = 'Apagar';
                btnApagar.classList.add('action-btn', 'danger');
                btnApagar.onclick = () => apagarRelatorioTecnico(report.id);
                actionsCell.appendChild(btnApagar);
            });
        }

        function apagarRelatorioTecnico(reportId) {
            if (confirm('Tem certeza que deseja apagar este relatório?')) {
                technicianReports = technicianReports.filter(report => report.id !== reportId);
                saveData();
                logAction('Exclusão de Relatório', 'Relatório Técnico', `ID: ${reportId}`, `Técnico: ${loggedInUser}`);
                renderRelatoriosTecnicoTable();
                showMessage('relatoriosTecnicoMessage', 'Relatório apagado com sucesso.', 'success'); // Supondo <p id="relatoriosTecnicoMessage">
            }
        }

        if (formCriarRelatorioTecnico) {
            formCriarRelatorioTecnico.addEventListener('submit', function(e) {
                e.preventDefault();
                const title = document.getElementById('relatorioTitulo').value;
                const content = document.getElementById('relatorioConteudo').value;
                if (!title || !content) {
                    showMessage('relatoriosTecnicoMessage', 'Título e conteúdo são obrigatórios.', 'error');
                    return;
                }
                const newReport = {
                    id: Date.now(),
                    technicianId: loggedInUser,
                    title: title,
                    content: content,
                    creationDate: new Date().toISOString()
                };
                technicianReports.push(newReport);
                saveData();
                logAction('Criação de Relatório', 'Relatório Técnico', `Título: ${title}`, `Técnico: ${loggedInUser}`);
                renderRelatoriosTecnicoTable();
                formCriarRelatorioTecnico.reset();
                showMessage('relatoriosTecnicoMessage', 'Relatório criado com sucesso!', 'success');
            });
        }
        if (tabelaRelatoriosTecnicoBody) { // Renderiza se a tabela existir
            renderRelatoriosTecnicoTable();
        }
    }


    // PÁGINA: ADMIN DASHBOARD (admin_dashboard.html ou o antigo dashboard.html)
    // Os IDs 'count-containers', 'count-materials', 'count-users' são usados aqui
    if (document.getElementById('count-containers') && (userRole === 'btnAdmin' || window.location.pathname.includes('admin_dashboard') || window.location.pathname.includes('dashboard.html'))) {
        document.getElementById('count-containers').textContent = containers.length;
        // 'materials' pode ser usado para 'equipamentos/maquinas'
        document.getElementById('count-materials').textContent = materials.length; // ou materials.reduce(...) se 'quantity' for relevante
        document.getElementById('count-users').textContent = users.length;
    }

    // PÁGINA: USUÁRIOS (usuarios.html - Admin)
    const formCadastroUsuario = document.getElementById('formCadastroUsuario');
    const tabelaUsuariosBody = document.querySelector('#tabelaUsuarios tbody');

    function renderUsuariosTable() {
        if (!tabelaUsuariosBody) return;
        tabelaUsuariosBody.innerHTML = '';
        users.forEach(user => {
            const row = tabelaUsuariosBody.insertRow();
            row.insertCell().textContent = user.id;
            row.insertCell().textContent = user.nomeCompleto;
            row.insertCell().textContent = user.email;
            row.insertCell().textContent = user.nomeDeUsuario;
            row.insertCell().textContent = user.setor;
            // Ações como editar/remover usuário poderiam ser adicionadas aqui
        });
    }

    if (formCadastroUsuario) {
        formCadastroUsuario.addEventListener('submit', (e) => {
            e.preventDefault();
            const nomeCompleto = document.getElementById('nomeCompleto').value;
            const email = document.getElementById('emailUsuario').value;
            const nomeDeUsuario = document.getElementById('nomeDeUsuario').value;
            const senha = document.getElementById('senhaUsuario').value; // Em produção, senhas não são guardadas assim!
            const confirmarSenha = document.getElementById('confirmarSenhaUsuario').value;
            const setor = document.getElementById('setorUsuario').value;

            if (senha !== confirmarSenha) {
                showMessage('userMessage', 'As senhas não coincidem!', 'error');
                return;
            }
            if (users.find(u => u.nomeDeUsuario === nomeDeUsuario || u.email === email)) {
                showMessage('userMessage', 'Nome de usuário ou email já cadastrado!', 'error');
                return;
            }
            const newUser = {
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                nomeCompleto, email, nomeDeUsuario, senha, setor
            };
            users.push(newUser);
            logAction('Cadastro', 'Usuário', nomeDeUsuario, `Nome: ${nomeCompleto}`);
            saveData();
            showMessage('userMessage', 'Usuário cadastrado com sucesso!');
            formCadastroUsuario.reset();
            renderUsuariosTable();
            if (document.getElementById('count-users')) { // Atualiza contador no dashboard do admin
                document.getElementById('count-users').textContent = users.length;
            }
        });
        renderUsuariosTable();
    }

    // PÁGINA: CADASTRAR MÁQUINAS/EQUIPAMENTOS (admin_cadastrar_equipamento.html ou o antigo adicionar-materiais.html)
    // Renomeie os IDs no HTML se estiver usando uma nova página, ou adapte os IDs aqui
    const formCadastrarEquipamento = document.getElementById('formAdicionarMaterial') || document.getElementById('formCadastrarEquipamento');
    const tabelaEquipamentosBody = document.querySelector('#tabelaMateriaisAdicionados tbody') || document.querySelector('#tabelaEquipamentos tbody'); // Adapte o ID da tabela
    // Se usar select de container para equipamento:
    const selectContainerEquipamento = document.getElementById('containerMaterial') || document.getElementById('containerEquipamento');


    function populateContainerSelect(selectElement) { // Função genérica para popular select de containers
        if (!selectElement) return;
        const currentValue = selectElement.value; // Salva valor atual se houver
        selectElement.innerHTML = '<option value="">Selecione um Contêiner (Opcional)</option>';
        containers.forEach(cont => {
            const option = document.createElement('option');
            option.value = cont.tag;
            option.textContent = `${cont.tag} (${cont.descricao || 'Sem descrição'})`;
            selectElement.appendChild(option);
        });
        if(currentValue) selectElement.value = currentValue; // Restaura valor
    }


    function renderEquipamentosTable() { // 'materials' é usado como 'equipamentos'
        if (!tabelaEquipamentosBody) return;
        tabelaEquipamentosBody.innerHTML = '';
        materials.forEach(equip => {
            const row = tabelaEquipamentosBody.insertRow();
            // Adapte as colunas conforme os dados do equipamento
            row.insertCell().textContent = equip.id;
            row.insertCell().textContent = equip.item; // Nome da Máquina/Equipamento
            row.insertCell().textContent = equip.descricao; // Modelo/Detalhes
            row.insertCell().textContent = equip.container || '-'; // Se aplicável
            row.insertCell().textContent = equip.quantity || 1; // Quantidade, se relevante, ou N/S
            row.insertCell().textContent = equip.observacao || '-';
            // Adicionar botão de remover equipamento
            const actionsCell = row.insertCell();
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remover';
            removeBtn.classList.add('action-btn', 'danger');
            removeBtn.onclick = () => {
                if (confirm(`Tem certeza que deseja remover o equipamento ${equip.item}?`)) {
                    materials = materials.filter(m => m.id !== equip.id);
                    logAction('Remoção', 'Equipamento', equip.item, `ID: ${equip.id}`);
                    saveData();
                    renderEquipamentosTable();
                    if (document.getElementById('count-materials')) {
                        document.getElementById('count-materials').textContent = materials.length;
                    }
                }
            };
            actionsCell.appendChild(removeBtn);
        });
    }

    if (formCadastrarEquipamento) {
        if (selectContainerEquipamento) populateContainerSelect(selectContainerEquipamento);
        renderEquipamentosTable();

        formCadastrarEquipamento.addEventListener('submit', (e) => {
            e.preventDefault();
            // Adapte os IDs dos campos do formulário para equipamento
            const nomeEquipamento = document.getElementById('itemMaterial').value; // ou 'nomeEquipamento'
            const descricaoEquipamento = document.getElementById('descricaoMaterial').value; // ou 'descricaoEquipamento'
            const containerTag = selectContainerEquipamento ? selectContainerEquipamento.value : '';
            // const numeroSerie = document.getElementById('numeroSerieEquipamento').value; // Exemplo
            const observacaoEquipamento = document.getElementById('observacaoMaterial').value; // ou 'observacaoEquipamento'
            const quantidade = 1; // Ou um campo de quantidade se for relevante

            const newEquip = {
                id: materials.length > 0 ? Math.max(...materials.map(m => m.id)) + 1 : 1,
                item: nomeEquipamento,
                descricao: descricaoEquipamento,
                container: containerTag,
                quantity: quantidade, // Equipamentos geralmente são únicos, mas pode variar
                // numeroSerie: numeroSerie, // Exemplo
                observacao: observacaoEquipamento
            };
            materials.push(newEquip);
            logAction('Cadastro', 'Equipamento', nomeEquipamento, `Descrição: ${descricaoEquipamento}`);
            saveData();
            showMessage('materialMessage', 'Equipamento cadastrado com sucesso!', 'success'); // ou 'equipamentoMessage'
            formCadastrarEquipamento.reset();
            if (selectContainerEquipamento) populateContainerSelect(selectContainerEquipamento);
            renderEquipamentosTable();
            if (document.getElementById('count-materials')) { // Atualiza contador no dashboard do admin
                document.getElementById('count-materials').textContent = materials.length;
            }
        });
    }

    // PÁGINA: CONTÊINERES (conteineres.html - Admin)
    const formCadastroContainer = document.getElementById('formCadastroContainer');
    const tabelaContainersBody = document.querySelector('#tabelaContainers tbody');

    function renderContainersTable() {
        if (!tabelaContainersBody) return;
        tabelaContainersBody.innerHTML = '';
        containers.forEach(cont => {
            const row = tabelaContainersBody.insertRow();
            row.insertCell().textContent = cont.id;
            row.insertCell().textContent = cont.tag;
            row.insertCell().textContent = cont.setor;
            row.insertCell().textContent = cont.descricao;
            const actionsCell = row.insertCell();
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remover';
            removeBtn.classList.add('action-btn', 'danger');
            removeBtn.onclick = () => {
                if (confirm(`Tem certeza que deseja remover o contêiner ${cont.tag}? Equipamentos associados não serão removidos automaticamente neste protótipo.`)) {
                    containers = containers.filter(c => c.id !== cont.id);
                    logAction('Remoção', 'Contêiner', cont.tag, `ID: ${cont.id}`);
                    saveData();
                    renderContainersTable();
                    if (document.getElementById('count-containers')) {
                        document.getElementById('count-containers').textContent = containers.length;
                    }
                }
            };
            actionsCell.appendChild(removeBtn);
        });
    }

    if (formCadastroContainer) {
        formCadastroContainer.addEventListener('submit', (e) => {
            e.preventDefault();
            const tag = document.getElementById('tagContainer').value;
            const setor = document.getElementById('setorContainer').value;
            const descricao = document.getElementById('descricaoContainer').value;
            if (containers.find(c => c.tag === tag)) {
                showMessage('containerMessage', 'Tag de contêiner já existe!', 'error');
                return;
            }
            const newContainer = {
                id: containers.length > 0 ? Math.max(...containers.map(c => c.id)) + 1 : 1,
                tag, setor, descricao
            };
            containers.push(newContainer);
            logAction('Cadastro', 'Contêiner', tag, `Descrição: ${descricao}`);
            saveData();
            showMessage('containerMessage', 'Contêiner cadastrado com sucesso!');
            formCadastroContainer.reset();
            renderContainersTable();
            if (document.getElementById('count-containers')) {
                document.getElementById('count-containers').textContent = containers.length;
            }
        });
        renderContainersTable();
    }


    // PÁGINA: INVENTÁRIO (inventario.html - Admin)
    // 'materials' é usado como 'equipamentos/maquinas' aqui
    const formFiltrarInventario = document.getElementById('formFiltrarMateriais') || document.getElementById('formFiltrarInventario');
    const tabelaInventarioBody = document.querySelector('#tabelaInventario tbody');
    const selectFiltroContainerInventario = document.getElementById('filtroContainer') || document.getElementById('filtroContainerInventario');
    const btnRemoverSelecionadosInventario = document.getElementById('btnRemoverSelecionados'); // Mantenha se o ID for o mesmo

    function renderInventarioTable(filteredItems = materials) { // 'materials' representa o inventário
        if (!tabelaInventarioBody) return;
        tabelaInventarioBody.innerHTML = '';
        filteredItems.forEach(item => {
            const row = tabelaInventarioBody.insertRow();
            const selectCell = row.insertCell();
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = item.id;
            selectCell.appendChild(checkbox);

            row.insertCell().textContent = item.item; // Nome do Equipamento/Máquina
            row.insertCell().textContent = item.descricao; // Modelo/Detalhes
            row.insertCell().textContent = item.container || '-';
            row.insertCell().textContent = item.quantity || 1; // Quantidade
            row.insertCell().textContent = item.observacao || '-';
        });
    }

    if (formFiltrarInventario) {
        if(selectFiltroContainerInventario) populateContainerSelect(selectFiltroContainerInventario);
        renderInventarioTable();

        formFiltrarInventario.addEventListener('submit', (e) => {
            e.preventDefault();
            const filtroItem = (document.getElementById('filtroItem') || document.getElementById('filtroNomeEquipamento')).value.toLowerCase();
            const filtroContainer = selectFiltroContainerInventario ? selectFiltroContainerInventario.value : '';
            const filtroDescricao = (document.getElementById('filtroDescricao') || document.getElementById('filtroModeloEquipamento')).value.toLowerCase();

            const filtered = materials.filter(item => {
                const itemMatch = !filtroItem || item.item.toLowerCase().includes(filtroItem);
                const containerMatch = !filtroContainer || item.container === filtroContainer;
                const descricaoMatch = !filtroDescricao || item.descricao.toLowerCase().includes(filtroDescricao);
                return itemMatch && containerMatch && descricaoMatch;
            });
            renderInventarioTable(filtered);
        });
        (document.getElementById('btnLimparFiltro') || document.getElementById('btnLimparFiltroInventario'))?.addEventListener('click', () => {
            formFiltrarInventario.reset();
            renderInventarioTable();
        });
    }
    if (btnRemoverSelecionadosInventario) {
        btnRemoverSelecionadosInventario.addEventListener('click', () => {
            const checkboxes = tabelaInventarioBody.querySelectorAll('input[type="checkbox"]:checked');
            if (checkboxes.length === 0) {
                alert('Nenhum item selecionado para remoção.');
                return;
            }
            if (confirm(`Tem certeza que deseja remover ${checkboxes.length} item(ns) selecionado(s)?`)) {
                const idsToRemove = Array.from(checkboxes).map(cb => parseInt(cb.value));
                idsToRemove.forEach(id => {
                    const itemToRemove = materials.find(m => m.id === id);
                    if (itemToRemove) {
                        logAction('Remoção', 'Inventário/Equipamento', itemToRemove.item, `ID: ${itemToRemove.id}`);
                    }
                });
                materials = materials.filter(item => !idsToRemove.includes(item.id));
                saveData();
                renderInventarioTable(); // Re-renderiza com os filtros atuais ou todos
                if (document.getElementById('count-materials')) {
                    document.getElementById('count-materials').textContent = materials.length;
                }
                alert(`${checkboxes.length} item(ns) "removido(s)".`);
            }
        });
    }


    // PÁGINA: RELATÓRIOS (relatorios.html - Admin, pode ser adaptado para Técnico também)
    const tabelaRelatoriosBody = document.querySelector('#tabelaRelatorios tbody'); // Tabela principal de logs de movimento
    const formFiltrarLogs = document.getElementById('formFiltrarLogs'); // Filtro para logs de movimento

    function renderRelatoriosTable(filteredLogs = movementLog) { // Para logs de movimento
        if (!tabelaRelatoriosBody) return;
        tabelaRelatoriosBody.innerHTML = '';
        filteredLogs.forEach(log => {
            const row = tabelaRelatoriosBody.insertRow();
            row.insertCell().textContent = new Date(log.date).toLocaleString('pt-BR');
            row.insertCell().textContent = log.user; // Quem fez a ação
            row.insertCell().textContent = log.sector; // Função/Setor
            row.insertCell().textContent = log.action; // Ação (Cadastro, Remoção, etc.)
            row.insertCell().textContent = `${log.entityType}: ${log.entityName}`; // Tipo e Nome da Entidade
            row.insertCell().textContent = log.details; // Detalhes adicionais
            row.insertCell().textContent = log.quantity !== null ? log.quantity : '-'; // Quantidade, se aplicável
        });
    }

    if (formFiltrarLogs) { // Se o formulário de filtro de logs de movimento existir
        renderRelatoriosTable();
        formFiltrarLogs.addEventListener('submit', (e) => {
            e.preventDefault();
            const dataInicio = document.getElementById('filtroDataInicio').value;
            const dataFim = document.getElementById('filtroDataFim').value;
            let dateInicioObj = dataInicio ? new Date(dataInicio) : null;
            let dateFimObj = dataFim ? new Date(dataFim) : null;
            if(dateInicioObj) dateInicioObj.setHours(0,0,0,0);
            if(dateFimObj) dateFimObj.setHours(23,59,59,999);

            const filtered = movementLog.filter(log => {
                const logDate = new Date(log.date);
                const inicioMatch = !dateInicioObj || logDate >= dateInicioObj;
                const fimMatch = !dateFimObj || logDate <= dateFimObj;
                return inicioMatch && fimMatch;
            });
            renderRelatoriosTable(filtered);
        });
        document.getElementById('btnLimparFiltroLogs')?.addEventListener('click', () => {
            formFiltrarLogs.reset();
            renderRelatoriosTable();
        });
    }

    // Adicional: Se houver uma seção na página de relatórios do Admin para ver relatórios de técnicos
    const tabelaRelatoriosTecnicosAdminViewBody = document.querySelector('#tabelaRelatoriosTecnicosAdminView tbody');
    if (tabelaRelatoriosTecnicosAdminViewBody) {
        function renderAllTechnicianReports() {
            tabelaRelatoriosTecnicosAdminViewBody.innerHTML = '';
            technicianReports.forEach(report => {
                const row = tabelaRelatoriosTecnicosAdminViewBody.insertRow();
                row.insertCell().textContent = new Date(report.creationDate).toLocaleDateString('pt-BR');
                row.insertCell().textContent = report.technicianId; // Email do técnico
                row.insertCell().textContent = report.title;
                const contentCell = row.insertCell();
                const pre = document.createElement('pre');
                pre.style.whiteSpace = 'pre-wrap';
                pre.style.wordBreak = 'break-word';
                pre.textContent = report.content;
                contentCell.appendChild(pre);
                // Admin poderia ter opção de apagar qualquer relatório de técnico
            });
        }
        renderAllTechnicianReports();
    }

});
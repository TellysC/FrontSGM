

document.addEventListener('DOMContentLoaded', () => {

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let materials = JSON.parse(localStorage.getItem('materials')) || [];
    let containers = JSON.parse(localStorage.getItem('containers')) || [];
    let movementLog = JSON.parse(localStorage.getItem('movementLog')) || [];
    let serviceOrders = JSON.parse(localStorage.getItem('serviceOrders')) || [];
    let technicianReports = JSON.parse(localStorage.getItem('technicianReports')) || [];

    let loggedInUser = localStorage.getItem('loggedInUser') || 'usuarioteste@email.com';
    let userRole = localStorage.getItem('userRole') || '';


    function saveData() {
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('materials', JSON.stringify(materials));
        localStorage.setItem('containers', JSON.stringify(containers));
        localStorage.setItem('movementLog', JSON.stringify(movementLog));
        localStorage.setItem('serviceOrders', JSON.stringify(serviceOrders));
        localStorage.setItem('technicianReports', JSON.stringify(technicianReports));
    }

    function logAction(action, entityType, entityName, details = '') {
        const logEntry = {
            date: new Date().toISOString(),
            user: loggedInUser,
            sector: userRole.replace('btn', ''),
            action, entityType, entityName, details
        };
        movementLog.unshift(logEntry);
        saveData();
    }

    function showMessage(elementId, text, type = 'success') {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = text;
            el.className = `message ${type}`;
            setTimeout(() => {
                el.textContent = '';
                el.className = 'message';
            }, 3000);
        }
    }

    function setupLogoutButton() {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('userRole');
                window.location.href = 'login.html';
            });
        }
    }

    function setupDarkModeToggle() {
        const darkModeSwitch = document.getElementById('darkModeSwitch');
        if (darkModeSwitch) {
            if (localStorage.getItem('darkMode') === 'enabled') {
                document.body.classList.add('dark-mode');
                darkModeSwitch.checked = true;
            }
            darkModeSwitch.addEventListener('change', () => {
                document.body.classList.toggle('dark-mode');
                localStorage.setItem('darkMode', darkModeSwitch.checked ? 'enabled' : 'disabled');
            });
        }
    }

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


    function iniciarPaginaCliente() {
    }
    function iniciarPaginaTecnicoDashboard() {
    }
    function iniciarPaginaTecnicoOrdens() {
    }
    function iniciarPaginaTecnicoRelatorios() {
    }
    function iniciarPaginaAdminDashboard() {
    }
    function iniciarPaginaAdminUsuarios() {
    }
    function iniciarPaginaAdminCadastrarMaquinas() {
    }
    function iniciarPaginaAdminInventario() {
    }
    function iniciarPaginaAdminRelatorios() {
        const tabelaLogsBody = document.querySelector('#tabelaRelatorios tbody');
        const tabelaTecnicosBody = document.querySelector('#tabelaRelatoriosTecnicosAdminView tbody');
        const btnApagarLogs = document.getElementById('btnApagarLogs'); // Seleciona o botão de apagar

        // ---- LÓGICA CORRIGIDA PARA O BOTÃO ----
        if (btnApagarLogs) {
            btnApagarLogs.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja apagar permanentemente TODOS os logs de movimentação?')) {
                    movementLog = []; // Esvazia o array de logs
                    saveData();       // Salva a alteração (agora o array vazio)
                    renderLogs();     // Re-desenha a tabela, que agora ficará vazia
                    alert('Todos os logs de movimentação foram apagados.');
                }
            });
        }
        // ---- FIM DA LÓGICA DO BOTÃO ----
        function renderLogs(logs = movementLog) {
            if (!tabelaLogsBody) return;
            tabelaLogsBody.innerHTML = '';
            logs.forEach(log => {
                const row = tabelaLogsBody.insertRow();
                row.insertCell().textContent = new Date(log.date).toLocaleString('pt-BR');
                row.insertCell().textContent = log.user;
                row.insertCell().textContent = log.sector;
                row.insertCell().textContent = log.action;
                row.insertCell().textContent = `${log.entityType}: ${log.entityName}`;
                row.insertCell().textContent = log.details;
            });
        }

        if (tabelaTecnicosBody) {
            function renderRelatoriosTecnicos() {
                tabelaTecnicosBody.innerHTML = '';
                technicianReports.forEach(report => {
                    const row = tabelaTecnicosBody.insertRow();
                    row.insertCell().textContent = new Date(report.creationDate).toLocaleDateString('pt-BR');
                    row.insertCell().textContent = report.technicianId;
                    row.insertCell().textContent = report.title;
                });
            }
            renderRelatoriosTecnicos();
        }
        const formFiltrar = document.getElementById('formFiltrarLogs');
        if(formFiltrar) {
            formFiltrar.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }
        renderLogs();
    }
    function iniciarPaginaAtual() {
        setupLogoutButton();
        setupDarkModeToggle();
        setupSidebarToggle();
        highlightActiveNavLink();

        const paginaAtual = window.location.pathname.split("/").pop();

        switch (paginaAtual) {
            case 'cliente_criar_ordem.html':      iniciarPaginaCliente(); break;
            case 'tecnico_dashboard.html':        iniciarPaginaTecnicoDashboard(); break;
            case 'tecnico_ordens_servico.html':   iniciarPaginaTecnicoOrdens(); break;
            case 'tecnico_relatorios.html':       iniciarPaginaTecnicoRelatorios(); break;
            case 'admin_dashboard.html':          iniciarPaginaAdminDashboard(); break;
            case 'usuarios.html':                 iniciarPaginaAdminUsuarios(); break;
            case 'admin_cadastrar_maquinas.html': iniciarPaginaAdminCadastrarMaquinas(); break;
            case 'inventario.html':               iniciarPaginaAdminInventario(); break;
            case 'relatorios_admin.html':         iniciarPaginaAdminRelatorios(); break;
            default: console.log("Nenhuma lógica específica para:", paginaAtual);
        }
    }
    iniciarPaginaAtual();
});

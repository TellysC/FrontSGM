// javascript/main.js

console.log("Arquivo main.js LIDO pelo navegador.");

// 1. IMPORTAR AS FUNÇÕES
import { setupDarkModeToggle } from "./UI/theme.js";
import { setupSidebarToggle, highlightActiveNavLink } from "./UI/sidebar.js";
import { setupLogout } from "./auth.js";

// 2. MAPA DE SCRIPTS
const pageScriptMap = {
  login: "./pages/login.js",
  admin_dashboard: "./pages/admin_dashboard.js",
  usuarios: "./pages/usuarios.js",
  admin_cadastrar_maquinas: "./pages/admin_maquinas.js",
  inventario: "./pages/inventario.js",
  relatorios_admin: "./pages/relatorios_admin.js",
  tecnico_dashboard: "./pages/tecnico_dashboard.js",
  tecnico_ordens_servico: "./pages/tecnico_ordens.js",
  tecnico_relatorios: "./pages/tecnico_relatorios.js",
  cliente_criar_ordem: "./pages/cliente_criar_ordem.js",
};

// 3. FUNÇÃO PARA INICIALIZAR A UI COMPARTILHADA
function initializeSharedUI() {
  console.log("[PASSO 2] Iniciando UI compartilhada...");
  try {
    setupDarkModeToggle();
    console.log("[PASSO 3] Dark Mode configurado.");
    setupSidebarToggle();
    console.log("[PASSO 4] Sidebar configurada.");
    highlightActiveNavLink();
    console.log("[PASSO 5] Link ativo destacado.");
    setupLogout();
    console.log("[PASSO 6] Logout configurado.");
  } catch (error) {
    console.error("ERRO ao inicializar a UI compartilhada:", error);
  }
}

// 4. FUNÇÃO PARA CARREGAR A LÓGICA DA PÁGINA ATUAL
async function loadPageSpecificScript() {
  const pageName = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", "");
  const scriptToLoad = pageScriptMap[pageName];

  if (scriptToLoad) {
    console.log(
      `[PASSO 7] Tentando carregar script para a página '${pageName}'...`
    );
    try {
      await import(scriptToLoad);
      console.log(`[PASSO 8] Módulo '${scriptToLoad}' carregado com SUCESSO.`);
    } catch (error) {
      console.error(`ERRO ao carregar o módulo '${scriptToLoad}':`, error);
    }
  }
}

// 5. PONTO DE ENTRADA
document.addEventListener("DOMContentLoaded", () => {
  console.log("[PASSO 1] O DOM da página está pronto.");
  initializeSharedUI();
  loadPageSpecificScript();
});

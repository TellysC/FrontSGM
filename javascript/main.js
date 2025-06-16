import { showMessage } from "./ui/feedback.js";
import { setupSidebarToggle, highlightActiveNavLink } from "./ui/sidebar.js";
import { setupDarkModeToggle } from "./ui/theme.js";

import { initLoginPage } from "./pages/login.js";
import { initAdminDashboardPage } from "./pages/admin-dashboard.js";
import { initAdminUsuariosPage } from "./pages/admin-usuarios.js";
import { initAdminMaquinasPage } from "./pages/admin-maquinas.js";

function setupLogoutButton() {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("authToken");
      window.location.href = "login.html";
    });
  }
}

function router() {
  const paginaAtual = window.location.pathname.split("/").pop();

  // Se não for a página de login e não tiver token, manda pro login
  if (paginaAtual !== "login.html" && !localStorage.getItem("authToken")) {
    window.location.href = "login.html";
    return;
  }

  // Roda a função específica da página
  switch (paginaAtual) {
    case "login.html":
      initLoginPage();
      break;
    case "admin_dashboard.html":
      initAdminDashboardPage();
      break;
    case "usuarios.html":
      initAdminUsuariosPage();
      break;
    case "admin_cadastrar_maquinas.html":
      initAdminMaquinasPage();
      break;
    case "inventario.html":
      initAdminMaquinasPage();
      break; // Reutilizando a função
    // Adicione aqui os 'case' para as outras páginas
    // case 'cliente_criar_ordem.html':    initClienteOrdemPage(); break;
  }

  if (paginaAtual !== "login.html") {
    setupLogoutButton();
    setupDarkModeToggle();
    setupSidebarToggle();
    highlightActiveNavLink();
  }
}

document.addEventListener("DOMContentLoaded", router);

// javascript/UI/sidebar.js

export function setupSidebarToggle() {
  console.log("Procurando o botão da Sidebar...");
  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  const appContainer = document.querySelector(".app-container");

  // Verifica se ambos os elementos foram encontrados
  if (sidebarToggleBtn && appContainer) {
    console.log(
      "-> Elementos 'sidebarToggleBtn' e '.app-container' ENCONTRADOS."
    );

    if (localStorage.getItem("sidebarState") === "collapsed") {
      appContainer.classList.add("sidebar-collapsed");
    }

    sidebarToggleBtn.addEventListener("click", () => {
      appContainer.classList.toggle("sidebar-collapsed");
      const newState = appContainer.classList.contains("sidebar-collapsed")
        ? "collapsed"
        : "expanded";
      localStorage.setItem("sidebarState", newState);
    });
  } else {
    // Se não encontrou um deles, avisa no console
    console.error(
      "### ERRO: Elemento 'sidebarToggleBtn' ou '.app-container' NÃO FOI ENCONTRADO no HTML. ###"
    );
  }
}

// Mantenha a função highlightActiveNavLink como está
export function highlightActiveNavLink() {
  // ... seu código original aqui ...
}

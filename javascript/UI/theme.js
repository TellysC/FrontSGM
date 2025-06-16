// javascript/UI/theme.js

export function setupDarkModeToggle() {
  console.log("Procurando o botão de Dark Mode...");
  const darkModeSwitch = document.getElementById("darkModeSwitch");

  // Verifica se o elemento foi encontrado no HTML
  if (darkModeSwitch) {
    console.log("-> Botão 'darkModeSwitch' ENCONTRADO.");

    // Aplica o estado inicial ao carregar a página
    if (localStorage.getItem("darkMode") === "enabled") {
      document.body.classList.add("dark-mode");
      darkModeSwitch.checked = true;
    }

    // Adiciona o evento de mudança
    darkModeSwitch.addEventListener("change", () => {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem(
        "darkMode",
        darkModeSwitch.checked ? "enabled" : "disabled"
      );
    });
  } else {
    // Se não encontrou, avisa no console
    console.error(
      "### ERRO: Elemento com id 'darkModeSwitch' NÃO FOI ENCONTRADO no HTML. ###"
    );
  }
}

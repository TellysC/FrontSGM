export function setupDarkModeToggle() {
  const darkModeSwitch = document.getElementById("darkModeSwitch");
  if (darkModeSwitch) {
    if (localStorage.getItem("darkMode") === "enabled") {
      document.body.classList.add("dark-mode");
      darkModeSwitch.checked = true;
    }
    darkModeSwitch.addEventListener("change", () => {
      document.body.classList.toggle("dark-mode");
      localStorage.setItem(
        "darkMode",
        darkModeSwitch.checked ? "enabled" : "disabled"
      );
    });
  }
}

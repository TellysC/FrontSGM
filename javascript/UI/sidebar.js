export function setupSidebarToggle() {
  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  const appContainer = document.querySelector(".app-container");
  if (sidebarToggleBtn && appContainer) {
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
  }
}

export function highlightActiveNavLink() {
  const sidebarNav = document.querySelector(".sidebar-nav");
  if (sidebarNav) {
    const currentPath = window.location.pathname.split("/").pop();
    sidebarNav.querySelectorAll(".nav-item").forEach((link) => {
      const linkPath = link.getAttribute("href").replace("./", "");
      link.classList.toggle("active", linkPath === currentPath);
    });
  }
}

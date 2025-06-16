import { API_BASE_URL } from "../services/api.js";

export function initLoginPage() {
  const form = document.getElementById("formLogin");
  if (!form) return;

  if (localStorage.getItem("authToken")) {
    window.location.href = "admin_dashboard.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const messageEl = document.getElementById("loginMessage");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      if (!response.ok) throw new Error("Email ou senha inválidos.");

      const data = await response.json();
      localStorage.setItem("authToken", data.token);
      window.location.href = "admin_dashboard.html";
    } catch (error) {
      if (messageEl) messageEl.textContent = error.message;
    }
  });
}

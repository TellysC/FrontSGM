export const API_BASE_URL = "http://localhost:8080";

// Função auxiliar para pegar o token do localStorage
const getToken = () => localStorage.getItem("authToken");

/**
 * Função central para fazer chamadas à API já com o token de autenticação.
 */
export async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();

  if (!token) {
    console.error("Usuário não autenticado. Redirecionando para login.");
    window.location.href = "login.html";
    throw new Error("Usuário não autenticado.");
  }

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("authToken");
    window.location.href = "login.html";
    throw new Error("Sessão inválida.");
  }

  return response;
}

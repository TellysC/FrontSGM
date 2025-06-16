// javascript/services/api.js

// 1. ENDEREÇO BASE DO SEU SERVIDOR BACK-END
export const API_BASE_URL = "http://localhost:8080";

// Função auxiliar para pegar o token do localStorage
const getToken = () => localStorage.getItem("authToken");

/**
 * Função central para fazer todas as chamadas à API que exigem autenticação.
 * Ela automaticamente adiciona o "Authorization: Bearer <token>" no cabeçalho.
 * @param {string} endpoint - O endpoint da API a ser chamado (ex: '/usuarios').
 * @param {object} options - As opções da requisição fetch (method, body, etc.).
 * @returns {Promise<Response>} - A resposta da requisição.
 */
export async function fetchWithAuth(endpoint, options = {}) {
  const token = getToken();

  // Se não houver token, o usuário não está logado. Redireciona para o login.
  if (!token) {
    console.error("Usuário não autenticado. Redirecionando para login.");
    window.location.href = "login.html";
    // Lança um erro para interromper a execução do código que tentou fazer a chamada
    throw new Error("Usuário não autenticado.");
  }

  // Define os cabeçalhos padrão, incluindo o de autorização.
  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Monta a configuração final da requisição
  const config = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Se o token for inválido ou expirado (erro 401 ou 403), limpa a sessão e redireciona para o login.
  if (response.status === 401 || response.status === 403) {
    localStorage.clear();
    window.location.href = "login.html";
    throw new Error("Sessão inválida ou expirada.");
  }

  return response;
}
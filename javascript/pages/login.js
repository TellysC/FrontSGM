// javascript/pages/login.js
import { api } from '../api.js'; // Importa a instância do Axios configurada

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');

    if (formLogin) {
        formLogin.addEventListener('submit', handleSubmitLogin);
    }

    // Função auxiliar para decodificar JWT (simples, para claims não sensíveis)
    function decodeJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Erro ao decodificar JWT:", e);
            return null;
        }
    }

    async function handleSubmitLogin(event) {
        event.preventDefault();

        const email = emailInput.value;
        const senha = passwordInput.value;

        try {
            const response = await api.post('/auth/login', { email, senha });

            const { token } = response.data;

            localStorage.setItem('jwt_token', token);
            console.log('Login bem-sucedido! Token:', token);
            loginMessage.textContent = 'Login bem-sucedido! Redirecionando...';
            loginMessage.className = 'message success';

            // Decodifica o token para obter o role
            const decodedToken = decodeJwt(token);
            const userRole = decodedToken ? decodedToken.role : null; // Pega o role do token

            console.log('Role do usuário:', userRole);

            // Redirecionamento baseado no role
            if (userRole === 'ADMINISTRADOR') { //
                window.location.href = './admDashboard.html';
            } else if (userRole === 'TECNICO') { //
                window.location.href = './tecDashboard.html';
            } else if (userRole === 'CLIENTE') { //
                window.location.href = './ordemServico.html';
            } else {
                console.warn('Role desconhecido ou não encontrado. Redirecionando para página padrão.');
                window.location.href = './index.html'; // Página de fallback
            }

        } catch (error) {
            console.error('Erro no login:', error);
            let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';

            if (error.response) {
                if (error.response.status === 403 || error.response.status === 401) {
                    errorMessage = 'Email ou senha inválidos.';
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                errorMessage = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
            } else {
                errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';
            }

            loginMessage.textContent = errorMessage;
            loginMessage.className = 'message error';
        }
    }
});
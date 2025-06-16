import { API_BASE_URL } from '../services/api.js';
import { showMessage } from '../UI/feedback.js';

function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar o token:", e);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('formLogin');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, senha: password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);

                const decodedToken = decodeJwt(data.token);
                // LOG DE VERIFICAÇÃO 1: Verifique o conteúdo do token decodificado no console
                console.log('Token Decodificado:', decodedToken);

                const userRole = decodedToken ? decodedToken.role : null;
                // LOG DE VERIFICAÇÃO 2: Verifique a role que foi extraída
                console.log('Role do Usuário:', userRole);

                localStorage.setItem('userRole', userRole);
                localStorage.setItem('userEmail', decodedToken?.sub);

                if (userRole === 'ADMINISTRADOR') {
                    window.location.href = 'admin_dashboard.html';
                } else if (userRole === 'TECNICO') {
                    window.location.href = 'tecnico_dashboard.html';
                } else {
                    window.location.href = 'cliente_criar_ordem.html';
                }
            } else {
                showMessage('loginMessage', 'Email ou senha inválidos.', 'error');
            }
        } catch (error) {
            showMessage('loginMessage', 'Falha na conexão com o servidor.', 'error');
        }
    });
});
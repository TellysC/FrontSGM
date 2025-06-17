// javascript/api.js
// Remova a linha de importação: import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.7/dist/axios.min.js';

// Certifique-se de que o script do Axios CDN está sendo carregado no seu HTML ANTES do api.js
// Exemplo no seu HTML: <script src="https://cdn.jsdelivr.net/npm/axios@1.6.7/dist/axios.min.js"></script>

export const api = axios.create({ // Agora 'axios' será a variável global do CDN
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
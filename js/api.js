
const API = (() => {
  const BASE = '/api';
  const TOKEN_KEY = 'biblioteca:token';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
  function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) return null;

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data && data.error) || `Erro ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  return {
    getToken,
    setToken,

    register: (dados) => request('POST', '/auth/register', dados),
    login: (dados) => request('POST', '/auth/login', dados),
    me: () => request('GET', '/auth/me'),

    listarLivros: (q = '') => request('GET', `/livros${q}`),
    buscarLivro: (id) => request('GET', `/livros/${id}`),
    criarLivro: (dados) => request('POST', '/livros', dados),
    atualizarLivro: (id, dados) => request('PUT', `/livros/${id}`, dados),
    removerLivro: (id) => request('DELETE', `/livros/${id}`),
   
    listarAutores: (q = '') => request('GET', `/autores${q}`),
    buscarAutor: (id) => request('GET', `/autores/${id}`),
    criarAutor: (dados) => request('POST', '/autores', dados),
    atualizarAutor: (id, dados) => request('PUT', `/autores/${id}`, dados),
    removerAutor: (id) => request('DELETE', `/autores/${id}`),
  };
})();

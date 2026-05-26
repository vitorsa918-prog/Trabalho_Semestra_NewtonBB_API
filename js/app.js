const App = (() => {
  const root = document.getElementById('app');


  let currentUser = null;


  function $(sel, parent = document) { return parent.querySelector(sel); }
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function toast(message, type = 'info') {
    const container = $('#toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
  function setLoading() {
    root.innerHTML = '<div class="loading">Carregando o acervo</div>';
  }
  function setActiveNav(viewName) {
    document.querySelectorAll('.nav-link').forEach((a) => {
      a.classList.toggle('active', a.dataset.view === viewName);
    });
  }

  async function refreshAuthState() {
    if (!API.getToken()) {
      currentUser = null;
      updateAuthUI();
      return;
    }
    try {
      currentUser = await API.me();
    } catch (err) {
      API.setToken(null);
      currentUser = null;
    }
    updateAuthUI();
  }

  function updateAuthUI() {
    const userInfo = $('#user-info');
    const btnLogin = $('#btn-login');
    const btnLogout = $('#btn-logout');
    if (currentUser) {
      userInfo.innerHTML = `<strong>${escapeHtml(currentUser.nome)}</strong> · ${escapeHtml(currentUser.perfil)}`;
      userInfo.classList.remove('hidden');
      btnLogin.classList.add('hidden');
      btnLogout.classList.remove('hidden');
    } else {
      userInfo.classList.add('hidden');
      btnLogin.classList.remove('hidden');
      btnLogout.classList.add('hidden');
    }
  }

  function requireAuth() {
    if (!currentUser) {
      toast('Faça login para realizar esta ação', 'error');
      openAuthModal();
      return false;
    }
    return true;
  }
  function requireAdmin() {
    if (!currentUser) {
      toast('Faça login como admin', 'error');
      openAuthModal();
      return false;
    }
    if (currentUser.perfil !== 'admin') {
      toast('Apenas administradores podem realizar esta ação', 'error');
      return false;
    }
    return true;
  }

  function openAuthModal() { $('#auth-modal').classList.remove('hidden'); }
  function closeAuthModal() { $('#auth-modal').classList.add('hidden'); }

  async function viewLivros(filtroBusca = '') {
    setActiveNav('livros');
    setLoading();
    try {
      const qs = filtroBusca ? `?titulo=${encodeURIComponent(filtroBusca)}` : '';
      const livros = await API.listarLivros(qs);

      root.innerHTML = `
        <header class="view-header">
          <div>
            <h2 class="view-title">Livros</h2>
            <p class="view-subtitle">${livros.length} ${livros.length === 1 ? 'obra' : 'obras'} no acervo</p>
          </div>
          <button class="btn btn-primary" id="btn-novo-livro">+ Novo livro</button>
        </header>
        <div class="toolbar">
          <input type="text" id="search-livros" placeholder="Buscar por título..." value="${escapeHtml(filtroBusca)}" />
        </div>
        <div class="list" id="lista-livros"></div>
      `;

      $('#btn-novo-livro').addEventListener('click', () => {
        if (!requireAuth()) return;
        viewLivroForm();
      });

      let debounce;
      $('#search-livros').addEventListener('input', (e) => {
        clearTimeout(debounce);
        const val = e.target.value;
        debounce = setTimeout(() => viewLivros(val), 300);
      });

      const lista = $('#lista-livros');
      if (livros.length === 0) {
        lista.outerHTML = '<div class="empty">Nenhum livro encontrado. Que tal cadastrar o primeiro?</div>';
        return;
      }

      livros.forEach((livro) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
          <div>
            <div class="card-title">${escapeHtml(livro.titulo)}</div>
            <div class="card-meta">
              <span>${livro.autor && livro.autor.nome ? escapeHtml(livro.autor.nome) : 'Autor desconhecido'}</span>
              ${livro.anoPublicacao ? `<span>${livro.anoPublicacao}</span>` : ''}
              ${livro.genero ? `<span>${escapeHtml(livro.genero)}</span>` : ''}
            </div>
          </div>
          <div>
            <span class="badge ${livro.disponivel ? '' : 'indisponivel'}">
              ${livro.disponivel ? 'Disponível' : 'Indisponível'}
            </span>
          </div>
        `;
        card.addEventListener('click', () => viewLivroDetail(livro.id));
        lista.appendChild(card);
      });
    } catch (err) {
      root.innerHTML = `<div class="empty">Erro ao carregar livros: ${escapeHtml(err.message)}</div>`;
    }
  }

  async function viewLivroDetail(id) {
    setLoading();
    try {
      const livro = await API.buscarLivro(id);
      root.innerHTML = `
        <a href="#" id="back-livros" class="nav-link" style="display:inline-block;margin-bottom:1rem;">← Voltar para livros</a>
        <article class="detail">
          <header class="detail-header">
            <h2 class="detail-title">${escapeHtml(livro.titulo)}</h2>
            ${livro.autor && livro.autor.nome ? `<p class="detail-subtitle">por ${escapeHtml(livro.autor.nome)}</p>` : ''}
          </header>
          ${livro.sinopse ? `<p class="detail-text">${escapeHtml(livro.sinopse)}</p>` : ''}
          <dl class="detail-grid">
            ${livro.isbn ? `<dt>ISBN</dt><dd>${escapeHtml(livro.isbn)}</dd>` : ''}
            ${livro.anoPublicacao ? `<dt>Publicação</dt><dd>${livro.anoPublicacao}</dd>` : ''}
            ${livro.genero ? `<dt>Gênero</dt><dd>${escapeHtml(livro.genero)}</dd>` : ''}
            <dt>Status</dt><dd>
              <span class="badge ${livro.disponivel ? '' : 'indisponivel'}">
                ${livro.disponivel ? 'Disponível' : 'Indisponível'}
              </span>
            </dd>
          </dl>
          <div class="detail-actions">
            <button class="btn btn-ghost" id="btn-editar">Editar</button>
            <button class="btn btn-danger" id="btn-remover">Remover</button>
          </div>
        </article>
      `;

      $('#back-livros').addEventListener('click', (e) => {
        e.preventDefault();
        viewLivros();
      });
      $('#btn-editar').addEventListener('click', () => {
        if (!requireAuth()) return;
        viewLivroForm(livro);
      });
      $('#btn-remover').addEventListener('click', async () => {
        if (!requireAdmin()) return;
        if (!confirm(`Remover "${livro.titulo}" do acervo?`)) return;
        try {
          await API.removerLivro(livro.id);
          toast('Livro removido', 'success');
          viewLivros();
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    } catch (err) {
      root.innerHTML = `<div class="empty">Livro não encontrado: ${escapeHtml(err.message)}</div>`;
    }
  }

  async function viewLivroForm(livro = null) {
    setLoading();
    const editando = !!livro;
    try {
      const autores = await API.listarAutores();
      root.innerHTML = `
        <header class="view-header">
          <div>
            <h2 class="view-title">${editando ? 'Editar' : 'Novo'} livro</h2>
            <p class="view-subtitle">${editando ? 'Atualize as informações da obra' : 'Acrescente uma obra ao acervo'}</p>
          </div>
        </header>
        <form class="form" id="form-livro">
          <div>
            <label>Título <input type="text" name="titulo" required value="${escapeHtml(livro?.titulo || '')}" /></label>
          </div>
          <div>
            <label>Autor
              <select name="autor" required>
                <option value="">— escolha um autor —</option>
                ${autores.map((a) => `
                  <option value="${a.id}" ${livro && livro.autor && (livro.autor.id === a.id || livro.autor === a.id) ? 'selected' : ''}>
                    ${escapeHtml(a.nome)}
                  </option>
                `).join('')}
              </select>
            </label>
          </div>
          <div>
            <label>ISBN <input type="text" name="isbn" value="${escapeHtml(livro?.isbn || '')}" /></label>
          </div>
          <div>
            <label>Ano de publicação <input type="number" name="anoPublicacao" min="0" max="9999" value="${livro?.anoPublicacao || ''}" /></label>
          </div>
          <div>
            <label>Gênero <input type="text" name="genero" value="${escapeHtml(livro?.genero || '')}" /></label>
          </div>
          <div>
            <label>Sinopse <textarea name="sinopse" rows="4">${escapeHtml(livro?.sinopse || '')}</textarea></label>
          </div>
          <div class="form-check">
            <input type="checkbox" id="disponivel" name="disponivel" ${(livro?.disponivel ?? true) ? 'checked' : ''} />
            <label for="disponivel">Disponível para empréstimo</label>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">${editando ? 'Salvar alterações' : 'Cadastrar livro'}</button>
            <button type="button" class="btn btn-ghost" id="btn-cancelar">Cancelar</button>
          </div>
        </form>
      `;

      if (autores.length === 0) {
        toast('Cadastre um autor antes de adicionar um livro', 'error');
      }

      $('#btn-cancelar').addEventListener('click', () => {
        editando ? viewLivroDetail(livro.id) : viewLivros();
      });

      $('#form-livro').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const dados = {
          titulo: fd.get('titulo'),
          autor: fd.get('autor'),
          isbn: fd.get('isbn') || undefined,
          anoPublicacao: fd.get('anoPublicacao') ? Number(fd.get('anoPublicacao')) : undefined,
          genero: fd.get('genero') || undefined,
          sinopse: fd.get('sinopse') || undefined,
          disponivel: fd.get('disponivel') === 'on',
        };
        try {
          if (editando) {
            const atualizado = await API.atualizarLivro(livro.id, dados);
            toast('Livro atualizado', 'success');
            viewLivroDetail(atualizado.id);
          } else {
            const criado = await API.criarLivro(dados);
            toast('Livro cadastrado', 'success');
            viewLivroDetail(criado.id);
          }
        } catch (err) {
          toast(err.message, 'error');
        }
      });
    } catch (err) {
      root.innerHTML = `<div class="empty">Erro: ${escapeHtml(err.message)}</div>`;
    }
  }

  async function viewAutores(filtroBusca = '') {
    setActiveNav('autores');
    setLoading();
    try {
      const qs = filtroBusca ? `?nome=${encodeURIComponent(filtroBusca)}` : '';
      const autores = await API.listarAutores(qs);

      root.innerHTML = `
        <header class="view-header">
          <div>
            <h2 class="view-title">Autores</h2>
            <p class="view-subtitle">${autores.length} ${autores.length === 1 ? 'autor cadastrado' : 'autores cadastrados'}</p>
          </div>
          <button class="btn btn-primary" id="btn-novo-autor">+ Novo autor</button>
        </header>
        <div class="toolbar">
          <input type="text" id="search-autores" placeholder="Buscar por nome..." value="${escapeHtml(filtroBusca)}" />
        </div>
        <div class="list" id="lista-autores"></div>
      `;

      $('#btn-novo-autor').addEventListener('click', () => {
        if (!requireAuth()) return;
        viewAutorForm();
      });
      let debounce;
      $('#search-autores').addEventListener('input', (e) => {
        clearTimeout(debounce);
        const val = e.target.value;
        debounce = setTimeout(() => viewAutores(val), 300);
      });

      const lista = $('#lista-autores');
      if (autores.length === 0) {
        lista.outerHTML = '<div class="empty">Nenhum autor cadastrado.</div>';
        return;
      }
      autores.forEach((a) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = `
          <div>
            <div class="card-title">${escapeHtml(a.nome)}</div>
            <div class="card-meta">
              ${a.nacionalidade ? `<span>${escapeHtml(a.nacionalidade)}</span>` : ''}
              ${a.anoNascimento ? `<span>n. ${a.anoNascimento}</span>` : ''}
            </div>
          </div>
        `;
        card.addEventListener('click', () => viewAutorDetail(a.id));
        lista.appendChild(card);
      });
    } catch (err) {
      root.innerHTML = `<div class="empty">Erro: ${escapeHtml(err.message)}</div>`;
    }
  }

  async function viewAutorDetail(id) {
    setLoading();
    try {
      const autor = await API.buscarAutor(id);
      const livrosDoAutor = await API.listarLivros(`?autor=${id}`);

      root.innerHTML = `
        <a href="#" id="back-autores" class="nav-link" style="display:inline-block;margin-bottom:1rem;">← Voltar para autores</a>
        <article class="detail">
          <header class="detail-header">
            <h2 class="detail-title">${escapeHtml(autor.nome)}</h2>
            ${autor.nacionalidade ? `<p class="detail-subtitle">${escapeHtml(autor.nacionalidade)}</p>` : ''}
          </header>
          ${autor.biografia ? `<p class="detail-text">${escapeHtml(autor.biografia)}</p>` : ''}
          <dl class="detail-grid">
            ${autor.anoNascimento ? `<dt>Nascimento</dt><dd>${autor.anoNascimento}</dd>` : ''}
            <dt>Obras no acervo</dt><dd>${livrosDoAutor.length}</dd>
          </dl>
          ${livrosDoAutor.length > 0 ? `
            <div>
              <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 1rem;">Obras</h3>
              <div class="list" id="obras-do-autor">
                ${livrosDoAutor.map((l) => `
                  <article class="card" data-livro="${l.id}">
                    <div>
                      <div class="card-title">${escapeHtml(l.titulo)}</div>
                      <div class="card-meta">${l.anoPublicacao ? `<span>${l.anoPublicacao}</span>` : ''}</div>
                    </div>
                  </article>
                `).join('')}
              </div>
            </div>
          ` : ''}
          <div class="detail-actions">
            <button class="btn btn-ghost" id="btn-editar-autor">Editar</button>
            <button class="btn btn-danger" id="btn-remover-autor">Remover</button>
          </div>
        </article>
      `;

      $('#back-autores').addEventListener('click', (e) => {
        e.preventDefault();
        viewAutores();
      });
      $('#btn-editar-autor').addEventListener('click', () => {
        if (!requireAuth()) return;
        viewAutorForm(autor);
      });
      $('#btn-remover-autor').addEventListener('click', async () => {
        if (!requireAdmin()) return;
        if (!confirm(`Remover ${autor.nome}?`)) return;
        try {
          await API.removerAutor(autor.id);
          toast('Autor removido', 'success');
          viewAutores();
        } catch (err) {
          toast(err.message, 'error');
        }
      });
      document.querySelectorAll('[data-livro]').forEach((el) => {
        el.addEventListener('click', () => viewLivroDetail(el.dataset.livro));
      });
    } catch (err) {
      root.innerHTML = `<div class="empty">Autor não encontrado: ${escapeHtml(err.message)}</div>`;
    }
  }

  function viewAutorForm(autor = null) {
    const editando = !!autor;
    root.innerHTML = `
      <header class="view-header">
        <div>
          <h2 class="view-title">${editando ? 'Editar' : 'Novo'} autor</h2>
          <p class="view-subtitle">${editando ? 'Atualize as informações do autor' : 'Adicione um novo autor ao sistema'}</p>
        </div>
      </header>
      <form class="form" id="form-autor">
        <div><label>Nome <input type="text" name="nome" required value="${escapeHtml(autor?.nome || '')}" /></label></div>
        <div><label>Nacionalidade <input type="text" name="nacionalidade" value="${escapeHtml(autor?.nacionalidade || '')}" /></label></div>
        <div><label>Ano de nascimento <input type="number" name="anoNascimento" min="0" max="9999" value="${autor?.anoNascimento || ''}" /></label></div>
        <div><label>Biografia <textarea name="biografia" rows="4">${escapeHtml(autor?.biografia || '')}</textarea></label></div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${editando ? 'Salvar alterações' : 'Cadastrar autor'}</button>
          <button type="button" class="btn btn-ghost" id="btn-cancelar">Cancelar</button>
        </div>
      </form>
    `;
    $('#btn-cancelar').addEventListener('click', () => {
      editando ? viewAutorDetail(autor.id) : viewAutores();
    });
    $('#form-autor').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const dados = {
        nome: fd.get('nome'),
        nacionalidade: fd.get('nacionalidade') || undefined,
        anoNascimento: fd.get('anoNascimento') ? Number(fd.get('anoNascimento')) : undefined,
        biografia: fd.get('biografia') || undefined,
      };
      try {
        if (editando) {
          const atualizado = await API.atualizarAutor(autor.id, dados);
          toast('Autor atualizado', 'success');
          viewAutorDetail(atualizado.id);
        } else {
          const criado = await API.criarAutor(dados);
          toast('Autor cadastrado', 'success');
          viewAutorDetail(criado.id);
        }
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  }

  function setupNav() {
    document.querySelectorAll('.nav-link').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const view = a.dataset.view;
        if (view === 'livros') viewLivros();
        else if (view === 'autores') viewAutores();
      });
    });

    $('#btn-login').addEventListener('click', openAuthModal);
    $('#btn-logout').addEventListener('click', () => {
      API.setToken(null);
      currentUser = null;
      updateAuthUI();
      toast('Você saiu', 'success');
    });
    $('#modal-close').addEventListener('click', closeAuthModal);
    $('#auth-modal').addEventListener('click', (e) => {
      if (e.target.id === 'auth-modal') closeAuthModal();
    });

    document.querySelectorAll('.auth-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        if (tab.dataset.tab === 'login') {
          $('#form-login').classList.remove('hidden');
          $('#form-register').classList.add('hidden');
        } else {
          $('#form-login').classList.add('hidden');
          $('#form-register').classList.remove('hidden');
        }
      });
    });

    $('#form-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        const { token } = await API.login({
          email: fd.get('email'),
          senha: fd.get('senha'),
        });
        API.setToken(token);
        await refreshAuthState();
        toast(`Bem-vindo, ${currentUser.nome}!`, 'success');
        closeAuthModal();
        e.target.reset();
      } catch (err) {
        toast(err.message, 'error');
      }
    });

    $('#form-register').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.register({
          nome: fd.get('nome'),
          email: fd.get('email'),
          senha: fd.get('senha'),
          perfil: fd.get('perfil'),
        });
        const { token } = await API.login({
          email: fd.get('email'),
          senha: fd.get('senha'),
        });
        API.setToken(token);
        await refreshAuthState();
        toast(`Conta criada. Bem-vindo, ${currentUser.nome}!`, 'success');
        closeAuthModal();
        e.target.reset();
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  }

  async function init() {
    setupNav();
    await refreshAuthState();
    await viewLivros();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);

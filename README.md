# Biblioteca API

> Trabalho Prático Semestral — Arquitetura de Aplicações Web (2026.1)

Aplicação web completa para gestão de uma biblioteca: cadastro de livros e autores, autenticação JWT com controle de perfis, documentação OpenAPI e um frontend SPA com navegação assíncrona.

---

## Visão geral

O domínio é uma biblioteca, com duas entidades principais relacionadas entre si:

| Entidade | Campos principais |
|----------|-------------------|
| Autor | `nome`, `nacionalidade`, `anoNascimento`, `biografia` |
| Livro | `titulo`, `isbn`, `anoPublicacao`, `genero`, `sinopse`, `disponivel`, `autor` (referência) |

Cada livro pertence a um autor (`Livro.autor → Autor`), e os endpoints retornam o autor populado para facilitar o consumo no frontend.

---

## Stack

| Camada    | Tecnologia |
|-----------|------------|
| Backend   | Node.js 20+, Express 4, Mongoose 8 |
| Banco     | MongoDB 7 (NoSQL) |
| Auth      | JSON Web Token (`jsonwebtoken`) + `bcryptjs` |
| Docs      | OpenAPI 3.0 via `swagger-jsdoc` + `swagger-ui-express` |
| Testes    | Jest |
| Frontend  | HTML + CSS + JavaScript (vanilla), `fetch` API |

---

## Pré-requisitos

- Node.js 20 LTS ou superior
- npm 10+ (acompanha o Node.js)
- MongoDB acessível na URI configurada — o jeito mais fácil é via Docker

---

## Como rodar localmente

### 1. Clone e instale

```bash
git clone <URL_DO_REPOSITORIO>
cd biblioteca-api
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
cp .env.example .env
```

Conteúdo padrão do `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/biblioteca
JWT_SECRET=troque-este-segredo-em-producao-use-uma-string-longa-e-aleatoria
JWT_EXPIRES_IN=2h
```

Nenhuma string de conexão ou segredo está hardcoded no código — tudo é lido via `process.env`.

### 3. Suba o MongoDB

**Opção A — Docker (recomendada):**

```bash
docker compose up -d
```

Isso sobe o container `biblioteca-mongo` na porta `27017`.

**Opção B — MongoDB local:** instale o MongoDB Community Edition e garanta que ele esteja rodando em `localhost:27017`.

### 4. Inicie a aplicação

```bash
# Modo desenvolvimento (com auto-reload):
npm run dev

# Ou em modo produção:
npm start
```

A aplicação ficará disponível em:

- Frontend (SPA): http://localhost:5000/
- API: http://localhost:5000/api
- Swagger: http://localhost:5000/swagger

---

## Documentação OpenAPI / Swagger

Toda a API está documentada com OpenAPI 3.0, gerada via anotações nos arquivos de rota (`src/routes/*.js`).

Acesse no navegador em **http://localhost:5000/swagger**. Por lá você pode visualizar todos os endpoints organizados por tag (Livros, Autores, Autenticação), ver os schemas de entrada e saída, e testar requisições diretamente na interface — incluindo o envio do token JWT pelo botão Authorize.

---

## Como rodar os testes

```bash
npm test
```

Os testes unitários estão em `tests/` e cobrem:

- `LivroService` — 2 cenários de sucesso, 3 de erro.
- `AutorService` — 2 cenários de sucesso, 2 de erro.

Os testes usam repositórios mockados, sem tocar no MongoDB, o que prova que a camada de serviço é desacoplada da persistência graças à injeção de dependência.

---

## Autenticação e perfis

A aplicação usa JWT para autenticação e controle de acesso baseado em papéis (RBAC).

### Endpoints públicos

| Método | Rota | O que faz |
|--------|------|-----------|
| `POST` | `/api/auth/register` | Cria um novo usuário |
| `POST` | `/api/auth/login` | Autentica e retorna o JWT |
| `GET`  | `/api/livros` | Lista livros |
| `GET`  | `/api/livros/:id` | Detalha um livro |
| `GET`  | `/api/autores` | Lista autores |
| `GET`  | `/api/autores/:id` | Detalha um autor |

### Endpoints autenticados (qualquer usuário logado)

| Método | Rota | Header obrigatório |
|--------|------|--------------------|
| `POST` | `/api/livros` | `Authorization: Bearer <token>` |
| `PUT`  | `/api/livros/:id` | `Authorization: Bearer <token>` |
| `POST` | `/api/autores` | `Authorization: Bearer <token>` |
| `PUT`  | `/api/autores/:id` | `Authorization: Bearer <token>` |
| `GET`  | `/api/auth/me` | `Authorization: Bearer <token>` |

### Endpoints restritos a admin

| Método   | Rota |
|----------|------|
| `DELETE` | `/api/livros/:id` |
| `DELETE` | `/api/autores/:id` |

O perfil do usuário está embutido no payload do JWT (`payload.perfil`) e validado pelo middleware `src/middleware/auth.js → requireRole`.

### Como criar o primeiro admin

Use o endpoint `POST /api/auth/register` com `"perfil": "admin"`:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Admin","email":"admin@biblioteca.com","senha":"senha123","perfil":"admin"}'
```

Em produção você deveria proteger esse endpoint ou criar admins via seed. Para o trabalho, deixamos aberto para facilitar a demonstração.

---

## Princípios SOLID

Os princípios SOLID aplicados estão detalhados em [`SOLID.md`](./SOLID.md).

---

## Frontend

O frontend está em `public/` e é uma SPA em HTML + JavaScript vanilla. Toda a navegação é feita atualizando apenas o conteúdo de `<main id="app">`, sem recarregar a página. As chamadas ao backend usam `fetch` (`public/js/api.js`), e o estado de autenticação é persistido em `localStorage` (apenas o token).

Views disponíveis: lista e detalhe de livros, formulário de livro; lista e detalhe de autores, formulário de autor; modal de login/registro.

Para testá-la, basta acessar **http://localhost:5000/** após iniciar o servidor.

---

## Estrutura do projeto

```
biblioteca-api/
├── README.md
├── SOLID.md
├── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
├── src/
│   ├── server.js              # Entrypoint
│   ├── app.js                 # Express + middlewares + rotas
│   ├── config/
│   │   └── database.js        # Conexão MongoDB
│   ├── models/                # Schemas Mongoose
│   │   ├── Autor.js
│   │   ├── Livro.js
│   │   └── Usuario.js
│   ├── repositories/          # Camada de persistência (DIP)
│   │   ├── ILivroRepository.js
│   │   ├── LivroRepository.js
│   │   ├── AutorRepository.js
│   │   └── UsuarioRepository.js
│   ├── services/              # Regras de negócio (SRP)
│   │   ├── LivroService.js
│   │   ├── AutorService.js
│   │   └── AuthService.js
│   ├── controllers/           # Adaptadores HTTP
│   │   ├── LivroController.js
│   │   ├── AutorController.js
│   │   └── AuthController.js
│   ├── routes/                # Definições de rotas + Swagger
│   ├── middleware/            # auth, errorHandler
│   ├── docs/swagger.js        # Especificação OpenAPI
│   └── utils/errors.js        # Erros de domínio
├── tests/                     # Testes Jest
│   ├── LivroService.test.js
│   └── AutorService.test.js
└── public/                    # Frontend SPA
    ├── index.html
    ├── css/style.css
    └── js/{api.js, app.js}
```

---

## Comandos úteis

| Comando | O que faz |
|---------|-----------|
| `npm install` | Instala dependências |
| `npm run dev` | Inicia com auto-reload (nodemon) |
| `npm start` | Inicia em modo produção |
| `npm test` | Executa os testes unitários |
| `docker compose up -d` | Sobe o MongoDB |
| `docker compose down` | Derruba o MongoDB |

---

## Roteiro de demonstração

1. Subir o ambiente com `docker compose up -d` e `npm run dev`.
2. Abrir o Swagger em `/swagger` e mostrar a documentação dos endpoints.
3. Criar um autor via Swagger.
4. Abrir o frontend em `/` e navegar entre as views.
5. Tentar criar um livro sem login e observar o redirecionamento ao modal.
6. Registrar e logar como admin.
7. Criar um livro vinculado ao autor.
8. Comparar a tentativa de deletar como usuário comum versus como admin, mostrando o RBAC funcionando.
9. Rodar os testes com `npm test`.
10. Explicar a aplicação dos princípios SOLID com base no `SOLID.md`.

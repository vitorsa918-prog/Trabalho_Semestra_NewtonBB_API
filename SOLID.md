# Princípios SOLID aplicados

Este documento descreve quatro dos cinco princípios SOLID aplicados no backend, com referência aos arquivos onde aparecem.

---

## S — Single Responsibility Principle

Cada camada tem uma responsabilidade clara e única: controllers lidam com HTTP, services concentram as regras de negócio, repositories cuidam do banco, e models definem os schemas.

O `LivroService`, por exemplo, não sabe nada sobre como a resposta HTTP é formatada nem sobre os detalhes do MongoDB. Se trocarmos o banco ou o protocolo, ele permanece intacto.

```js
// src/services/LivroService.js
async criar(dados) {
  this._validar(dados);
  const autor = await this.autorRepository.buscarPorId(dados.autor);
  if (!autor) throw new ValidationError(`Autor com id ${dados.autor} não existe`);
  return this.livroRepository.criar(dados);
}
```

## O — Open/Closed Principle

O middleware `requireRole` em `src/middleware/auth.js` é uma factory que recebe os perfis permitidos como argumento. Para suportar um novo perfil, basta estender o uso — sem tocar no código do middleware:

```js
// adicionar 'bibliotecario' sem modificar o middleware
router.put('/:id', auth, requireRole('admin', 'bibliotecario'), controller.atualizar);
```

O mesmo vale para a hierarquia de erros em `src/utils/errors.js`: adicionar um `ConflictError` é só criar uma nova subclasse de `AppError`, sem alterar o handler existente.

## L — Liskov Substitution Principle

`ILivroRepository` define o contrato; `LivroRepository` o implementa com Mongoose. Qualquer outra implementação que respeite esse contrato pode substituir a original sem que o `LivroService` precise saber da troca — e é exatamente isso que os testes fazem:

```js
// tests/LivroService.test.js
livroRepo = { listar: jest.fn(), buscarPorId: jest.fn(), criar: jest.fn(), ... };
service = new LivroService(livroRepo, autorRepo);
```

## D — Dependency Inversion Principle

O `LivroService` não importa nenhum repositório diretamente — recebe tudo pelo construtor. A montagem das dependências concretas acontece em `src/routes/livros.js`:

```js
// src/services/LivroService.js
constructor(livroRepository, autorRepository) {
  this.livroRepository = livroRepository;
  this.autorRepository = autorRepository;
}

// src/routes/livros.js
const livroService = new LivroService(new LivroRepository(), new AutorRepository());
```

Isso permite testar o service sem MongoDB, trocar a tecnologia de persistência sem mexer na regra de negócio, e reutilizar o service em outros contextos.

---

## Resumo

| Princípio | Local | O que garante |
|-----------|-------|---------------|
| SRP | `services/`, `controllers/`, `repositories/` | Cada classe tem uma razão para mudar |
| OCP | `middleware/auth.js`, `utils/errors.js` | Extensão sem modificação |
| LSP | `repositories/ILivroRepository.js` | Implementações intercambiáveis |
| DIP | `services/LivroService.js`, `routes/livros.js` | Service depende da abstração, não da concretude |

Sobre o ISP: aparece de forma sutil no `UsuarioRepository`, que expõe apenas as operações necessárias ao `AuthService` (`buscarPorEmail`, `buscarPorId`, `criar`), sem listar ou remover usuários, o que não faz sentido para o fluxo de autenticação.

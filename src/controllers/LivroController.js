
class LivroController {
  constructor(livroService) {
    this.livroService = livroService;
  }

  listar = async (req, res, next) => {
    try {
      const filtros = {
        titulo: req.query.titulo,
        autor: req.query.autor,
        disponivel: req.query.disponivel !== undefined
          ? req.query.disponivel === 'true'
          : undefined,
      };
      const livros = await this.livroService.listar(filtros);
      res.json(livros);
    } catch (err) { next(err); }
  };

  buscarPorId = async (req, res, next) => {
    try {
      const livro = await this.livroService.buscarPorId(req.params.id);
      res.json(livro);
    } catch (err) { next(err); }
  };

  criar = async (req, res, next) => {
    try {
      const livro = await this.livroService.criar(req.body);
      res.status(201).json(livro);
    } catch (err) { next(err); }
  };

  atualizar = async (req, res, next) => {
    try {
      const livro = await this.livroService.atualizar(req.params.id, req.body);
      res.json(livro);
    } catch (err) { next(err); }
  };

  remover = async (req, res, next) => {
    try {
      await this.livroService.remover(req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  };
}

module.exports = LivroController;

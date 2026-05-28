class AutorController {
  constructor(autorService) {
    this.autorService = autorService;
  }

  listar = async (req, res, next) => {
    try {
      const autores = await this.autorService.listar({ nome: req.query.nome });
      res.json(autores);
    } catch (err) { next(err); }
  };

  buscarPorId = async (req, res, next) => {
    try {
      const autor = await this.autorService.buscarPorId(req.params.id);
      res.json(autor);
    } catch (err) { next(err); }
  };

  criar = async (req, res, next) => {
    try {
      const autor = await this.autorService.criar(req.body);
      res.status(201).json(autor);
    } catch (err) { next(err); }
  };

  atualizar = async (req, res, next) => {
    try {
      const autor = await this.autorService.atualizar(req.params.id, req.body);
      res.json(autor);
    } catch (err) { next(err); }
  };

  remover = async (req, res, next) => {
    try {
      await this.autorService.remover(req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  };
}

module.exports = AutorController;

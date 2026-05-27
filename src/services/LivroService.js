const { NotFoundError, ValidationError } = require('../utils/errors');

class LivroService {
  constructor(livroRepository, autorRepository) {
    this.livroRepository = livroRepository;
    this.autorRepository = autorRepository;
  }

  async listar(filtros) {
    return this.livroRepository.listar(filtros);
  }

  async buscarPorId(id) {
    const livro = await this.livroRepository.buscarPorId(id);
    if (!livro) {
      throw new NotFoundError(`Livro com id ${id} não encontrado`);
    }
    return livro;
  }

  async criar(dados) {
    this._validar(dados);

    const autor = await this.autorRepository.buscarPorId(dados.autor);
    if (!autor) {
      throw new ValidationError(`Autor com id ${dados.autor} não existe`);
    }

    return this.livroRepository.criar(dados);
  }

  async atualizar(id, dados) {
    const existente = await this.livroRepository.buscarPorId(id);
    if (!existente) {
      throw new NotFoundError(`Livro com id ${id} não encontrado`);
    }

    if (dados.autor) {
      const autor = await this.autorRepository.buscarPorId(dados.autor);
      if (!autor) {
        throw new ValidationError(`Autor com id ${dados.autor} não existe`);
      }
    }

    return this.livroRepository.atualizar(id, dados);
  }

  async remover(id) {
    const removido = await this.livroRepository.remover(id);
    if (!removido) {
      throw new NotFoundError(`Livro com id ${id} não encontrado`);
    }
  }

  _validar(dados) {
    if (!dados.titulo || dados.titulo.trim() === '') {
      throw new ValidationError('Título é obrigatório');
    }
    if (!dados.autor) {
      throw new ValidationError('Autor é obrigatório');
    }
    if (dados.anoPublicacao !== undefined && dados.anoPublicacao !== null) {
      const ano = Number(dados.anoPublicacao);
      if (Number.isNaN(ano) || ano < 0 || ano > 9999) {
        throw new ValidationError('Ano de publicação inválido');
      }
    }
  }
}

module.exports = LivroService;

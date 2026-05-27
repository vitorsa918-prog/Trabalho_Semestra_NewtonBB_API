const { NotFoundError, ValidationError } = require('../utils/errors');

class AutorService {
  constructor(autorRepository) {
    this.autorRepository = autorRepository;
  }

  async listar(filtros) {
    return this.autorRepository.listar(filtros);
  }

  async buscarPorId(id) {
    const autor = await this.autorRepository.buscarPorId(id);
    if (!autor) {
      throw new NotFoundError(`Autor com id ${id} não encontrado`);
    }
    return autor;
  }

  async criar(dados) {
    this._validar(dados);
    return this.autorRepository.criar(dados);
  }

  async atualizar(id, dados) {
    const existente = await this.autorRepository.buscarPorId(id);
    if (!existente) {
      throw new NotFoundError(`Autor com id ${id} não encontrado`);
    }
    return this.autorRepository.atualizar(id, dados);
  }

  async remover(id) {
    const removido = await this.autorRepository.remover(id);
    if (!removido) {
      throw new NotFoundError(`Autor com id ${id} não encontrado`);
    }
  }

  _validar(dados) {
    if (!dados.nome || dados.nome.trim() === '') {
      throw new ValidationError('Nome do autor é obrigatório');
    }
    if (dados.anoNascimento !== undefined && dados.anoNascimento !== null) {
      const ano = Number(dados.anoNascimento);
      if (Number.isNaN(ano) || ano < 0 || ano > 9999) {
        throw new ValidationError('Ano de nascimento inválido');
      }
    }
  }
}

module.exports = AutorService;

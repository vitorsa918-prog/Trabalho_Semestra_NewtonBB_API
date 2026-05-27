const Autor = require('../models/Autor');

class AutorRepository {
  async listar(filtros = {}) {
    const query = {};
    if (filtros.nome) query.nome = new RegExp(filtros.nome, 'i');
    return Autor.find(query).sort({ nome: 1 });
  }

  async buscarPorId(id) {
    return Autor.findById(id);
  }

  async criar(dados) {
    return Autor.create(dados);
  }

  async atualizar(id, dados) {
    return Autor.findByIdAndUpdate(id, dados, { new: true, runValidators: true });
  }

  async remover(id) {
    return Autor.findByIdAndDelete(id);
  }
}

module.exports = AutorRepository;

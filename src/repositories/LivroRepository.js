const Livro = require('../models/Livro');
const ILivroRepository = require('./ILivroRepository');

class LivroRepository extends ILivroRepository {
  async listar(filtros = {}) {
    const query = {};
    if (filtros.titulo) query.titulo = new RegExp(filtros.titulo, 'i');
    if (filtros.autor) query.autor = filtros.autor;
    if (filtros.disponivel !== undefined) query.disponivel = filtros.disponivel;

    return Livro.find(query).populate('autor', 'nome nacionalidade').sort({ createdAt: -1 });
  }

  async buscarPorId(id) {
    return Livro.findById(id).populate('autor', 'nome nacionalidade');
  }

  async criar(dados) {
    const livro = await Livro.create(dados);
    return livro.populate('autor', 'nome nacionalidade');
  }

  async atualizar(id, dados) {
    return Livro.findByIdAndUpdate(id, dados, { new: true, runValidators: true })
      .populate('autor', 'nome nacionalidade');
  }

  async remover(id) {
    return Livro.findByIdAndDelete(id);
  }
}

module.exports = LivroRepository;

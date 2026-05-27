
class ILivroRepository {

  async listar(filtros = {}) { throw new Error('Not implemented'); }
  async buscarPorId(id) { throw new Error('Not implemented'); }
  async criar(dados) { throw new Error('Not implemented'); }
  async atualizar(id, dados) { throw new Error('Not implemented'); }
  async remover(id) { throw new Error('Not implemented'); }
}

module.exports = ILivroRepository;

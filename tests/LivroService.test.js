const LivroService = require('../src/services/LivroService');
const { NotFoundError, ValidationError } = require('../src/utils/errors');


describe('LivroService', () => {
  let livroRepo;
  let autorRepo;
  let service;

  beforeEach(() => {
    livroRepo = {
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      remover: jest.fn(),
    };
    autorRepo = {
      buscarPorId: jest.fn(),
    };
    service = new LivroService(livroRepo, autorRepo);
  });


  test('criar() deve persistir um livro quando todos os dados são válidos', async () => {
    autorRepo.buscarPorId.mockResolvedValue({ id: 'autor1', nome: 'Machado' });
    const livroCriado = { id: 'livro1', titulo: 'Dom Casmurro', autor: 'autor1' };
    livroRepo.criar.mockResolvedValue(livroCriado);

    const result = await service.criar({
      titulo: 'Dom Casmurro',
      autor: 'autor1',
      anoPublicacao: 1899,
    });

    expect(result).toEqual(livroCriado);
    expect(autorRepo.buscarPorId).toHaveBeenCalledWith('autor1');
    expect(livroRepo.criar).toHaveBeenCalledTimes(1);
  });

  test('buscarPorId() deve retornar o livro encontrado', async () => {
    const livro = { id: 'livro1', titulo: 'Memórias Póstumas' };
    livroRepo.buscarPorId.mockResolvedValue(livro);

    const result = await service.buscarPorId('livro1');

    expect(result).toEqual(livro);
    expect(livroRepo.buscarPorId).toHaveBeenCalledWith('livro1');
  });


  test('criar() deve lançar ValidationError quando o título estiver vazio', async () => {
    await expect(
      service.criar({ titulo: '', autor: 'autor1' })
    ).rejects.toThrow(ValidationError);

    expect(livroRepo.criar).not.toHaveBeenCalled();
  });

  test('buscarPorId() deve lançar NotFoundError quando o livro não existe', async () => {
    livroRepo.buscarPorId.mockResolvedValue(null);

    await expect(service.buscarPorId('inexistente')).rejects.toThrow(NotFoundError);
  });

  test('criar() deve lançar ValidationError quando o autor referenciado não existe', async () => {
    autorRepo.buscarPorId.mockResolvedValue(null);

    await expect(
      service.criar({ titulo: 'Algo', autor: 'inexistente' })
    ).rejects.toThrow(ValidationError);

    expect(livroRepo.criar).not.toHaveBeenCalled();
  });
});

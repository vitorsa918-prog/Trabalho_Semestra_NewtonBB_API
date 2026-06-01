const AutorService = require('../src/services/AutorService');
const { NotFoundError, ValidationError } = require('../src/utils/errors');

describe('AutorService', () => {
  let autorRepo;
  let service;

  beforeEach(() => {
    autorRepo = {
      listar: jest.fn(),
      buscarPorId: jest.fn(),
      criar: jest.fn(),
      atualizar: jest.fn(),
      remover: jest.fn(),
    };
    service = new AutorService(autorRepo);
  });

  test('criar() deve persistir o autor com dados válidos', async () => {
    const autor = { id: 'autor1', nome: 'Clarice Lispector' };
    autorRepo.criar.mockResolvedValue(autor);

    const result = await service.criar({
      nome: 'Clarice Lispector',
      nacionalidade: 'Brasileira',
    });

    expect(result).toEqual(autor);
    expect(autorRepo.criar).toHaveBeenCalledTimes(1);
  });

  test('listar() deve retornar a lista do repositório', async () => {
    autorRepo.listar.mockResolvedValue([{ id: '1' }, { id: '2' }]);

    const result = await service.listar({});

    expect(result).toHaveLength(2);
  });

  test('criar() deve lançar ValidationError quando nome estiver ausente', async () => {
    await expect(service.criar({})).rejects.toThrow(ValidationError);
    expect(autorRepo.criar).not.toHaveBeenCalled();
  });

  test('atualizar() deve lançar NotFoundError quando autor não existe', async () => {
    autorRepo.buscarPorId.mockResolvedValue(null);

    await expect(
      service.atualizar('inexistente', { nome: 'X' })
    ).rejects.toThrow(NotFoundError);

    expect(autorRepo.atualizar).not.toHaveBeenCalled();
  });
});

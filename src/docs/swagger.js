const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Biblioteca Newton Paiva API',
      version: '1.0.0',
      description:
        'API REST para gestão de uma biblioteca. Permite gerenciar Livros e Autores, '
        + 'com autenticação JWT e controle de acesso por perfis (admin / usuario).',
      contact: { name: 'Trabalho Prático Semestral - Arquitetura de Aplicações Web' },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Servidor local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Autor: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '65f0c8a1b2d3e4f5a6b7c8d9' },
            nome: { type: 'string', example: 'Machado de Assis' },
            nacionalidade: { type: 'string', example: 'Brasileira' },
            anoNascimento: { type: 'integer', example: 1839 },
            biografia: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AutorInput: {
          type: 'object',
          required: ['nome'],
          properties: {
            nome: { type: 'string' },
            nacionalidade: { type: 'string' },
            anoNascimento: { type: 'integer' },
            biografia: { type: 'string' },
          },
        },
        Livro: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            titulo: { type: 'string', example: 'Dom Casmurro' },
            isbn: { type: 'string', example: '978-85-359-0277-5' },
            anoPublicacao: { type: 'integer', example: 1899 },
            genero: { type: 'string', example: 'Romance' },
            sinopse: { type: 'string' },
            disponivel: { type: 'boolean' },
            autor: {
              oneOf: [
                { type: 'string' },
                { $ref: '#/components/schemas/Autor' },
              ],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LivroInput: {
          type: 'object',
          required: ['titulo', 'autor'],
          properties: {
            titulo: { type: 'string' },
            isbn: { type: 'string' },
            anoPublicacao: { type: 'integer' },
            genero: { type: 'string' },
            sinopse: { type: 'string' },
            disponivel: { type: 'boolean' },
            autor: { type: 'string', description: 'ID do autor' },
          },
        },
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            nome: { type: 'string' },
            email: { type: 'string' },
            perfil: { type: 'string', enum: ['admin', 'usuario'] },
          },
        },
        Erro: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },

  apis: [
    path.join(__dirname, '..', 'routes', 'auth.js'),
    path.join(__dirname, '..', 'routes', 'autores.js'),
    path.join(__dirname, '..', 'routes', 'livros.js'),
  ],
};

module.exports = swaggerJSDoc(options);

const express = require('express');

const LivroRepository = require('../repositories/LivroRepository');
const AutorRepository = require('../repositories/AutorRepository');
const LivroService = require('../services/LivroService');
const LivroController = require('../controllers/LivroController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

const livroService = new LivroService(new LivroRepository(), new AutorRepository());
const controller = new LivroController(livroService);

const auth = authMiddleware(process.env.JWT_SECRET);

/**
 * @openapi
 * tags:
 *   - name: Livros
 *     description: Operações sobre livros do acervo
 */

/**
 * @openapi
 * /api/livros:
 *   get:
 *     summary: Lista livros do acervo
 *     tags: [Livros]
 *     parameters:
 *       - in: query
 *         name: titulo
 *         schema: { type: string }
 *         description: Filtro parcial por título (case-insensitive)
 *       - in: query
 *         name: autor
 *         schema: { type: string }
 *         description: ID do autor para filtrar
 *       - in: query
 *         name: disponivel
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de livros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Livro' }
 */
router.get('/', controller.listar);

/**
 * @openapi
 * /api/livros/{id}:
 *   get:
 *     summary: Busca um livro pelo ID
 *     tags: [Livros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Livro encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Livro' }
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', controller.buscarPorId);

/**
 * @openapi
 * /api/livros:
 *   post:
 *     summary: Cria um livro
 *     tags: [Livros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LivroInput' }
 *           example:
 *             titulo: "Dom Casmurro"
 *             isbn: "978-85-359-0277-5"
 *             anoPublicacao: 1899
 *             genero: "Romance"
 *             sinopse: "O ciúme de Bentinho."
 *             disponivel: true
 *             autor: "65f0c8a1b2d3e4f5a6b7c8d9"
 *     responses:
 *       201: { description: Criado }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autenticado }
 */
router.post('/', auth, controller.criar);

/**
 * @openapi
 * /api/livros/{id}:
 *   put:
 *     summary: Atualiza um livro existente
 *     tags: [Livros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LivroInput' }
 *     responses:
 *       200: { description: Atualizado }
 *       401: { description: Não autenticado }
 *       404: { description: Não encontrado }
 */
router.put('/:id', auth, controller.atualizar);

/**
 * @openapi
 * /api/livros/{id}:
 *   delete:
 *     summary: Remove um livro (apenas admin)
 *     tags: [Livros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Removido com sucesso }
 *       401: { description: Não autenticado }
 *       403: { description: Acesso negado (requer admin) }
 *       404: { description: Não encontrado }
 */
router.delete('/:id', auth, requireRole('admin'), controller.remover);

module.exports = router;

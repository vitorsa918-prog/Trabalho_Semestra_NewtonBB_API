const express = require('express');

const AutorRepository = require('../repositories/AutorRepository');
const AutorService = require('../services/AutorService');
const AutorController = require('../controllers/AutorController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

const autorService = new AutorService(new AutorRepository());
const controller = new AutorController(autorService);

const auth = authMiddleware(process.env.JWT_SECRET);

/**
 * @openapi
 * tags:
 *   - name: Autores
 *     description: Operações sobre autores
 */

/**
 * @openapi
 * /api/autores:
 *   get:
 *     summary: Lista autores
 *     tags: [Autores]
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de autores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Autor' }
 */
router.get('/', controller.listar);

/**
 * @openapi
 * /api/autores/{id}:
 *   get:
 *     summary: Busca um autor pelo ID
 *     tags: [Autores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Autor encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Autor' }
 *       404: { description: Não encontrado }
 */
router.get('/:id', controller.buscarPorId);

/**
 * @openapi
 * /api/autores:
 *   post:
 *     summary: Cria um autor
 *     tags: [Autores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AutorInput' }
 *           example:
 *             nome: "Machado de Assis"
 *             nacionalidade: "Brasileira"
 *             anoNascimento: 1839
 *             biografia: "Escritor brasileiro."
 *     responses:
 *       201: { description: Criado }
 *       400: { description: Dados inválidos }
 *       401: { description: Não autenticado }
 */
router.post('/', auth, controller.criar);

/**
 * @openapi
 * /api/autores/{id}:
 *   put:
 *     summary: Atualiza um autor
 *     tags: [Autores]
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
 *           schema: { $ref: '#/components/schemas/AutorInput' }
 *     responses:
 *       200: { description: Atualizado }
 *       401: { description: Não autenticado }
 *       404: { description: Não encontrado }
 */
router.put('/:id', auth, controller.atualizar);

/**
 * @openapi
 * /api/autores/{id}:
 *   delete:
 *     summary: Remove um autor (apenas admin)
 *     tags: [Autores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Removido }
 *       401: { description: Não autenticado }
 *       403: { description: Acesso negado (requer admin) }
 *       404: { description: Não encontrado }
 */
router.delete('/:id', auth, requireRole('admin'), controller.remover);

module.exports = router;

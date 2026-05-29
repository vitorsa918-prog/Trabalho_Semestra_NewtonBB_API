const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./docs/swagger');
const livroRoutes = require('./routes/livros');
const autorRoutes = require('./routes/autores');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, '..', 'public')));


app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Biblioteca Newton API - Swagger',
}));


app.use('/api/auth', authRoutes);
app.use('/api/livros', livroRoutes);
app.use('/api/autores', autorRoutes);


app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


app.use(errorHandler);

module.exports = app;

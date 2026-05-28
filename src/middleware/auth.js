const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

function authMiddleware(jwtSecret) {
  return (req, _res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next(new UnauthorizedError('Token não fornecido'));
    }

    try {
      const payload = jwt.verify(token, jwtSecret);
      req.user = payload;
      return next();
    } catch (err) {
      return next(new UnauthorizedError('Token inválido ou expirado'));
    }
  };
}


function requireRole(...perfisPermitidos) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!perfisPermitidos.includes(req.user.perfil)) {
      return next(new ForbiddenError('Permissão insuficiente para esta operação'));
    }
    return next();
  };
}

module.exports = { authMiddleware, requireRole };

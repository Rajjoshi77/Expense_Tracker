import { verifyToken } from '../lib/jwt.js';

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Request is not authorized' });
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Request is not authorized' });
  }
}

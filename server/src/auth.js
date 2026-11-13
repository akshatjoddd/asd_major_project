import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'museumx-secret-key-2026';

export function signAdminToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role || 'admin',
      name: admin.name || 'Staff',
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

export function signUserToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || null,
      role: 'user',
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
  }

  const token = header.slice(7).trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin' && payload.role !== 'gate') {
      return res.status(403).json({ error: 'Admin access required', code: 'FORBIDDEN' });
    }
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'UNAUTHORIZED' });
  }
}

export function requireUser(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Please log in to continue', code: 'UNAUTHORIZED' });
  }

  const token = header.slice(7).trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token', code: 'UNAUTHORIZED' });
  }
}

export function optionalUser(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7).trim();
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
    }
  }
  next();
}

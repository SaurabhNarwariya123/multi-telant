import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Agency from '../models/Agency.js';
import Activity from '../models/Activity.js';

const SUSPENDED_MESSAGE = 'This agency account is suspended. Please contact the platform administrator.';

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      agencyId: user.agencyId,
      clientId: user.clientId,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Independent lookups run in parallel (one round trip instead of up to three in a row).
    const supportAgencyId = req.headers['x-support-agency'];
    const [user, ownAgency, supportAgency] = await Promise.all([
      User.findById(payload.id),
      payload.agencyId ? Agency.findById(payload.agencyId).select('status').lean() : null,
      supportAgencyId ? Agency.findById(supportAgencyId).select('status').lean().catch(() => null) : null,
    ]);
    if (!user) return res.status(401).json({ message: 'User not found' });

    if (user.role !== 'superadmin') {
      const agency = String(user.agencyId) === String(payload.agencyId)
        ? ownAgency
        : await Agency.findById(user.agencyId).select('status').lean();
      if (!agency || agency.status === 'suspended') {
        return res.status(403).json({ message: SUSPENDED_MESSAGE });
      }
    }

    if (supportAgencyId) {
      if (user.role !== 'superadmin') return res.status(403).json({ message: 'Access denied' });
      const agency = supportAgency;
      if (!agency) return res.status(404).json({ message: 'Agency not found' });
      // Support mode: the super admin acts as an agency admin inside this one agency (view, edit, delete).
      // Every successful write is recorded in that agency's activity log as a `support_action`.
      req.user = { ...user.toObject(), role: 'admin', agencyId: agency._id, isSupport: true };
      if (req.method !== 'GET') {
        res.on('finish', () => {
          if (res.statusCode >= 400) return;
          Activity.create({
            agencyId: agency._id,
            actorId: user._id,
            actorName: user.name,
            eventType: 'support_action',
            entityType: 'support',
            message: `${user.name} (Super Admin, support mode) performed ${req.method} ${req.baseUrl}${req.path}`,
            metadata: { method: req.method, path: `${req.baseUrl}${req.path}`, status: res.statusCode },
          }).catch((error) => console.error(`Support audit log failed: ${error.message}`));
        });
      }
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const allow = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

export { signToken, protect, allow, SUSPENDED_MESSAGE };

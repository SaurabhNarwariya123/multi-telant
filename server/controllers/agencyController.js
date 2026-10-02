import bcrypt from 'bcryptjs';
import Agency from '../models/Agency.js';
import User from '../models/User.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import { logAgencyEvent } from './activityController.js';

const PAGE_SIZE = 20;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const countBy = async (Model, agencyIds, extra = {}) => {
  const rows = await Model.aggregate([
    { $match: { agencyId: { $in: agencyIds }, ...extra } },
    { $group: { _id: '$agencyId', count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((row) => [String(row._id), row.count]));
};

const getOwners = async (agencyIds) => {
  const admins = await User.find({ agencyId: { $in: agencyIds }, role: 'admin' }).sort('createdAt').select('name email agencyId');
  const owners = {};
  for (const admin of admins) {
    const key = String(admin.agencyId);
    if (!owners[key]) owners[key] = { name: admin.name, email: admin.email };
  }
  return owners;
};

const getAgencies = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = String(req.query.status);

    if (req.query.search) {
      const pattern = new RegExp(escapeRegex(String(req.query.search)), 'i');
      const ownerAgencyIds = await User.find({ role: 'admin', $or: [{ email: pattern }, { name: pattern }] }).distinct('agencyId');
      filter.$or = [{ name: pattern }, { _id: { $in: ownerAgencyIds } }];
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const [total, agencies] = await Promise.all([
      Agency.countDocuments(filter),
      Agency.find(filter)
        .sort('-createdAt')
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE),
    ]);

    const ids = agencies.map((agency) => agency._id);
    const [owners, users, clients, projects] = await Promise.all([
      getOwners(ids),
      countBy(User, ids),
      countBy(Client, ids),
      countBy(Project, ids),
    ]);

    const items = agencies.map((agency) => {
      const key = String(agency._id);
      return {
        ...agency.toObject(),
        owner: owners[key] || null,
        counts: { users: users[key] || 0, clients: clients[key] || 0, projects: projects[key] || 0 },
      };
    });

    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) });
  } catch (error) {
    next(error);
  }
};

const postAgency = async (req, res, next) => {
  try {
    const { agencyName, ownerName, email, password } = req.body;
    if (!agencyName || !ownerName || !email || !password) {
      return res.status(400).json({ message: 'Agency name, owner name, email and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return res.status(400).json({ message: 'Enter a valid email address' });
    if (String(password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (await User.exists({ email: String(email).toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });

    const agency = await Agency.create({ name: agencyName });
    const owner = await User.create({
      name: ownerName,
      email,
      password: await bcrypt.hash(String(password), await bcrypt.genSalt(12)),
      role: 'admin',
      agencyId: agency._id,
    });
    await logAgencyEvent({
      actor: req.user,
      agencyId: agency._id,
      eventType: 'agency_created',
      message: `Agency "${agency.name}" was created by Super Admin`,
    });
    res.status(201).json({ agency, owner: { name: owner.name, email: owner.email } });
  } catch (error) {
    next(error);
  }
};

const getAgencyDetail = async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.params.id);
    if (!agency) return res.status(404).json({ message: 'Agency not found' });

    const [users, clients, projects, activity] = await Promise.all([
      User.find({ agencyId: agency._id }).sort('createdAt'),
      Client.find({ agencyId: agency._id }),
      Project.find({ agencyId: agency._id }).sort('-createdAt'),
      Activity.find({ agencyId: agency._id }).sort('-createdAt').limit(15),
    ]);
    const owner = users.find((user) => user.role === 'admin');

    res.json({
      agency,
      owner: owner ? { name: owner.name, email: owner.email } : null,
      users,
      clients,
      projects,
      activity,
    });
  } catch (error) {
    next(error);
  }
};

const updateAgencyStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const existing = await Agency.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Agency not found' });

    const agency = await Agency.findByIdAndUpdate(existing._id, { status }, { new: true });
    if (existing.status !== status) {
      await logAgencyEvent({
        actor: req.user,
        agencyId: agency._id,
        eventType: 'agency_status_changed',
        message: `Agency "${agency.name}" was ${status === 'suspended' ? 'suspended' : 'activated'}`,
        metadata: { from: existing.status, to: status },
      });
    }
    res.json(agency);
  } catch (error) {
    next(error);
  }
};

// Recorded when a super admin enters an agency's support view.
const postSupportSession = async (req, res, next) => {
  try {
    const agency = await Agency.findById(req.params.id);
    if (!agency) return res.status(404).json({ message: 'Agency not found' });

    await logAgencyEvent({
      actor: req.user,
      agencyId: agency._id,
      eventType: 'support_session_started',
      message: `${req.user.name} (Super Admin) opened "${agency.name}" in support mode`,
    });
    res.json({ agency });
  } catch (error) {
    next(error);
  }
};

const getAgencyStats = async (req, res, next) => {
  try {
    const [agencies, activeAgencies, users, clients, projects] = await Promise.all([
      Agency.countDocuments(),
      Agency.countDocuments({ status: 'active' }),
      User.countDocuments({ role: { $ne: 'superadmin' } }),
      Client.countDocuments(),
      Project.countDocuments(),
    ]);
    res.json({ agencies, activeAgencies, inactiveAgencies: agencies - activeAgencies, users, clients, projects });
  } catch (error) {
    next(error);
  }
};

const getPlatformActivity = async (req, res, next) => {
  try {
    const activity = await Activity.find().sort('-createdAt').limit(50).populate('agencyId', 'name');
    res.json(activity);
  } catch (error) {
    next(error);
  }
};

export { postAgency, getAgencies, getAgencyDetail, updateAgencyStatus, postSupportSession, getAgencyStats, getPlatformActivity };

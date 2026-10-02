import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Client from '../models/Client.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { logAgencyEvent } from './activityController.js';

const creatableRoles = ['admin', 'member', 'client'];

const getUsers = async (req, res, next) => {
  try {
    const filter = { agencyId: req.user.agencyId };
    if (req.query.role) filter.role = String(req.query.role);

    const users = await User.find(filter).sort('-createdAt');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getTeamMembers = async (req, res, next) => {
  try {
    const members = await User.find({ agencyId: req.user.agencyId, role: { $in: ['admin', 'member'] } })
      .select('name role')
      .sort('name');
    res.json(members);
  } catch (error) {
    next(error);
  }
};

const postUser = async (req, res, next) => {
  try {
    const { name, email, password, role, clientId } = req.body;
    if (!creatableRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (!password || String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    if (role === 'client') {
      if (!clientId) return res.status(400).json({ message: 'clientId is required for client users' });
      if (!(await Client.exists({ _id: clientId, agencyId: req.user.agencyId }))) {
        return res.status(400).json({ message: 'Invalid clientId' });
      }
    }

    const salt = await bcrypt.genSalt(12);
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(String(password), salt),
      role,
      clientId: role === 'client' ? clientId : undefined,
      agencyId: req.user.agencyId,
    });
    await logAgencyEvent({
      actor: req.user,
      agencyId: req.user.agencyId,
      eventType: 'user_created',
      entityType: 'user',
      entityId: user._id,
      message: `${user.name} was added as ${user.role}`,
    });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, role, password } = req.body;
    if (password && String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (role && !['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Role can only be changed between admin and member' });
    }

    const user = await User.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (role && user.role === 'client') return res.status(400).json({ message: 'Client role cannot be changed' });
    if (role === 'member' && user.role === 'admin') {
      const otherAdmins = await User.countDocuments({ agencyId: req.user.agencyId, role: 'admin', _id: { $ne: user._id } });
      if (!otherAdmins) return res.status(400).json({ message: 'An agency needs at least one admin' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (password) user.password = await bcrypt.hash(String(password), await bcrypt.genSalt(12));
    await user.save();

    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findOneAndDelete({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Release work that pointed at the removed person.
    await Task.updateMany({ agencyId: req.user.agencyId, assigneeId: user._id }, { $unset: { assigneeId: 1 } });
    await Project.updateMany({ agencyId: req.user.agencyId, managerId: user._id }, { $unset: { managerId: 1 } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const seedSuperAdmin = async () => {
  if (await User.exists({ role: 'superadmin' })) return;

  const salt = await bcrypt.genSalt(12);
  await User.create({
    name: process.env.SUPER_ADMIN_NAME,
    email: process.env.SUPER_ADMIN_EMAIL,
    password: await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, salt),
    role: 'superadmin',
  });
};

export { getUsers, getTeamMembers, postUser, updateUser, deleteUser, seedSuperAdmin };

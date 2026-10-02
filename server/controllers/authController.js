import bcrypt from 'bcryptjs';
import Agency from '../models/Agency.js';
import User from '../models/User.js';
import Client from '../models/Client.js';
import { signToken, SUSPENDED_MESSAGE } from '../middleware/auth.js';
import { logAgencyEvent } from './activityController.js';

const MIN_PASSWORD_LENGTH = 8;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendSession = (res, user, status = 200) =>
  res.status(status).json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });

const postRegisterAgency = async (req, res, next) => {
  try {
    const { agencyName, name, email, password } = req.body;
    if (!agencyName || !name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!emailPattern.test(String(email))) return res.status(400).json({ message: 'Enter a valid email address' });
    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }
    if (await User.exists({ email: String(email).toLowerCase() })) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const agency = await Agency.create({ name: agencyName });
    const salt = await bcrypt.genSalt(12);
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(String(password), salt),
      role: 'admin',
      agencyId: agency._id,
    });
    await logAgencyEvent({
      actor: user,
      agencyId: agency._id,
      eventType: 'agency_created',
      message: `Agency "${agency.name}" was created`,
    });
    sendSession(res, user, 201);
  } catch (error) {
    next(error);
  }
};

const postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(String(password), user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.role !== 'superadmin') {
      const agency = await Agency.findById(user.agencyId);
      if (!agency || agency.status === 'suspended') return res.status(403).json({ message: SUSPENDED_MESSAGE });
    }
    sendSession(res, user);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const { _id, name, email, role, agencyId, clientId } = req.user;
    const client = role === 'client' ? await Client.findOne({ _id: clientId, agencyId }) : null;
    res.json({ id: _id, name, email, role, agencyId, clientId, company: client?.company });
  } catch (error) {
    next(error);
  }
};

export { postRegisterAgency, postLogin, getMe };

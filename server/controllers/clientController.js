import Client from '../models/Client.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find({ agencyId: req.user.agencyId }).sort('-createdAt');
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

const getClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const projects = await Project.find({ agencyId: req.user.agencyId, clientId: client._id }).sort('-createdAt');
    const activity = await Activity.find({ agencyId: req.user.agencyId, projectId: { $in: projects.map((project) => project._id) } })
      .sort('-createdAt')
      .limit(30);
    res.json({ client, projects, activity });
  } catch (error) {
    next(error);
  }
};

const postClient = async (req, res, next) => {
  try {
    const { company, contactName, email, phone, notes } = req.body;
    const client = await Client.create({ agencyId: req.user.agencyId, company, contactName, email, phone, notes });
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const { company, contactName, email, phone, notes } = req.body;
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, agencyId: req.user.agencyId },
      { company, contactName, email, phone, notes },
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    next(error);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (await Project.exists({ agencyId: req.user.agencyId, clientId: client._id })) {
      return res.status(409).json({ message: "Delete or reassign this client's projects first" });
    }
    await User.deleteMany({ agencyId: req.user.agencyId, clientId: client._id, role: 'client' });
    await client.deleteOne();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export { getClients, getClient, postClient, updateClient, deleteClient };

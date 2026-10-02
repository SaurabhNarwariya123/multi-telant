import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Milestone from '../models/Milestone.js';
import Client from '../models/Client.js';
import User from '../models/User.js';
import Meeting from '../models/Meeting.js';
import Feedback from '../models/Feedback.js';
import ProjectFile from '../models/ProjectFile.js';
import Activity from '../models/Activity.js';
import cloudinary from '../config/cloudinary.js';
import { logActivity } from './activityController.js';

const progressOf = ({ total = 0, done = 0 } = {}) => (total ? Math.round((done / total) * 100) : 0);

const findAccessibleProject = (user, projectId) => {
  const filter = { _id: projectId, agencyId: user.agencyId };
  if (user.role === 'client') filter.clientId = user.clientId;
  return Project.findOne(filter);
};

const getProgressByProject = async (projectIds) => {
  const stats = await Task.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    {
      $group: {
        _id: '$projectId',
        total: { $sum: 1 },
        done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
      },
    },
  ]);
  return Object.fromEntries(stats.map((item) => [String(item._id), progressOf(item)]));
};

const getProjects = async (req, res, next) => {
  try {
    const filter = { agencyId: req.user.agencyId };
    if (req.user.role === 'client') filter.clientId = req.user.clientId;
    if (req.query.status) filter.status = String(req.query.status);
    if (req.query.clientId && req.user.role !== 'client') filter.clientId = String(req.query.clientId);

    const projects = await Project.find(filter).sort('-createdAt');
    const progressById = await getProgressByProject(projects.map((project) => project._id));

    res.json(projects.map((project) => ({ ...project.toObject(), progress: progressById[project._id] || 0 })));
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await findAccessibleProject(req.user, req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const progressById = await getProgressByProject([project._id]);
    const [taskCount, milestoneCount, nextMilestone] = await Promise.all([
      Task.countDocuments({ projectId: project._id }),
      Milestone.countDocuments({ projectId: project._id }),
      Milestone.findOne({ projectId: project._id, status: { $ne: 'completed' } }).sort('dueDate'),
    ]);

    res.json({
      ...project.toObject(),
      progress: progressById[project._id] || 0,
      taskCount: req.user.role === 'client' ? undefined : taskCount,
      milestoneCount,
      nextMilestone,
    });
  } catch (error) {
    next(error);
  }
};

const postProject = async (req, res, next) => {
  try {
    const { clientId, managerId, name, description, status, priority, startDate, dueDate } = req.body;

    if (!(await Client.exists({ _id: clientId, agencyId: req.user.agencyId }))) {
      return res.status(400).json({ message: 'Invalid clientId' });
    }
    if (managerId && !(await User.exists({ _id: managerId, agencyId: req.user.agencyId, role: { $in: ['admin', 'member'] } }))) {
      return res.status(400).json({ message: 'Invalid managerId' });
    }

    const project = await Project.create({
      agencyId: req.user.agencyId,
      clientId,
      managerId,
      name,
      description,
      status,
      priority,
      startDate,
      dueDate,
    });

    await logActivity({
      user: req.user,
      projectId: project._id,
      eventType: 'project_created',
      entityType: 'project',
      entityId: project._id,
      message: `Project "${project.name}" created`,
      visibility: 'client',
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { clientId, managerId, name, description, status, priority, startDate, dueDate } = req.body;

    if (clientId && !(await Client.exists({ _id: clientId, agencyId: req.user.agencyId }))) {
      return res.status(400).json({ message: 'Invalid clientId' });
    }
    if (managerId && !(await User.exists({ _id: managerId, agencyId: req.user.agencyId, role: { $in: ['admin', 'member'] } }))) {
      return res.status(400).json({ message: 'Invalid managerId' });
    }

    const existing = await Project.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!existing) return res.status(404).json({ message: 'Project not found' });
    const previousStatus = existing.status;

    const project = await Project.findOneAndUpdate(
      { _id: existing._id, agencyId: req.user.agencyId },
      { clientId, managerId, name, description, status, priority, startDate, dueDate, ...(status && status !== previousStatus && { clientApprovedAt: null }) },
      { new: true, runValidators: true }
    );

    if (status && status !== previousStatus) {
      await logActivity({
        user: req.user,
        projectId: project._id,
        eventType: 'status_changed',
        entityType: 'project',
        entityId: project._id,
        message: `Status changed from ${previousStatus} to ${project.status}`,
        visibility: 'client',
        metadata: { from: previousStatus, to: project.status },
      });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Task.deleteMany({ projectId: project._id, agencyId: req.user.agencyId });
    await Milestone.deleteMany({ projectId: project._id, agencyId: req.user.agencyId });
    await Meeting.deleteMany({ projectId: project._id, agencyId: req.user.agencyId });
    await Feedback.deleteMany({ projectId: project._id, agencyId: req.user.agencyId });
    await Activity.deleteMany({ projectId: project._id, agencyId: req.user.agencyId });

    const files = await ProjectFile.find({ projectId: project._id, agencyId: req.user.agencyId });
    await ProjectFile.deleteMany({ projectId: project._id, agencyId: req.user.agencyId });
    await Promise.all(
      files.map((file) =>
        cloudinary.uploader.destroy(file.publicId, { resource_type: file.resourceType, type: 'authenticated' }).catch(() => {})
      )
    );
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const postApproveProject = async (req, res, next) => {
  try {
    const project = await findAccessibleProject(req.user, req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.status !== 'client_review') {
      return res.status(400).json({ message: 'Project is not waiting for client review' });
    }

    if (project.clientApprovedAt) return res.status(400).json({ message: 'Project is already approved' });
    project.clientApprovedAt = new Date();
    await project.save();

    await logActivity({
      user: req.user,
      projectId: project._id,
      eventType: 'approval_received',
      entityType: 'project',
      entityId: project._id,
      message: `${req.user.name} approved the project`,
      visibility: 'client',
    });
    res.json({ message: 'Approval recorded' });
  } catch (error) {
    next(error);
  }
};

export { findAccessibleProject, getProjects, getProject, postProject, updateProject, deleteProject, postApproveProject };

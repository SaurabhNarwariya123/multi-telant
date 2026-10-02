import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { logActivity } from './activityController.js';

const getTasks = async (req, res, next) => {
  try {
    const filter = { agencyId: req.user.agencyId };
    if (req.query.projectId) filter.projectId = String(req.query.projectId);
    if (req.query.status) filter.status = String(req.query.status);
    if (req.query.assigneeId) filter.assigneeId = String(req.query.assigneeId);

    const tasks = await Task.find(filter).sort('-createdAt');
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const postTask = async (req, res, next) => {
  try {
    const { projectId, assigneeId, title, description, status, priority, dueDate } = req.body;

    if (!(await Project.exists({ _id: projectId, agencyId: req.user.agencyId }))) {
      return res.status(400).json({ message: 'Invalid projectId' });
    }
    if (assigneeId && !(await User.exists({ _id: assigneeId, agencyId: req.user.agencyId, role: { $in: ['admin', 'member'] } }))) {
      return res.status(400).json({ message: 'Invalid assigneeId' });
    }

    const task = await Task.create({
      agencyId: req.user.agencyId,
      projectId,
      assigneeId,
      title,
      description,
      status,
      priority,
      dueDate,
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { projectId, assigneeId, title, description, status, priority, dueDate } = req.body;

    if (projectId && !(await Project.exists({ _id: projectId, agencyId: req.user.agencyId }))) {
      return res.status(400).json({ message: 'Invalid projectId' });
    }
    if (assigneeId && !(await User.exists({ _id: assigneeId, agencyId: req.user.agencyId, role: { $in: ['admin', 'member'] } }))) {
      return res.status(400).json({ message: 'Invalid assigneeId' });
    }

    const existing = await Task.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const task = await Task.findOneAndUpdate(
      { _id: existing._id, agencyId: req.user.agencyId },
      { projectId, assigneeId, title, description, status, priority, dueDate },
      { new: true, runValidators: true }
    );

    if (existing.status !== 'done' && task.status === 'done') {
      await logActivity({
        user: req.user,
        projectId: task.projectId,
        eventType: 'task_completed',
        entityType: 'task',
        entityId: task._id,
        message: `Task "${task.title}" completed`,
        visibility: 'internal',
      });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

const postTaskComment = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const task = await Task.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.comments.push({ userId: req.user._id, userName: req.user.name, message });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export { getTasks, postTask, updateTask, deleteTask, postTaskComment };

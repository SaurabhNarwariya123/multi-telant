import Milestone from '../models/Milestone.js';
import Project from '../models/Project.js';
import { findAccessibleProject } from './projectController.js';
import { logActivity } from './activityController.js';

const getMilestones = async (req, res, next) => {
  try {
    const filter = { agencyId: req.user.agencyId };
    const requested = req.query.projectId ? String(req.query.projectId) : null;

    if (req.user.role === 'client') {
      const ownIds = await Project.find({ agencyId: req.user.agencyId, clientId: req.user.clientId }).distinct('_id');
      filter.projectId = { $in: requested ? ownIds.filter((id) => String(id) === requested) : ownIds };
    } else if (requested) {
      filter.projectId = requested;
    }

    const milestones = await Milestone.find(filter).sort('dueDate');
    res.json(milestones);
  } catch (error) {
    next(error);
  }
};

const postMilestone = async (req, res, next) => {
  try {
    const { projectId, title, description, status, dueDate } = req.body;
    if (!(await findAccessibleProject(req.user, projectId))) {
      return res.status(400).json({ message: 'Invalid projectId' });
    }

    const milestone = await Milestone.create({
      agencyId: req.user.agencyId,
      projectId,
      title,
      description,
      status,
      dueDate,
      completedAt: status === 'completed' ? new Date() : undefined,
    });
    res.status(201).json(milestone);
  } catch (error) {
    next(error);
  }
};

const updateMilestone = async (req, res, next) => {
  try {
    const { title, description, status, dueDate } = req.body;

    const existing = await Milestone.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!existing) return res.status(404).json({ message: 'Milestone not found' });
    const wasCompleted = existing.status === 'completed';

    const milestone = await Milestone.findOneAndUpdate(
      { _id: existing._id, agencyId: req.user.agencyId },
      {
        title,
        description,
        status,
        dueDate,
        completedAt: status === 'completed' ? new Date() : status ? null : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!wasCompleted && milestone.status === 'completed') {
      await logActivity({
        user: req.user,
        projectId: milestone.projectId,
        eventType: 'milestone_completed',
        entityType: 'milestone',
        entityId: milestone._id,
        message: `Milestone "${milestone.title}" completed`,
        visibility: 'client',
      });
    }
    res.json(milestone);
  } catch (error) {
    next(error);
  }
};

const deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findOneAndDelete({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export { getMilestones, postMilestone, updateMilestone, deleteMilestone };

import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Feedback from '../models/Feedback.js';

const WEEK = 7 * 24 * 60 * 60 * 1000;

const getDashboard = async (req, res, next) => {
  try {
    const agencyId = req.user.agencyId;
    const now = new Date();
    const nextWeek = new Date(now.getTime() + WEEK);
    const notLaunched = { agencyId, status: { $ne: 'launched' } };

    const [totalClients, activeProjects, dueSoon, completedProjects, pendingFeedback, overdueTasks, projectsByStatus, tasksByStatus] =
      await Promise.all([
        Client.countDocuments({ agencyId }),
        Project.countDocuments(notLaunched),
        Project.countDocuments({ ...notLaunched, dueDate: { $gte: now, $lte: nextWeek } }),
        Project.countDocuments({ agencyId, status: 'launched' }),
        Feedback.countDocuments({ agencyId, status: { $in: ['open', 'in_review'] } }),
        Task.countDocuments({ agencyId, status: { $ne: 'done' }, dueDate: { $lt: now } }),
        Project.aggregate([{ $match: { agencyId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
        Task.aggregate([{ $match: { agencyId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      ]);

    res.json({
      totalClients,
      activeProjects,
      dueSoon,
      completedProjects,
      pendingFeedback,
      overdueTasks,
      projectsByStatus,
      tasksByStatus,
    });
  } catch (error) {
    next(error);
  }
};

export { getDashboard };

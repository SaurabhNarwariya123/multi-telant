import Meeting from '../models/Meeting.js';
import Project from '../models/Project.js';
import { findAccessibleProject } from './projectController.js';
import { logActivity } from './activityController.js';

const getMeetings = async (req, res, next) => {
  try {
    const filter = { agencyId: req.user.agencyId };
    const requested = req.query.projectId ? String(req.query.projectId) : null;

    if (req.user.role === 'client') {
      const ownIds = await Project.find({ agencyId: req.user.agencyId, clientId: req.user.clientId }).distinct('_id');
      filter.projectId = { $in: requested ? ownIds.filter((id) => String(id) === requested) : ownIds };
      filter.sharedWithClient = true;
    } else if (requested) {
      filter.projectId = requested;
    }

    const meetings = await Meeting.find(filter).sort('-date');
    res.json(meetings);
  } catch (error) {
    next(error);
  }
};

const postMeeting = async (req, res, next) => {
  try {
    const { projectId, title, date, notes, sharedWithClient } = req.body;
    if (!(await findAccessibleProject(req.user, projectId))) {
      return res.status(400).json({ message: 'Invalid projectId' });
    }

    const meeting = await Meeting.create({
      agencyId: req.user.agencyId,
      projectId,
      createdBy: req.user._id,
      title,
      date,
      notes,
      sharedWithClient,
    });

    await logActivity({
      user: req.user,
      projectId: meeting.projectId,
      eventType: 'meeting_recorded',
      entityType: 'meeting',
      entityId: meeting._id,
      message: `Meeting "${meeting.title}" recorded`,
      visibility: meeting.sharedWithClient ? 'client' : 'internal',
    });
    res.status(201).json(meeting);
  } catch (error) {
    next(error);
  }
};

const updateMeeting = async (req, res, next) => {
  try {
    const { title, date, notes, sharedWithClient } = req.body;
    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, agencyId: req.user.agencyId },
      { title, date, notes, sharedWithClient },
      { new: true, runValidators: true }
    );
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    res.json(meeting);
  } catch (error) {
    next(error);
  }
};

const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export { getMeetings, postMeeting, updateMeeting, deleteMeeting };

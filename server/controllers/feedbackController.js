import Feedback from '../models/Feedback.js';
import { findAccessibleProject } from './projectController.js';
import { logActivity } from './activityController.js';

const findFeedbackFor = (user, feedbackId) => {
  const filter = { _id: feedbackId, agencyId: user.agencyId };
  if (user.role === 'client') filter.clientId = user.clientId;
  return Feedback.findOne(filter);
};

const getFeedbacks = async (req, res, next) => {
  try {
    const filter = { agencyId: req.user.agencyId };
    if (req.user.role === 'client') filter.clientId = req.user.clientId;
    if (req.query.projectId) filter.projectId = String(req.query.projectId);
    if (req.query.status) filter.status = String(req.query.status);

    const feedbacks = await Feedback.find(filter).sort('-createdAt');
    res.json(feedbacks);
  } catch (error) {
    next(error);
  }
};

const getFeedback = async (req, res, next) => {
  try {
    const feedback = await findFeedbackFor(req.user, req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

const postFeedback = async (req, res, next) => {
  try {
    const { projectId, title, description } = req.body;
    const project = await findAccessibleProject(req.user, projectId);
    if (!project) return res.status(400).json({ message: 'Invalid projectId' });

    const feedback = await Feedback.create({
      agencyId: req.user.agencyId,
      projectId: project._id,
      clientId: project.clientId,
      submittedBy: req.user._id,
      title,
      description,
    });

    await logActivity({
      user: req.user,
      projectId: project._id,
      eventType: 'feedback_submitted',
      entityType: 'feedback',
      entityId: feedback._id,
      message: `Feedback "${feedback.title}" submitted`,
      visibility: 'client',
    });
    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

const updateFeedback = async (req, res, next) => {
  try {
    const { status, agencyResponse } = req.body;

    const existing = await Feedback.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!existing) return res.status(404).json({ message: 'Feedback not found' });
    const previousStatus = existing.status;

    const feedback = await Feedback.findOneAndUpdate(
      { _id: existing._id, agencyId: req.user.agencyId },
      { status, agencyResponse },
      { new: true, runValidators: true }
    );

    if (status && status !== previousStatus) {
      await logActivity({
        user: req.user,
        projectId: feedback.projectId,
        eventType: 'feedback_status_changed',
        entityType: 'feedback',
        entityId: feedback._id,
        message: `Feedback "${feedback.title}" moved to ${feedback.status}`,
        visibility: 'client',
        metadata: { from: previousStatus, to: feedback.status },
      });
    }
    res.json(feedback);
  } catch (error) {
    next(error);
  }
};

const postFeedbackComment = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const feedback = await findFeedbackFor(req.user, req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    feedback.comments.push({ userId: req.user._id, userName: req.user.name, message });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOneAndDelete({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export { getFeedbacks, getFeedback, postFeedback, updateFeedback, postFeedbackComment, deleteFeedback };

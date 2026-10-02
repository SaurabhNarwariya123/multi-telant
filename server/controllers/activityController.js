import Activity from '../models/Activity.js';
import Project from '../models/Project.js';

const logActivity = ({ user, projectId, eventType, entityType, entityId, message, visibility = 'internal', metadata }) =>
  Activity.create({
    agencyId: user.agencyId,
    projectId,
    actorId: user._id,
    actorName: user.name,
    eventType,
    entityType,
    entityId,
    message,
    visibility,
    metadata,
  });

// Events that are not tied to the actor's own agency, e.g. a super admin acting on an agency.
const logAgencyEvent = ({ actor, agencyId, eventType, entityType = 'agency', entityId, message, metadata }) =>
  Activity.create({
    agencyId,
    actorId: actor._id,
    actorName: actor.name,
    eventType,
    entityType,
    entityId: entityId || agencyId,
    message,
    visibility: 'internal',
    metadata,
  });

const getActivity = async (req, res, next) => {
  try {
    const filter = { agencyId: req.user.agencyId };
    const requested = req.query.projectId ? String(req.query.projectId) : null;

    if (req.user.role === 'client') {
      const ownIds = await Project.find({ agencyId: req.user.agencyId, clientId: req.user.clientId }).distinct('_id');
      filter.projectId = { $in: requested ? ownIds.filter((id) => String(id) === requested) : ownIds };
      filter.visibility = 'client';
    } else if (requested) {
      filter.projectId = requested;
    }

    const activity = await Activity.find(filter).sort('-createdAt').limit(100);
    res.json(activity);
  } catch (error) {
    next(error);
  }
};

export { logActivity, logAgencyEvent, getActivity };

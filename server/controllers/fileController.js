import cloudinary from '../config/cloudinary.js';
import ProjectFile from '../models/ProjectFile.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Feedback from '../models/Feedback.js';
import { findAccessibleProject } from './projectController.js';
import { logActivity } from './activityController.js';

const resourceTypes = ['image', 'video', 'raw'];
const DOWNLOAD_LINK_SECONDS = 60;

const folderFor = (user, projectId) => `agencies/${user.agencyId}/projects/${projectId}`;

const destroyAsset = (file) =>
  cloudinary.uploader.destroy(file.publicId, { resource_type: file.resourceType, type: 'authenticated' }).catch(() => {});

const getFiles = async (req, res, next) => {
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
    if (req.query.attachedToType) filter.attachedToType = String(req.query.attachedToType);
    if (req.query.attachedToId) filter.attachedToId = String(req.query.attachedToId);

    const files = await ProjectFile.find(filter).sort('-createdAt').populate('uploadedBy', 'name');
    res.json(files);
  } catch (error) {
    next(error);
  }
};

const postUploadSignature = async (req, res, next) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({ message: 'File storage is not configured' });
    }

    const project = await findAccessibleProject(req.user, req.body.projectId);
    if (!project) return res.status(400).json({ message: 'Invalid projectId' });

    const params = {
      folder: folderFor(req.user, project._id),
      timestamp: Math.round(Date.now() / 1000),
      type: 'authenticated',
    };
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    res.json({ ...params, signature, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
  } catch (error) {
    next(error);
  }
};

const postFile = async (req, res, next) => {
  try {
    const { projectId, attachedToType = 'project', attachedToId, publicId, resourceType, originalName } = req.body;

    const project = await findAccessibleProject(req.user, projectId);
    if (!project) return res.status(400).json({ message: 'Invalid projectId' });

    const ownFolder = `${folderFor(req.user, project._id)}/`;
    if (typeof publicId !== 'string' || !publicId.startsWith(ownFolder) || !resourceTypes.includes(resourceType)) {
      return res.status(400).json({ message: 'Invalid upload' });
    }
    if (await ProjectFile.exists({ publicId })) return res.status(409).json({ message: 'File already attached' });

    let asset;
    try {
      asset = await cloudinary.api.resource(publicId, { resource_type: resourceType, type: 'authenticated' });
    } catch {
      return res.status(400).json({ message: 'Upload not found' });
    }

    const stored = { publicId, resourceType };
    const reject = async (status, message) => {
      await destroyAsset(stored);
      return res.status(status).json({ message });
    };

    if (asset.bytes > Number(process.env.MAX_FILE_SIZE_MB) * 1024 * 1024) {
      return reject(400, `File is larger than ${process.env.MAX_FILE_SIZE_MB} MB`);
    }

    let targetId = project._id;

    if (attachedToType === 'task') {
      if (req.user.role === 'client') return reject(403, 'Access denied');
      const task = await Task.findOne({ _id: attachedToId, agencyId: req.user.agencyId, projectId: project._id });
      if (!task) return reject(400, 'Invalid attachedToId');
      targetId = task._id;
    } else if (attachedToType === 'feedback') {
      const feedback = await Feedback.findOne({ _id: attachedToId, agencyId: req.user.agencyId, projectId: project._id });
      if (!feedback) return reject(400, 'Invalid attachedToId');
      targetId = feedback._id;
    } else if (attachedToType !== 'project') {
      return reject(400, 'Invalid attachedToType');
    }

    const sharedWithClient = req.user.role === 'client' ? true : req.body.sharedWithClient === true;

    const file = await ProjectFile.create({
      agencyId: req.user.agencyId,
      projectId: project._id,
      attachedToType,
      attachedToId: targetId,
      uploadedBy: req.user._id,
      originalName: String(originalName || asset.original_filename || 'file'),
      publicId,
      resourceType,
      format: asset.format,
      size: asset.bytes,
      sharedWithClient,
    });

    await logActivity({
      user: req.user,
      projectId: project._id,
      eventType: 'file_uploaded',
      entityType: 'file',
      entityId: file._id,
      message: `File "${file.originalName}" uploaded`,
      visibility: sharedWithClient ? 'client' : 'internal',
    });
    res.status(201).json(file);
  } catch (error) {
    next(error);
  }
};

const getFileDownload = async (req, res, next) => {
  try {
    const file = await ProjectFile.findOne({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (req.user.role === 'client') {
      const project = await findAccessibleProject(req.user, file.projectId);
      if (!project || !file.sharedWithClient) return res.status(404).json({ message: 'File not found' });
    }

    const url = cloudinary.utils.private_download_url(file.publicId, file.format || '', {
      resource_type: file.resourceType,
      type: 'authenticated',
      attachment: true,
      expires_at: Math.floor(Date.now() / 1000) + DOWNLOAD_LINK_SECONDS,
    });
    res.json({ url });
  } catch (error) {
    next(error);
  }
};

const updateFile = async (req, res, next) => {
  try {
    const file = await ProjectFile.findOneAndUpdate(
      { _id: req.params.id, agencyId: req.user.agencyId },
      { sharedWithClient: req.body.sharedWithClient },
      { new: true, runValidators: true }
    );
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.json(file);
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const file = await ProjectFile.findOneAndDelete({ _id: req.params.id, agencyId: req.user.agencyId });
    if (!file) return res.status(404).json({ message: 'File not found' });
    await destroyAsset(file);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export { getFiles, postUploadSignature, postFile, getFileDownload, updateFile, deleteFile };

import express from 'express';
import {
  deleteFile,
  getFileDownload,
  getFiles,
  postFile,
  postUploadSignature,
  updateFile,
} from '../controllers/fileController.js';
import { allow, protect } from '../middleware/auth.js';

const router = express.Router();
const anyUser = [protect, allow('admin', 'member', 'client')];
const staff = [protect, allow('admin', 'member')];

router.get('/', anyUser, getFiles);
router.post('/upload-signature', anyUser, postUploadSignature);
router.post('/', anyUser, postFile);
router.get('/:id/download', anyUser, getFileDownload);
router.patch('/:id', staff, updateFile);
router.delete('/:id', staff, deleteFile);

export default router;

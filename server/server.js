import express from 'express';
import cors from 'cors';
import dns from 'node:dns/promises'
dns.setServers(['1.1.1.1', '8.8.8.8']);
import { connectDb } from './config/db.js';
import { seedSuperAdmin } from './controllers/userController.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import agencyRoutes from './routes/agencyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

let ready;
const init = () => (ready ??= connectDb().then(seedSuperAdmin).catch((e) => { ready = undefined; throw e; }));

if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    try { await init(); next(); } catch (error) { next(error); }
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

if (!process.env.VERCEL) {
  init()
    .then(() => app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`)))
    .catch((error) => { console.error(`Server failed to start: ${error.message}`); process.exit(1); });
}

export default app;

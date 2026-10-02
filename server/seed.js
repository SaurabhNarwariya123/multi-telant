import dns from 'node:dns/promises';
dns.setServers(['1.1.1.1', '8.8.8.8']);
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import { seedSuperAdmin } from './controllers/userController.js';
import Agency from './models/Agency.js';
import User from './models/User.js';
import Client from './models/Client.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import Milestone from './models/Milestone.js';
import Meeting from './models/Meeting.js';
import Feedback from './models/Feedback.js';
import Activity from './models/Activity.js';
import ProjectFile from './models/ProjectFile.js';

const PASSWORD = process.env.DEMO_PASSWORD || 'Password@123';
const DAY = 24 * 60 * 60 * 1000;
const days = (offset) => new Date(Date.now() + offset * DAY);

const demoAgencies = [
  {
    name: 'Pixel Forge Studio',
    slug: 'pixelforge',
    clients: [
      {
        company: 'Brightside Bakery',
        contactName: 'Maya Brooks',
        phone: '+1 555 0101',
        notes: 'Prefers weekly updates on Fridays.',
        projects: [
          { name: 'Brightside Website Redesign', status: 'development', priority: 'high', start: -30, due: 12 },
          { name: 'Online Ordering Integration', status: 'planning', priority: 'medium', start: -3, due: 45 },
        ],
      },
      {
        company: 'Orbit Fitness',
        contactName: 'Daniel Cruz',
        phone: '+1 555 0102',
        notes: 'Launching a new app in Q3.',
        projects: [{ name: 'Orbit Brand Refresh', status: 'client_review', priority: 'medium', start: -40, due: 5 }],
      },
    ],
  },
  {
    name: 'Northwind Digital',
    slug: 'northwind',
    clients: [
      {
        company: 'Harbor Legal Group',
        contactName: 'Priya Nair',
        phone: '+1 555 0201',
        notes: 'Compliance review required for every page.',
        projects: [
          { name: 'Harbor Legal Intranet', status: 'testing', priority: 'high', start: -60, due: -4 },
          { name: 'Case Study Microsite', status: 'launched', priority: 'low', start: -90, due: -30 },
        ],
      },
      {
        company: 'Summit Outdoor Co.',
        contactName: 'Liam Foster',
        phone: '+1 555 0202',
        notes: 'E-mail marketing and SEO retainer.',
        projects: [{ name: 'Summit SEO Campaign', status: 'design', priority: 'medium', start: -10, due: 30 }],
      },
    ],
  },
];

const taskTemplates = [
  ['Gather requirements and assets', 'done', 'medium', -20],
  ['Create wireframes', 'done', 'medium', -12],
  ['Build core pages', 'in_progress', 'high', 3],
  ['Internal QA pass', 'todo', 'medium', 8],
  ['Fix reported issues', 'todo', 'high', -2],
];

const wipeDemoData = async () => {
  const agencies = await Agency.find({ name: { $in: demoAgencies.map((agency) => agency.name) } }).select('_id');
  const agencyId = { $in: agencies.map((agency) => agency._id) };
  await Promise.all(
    [User, Client, Project, Task, Milestone, Meeting, Feedback, Activity, ProjectFile].map((Model) => Model.deleteMany({ agencyId }))
  );
  await Agency.deleteMany({ _id: agencyId });
};

const seedAgency = async (spec, passwordHash) => {
  const agency = await Agency.create({ name: spec.name });
  const makeStaff = (name, role) =>
    User.create({ name, email: `${role}@${spec.slug}.com`, password: passwordHash, role, agencyId: agency._id });

  const admin = await makeStaff('Alex Morgan', 'admin');
  const member = await makeStaff('Sam Rivera', 'member');
  const people = [admin, member];

  for (const [index, clientSpec] of spec.clients.entries()) {
    const client = await Client.create({
      agencyId: agency._id,
      company: clientSpec.company,
      contactName: clientSpec.contactName,
      email: `contact@${clientSpec.company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: clientSpec.phone,
      notes: clientSpec.notes,
    });

    // The first client of each agency gets the documented demo login (client@<agency>.com).
    const clientUser = await User.create({
      name: clientSpec.contactName,
      email: index === 0 ? `client@${spec.slug}.com` : `client2@${spec.slug}.com`,
      password: passwordHash,
      role: 'client',
      agencyId: agency._id,
      clientId: client._id,
    });

    for (const [projectIndex, projectSpec] of clientSpec.projects.entries()) {
      const project = await Project.create({
        agencyId: agency._id,
        clientId: client._id,
        managerId: people[projectIndex % 2]._id,
        name: projectSpec.name,
        description: `Delivery of "${projectSpec.name}" for ${clientSpec.company}.`,
        status: projectSpec.status,
        priority: projectSpec.priority,
        startDate: days(projectSpec.start),
        dueDate: days(projectSpec.due),
      });

      const launched = projectSpec.status === 'launched';
      await Task.insertMany(
        taskTemplates.map(([title, status, priority, due], taskIndex) => ({
          agencyId: agency._id,
          projectId: project._id,
          assigneeId: people[taskIndex % 2]._id,
          title,
          description: `${title} for ${projectSpec.name}.`,
          status: launched ? 'done' : status,
          priority,
          dueDate: days(due),
          comments:
            taskIndex === 2 ? [{ userId: admin._id, userName: admin.name, message: 'Let us finish this before the review.' }] : [],
        }))
      );

      await Milestone.insertMany([
        { agencyId: agency._id, projectId: project._id, title: 'Design approved', status: 'completed', dueDate: days(-10), completedAt: days(-11) },
        { agencyId: agency._id, projectId: project._id, title: 'Beta ready', status: launched ? 'completed' : 'in_progress', dueDate: days(projectSpec.due - 5) },
        { agencyId: agency._id, projectId: project._id, title: 'Launch', status: launched ? 'completed' : 'pending', dueDate: days(projectSpec.due) },
      ]);

      await Meeting.insertMany([
        {
          agencyId: agency._id,
          projectId: project._id,
          createdBy: admin._id,
          title: 'Kick-off call',
          date: days(projectSpec.start + 1),
          notes: 'Agreed scope, timeline and communication cadence.\nDecision: weekly status email.',
          sharedWithClient: true,
        },
        {
          agencyId: agency._id,
          projectId: project._id,
          createdBy: admin._id,
          title: 'Internal budget review',
          date: days(projectSpec.start + 7),
          notes: 'Internal only: margin is tight, avoid extra revisions.',
          sharedWithClient: false,
        },
      ]);

      const feedback = await Feedback.create({
        agencyId: agency._id,
        projectId: project._id,
        clientId: client._id,
        submittedBy: clientUser._id,
        title: 'Please change the hero section button colour',
        description: 'The call-to-action button should match our brand green.',
        status: projectIndex === 0 ? 'in_review' : 'open',
        agencyResponse: projectIndex === 0 ? 'Thanks, we are checking the brand palette.' : undefined,
        comments: [{ userId: clientUser._id, userName: clientUser.name, message: 'Hex code is #2E9E5B.' }],
      });

      const events = [
        ['project_created', 'project', project._id, `Project "${project.name}" created`, 'client', admin],
        ['milestone_completed', 'milestone', project._id, 'Milestone "Design approved" completed', 'client', member],
        ['meeting_recorded', 'meeting', project._id, 'Meeting "Kick-off call" recorded', 'client', admin],
        ['feedback_submitted', 'feedback', feedback._id, `Feedback "${feedback.title}" submitted`, 'client', clientUser],
        ['task_completed', 'task', project._id, 'Task "Create wireframes" completed', 'internal', member],
      ];
      await Activity.insertMany(
        events.map(([eventType, entityType, entityId, message, visibility, actor], eventIndex) => ({
          agencyId: agency._id,
          projectId: project._id,
          actorId: actor._id,
          actorName: actor.name,
          eventType,
          entityType,
          entityId,
          message,
          visibility,
          createdAt: days(-(events.length - eventIndex)),
        }))
      );
    }
  }

  await Activity.create({
    agencyId: agency._id,
    actorId: admin._id,
    actorName: admin.name,
    eventType: 'agency_created',
    entityType: 'agency',
    entityId: agency._id,
    message: `Agency "${agency.name}" was created`,
    visibility: 'internal',
  });
};

const run = async () => {
  await connectDb();
  await seedSuperAdmin();

  const exists = await Agency.exists({ name: { $in: demoAgencies.map((agency) => agency.name) } });
  if (exists && !process.argv.includes('--force')) {
    console.log('Demo data already exists. Run "npm run seed -- --force" to recreate it.');
    return;
  }
  if (exists) await wipeDemoData();

  const passwordHash = await bcrypt.hash(PASSWORD, await bcrypt.genSalt(12));
  for (const spec of demoAgencies) await seedAgency(spec, passwordHash);

  console.log('Demo data created. All demo users share the password:', PASSWORD);
  for (const { slug } of demoAgencies) console.log(`  admin@${slug}.com, member@${slug}.com, client@${slug}.com`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

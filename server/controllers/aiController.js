import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Milestone from '../models/Milestone.js';
import Feedback from '../models/Feedback.js';
import Activity from '../models/Activity.js';

const DAY = 24 * 60 * 60 * 1000;

const AI_TIMEOUT_MS = 20000;
const getApiKey = () => process.env.OPENAI_API_KEY || process.env.ChatGpt_API_KEY;

const askOpenAI = async (facts) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${getApiKey()}`,
    },
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      max_tokens: 400,
      messages: [
        {
          role: 'system',
          content: 'You are a project health analyst for an agency. Use only the JSON the user provides. Never invent facts.',
        },
        {
          role: 'user',
          content: `Write a short status summary and the main risks in under 120 words.\n\n${JSON.stringify(facts)}`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`AI request failed with ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content.trim();
};

const getProjectHealth = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, agencyId: req.user.agencyId });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const scope = { agencyId: req.user.agencyId, projectId: project._id };
    const now = new Date();

    const [tasks, milestones, feedbacks, recentActivity] = await Promise.all([
      Task.find(scope),
      Milestone.find(scope),
      Feedback.find(scope),
      Activity.find(scope).sort('-createdAt').limit(10),
    ]);

    const doneTasks = tasks.filter((task) => task.status === 'done').length;
    const progress = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
    const overdueTasks = tasks.filter((task) => task.status !== 'done' && task.dueDate && task.dueDate < now);
    const stalledMilestones = milestones.filter((item) => item.status !== 'completed' && item.dueDate && item.dueDate < now);
    const openFeedback = feedbacks.filter((item) => item.status !== 'resolved');
    const lastActivityAt = recentActivity[0]?.createdAt;
    const daysSinceActivity = lastActivityAt ? Math.floor((now - lastActivityAt) / DAY) : null;
    const projectOverdue = project.dueDate && project.dueDate < now && project.status !== 'launched';

    const risks = [];
    if (overdueTasks.length) risks.push(`${overdueTasks.length} task(s) are overdue`);
    if (stalledMilestones.length) risks.push(`${stalledMilestones.length} milestone(s) are past their deadline`);
    if (openFeedback.length > 2) risks.push(`${openFeedback.length} client feedback items are unresolved`);
    if (daysSinceActivity === null || daysSinceActivity > 14) risks.push('No project activity in the last 14 days');
    if (projectOverdue) risks.push('Project is past its expected completion date');

    let riskLevel = 'low';
    if (risks.length) riskLevel = 'medium';
    if (overdueTasks.length >= 3 || stalledMilestones.length >= 2 || projectOverdue) riskLevel = 'high';

    const facts = {
      project: { name: project.name, status: project.status, priority: project.priority, dueDate: project.dueDate },
      progress,
      taskCount: tasks.length,
      overdueTasks: overdueTasks.map((task) => ({ title: task.title, dueDate: task.dueDate })),
      stalledMilestones: stalledMilestones.map((item) => ({ title: item.title, dueDate: item.dueDate })),
      openFeedback: openFeedback.map((item) => ({ title: item.title, status: item.status })),
      recentActivity: recentActivity.map((item) => item.message),
      daysSinceActivity,
      riskLevel,
    };

    let summary = `${project.name} is ${progress}% complete with ${overdueTasks.length} overdue task(s), ${stalledMilestones.length} stalled milestone(s) and ${openFeedback.length} open feedback item(s).`;
    let source = 'rules';

    if (getApiKey()) {
      try {
        summary = await askOpenAI(facts);
        source = 'ai';
      } catch (error) {
        console.error(error.message);
      }
    }

    res.json({ ...facts, risks, summary, source });
  } catch (error) {
    next(error);
  }
};

export { getProjectHealth };

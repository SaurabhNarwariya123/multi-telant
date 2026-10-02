import Navbar from '@/components/Navbar';
import Hero from '@/components/landing/Hero';
import HierarchySection from '@/components/landing/HierarchySection';
import Features from '@/components/Features';
import StepFlow from '@/components/landing/StepFlow';
import TimelineSection from '@/components/landing/TimelineSection';
import InfoSection from '@/components/landing/InfoSection';
import Security from '@/components/Security';
import TechSection from '@/components/landing/TechSection';
import FinalCta from '@/components/landing/FinalCta';

const workflow = ['Planning', 'Design', 'Development', 'Testing', 'Client Review', 'Launch'];
const feedbackFlow = ['Open', 'In Review', 'In Progress', 'Resolved'];

const filePoints = [
  'Attach files to projects, tasks and feedback',
  'See who uploaded each file and what it belongs to',
  'Share with the client only when you choose to',
  'Downloads need a valid login, guessing a URL gives nothing',
];

const aiPoints = [
  'Reads tasks, deadlines, activity and feedback',
  'Finds overdue tasks and stalled milestones',
  'Summarises status and possible risks',
  'Only ever sees the data of the selected agency project',
];

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HierarchySection />
      <Features />
      <StepFlow
        id="workflow"
        eyebrow="Project management"
        title="Turn projects into clear, trackable workflows."
        text="Project progress comes from completed tasks, not a manually typed percentage."
        steps={workflow}
      />
      <TimelineSection />
      <StepFlow
        id="feedback"
        eyebrow="Client feedback"
        title="Turn client feedback into trackable work."
        steps={feedbackFlow}
      />
      <InfoSection
        id="files"
        eyebrow="File management"
        title="Share files without compromising access."
        points={filePoints}
      />
      <InfoSection
        id="ai"
        eyebrow="AI project health"
        title="AI that solves a real project problem."
        points={aiPoints}
      />
      <Security />
      <TechSection />
      <FinalCta />
    </main>
  );
}

import { UserProvider } from '@/context/UserContext';
import DashboardShell from '@/components/DashboardShell';

export default function DashboardLayout({ children }) {
  return (
    <UserProvider>
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  );
}

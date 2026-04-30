import type { Metadata } from 'next';
import ClientLayout from '@/components/navigation/ClientLayout';

export const metadata: Metadata = {
  title: 'Athletic Agency - Admin',
  description:
    'Manage teams, players, and competitions in the Athletic Agency admin dashboard.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}

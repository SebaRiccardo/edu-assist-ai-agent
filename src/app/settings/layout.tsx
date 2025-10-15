import { DashboardNavBar } from '@/components/top-nav';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-bl from-pink-100 to-blue-200">
      <DashboardNavBar />
      <main className="relative py-5">{children}</main>
    </div>
  );
}

import PortalHeader from '@/components/portal/PortalHeader';
import PortalSidebar from '@/components/portal/PortalSidebar';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <PortalSidebar />

        <div className="min-w-0 flex-1">
          <PortalHeader />

          <main className="p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
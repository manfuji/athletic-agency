'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidenav from './Sidenav';
import MobileHeader from './MobileHeader';
import useIsMobile from '@/hooks/useIsMobile';
import SetupCompetition from '@/components/competitions/competition-setup/SetupCompetition';
import { usePathname } from 'next/navigation';
import { useSession } from '@/providers/supabase-auth';
import AdminTopNav from './AdminTopNav';
import { adminNavGroups } from './adminNavConfig';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile(1023);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Ensure component is mounted before rendering mobile-specific content
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const competitionId = useMemo(() => {
    const match = pathname.match(/\/setup-competition\/([^/]+)(\/.*)?/);
    return match ? match[1] : null;
  }, [pathname]);

  useEffect(() => {
    if (!isMounted) return;
    
    if (competitionId) {
      const setupState = JSON.parse(
        localStorage.getItem(`setup_${competitionId}`) || '{}'
      );
      const stepCompletion = setupState.stepCompletion || {};
      const completedCount =
        Object.values(stepCompletion).filter(Boolean).length;
      setCompletedSteps(completedCount);
    } else {
      setCompletedSteps(1);
    }
  }, [competitionId, isMounted]);

  const handleStepChange = (steps: number) => {
    setCompletedSteps(steps);
  };

  const isBaseSetupPage = /^\/setup-competition\/[^/]+$/.test(pathname);

  const isAdminRoute = useMemo(() => {
    if (!pathname) return false;
    if (pathname === '/admin') return true;
    return adminNavGroups.some((g) =>
      g.items.some((it) => pathname === it.path || pathname.startsWith(`${it.path}/`))
    );
  }, [pathname]);

  const showAdminTopNav = Boolean(session?.user?.role === 'admin' && isAdminRoute && !isBaseSetupPage);

  return (
    <div className="flex h-screen bg-[#F2F4F7]">
      {/* Sidebar */}
      <Sidenav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        completedSteps={completedSteps}
      />

      {/* Main Content */}
      <div className="relative flex flex-col flex-1 lg:overflow-y-auto lg:overflow-x-hidden">
        {/* Mobile Header */}
        {isMounted && isMobile && (
          <MobileHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            className="sticky top-0 z-30"
          />
        )}
        {showAdminTopNav && <AdminTopNav />}
        <main>
          <div className={`${isMobile && !sidebarOpen ? 'ml-[5rem]' : 'w-full'} `}>
            {isBaseSetupPage && competitionId ? (
              <SetupCompetition
                competitionId={competitionId}
                onStepChange={handleStepChange}
              />
            ) : (
              <div className="px-6 py-6 max-w-[1400px] mx-auto">
                <div className="bg-white border border-[#EAECF0] rounded-xl shadow-sm">
                  <div className="p-6">{children}</div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

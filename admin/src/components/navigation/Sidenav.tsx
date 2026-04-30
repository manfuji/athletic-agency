'use client';

import { useState, useEffect, useRef } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import SidenavHeader from './SidenavHeader';
import Navlinks from './Navlinks';
import SidenavFooter from './SidenavFooter';

interface SidenavProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  completedSteps?: number;
}

export default function Sidenav({
  sidebarOpen,
  setSidebarOpen,
  completedSteps,
}: SidenavProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <TooltipProvider>
      <div
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed inset-0 border-r border-gray-200 sm:translate-x-0 bg-opacity-30 z-40 lg:hidden transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebarRef}
        className={`fixed flex flex-col z-40 left-0 top-0 lg:static h-screen lg:overflow-visible overflow-hidden ${
          sidebarExpanded ? 'lg:w-64 w-72' : 'lg:w-20 w-20'
        } bg-white shrink-0 border-r border-gray-200 sm:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-72'
        } transition-all duration-200`}
      >
        <SidenavHeader
          sidebarExpanded={sidebarExpanded}
          setSidebarExpanded={setSidebarExpanded}
        />

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <Navlinks
            sidebarExpanded={sidebarExpanded}
            setSidebarOpen={setSidebarOpen}
            completedSteps={completedSteps}
          />
        </div>

        <SidenavFooter sidebarExpanded={sidebarExpanded} />
      </div>
    </TooltipProvider>
  );
}

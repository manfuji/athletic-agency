'use client';

import { PanelLeft } from 'lucide-react';

interface MobileHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  className?: string;
}

export default function MobileHeader({
  sidebarOpen,
  setSidebarOpen,
  className = '',
}: MobileHeaderProps) {
  return (
    <header className={`sticky top-0 z-30 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex">
            <button
              className="text-slate-500 hover:text-slate-600 lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <span className="sr-only">Open sidebar</span>
              <PanelLeft size={24} className="text-black" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

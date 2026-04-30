'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Square,
  Calendar,
  Book,
  House,
  Users,
  Clipboard,
  List,
  Shield,
} from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useSession } from '@/providers/supabase-auth';
import { adminNavGroups } from './adminNavConfig';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  completedSteps?: number;
  onClick?: () => void;
}

interface NavlinksProps {
  sidebarExpanded: boolean;
  setSidebarOpen: (open: boolean) => void;
  competitionId?: string;
  completedSteps?: number;
}

const baseNavItems: NavItem[] = [
  {
    name: 'Competitions',
    icon: <Image src="/Trophy.svg" alt="Trophy" width={22} height={18} />,
    path: '/',
  },
  {
    name: 'Teams',
    icon: <Image src="/groups.svg" alt="Team" width={24} height={24} />,
    path: '/team',
  },
  { name: 'Players', icon: <Users />, path: '/players' },
  { name: 'Categories', icon: <Square />, path: '/categories' },
  { name: 'Collators', icon: <Clipboard />, path: '/collators' },
  { name: 'Competition Types', icon: <List />, path: '/competition-types' },
];

function isPathActive(pathname: string, itemPath?: string) {
  if (!itemPath) return false;
  if (itemPath === '/team') return pathname === '/team' || pathname.startsWith('/team/');
  if (itemPath === '/') return pathname === '/';
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

const setupCompetitionNavItems = (
  competitionId?: string,
  completedSteps: number = 1
): NavItem[] => {
  const handleGoBackClick = () => {
    const pathname = window.location.pathname;
    const baseSetupPath = competitionId
      ? `/setup-competition/${competitionId}`
      : '/setup-competition';

    if (pathname === baseSetupPath) {
      window.location.href = '/';
    } else {
      window.history.back();
    }
  };

  return [
    {
      name: 'Go Back',
      icon: <ArrowLeft />,
      onClick: handleGoBackClick,
    },
    {
      name: 'Setup',
      icon: <House />,
      path: competitionId ? `/setup-competition/${competitionId}` : '',
      completedSteps,
    },
    {
      name: 'Teams',
      icon: <Image src="/groups.svg" alt="Teams" width={24} height={24} />,
      path: competitionId
        ? `/setup-competition/${competitionId}/teams`
        : '/teams',
    },
    {
      name: 'Fixtures',
      icon: <Calendar />,
      path: competitionId
        ? `/setup-competition/${competitionId}/fixtures`
        : '/fixtures',
    },
    {
      name: 'Results & Standings',
      icon: (
        <Image
          src="/Trophy.svg"
          alt="Results & Standings"
          width={22}
          height={22}
        />
      ),
      path: competitionId
        ? `/setup-competition/${competitionId}/results-and-standings`
        : '/results-and-standings',
    },
    {
      name: 'Assign Collators',
      icon: <Clipboard />,
      path: competitionId
        ? `/setup-competition/${competitionId}/assign-collators`
        : '/assign-collators',
    },
    {
      name: 'News',
      icon: <Book />,
      path: '/news',
    },
  ];
};

const getNavigationContext = (
  pathname: string,
  isSetupContext: boolean,
  competitionId?: string,
  completedSteps: number = 1
): { items: NavItem[]; isSetup: boolean } => {
  const isSetupCompetition = pathname.startsWith('/setup-competition/');
  const standaloneRoutes = [
    '/teams',
    '/fixtures',
    '/results-and-standings',
    '/news',
  ];

  if (
    isSetupCompetition ||
    (isSetupContext && standaloneRoutes.includes(pathname))
  ) {
    return {
      items: setupCompetitionNavItems(competitionId, completedSteps),
      isSetup: true,
    };
  }

  return { items: baseNavItems, isSetup: false };
};

const Navlinks: React.FC<NavlinksProps> = ({
  sidebarExpanded,
  setSidebarOpen,
  competitionId: providedCompetitionId,
  completedSteps: providedCompletedSteps,
}) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [isSetupContext, setIsSetupContext] = useState(false);
  const [currentCompetitionId, setCurrentCompetitionId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const competitionIdFromPath = pathname.startsWith('/setup-competition/')
      ? pathname.split('/')[2]
      : undefined;

    const effectiveCompetitionId =
      providedCompetitionId || competitionIdFromPath;

    if (
      effectiveCompetitionId &&
      effectiveCompetitionId !== currentCompetitionId
    ) {
      setCurrentCompetitionId(effectiveCompetitionId);
    }

    const completedSteps = providedCompletedSteps ?? 1;

    const { items, isSetup } = getNavigationContext(
      pathname,
      isSetupContext,
      effectiveCompetitionId || currentCompetitionId,
      completedSteps
    );

    const filteredItems =
      userRole === 'admin'
        ? items
        : userRole === 'collator'
          ? isSetup
            ? items.filter(
                (item) =>
                  item.name === 'Results & Standings' || item.name === 'Go Back'
              )
            : items.filter((item) => item.name === 'Competitions')
          : items;

    setActiveNavItems(filteredItems);
    setIsSetupContext(isSetup);
  }, [
    pathname,
    isSetupContext,
    providedCompetitionId,
    providedCompletedSteps,
    currentCompetitionId,
    userRole,
  ]);

  const [activeNavItems, setActiveNavItems] = useState<NavItem[]>([]);

  const handleNavClick = (item: NavItem) => {
    setSidebarOpen(false);

    if (item.onClick) {
      item.onClick();
      return;
    }

    const isSetupNav = activeNavItems.some((nav) =>
      nav.path?.includes('/setup-competition/')
    );

    if (
      isSetupNav ||
      item.path?.includes('/teams') ||
      item.path === '/fixtures' ||
      item.path === '/results-and-standings' ||
      item.path === '/news'
    ) {
      setIsSetupContext(true);
    } else {
      setIsSetupContext(false);
      setCurrentCompetitionId(undefined);
    }
  };

  const isOnAdminRoute = useMemo(() => {
    if (pathname === '/admin') return true;
    return adminNavGroups.some((g) => g.items.some((it) => isPathActive(pathname, it.path)));
  }, [pathname]);

  if (!session) {
    return null;
  }

  return (
    <div className={`${isSetupContext ? 'mt-0' : 'mt-5'} px-2`}>
      <ul className="space-y-2">
        {activeNavItems.map((item, index) => {
          const active = item.name !== 'Go Back' && isPathActive(pathname, item.path);
          return (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.2) }}
              className="relative group"
            >
              {item.path ? (
                <Link
                  href={item.path}
                  onClick={() => handleNavClick(item)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg font-inter text-[15px] transition-colors
                    ${active ? 'bg-gray-100 font-semibold text-[#101828]' : 'hover:bg-gray-50 text-[#344054]'}`}
                >
                  {!sidebarExpanded ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center">{item.icon}</span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-normal">
                        {item.name}
                        {item.completedSteps !== undefined && ` ${item.completedSteps}/5`}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <span className="text-[#667085]">{item.icon}</span>
                      <span className="truncate">{item.name}</span>
                      {item.name === 'Setup' && item.completedSteps !== undefined && (
                        <span className="ml-auto text-xs text-[#667085]">
                          {item.completedSteps}/5
                        </span>
                      )}
                    </>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => handleNavClick(item)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg font-inter text-[15px] hover:bg-gray-50 text-[#344054] w-full"
                >
                  <span className="text-[#667085]">{item.icon}</span>
                  {sidebarExpanded && <span className="truncate">{item.name}</span>}
                </button>
              )}
            </motion.li>
          );
        })}
      </ul>

      {userRole === 'admin' && !isSetupContext && sidebarExpanded && (
        <div className="mt-4">
          <Link
            href="/admin"
            onClick={() => handleNavClick({ name: 'Admin', icon: <Shield />, path: '/admin' })}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg font-inter text-[15px] transition-colors
              ${isOnAdminRoute ? 'bg-gray-100 font-semibold text-[#101828]' : 'hover:bg-gray-50 text-[#344054]'}`}
          >
            <span className="text-[#667085]">
              <Shield className="h-4 w-4" />
            </span>
            <span className="truncate">Admin</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navlinks;

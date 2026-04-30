'use client';

import { useState, useRef } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import useClickOutside from '@/hooks/useClickOutside';
import { signOut, useSession } from '@/providers/supabase-auth';
import { useRouter } from 'next/navigation';

interface AdminProfileProps {
  sidebarExpanded: boolean;
}

const AdminProfile: React.FC<AdminProfileProps> = ({ sidebarExpanded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null!);
  const router = useRouter();
  const { data: session, status } = useSession();

  useClickOutside(popoverRef, () => setIsOpen(false));

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  const handleAccountSettings = () => {
    setIsOpen(false);
    router.push('/account-settings');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center p-3 w-full rounded-lg">
        {sidebarExpanded && (
          <div className="ml-3 flex-1 min-w-0 font-inter">
            <p className="text-sm font-bold text-gray-900">Loading...</p>
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        )}
      </div>
    );
  }

  const user = session?.user;

  return (
    <div
      ref={popoverRef}
      className={`relative flex items-center p-3 w-full rounded-lg ${
        sidebarExpanded ? 'border border-[#D0D5DD]' : 'border-none'
      }`}
    >
      {sidebarExpanded && user && (
        <div className="ml-3 flex-1 min-w-0 font-inter">
          <p className="text-sm font-bold text-gray-900 truncate">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
      )}

      <div
        className={`${sidebarExpanded ? 'ml-auto' : 'mr-3'} cursor-pointer`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <ChevronsUpDown className="w-5 h-5 mb-5 text-gray-600" />
      </div>

      {isOpen && (
        <div className="absolute bottom-12 right-3 bg-white rounded-lg p-2 border-t text-sm w-[90%] shadow-md">
          <button
            onClick={handleAccountSettings}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Account Settings
          </button>
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;

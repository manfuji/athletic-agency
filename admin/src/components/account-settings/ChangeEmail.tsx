'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from '@/providers/supabase-auth';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getPublicSiteUrl } from '@/lib/siteUrl';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';

export function ChangeEmail() {
  const { data: session, status } = useSession();
  const currentEmail = session?.user?.email || '';

  const [newEmail, setNewEmail] = useState(currentEmail);

  useEffect(() => {
    if (status === 'authenticated' && currentEmail) {
      setNewEmail(currentEmail);
    }
  }, [currentEmail, status]);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'loading') {
      toast.error('Session is still loading. Please wait.');
      return;
    }

    if (!newEmail) {
      toast.error('Please enter a new email address');
      return;
    }

    if (!session?.user?.id) {
      toast.error('User session not available');
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const emailRedirectTo = `${getPublicSiteUrl()}/auth/callback?next=${encodeURIComponent('/account-settings')}`;

      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo }
      );
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Check your new email to confirm the change.', {
        onAutoClose: () => {
          void signOut({
            callbackUrl: '/auth/login',
            redirect: true,
          });
        },
        duration: 2000,
      });
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'An error occurred while initiating the email change'
      );
    }
  };

  return (
    <section className="mb-6">
      <h2 className="text-[15px] font-normal text-[#000000] font-evogria mb-4">
        Change Email
      </h2>
      <form onSubmit={handleChangeEmail}>
        <div className="mb-4">
          <label className="block text-[14px] font-inter font-medium text-[#344054] mb-1">
            Email Address
          </label>
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="font-inter text-[#475467] font-normal text-[14px]">
            We’ll email a confirmation link to the new address.
          </span>
        </div>
        <Button
          type="submit"
          className="px-4 py-2 font-inter text-[14px] font-semibold bg-white text-[#344054] rounded-lg cursor-pointer border border-[#D0D5DD] hover:bg-gray-100 transition-colors"
        >
          Change email
        </Button>
      </form>
    </section>
  );
}

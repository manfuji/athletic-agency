'use client';

import { useState } from 'react';
import { useSession, signOut } from '@/providers/supabase-auth';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { z } from 'zod';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        'New password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password',
    path: ['newPassword'],
  });

export function ChangePassword() {
  const { data: session, status } = useSession();
  const email = session?.user?.email;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'loading') {
      toast.error('Session is still loading. Please wait.');
      return;
    }

    if (!email) {
      toast.error('User session not available');
      return;
    }

    try {
      passwordSchema.parse({ currentPassword, newPassword });
      setErrors({});
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorMap: { [key: string]: string } = {};
        validationError.errors.forEach((err) => {
          const field = err.path[0] as string;
          errorMap[field] = err.message;
        });
        setErrors(errorMap);
        return;
      }
    }

    const userEmail = email;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (signInError) {
        toast.error('Current password is incorrect');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        toast.error(updateError.message);
        return;
      }

      toast.success('Your password has been changed! Please log in again.', {
        onAutoClose: () => {
          void signOut({
            callbackUrl: '/auth/login',
            redirect: true,
          });
        },
        duration: 2000,
      });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'An error occurred while changing your password'
      );
    }
  };

  return (
    <section className="mb-6">
      <h2 className="text-[15px] font-normal text-[#000000] font-evogria mb-4">
        Change Password
      </h2>
      <form onSubmit={handleChangePassword}>
        <div className="mb-4">
          <label className="block text-[14px] font-inter font-medium text-[#344054] mb-1">
            Current Password
          </label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-[14px] font-medium mt-1 font-inter">
              {errors.currentPassword}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-[14px] font-inter font-medium text-[#344054] mb-1">
            New Password
          </label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-[14px] font-medium mt-1 font-inter">
              {errors.newPassword}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="px-4 py-2 font-inter text-[14px] font-semibold bg-white text-[#344054] rounded-lg cursor-pointer border border-[#D0D5DD] hover:bg-gray-100 transition-colors"
        >
          Change password
        </Button>
      </form>
    </section>
  );
}

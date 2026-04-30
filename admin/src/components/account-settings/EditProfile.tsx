'use client';

import { useState } from 'react';
import { useSession } from '@/providers/supabase-auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';

export function EditProfile() {
  const { data: session, status, update } = useSession();
  const user = session?.user;
  const userId = user?.id;
  const accessToken = session?.access_token;

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');

  if (status !== 'loading' && user && firstName === '' && lastName === '') {
    setFirstName(user.first_name);
    setLastName(user.last_name);
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'loading') {
      toast.error('Session is still loading. Please wait.');
      return;
    }

    if (!userId || !accessToken) {
      console.error('User ID or access token not found', { session });
      toast.error('User session not available');
      return;
    }

    if (!firstName || !lastName) {
      toast.error('Please enter both first and last names');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/change-name/${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
          }),
        }
      );

      if (response.ok) {
        await update({
          user: {
            first_name: firstName,
            last_name: lastName,
          },
        });
        toast.success('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        });
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(
        error instanceof Error
          ? error.message === 'Failed to update profile'
            ? 'Failed to update profile. Please try again.'
            : error.message
          : 'An error occurred while updating the profile'
      );
    }
  };

  return (
    <section className="mb-6">
      <h2 className="text-[15px] font-normal text-[#000000] font-evogria mb-4">
        Edit Profile
      </h2>
      <form onSubmit={handleSaveProfile}>
        <div className="mb-4">
          <label className="block text-[14px] font-inter font-medium text-[#344054] mb-1">
            Edit first name
          </label>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-[14px] font-inter font-medium text-[#344054] mb-1">
            Edit last name
          </label>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button
          type="submit"
          className="px-4 py-2 font-inter text-[14px] font-semibold bg-white text-[#344054] rounded-lg cursor-pointer border border-[#D0D5DD] hover:bg-gray-100 transition-colors"
        >
          Save Changes
        </Button>
      </form>
    </section>
  );
}

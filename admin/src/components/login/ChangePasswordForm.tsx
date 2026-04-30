'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleAlert } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

function ErrorMessage({ message }: { message: string }) {
  return <p className="text-red-600 text-sm">{message}</p>;
}

export default function ChangePasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null);
      setLoadingSession(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage('');

    if (!password || !confirmPassword) {
      setError('Both fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setError('Your reset link may have expired. Request a new one.');
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setMessage('Password updated. Redirecting to login…');
      await supabase.auth.signOut();
      setTimeout(() => router.push('/auth/login'), 1500);
    } catch {
      setError('An error occurred. Please try again.');
    }
  };

  if (loadingSession) {
    return (
      <div className="flex flex-col items-center min-h-screen p-6">
        <p className="text-sm text-gray-600 font-inter">Loading…</p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex flex-col items-center min-h-screen p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl text-black font-bold font-inter text-center">
              Set a new password
            </h2>
            <p className="text-sm text-gray-600 font-inter text-center">
              Use the link from your reset email, or request a new reset link.
            </p>
            <Button
              asChild
              className="w-full bg-[#302464] font-evogria hover:bg-[#1f1656] text-white"
            >
              <Link href="/auth/reset-password">Request reset link</Link>
            </Button>
            <Button variant="outline" asChild className="w-full font-evogria">
              <Link href="/auth/login">Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-xl text-black font-bold font-inter text-center mb-4">
            Set a new password
          </h2>
          <p className="text-sm text-gray-600 font-inter text-center mb-6">
            Choose a new password for your account.
          </p>
          {message && (
            <p className="text-green-600 text-center mb-4">{message}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-black font-inter">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-black font-inter">
                New password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(error && !password ? 'border-red-500' : '')}
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="confirmPassword"
                className="text-black font-inter"
              >
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    error && !confirmPassword ? 'border-red-500' : ''
                  )}
                />
                {error && !confirmPassword && (
                  <CircleAlert
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"
                    size={18}
                  />
                )}
              </div>
              {error && <ErrorMessage message={error} />}
            </div>
            <Button
              type="submit"
              className="w-full bg-[#302464] font-evogria hover:bg-[#1f1656] text-white"
            >
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

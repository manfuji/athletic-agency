'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { CircleAlert, Loader2, Eye, EyeOff } from 'lucide-react';

function ErrorMessage({ message }: { message: string }) {
  return <p className="text-red-600 text-sm">{message}</p>;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      const errorMessage = errorDescription || 'Unable to sign in. Please try again.';
      setErrors({ general: errorMessage });

      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('error');
      newSearchParams.delete('error_description');
      const newUrl = newSearchParams.toString()
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: { email?: string; password?: string; general?: string } =
      {};

    if (!email && !password) {
      newErrors.general = 'Both fields are required';
    } else {
      if (!email) newErrors.email = 'This field is required';
      if (!password) newErrors.password = 'This field is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setIsLoading(false);

      if (error) {
        setErrors({
          general: error.message || 'Invalid email or password.',
        });
        return;
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      setIsLoading(false);
      console.error('[LOGIN] Unexpected error during sign in:', error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <Image
          className="mx-auto my-8 w-[180px] h-auto"
          src="/AALogo.svg"
          height={32}
          width={180}
          alt="logo"
          priority
          sizes="180px"
          style={{ width: "auto", height: "auto" }}
        />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {errors.general && errors.general !== 'Both fields are required' && (
                <div className="bg-[#FAE6E6] border rounded-md border-red-500 border-l-4 border-l-red-600 p-3 flex items-center gap-2">
                  <Image
                    src="/XCircle.svg"
                    height={20}
                    width={20}
                    alt="logo"
                  />
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-black font-inter">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      errors.general === 'Both fields are required' ||
                        errors.email
                        ? 'border-red-500'
                        : ''
                    )}
                  />
                  {(errors.general === 'Both fields are required' ||
                    errors.email) && (
                    <CircleAlert
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"
                      size={18}
                    />
                  )}
                </div>
                {errors.email && <ErrorMessage message={errors.email} />}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-black font-inter">
                    Password
                  </Label>
                  <Link
                    href="/auth/reset-password"
                    className="ml-auto inline-block text-black text-sm font-inter underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      errors.general === 'Both fields are required' ||
                        errors.password
                        ? 'border-red-500 pr-20'
                        : 'pr-10'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  {(errors.general === 'Both fields are required' ||
                    errors.password) && (
                    <CircleAlert
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-red-500 pointer-events-none"
                      size={18}
                    />
                  )}
                </div>
                {errors.password && <ErrorMessage message={errors.password} />}
              </div>

              {errors.general &&
                errors.general === 'Both fields are required' && (
                  <ErrorMessage message={errors.general} />
                )}

              <Button
                type="submit"
                className="w-full bg-[#302464] font-evogria hover:bg-[#1f1656] text-white flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? 'Logging In' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

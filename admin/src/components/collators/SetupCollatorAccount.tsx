'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

/**
 * Collator onboarding is handled by Supabase: admins trigger
 * `inviteUserByEmail` when registering a collator; the invite email
 * contains the link to set a password. Legacy `?token=` links are no longer used.
 */
export function SetupCollatorAccount({
  className,
  email,
  token: _legacyToken,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  email: string | null;
  /** @deprecated Legacy setup links; collators now use the Supabase invite email. */
  token?: string | null;
}) {
  void _legacyToken;
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
          <h2 className="text-[24px] font-bold font-evogria mb-2">
            Activate your collator account
          </h2>
          <p className="text-[14px] text-[#667085] mb-4 font-inter">
            When an administrator adds you as a collator, Supabase sends an
            invitation email to{' '}
            {email ? (
              <span className="font-medium text-[#344054]">{email}</span>
            ) : (
              'your address'
            )}
            . Open that email and use the link to choose your password, then sign
            in here.
          </p>
          <p className="text-[14px] text-[#667085] mb-6 font-inter">
            If the link expired, ask your administrator to remove and re-add
            your collator entry, or use a password reset from the login page if
            you already completed setup.
          </p>
          <Button
            asChild
            className="w-full bg-[#302464] font-evogria hover:bg-[#1f1656] text-white"
          >
            <Link href="/auth/login">Go to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

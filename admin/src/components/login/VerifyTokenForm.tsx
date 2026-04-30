'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

/**
 * Legacy email+token reset is replaced by Supabase magic links.
 * This screen points users to the current flow.
 */
export default function VerifyTokenForm() {
  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl text-black font-bold text-center font-inter">
            Password reset
          </h2>
          <p className="text-sm text-gray-600 text-center font-inter">
            We send a secure link by email. Open it on this device to choose a
            new password—no separate code step.
          </p>
          <Button
            asChild
            className="w-full bg-[#302464] font-evogria hover:bg-[#1f1656] text-white"
          >
            <Link href="/auth/reset-password">Email me a reset link</Link>
          </Button>
          <Button variant="outline" asChild className="w-full font-evogria">
            <Link href="/auth/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

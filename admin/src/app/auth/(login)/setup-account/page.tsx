import { SetupCollatorAccount } from '@/components/collators/SetupCollatorAccount';
import { Suspense } from 'react';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; token?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const email = resolvedSearchParams.email ?? null;
  const token = resolvedSearchParams.token ?? null;

  return (
    <Suspense fallback={<div className="font-evogria">Loading...</div>}>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SetupCollatorAccount email={email} token={token} />
        </div>
      </div>
    </Suspense>
  );
}

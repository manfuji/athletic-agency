'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function NewPasswordRedirectInner() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace('/auth/change-password');
        return;
      }
      router.replace('/auth/reset-password');
    });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen p-6 text-sm text-gray-600 font-inter">
      Loading…
    </div>
  );
}

export default function NewPasswordRedirect() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
      <NewPasswordRedirectInner />
    </Suspense>
  );
}

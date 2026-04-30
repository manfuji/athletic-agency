'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { safeAuthNextPath } from '@/lib/siteUrl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Finishes Supabase auth from the browser: PKCE `?code=...` (email reset, some OAuth)
 * and implicit/hash sessions (e.g. invite links, where PKCE is not used).
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [hint, setHint] = useState('Signing you in…');
  const subRef = useRef<{ unsubscribe: () => void } | undefined>(undefined);
  const doneRef = useRef(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const next = safeAuthNextPath(url.searchParams.get('next'));

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      subRef.current?.unsubscribe();
      router.replace(next);
      router.refresh();
    };

    const fail = (msg: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      subRef.current?.unsubscribe();
      router.replace(`/auth/login?error=${encodeURIComponent(msg)}`);
    };

    void (async () => {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            fail(error.message);
            return;
          }
          finish();
          return;
        }

        const {
          data: { session: initial },
        } = await supabase.auth.getSession();
        if (initial) {
          finish();
          return;
        }

        setHint('Completing sign-in…');
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) finish();
        });
        subRef.current = subscription;

        await new Promise((r) => setTimeout(r, 2500));
        const {
          data: { session: late },
        } = await supabase.auth.getSession();
        if (late) {
          finish();
          return;
        }
        fail('Could not complete sign-in');
      } catch {
        fail('Could not complete sign-in');
      }
    })();

    return () => {
      subRef.current?.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex min-h-svh items-center justify-center p-6 text-sm text-gray-600 font-inter">
      {hint}
    </div>
  );
}

import { Suspense } from 'react';
import { LoginForm } from '@/components/login/login-form';

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 ">
      <div className="w-full max-w-sm">
        <Suspense fallback={
          <div className="flex items-center justify-center p-6">
            <div className="text-gray-500">Loading...</div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

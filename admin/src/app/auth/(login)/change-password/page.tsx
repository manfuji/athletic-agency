import { Suspense } from 'react';
import ChangePasswordForm from '@/components/login/ChangePasswordForm';

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChangePasswordForm />
    </Suspense>
  );
}

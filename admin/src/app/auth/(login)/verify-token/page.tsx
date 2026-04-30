import { Suspense } from 'react';
import VerifyTokenForm from '@/components/login/VerifyTokenForm';

export default function VerifyTokenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center text-center text-[#302464] text-[25px] font-evogria">
          Loading...
        </div>
      }
    >
      <VerifyTokenForm />
    </Suspense>
  );
}

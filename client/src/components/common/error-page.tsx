"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "./Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="p-2 sm:p-4 space-y-8 h-screen mt-20 flex flex-col">
      <div className="text-primary bg-[#6754bda8] font-evogria text-sm sm:text-lg w-fit mx-auto p-3 rounded-[8px]">
        Network Error
      </div>
      <div>
        <h1 className="text-2xl sm:text-4xl text-center font-inter">
          Oops! Something went wrong
        </h1>
        <p className="text-center font-inter text-sm sm:text-lg mt-4">
          We encountered an error while processing your request. Please refresh
          the page or try again later.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button
          onClick={handleGoBack}
          className="bg-transparent text-primary border border-primary py-2.5"
        >
          Go back
        </Button>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  );
}

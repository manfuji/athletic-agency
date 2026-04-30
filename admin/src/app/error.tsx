"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Error({
error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const router = useRouter();

  const handleTryAgain = () => {
      if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";");
      cookies.forEach((cookie) => {
        document.cookie =
          cookie.split("=")[0] +
          "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      });
    }
    reset();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <CardTitle>Something went wrong!</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {error.message && (
              <p className="mt-2 font-medium">{error.message}</p>
            )}
            {error.digest && (
              <p className="mt-1 text-xs">Error ID: {error.digest}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleTryAgain}
            variant="default"
            className="w-full gap-2 hover:bg-primary"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="default"
            className="w-full gap-2 hover:bg-primary"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

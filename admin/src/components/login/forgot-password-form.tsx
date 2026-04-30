// src/components/login/forgot-password-form.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleAlert } from "lucide-react";
import { forgotPassword } from "@/actions/auth";
function ErrorMessage({ message }: { message: string }) {
  return <p className="text-red-600 text-sm">{message}</p>;
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("This field is required");
      return;
    }

    try {
      const res = await forgotPassword(email);

      if ("error" in res) {
        setError(res.error || "Something went wrong");
        return;
      }

      if ("ok" in res && res.ok) {
        setMessage(
          "If an account exists for this email, you will receive a link to reset your password."
        );
        setSubmitted(true);
      } else {
        setError("An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div
      className={cn("flex justify-center items-center h-screen p-6", className)}
      {...props}
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-xl text-black font-bold text-center mb-8">
            Reset Your Password
          </h2>
          {message && (
            <p className="text-green-600 font-inter text-center mb-4">
              {message}
            </p>
          )}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-black font-inter">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(error ? "border-red-500" : "")}
                  />
                  {error && (
                    <CircleAlert
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500"
                      size={18}
                    />
                  )}
                </div>
                {error && <ErrorMessage message={error} />}
              </div>
              <Button
                type="submit"
                className="w-full bg-[#302464] font-evogria hover:bg-[#1f1656] text-white"
              >
                Send reset link
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 font-inter text-center">
                Open the link in the email on this device. It expires after a
                short time.
              </p>
              <Button
                variant="outline"
                className="w-full font-evogria"
                onClick={() => router.push("/auth/login")}
              >
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

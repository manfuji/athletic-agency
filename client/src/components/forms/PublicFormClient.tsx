"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  signInForForm,
  signOutFromForm,
  submitPublicForm,
  type PublicForm,
  type PublicFormField,
} from "@/actions/data-forms";

function toStringValue(v: unknown) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

function FormFields({
  fields,
  values,
  onChange,
}: {
  fields: PublicFormField[];
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  const setValue = (key: string, value: unknown) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => {
        const value = values[field.field_key];
        return (
          <div
            key={field.id}
            className={field.field_type === "textarea" ? "md:col-span-2" : ""}
          >
            <label className="block text-sm font-medium text-[#344054] mb-1">
              {field.label}
              {field.required ? " *" : ""}
            </label>
            {field.field_type === "boolean" ? (
              <label className="flex items-center gap-2 h-10">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => setValue(field.field_key, e.target.checked)}
                />
                <span className="text-sm">{Boolean(value) ? "Yes" : "No"}</span>
              </label>
            ) : field.field_type === "textarea" ? (
              <textarea
                className="w-full min-h-[96px] rounded-md border border-input px-3 py-2 text-sm"
                value={toStringValue(value)}
                onChange={(e) => setValue(field.field_key, e.target.value)}
              />
            ) : field.field_type === "select" && field.options?.length ? (
              <Select
                value={toStringValue(value)}
                onValueChange={(v) => setValue(field.field_key, v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={
                  field.field_type === "number"
                    ? "number"
                    : field.field_type === "date"
                      ? "date"
                      : "text"
                }
                value={toStringValue(value)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (field.field_type === "number") {
                    setValue(field.field_key, v === "" ? null : Number(v));
                  } else {
                    setValue(field.field_key, v);
                  }
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AuthPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const res = await signInForForm(email.trim(), password);
    setLoading(false);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Signed in");
    router.refresh();
  };

  return (
    <div className="rounded-lg border p-4 bg-gray-50 space-y-3">
      <p className="text-sm text-[#475467]">
        Sign in to submit this form. Use the same account as the admin dashboard if you already have one.
      </p>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleSignIn} disabled={loading} className="w-full">
        {loading ? "Signing in..." : "Sign in to continue"}
      </Button>
    </div>
  );
}

export default function PublicFormClient({
  form,
  fields,
  initialSession,
}: {
  form: PublicForm;
  fields: PublicFormField[];
  initialSession: { id: string; email: string | null } | null;
}) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  const needsAuth = form.requires_auth;
  const canSubmit = !needsAuth || Boolean(session);

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error("Sign in required");
      return;
    }
    setSubmitting(true);
    const res = await submitPublicForm(form.slug, answers);
    setSubmitting(false);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Submitted successfully");
    setSubmitted(true);
    setAnswers({});
  };

  const handleSignOut = async () => {
    await signOutFromForm();
    setSession(null);
    toast.message("Signed out");
    router.refresh();
  };

  if (submitted) {
    return (
      <div className="rounded-lg border p-6 bg-white text-center">
        <h2 className="font-evogria text-xl mb-2">Thank you</h2>
        <p className="text-sm text-[#475467]">Your response has been recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {needsAuth && !session ? (
        <AuthPanel />
      ) : (
        <>
          {session && (
            <div className="flex items-center justify-between text-sm text-[#475467]">
              <span>Signed in{session.email ? ` as ${session.email}` : ""}</span>
              <button type="button" className="underline" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          )}
          <FormFields fields={fields} values={answers} onChange={setAnswers} />
          <Button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="w-full md:w-auto"
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </>
      )}
    </div>
  );
}

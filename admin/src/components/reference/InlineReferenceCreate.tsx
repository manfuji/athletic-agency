"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type InlineReferenceCreateProps = {
  title: string;
  helpText?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  submitLabel?: string;
  /** Query keys to invalidate after a successful create (prefix match on each key). */
  queryKeysToInvalidate?: readonly (readonly string[])[];
  onSubmit: (payload: { name: string }) => Promise<unknown>;
  onCreated?: () => void;
};

/**
 * Small inline form for creating a global reference row (stages, etc.)
 * without leaving the current screen.
 */
export function InlineReferenceCreate({
  title,
  helpText,
  nameLabel = "Name",
  namePlaceholder = "Enter name",
  submitLabel = "Create",
  queryKeysToInvalidate,
  onSubmit,
  onCreated,
}: InlineReferenceCreateProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a name");
      return;
    }
    setPending(true);
    try {
      const result = await onSubmit({ name: trimmed });
      if (
        result &&
        typeof result === "object" &&
        "error" in result &&
        result.error
      ) {
        toast.error(String(result.error));
        return;
      }
      toast.success("Created successfully");
      setName("");
      if (queryKeysToInvalidate?.length) {
        for (const key of queryKeysToInvalidate) {
          await queryClient.invalidateQueries({
            queryKey: [...key] as string[],
          });
        }
      }
      onCreated?.();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/90 p-4 space-y-3 mb-4">
      <h4 className="font-semibold font-inter text-sm text-foreground">{title}</h4>
      {helpText ? (
        <p className="text-sm text-muted-foreground font-inter">{helpText}</p>
      ) : null}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 sm:items-end"
      >
        <div className="flex-1 space-y-2 min-w-0">
          <Label htmlFor="inline-ref-create-name" className="font-inter">
            {nameLabel}
          </Label>
          <Input
            id="inline-ref-create-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={namePlaceholder}
            disabled={pending}
            className="font-inter"
          />
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="bg-[#302464] hover:bg-[#1f1656] font-evogria shrink-0"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </div>
  );
}

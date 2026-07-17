"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DataFormFieldRow } from "@/actions/data-forms";

function toStringValue(v: unknown) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

export default function FillFormFields({
  fields,
  values,
  onChange,
}: {
  fields: DataFormFieldRow[];
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  const setValue = (key: string, value: unknown) => {
    onChange({ ...values, [key]: value });
  };

  if (fields.length === 0) {
    return <p className="text-sm text-muted-foreground">No fields configured.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field) => {
        const value = values[field.field_key];
        return (
          <div
            key={field.id}
            className={field.field_type === "textarea" ? "md:col-span-2" : ""}
          >
            <div className="text-sm font-medium text-[#344054] mb-1">
              {field.label}
              {field.required ? " *" : ""}
            </div>
            {field.field_type === "boolean" ? (
              <div className="flex items-center gap-2 h-10">
                <Switch
                  checked={Boolean(value)}
                  onCheckedChange={(v) => setValue(field.field_key, v)}
                />
                <span className="text-sm">{Boolean(value) ? "Yes" : "No"}</span>
              </div>
            ) : field.field_type === "textarea" ? (
              <Textarea
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

"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

export type FieldType = "string" | "number" | "boolean" | "date" | "textarea";

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  readOnly?: boolean;
  options?: Array<{ value: string; label: string }>;
};

function inferType(value: unknown): FieldType {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "date";
    if (value.length > 80) return "textarea";
    return "string";
  }
  return "string";
}

function toStringValue(v: unknown) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

export default function EditRowModal({
  title,
  description,
  row,
  fields,
  onClose,
  onSave,
}: {
  title: string;
  description?: string;
  row: Record<string, unknown>;
  fields?: FieldConfig[];
  onClose: () => void;
  onSave: (patch: Record<string, unknown>, meta: { issue: string; evidence: string }) => Promise<void>;
}) {
  const defaultFields = useMemo<FieldConfig[]>(() => {
    const keys = Object.keys(row).filter(
      (k) =>
        !["__labels", "id", "created_at", "updated_at", "deleted_at"].includes(k) &&
        !k.endsWith("_id") &&
        typeof row[k] !== "object"
    );
    return keys.map((k) => ({
      key: k,
      label: k,
      type: inferType(row[k]),
    }));
  }, [row]);

  const effectiveFields = fields ?? defaultFields;

  const [draft, setDraft] = useState<Record<string, unknown>>(() => {
    const d: Record<string, unknown> = {};
    for (const f of effectiveFields) d[f.key] = row[f.key];
    return d;
  });

  const [issue, setIssue] = useState("Admin edit");
  const [evidence, setEvidence] = useState("");
  const [saving, setSaving] = useState(false);

  const patch = useMemo(() => {
    const p: Record<string, unknown> = {};
    for (const f of effectiveFields) {
      if (f.readOnly) continue;
      const before = row[f.key];
      const after = draft[f.key];
      if (JSON.stringify(before) !== JSON.stringify(after)) p[f.key] = after;
    }
    return p;
  }, [draft, effectiveFields, row]);

  const save = async () => {
    if (Object.keys(patch).length === 0) {
      toast.message("No changes");
      onClose();
      return;
    }
    setSaving(true);
    try {
      await onSave(patch, { issue, evidence });
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
      setSaving(false);
      return;
    }
    setSaving(false);
    onClose();
  };

  const setValue = (key: string, value: unknown) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  return (
    <Dialog open onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="bg-white w-[46rem] max-w-[95vw] max-h-[85vh] overflow-hidden p-0 flex flex-col">
        <div className="px-6 py-5 border-b border-[#EAECF0]">
          <DialogHeader>
          <DialogTitle className="font-evogria text-[#101828] text-[18px]">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="font-inter text-[14px] text-[#475467]">
              {description}
            </DialogDescription>
          )}
          </DialogHeader>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {effectiveFields.map((f) => {
              const value = draft[f.key];
              const label = f.label;
              const readOnly = Boolean(f.readOnly);
              const type = f.type;
              return (
                <div key={f.key} className={type === "textarea" ? "md:col-span-2" : ""}>
                  <div className="text-xs text-[#667085] mb-1 font-inter">{label}</div>
                  {type === "boolean" ? (
                    <div className="flex items-center gap-2 h-10">
                      <Switch
                        checked={Boolean(value)}
                        onCheckedChange={(v) => setValue(f.key, v)}
                        disabled={readOnly}
                      />
                      <span className="text-sm font-inter text-[#344054]">
                        {Boolean(value) ? "Yes" : "No"}
                      </span>
                    </div>
                  ) : type === "textarea" ? (
                    <Textarea
                      value={toStringValue(value)}
                      onChange={(e) => setValue(f.key, e.target.value)}
                      disabled={readOnly}
                    />
                  ) : Array.isArray(f.options) && f.options.length ? (
                    <Select
                      value={toStringValue(value) || ""}
                      onValueChange={(v) => setValue(f.key, v)}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {f.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={type === "number" ? "number" : type === "date" ? "date" : "text"}
                      value={toStringValue(value)}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (type === "number") setValue(f.key, v === "" ? null : Number(v));
                        else setValue(f.key, v);
                      }}
                      disabled={readOnly}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-[#667085] mb-1 font-inter">Issue description</div>
              <Input value={issue} onChange={(e) => setIssue(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-[#667085] mb-1 font-inter">Evidence (optional)</div>
              <Input value={evidence} onChange={(e) => setEvidence(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#EAECF0] flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="w-full bg-transparent font-evogria text-[#344054]"
          >
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="w-full bg-[#302464] font-evogria text-white"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


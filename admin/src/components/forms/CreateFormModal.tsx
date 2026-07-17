"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDataForm,
  type DataFormRow,
  type FormAccessType,
  type FormFieldInput,
  type FormFieldType,
} from "@/actions/data-forms";

const FIELD_TYPES: FormFieldType[] = [
  "string",
  "number",
  "boolean",
  "date",
  "textarea",
  "select",
];

function emptyField(order: number): FormFieldInput {
  return {
    field_key: `field_${order}`,
    label: "",
    field_type: "string",
    required: false,
    sort_order: order,
  };
}

export default function CreateFormModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (form: DataFormRow) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accessType, setAccessType] = useState<FormAccessType>("private");
  const [fields, setFields] = useState<FormFieldInput[]>([emptyField(0)]);
  const [saving, setSaving] = useState(false);

  const updateField = (index: number, patch: Partial<FormFieldInput>) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f))
    );
  };

  const addField = () => {
    setFields((prev) => [...prev, emptyField(prev.length)]);
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const validFields = fields
      .filter((f) => f.label.trim())
      .map((f, i) => ({
        ...f,
        field_key:
          f.field_key.trim() ||
          f.label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "") ||
          `field_${i + 1}`,
        sort_order: i,
      }));

    setSaving(true);
    const res = await createDataForm({
      title: title.trim(),
      description: description.trim() || null,
      access_type: accessType,
      fields: validFields,
    });
    setSaving(false);

    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }

    toast.success("Form created");
    onCreated((res as { form: DataFormRow }).form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="bg-white w-[46rem] max-w-[95vw] max-h-[85vh] overflow-hidden p-0 flex flex-col">
        <div className="px-6 py-5 border-b border-[#EAECF0]">
          <DialogHeader>
            <DialogTitle className="font-evogria text-[#101828] text-[18px]">
              Create Form
            </DialogTitle>
            <DialogDescription className="font-inter text-[14px] text-[#475467]">
              Private forms are admin-only. Public forms are shared on the client site and require sign-in to submit.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0 space-y-4">
          <div>
            <Label htmlFor="form-title">Title</Label>
            <Input
              id="form-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Series Registration"
            />
          </div>

          <div>
            <Label htmlFor="form-description">Description</Label>
            <Textarea
              id="form-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional instructions for respondents"
            />
          </div>

          <div>
            <Label>Access type</Label>
            <Select
              value={accessType}
              onValueChange={(v) => setAccessType(v as FormAccessType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private (admin only)</SelectItem>
                <SelectItem value="public">Public (auth required to submit)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Fields</Label>
              <Button type="button" variant="outline" size="sm" onClick={addField}>
                Add field
              </Button>
            </div>

            {fields.map((field, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 border rounded-lg"
              >
                <div className="md:col-span-4">
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="Label"
                  />
                </div>
                <div className="md:col-span-3">
                  <Select
                    value={field.field_type}
                    onValueChange={(v) =>
                      updateField(index, { field_type: v as FormFieldType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      updateField(index, { required: e.target.checked })
                    }
                  />
                  <span className="text-sm text-[#475467]">Required</span>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(index)}
                    disabled={fields.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
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
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-[#302464] font-evogria text-white"
          >
            {saving ? "Creating..." : "Create Form"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

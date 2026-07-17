"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchDataForm,
  fetchFormSubmissions,
  replaceFormFields,
  submitPrivateForm,
  updateDataForm,
  type DataFormFieldRow,
  type DataFormRow,
  type FormFieldInput,
  type FormFieldType,
} from "@/actions/data-forms";
import { queryClient } from "@/providers/query-provider";
import FillFormFields from "@/components/forms/FillFormFields";

const FIELD_TYPES: FormFieldType[] = [
  "string",
  "number",
  "boolean",
  "date",
  "textarea",
  "select",
];

function toFieldInput(row: DataFormFieldRow): FormFieldInput {
  return {
    field_key: row.field_key,
    label: row.label,
    field_type: row.field_type,
    required: row.required,
    options: row.options,
    sort_order: row.sort_order,
  };
}

export default function FormDetailPanel({
  form,
  onBack,
  onUpdated,
}: {
  form: DataFormRow;
  onBack: () => void;
  onUpdated: () => void;
}) {
  const { data, isFetching } = useQuery({
    queryKey: ["data-form", form.id],
    queryFn: () => fetchDataForm(form.id),
  });

  const detail =
    data && typeof data === "object" && !("error" in data) ? data : null;
  const fields = detail?.fields ?? [];

  const [draftFields, setDraftFields] = useState<FormFieldInput[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submissionPage, setSubmissionPage] = useState(1);
  const [tab, setTab] = useState<"fields" | "submissions" | "fill">("fields");

  const tabs: Array<"fields" | "submissions" | "fill"> = [
    "fields",
    "submissions",
    ...(form.access_type === "private" ? (["fill"] as const) : []),
  ];

  const { data: submissionsData } = useQuery({
    queryKey: ["form-submissions", form.id, submissionPage],
    queryFn: () => fetchFormSubmissions(form.id, submissionPage),
    enabled: tab === "submissions",
  });

  const submissions =
    submissionsData &&
    typeof submissionsData === "object" &&
    !("error" in submissionsData)
      ? submissionsData
      : null;

  const effectiveFields = useMemo(
    () => draftFields ?? fields.map(toFieldInput),
    [draftFields, fields]
  );

  const clientBase = process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000";

  const publicUrl =
    form.access_type === "public" && clientBase
      ? `${clientBase.replace(/\/$/, "")}/forms/${form.slug}`
      : null;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["data-form", form.id] });
    queryClient.invalidateQueries({ queryKey: ["form-submissions", form.id] });
    onUpdated();
  };

  const saveFields = async () => {
    const res = await replaceFormFields(form.id, effectiveFields);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Fields saved");
    setDraftFields(null);
    refresh();
  };

  const submitPrivate = async () => {
    const res = await submitPrivateForm(form.id, answers);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Submission recorded");
    setAnswers({});
    refresh();
  };

  const toggleAccess = async () => {
    const next = form.access_type === "private" ? "public" : "private";
    const res = await updateDataForm(form.id, { access_type: next });
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Access updated");
    refresh();
    onBack();
  };

  const updateField = (index: number, patch: Partial<FormFieldInput>) => {
    setDraftFields((prev) => {
      const base = prev ?? fields.map(toFieldInput);
      return base.map((f, i) => (i === index ? { ...f, ...patch } : f));
    });
  };

  const addField = () => {
    setDraftFields((prev) => {
      const base = prev ?? fields.map(toFieldInput);
      return [
        ...base,
        {
          field_key: `field_${base.length + 1}`,
          label: "",
          field_type: "string" as FormFieldType,
          required: false,
          sort_order: base.length,
        },
      ];
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <Button variant="outline" size="sm" onClick={onBack}>
            Back to forms
          </Button>
          <h2 className="font-evogria text-[22px] text-[#101828] mt-3">{form.title}</h2>
          <p className="font-inter text-sm text-[#475467]">
            {form.access_type === "public"
              ? "Public form — respondents must sign in to submit"
              : "Private form — admin only"}
          </p>
          {publicUrl && (
            <p className="font-inter text-sm text-[#475467] mt-1">
              Public URL:{" "}
              <a href={publicUrl} className="text-[#302464] underline" target="_blank" rel="noreferrer">
                {publicUrl}
              </a>
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={toggleAccess}>
            Switch to {form.access_type === "private" ? "public" : "private"}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <Button
            key={t}
            variant={tab === t ? "default" : "outline"}
            className={tab === t ? "bg-[#302464] text-white" : ""}
            onClick={() => setTab(t)}
          >
            {t === "fields" ? "Fields" : t === "submissions" ? "Submissions" : "Fill form"}
          </Button>
        ))}
      </div>

      {isFetching && !detail ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : tab === "fields" ? (
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <Label>Form fields</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addField}>
                Add field
              </Button>
              <Button
                size="sm"
                className="bg-[#302464] text-white"
                onClick={saveFields}
              >
                Save fields
              </Button>
            </div>
          </div>
          {effectiveFields.map((field, index) => (
            <div
              key={`${field.field_key}-${index}`}
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
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    updateField(index, { required: e.target.checked })
                  }
                />
                <span className="text-sm">Required</span>
              </div>
              <div className="md:col-span-3">
                <Input
                  value={field.field_key}
                  onChange={(e) => updateField(index, { field_key: e.target.value })}
                  placeholder="field_key"
                />
              </div>
            </div>
          ))}
        </div>
      ) : tab === "submissions" ? (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-[#475467]">Submitted</th>
                <th className="px-4 py-3 text-left text-sm text-[#475467]">Answers</th>
              </tr>
            </thead>
            <tbody>
              {!submissions?.data?.length ? (
                <tr>
                  <td className="px-4 py-6" colSpan={2}>
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                submissions.data.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-3 text-sm align-top whitespace-nowrap">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <pre className="text-xs whitespace-pre-wrap">
                        {JSON.stringify(s.answers, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {submissions && submissions.last_page > 1 && (
            <div className="flex gap-2 p-4">
              <Button
                variant="outline"
                size="sm"
                disabled={submissionPage <= 1}
                onClick={() => setSubmissionPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={submissionPage >= submissions.last_page}
                onClick={() => setSubmissionPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-4 space-y-4">
          <FillFormFields
            fields={fields}
            values={answers}
            onChange={setAnswers}
          />
          <Button className="bg-[#302464] text-white" onClick={submitPrivate}>
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}

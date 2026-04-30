"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/providers/query-provider";
import { fetchOpsTable, updateOpsRow, type OpsTableName } from "@/actions/ops-table";
import EditRowModal from "@/components/forms/EditRowModal";

function safeString(v: unknown) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

function safeShortUuid(v: unknown) {
  const s = safeString(v);
  if (!s) return "-";
  return s.length > 10 ? `${s.slice(0, 8)}…` : s;
}

function summaryFor(row: Record<string, unknown>) {
  const labels = (row.__labels as Record<string, unknown> | undefined) ?? undefined;
  const s = labels ? (labels.summary as unknown) : null;
  return typeof s === "string" && s.trim() ? s : null;
}

export default function OpsTableManager({ table }: { table: OpsTableName }) {
  const [page, setPage] = useState(1);
  const { data, isFetching } = useQuery({
    queryKey: ["ops-table", table, page],
    queryFn: () => fetchOpsTable({ table, page }),
  });

  const rows = useMemo(() => data?.data ?? [], [data]);
  const last = data?.last_page ?? 1;

  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["ops-table", table] });

  const openEdit = (row: Record<string, unknown>) => setEditing(row);

  return (
    <div className="w-full">
      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                id
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Summary
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td className="px-6 py-6" colSpan={3}>
                  {isFetching ? "Loading..." : "No rows found."}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={safeString(r.id)}>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {safeShortUuid(r.id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {summaryFor(r) ?? safeString(r.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-3">
        <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || isFetching}>
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {page} / {last}
        </div>
        <Button variant="outline" onClick={() => setPage((p) => Math.min(last, p + 1))} disabled={page >= last || isFetching}>
          Next
        </Button>
      </div>

      {editing && (
        <EditRowModal
          title={`Edit ${table}`}
          description="Edits are audited to qa_log."
          row={editing}
          onClose={() => setEditing(null)}
          onSave={async (patch, meta) => {
            const id = safeString(editing.id);
            const res = await updateOpsRow({
              table,
              id,
              patch,
              issue_description: meta.issue,
              evidence_reference: meta.evidence || null,
            });
            if (res && typeof res === "object" && "error" in res) {
              const msg = (res as Record<string, unknown>).error;
              throw new Error(typeof msg === "string" ? msg : "Failed to save");
            }
            refresh();
          }}
        />
      )}
    </div>
  );
}


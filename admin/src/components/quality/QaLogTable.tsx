"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchQaLog } from "@/actions/qa-log";

function safeStr(v: unknown) {
  return v == null ? "" : String(v);
}

function shortId(v: unknown) {
  const s = safeStr(v);
  if (!s) return "-";
  return s.length > 10 ? `${s.slice(0, 8)}…` : s;
}

export default function QaLogTable() {
  const [page, setPage] = useState(1);
  const [tableName, setTableName] = useState("");
  const [recordId, setRecordId] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["qa-log", page, tableName, recordId],
    queryFn: () =>
      fetchQaLog({
        page,
        table_name: tableName.trim() || undefined,
        record_id: recordId.trim() || undefined,
      }),
  });

  const rows = useMemo(() => data?.data ?? [], [data]);
  const last = data?.last_page ?? 1;

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <Input
          value={tableName}
          onChange={(e) => {
            setTableName(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by table_name (e.g. bio_data, passes)"
        />
        <Input
          value={recordId}
          onChange={(e) => {
            setRecordId(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by record_id (uuid)"
        />
        <div className="text-sm text-muted-foreground flex items-center">
          {isFetching ? "Loading..." : `${rows.length} shown`}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                table
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                record_id
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                issue
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                corrected_by
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                corrected_at
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td className="px-6 py-6" colSpan={5}>
                  {isFetching ? "Loading..." : "No QA log entries."}
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={`${safeStr(r.id)}-${idx}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {safeStr(r.table_name)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    <span title={safeStr(r.record_id)}>{shortId(r.record_id)}</span>
                  </td>
                  <td className="px-6 py-4 text-[14px] font-inter text-[#475467] max-w-[420px] truncate">
                    {safeStr(r.issue_description)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {safeStr(r.corrected_by)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {safeStr(r.corrected_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-3">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || isFetching}
        >
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {page} / {last}
        </div>
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.min(last, p + 1))}
          disabled={page >= last || isFetching}
        >
          Next
        </Button>
      </div>
    </div>
  );
}


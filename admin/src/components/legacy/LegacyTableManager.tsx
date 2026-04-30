"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/providers/query-provider";
import {
  fetchLegacyTable,
  updateLegacyRow,
  type LegacyTableName,
} from "@/actions/legacy-table";
import EditRowModal, { type FieldConfig } from "@/components/forms/EditRowModal";
import { fetchAllTeams } from "@/actions/teams";

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

function labelFor(row: Record<string, unknown>, key: "match" | "team" | "player") {
  const labels = (row.__labels as Record<string, unknown> | undefined) ?? undefined;
  const label = labels ? (labels[key] as unknown) : null;
  return typeof label === "string" && label.trim() ? label : null;
}

function labelAny(row: Record<string, unknown>, key: string) {
  const labels = (row.__labels as Record<string, unknown> | undefined) ?? undefined;
  const label = labels ? (labels[key] as unknown) : null;
  return typeof label === "string" && label.trim() ? label : null;
}

export default function LegacyTableManager({ table }: { table: LegacyTableName }) {
  const [page, setPage] = useState(1);
  const [matchId, setMatchId] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["legacy-table", table, page, matchId],
    queryFn: () =>
      fetchLegacyTable({
        table,
        page,
        match_id: matchId.trim() || undefined,
      }),
  });

  const rows = useMemo(() => data?.data ?? [], [data]);
  const last = data?.last_page ?? 1;

  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const { data: teams } = useQuery({
    queryKey: ["all-teams"],
    queryFn: fetchAllTeams,
    enabled: table === "matches",
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["legacy-table", table] });

  const openEdit = (row: Record<string, unknown>) => setEditing(row);

  const matchFields: FieldConfig[] = useMemo(() => {
    const opts =
      Array.isArray(teams) && teams.length
        ? teams.map((t) => ({
            value: t.id,
            label: t.shortCode ? `${t.name} (${t.shortCode})` : t.name,
          }))
        : [];
    return [
      { key: "Event", label: "Event", type: "string" },
      { key: "Date", label: "Date", type: "date" },
      { key: "home_team_id", label: "Home team", type: "string", options: opts },
      { key: "away_team_id", label: "Away team", type: "string", options: opts },
      { key: "home_score", label: "Home score", type: "number" },
      { key: "away_score", label: "Away score", type: "number" },
      { key: "stage", label: "Stage", type: "string" },
      { key: "match_status", label: "Status", type: "string" },
      { key: "video_url", label: "Video URL", type: "string" },
      { key: "notes", label: "Notes", type: "textarea" },
    ];
  }, [teams]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div className="flex gap-2 items-center">
          <Input
            value={matchId}
            onChange={(e) => {
              setMatchId(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by match_id (optional)"
            className="w-[22rem] max-w-[90vw]"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {isFetching ? "Loading..." : `${rows.length} shown`}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Record
              </th>
              {table === "matches" ? (
                <>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                    Teams
                  </th>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                    Status
                  </th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                    Match
                  </th>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                    Verified
                  </th>
                </>
              )}
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td className="px-6 py-6" colSpan={table === "matches" ? 7 : 6}>
                  {isFetching ? "Loading..." : "No rows found."}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={safeString(r.id)}>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    <div className="flex flex-col">
                      <span className="font-medium text-[#1E1E1E]">
                        {safeShortUuid(r.id)}
                      </span>
                      <span className="text-xs text-[#667085]">{table}</span>
                    </div>
                  </td>
                  {table === "matches" ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                        {labelAny(r, "event") ?? safeString((r as Record<string, unknown>).Event) ?? "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                        {safeString((r as Record<string, unknown>).Date) || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                        {(labelFor(r, "team") ?? safeString((r as Record<string, unknown>).Teams)) || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                        {safeString((r as Record<string, unknown>).home_score) || "0"}-
                        {safeString((r as Record<string, unknown>).away_score) || "0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                        {safeString((r as Record<string, unknown>).match_status) || "-"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                        {labelFor(r, "match") ?? safeShortUuid((r as Record<string, unknown>).match_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                        {labelFor(r, "player") ?? safeShortUuid((r as Record<string, unknown>).player_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                        {labelFor(r, "team") ?? safeShortUuid((r as Record<string, unknown>).team_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                        {typeof (r as Record<string, unknown>).data_verified === "boolean"
                          ? (r as Record<string, unknown>).data_verified
                            ? "Yes"
                            : "No"
                          : "-"}
                      </td>
                    </>
                  )}
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

      {editing && (
        <EditRowModal
          title={`Edit ${table}`}
          description="Edits are audited to qa_log."
          row={editing}
          fields={table === "matches" ? matchFields : undefined}
          onClose={() => setEditing(null)}
          onSave={async (patch, meta) => {
            const id = safeString(editing.id);
            const res = await updateLegacyRow({
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


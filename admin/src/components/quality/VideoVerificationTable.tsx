"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchVideoVerification } from "@/actions/video-verification";

function safeStr(v: unknown) {
  return v == null ? "" : String(v);
}

function shortId(v: unknown) {
  const s = safeStr(v);
  if (!s) return "-";
  return s.length > 10 ? `${s.slice(0, 8)}…` : s;
}

export default function VideoVerificationTable() {
  const [page, setPage] = useState(1);
  const [matchId, setMatchId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [statTable, setStatTable] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["video-verification", page, matchId, playerId, statTable],
    queryFn: () =>
      fetchVideoVerification({
        page,
        match_id: matchId.trim() || undefined,
        player_id: playerId.trim() || undefined,
        stat_table: statTable.trim() || undefined,
      }),
  });

  const rows = useMemo(() => data?.data ?? [], [data]);
  const last = data?.last_page ?? 1;

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <Input
          value={matchId}
          onChange={(e) => {
            setMatchId(e.target.value);
            setPage(1);
          }}
          placeholder="match_id (uuid)"
        />
        <Input
          value={playerId}
          onChange={(e) => {
            setPlayerId(e.target.value);
            setPage(1);
          }}
          placeholder="player_id (uuid)"
        />
        <Input
          value={statTable}
          onChange={(e) => {
            setStatTable(e.target.value);
            setPage(1);
          }}
          placeholder="stat_table (e.g. passes)"
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
                match_id
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                stat_table
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                player_id
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                column
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                original
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                verified
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                verified_at
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td className="px-6 py-6" colSpan={7}>
                  {isFetching ? "Loading..." : "No verification logs."}
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={`${safeStr(r.id)}-${idx}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    <span title={safeStr(r.match_id)}>{shortId(r.match_id)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {safeStr(r.stat_table)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    <span title={safeStr(r.player_id)}>{shortId(r.player_id)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {safeStr(r.stat_column)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {safeStr(r.original_value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {safeStr(r.verified_value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {safeStr(r.verified_at)}
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


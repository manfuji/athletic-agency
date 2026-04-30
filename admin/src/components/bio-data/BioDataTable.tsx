"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SearchInput from "@/reusables/SearchInput";
import { queryClient } from "@/providers/query-provider";
import { fetchBioData, type BioDataRow } from "@/actions/bio-data";
import { importBioDataToPlayer, unlinkBioData } from "@/actions/legacyPlayers";
import EditBioDataModal from "./EditBioDataModal";

export default function BioDataTable() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<BioDataRow | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: ["bio-data", page, q],
    queryFn: () => fetchBioData({ page, q: q.trim() || undefined }),
  });

  const rows = useMemo(() => data?.data ?? [], [data]);
  const last = data?.last_page ?? 1;

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["bio-data"] });

  const handleImport = async (bioDataId: string) => {
    const res = await importBioDataToPlayer(bioDataId);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Imported to Players");
    refresh();
  };

  const handleUnlink = async (bioDataId: string) => {
    const res = await unlinkBioData(bioDataId);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Unlinked");
    refresh();
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 gap-2">
        <SearchInput
          placeholder="Search by name, email, code"
          onSearch={(value) => {
            setQ(value);
            setPage(1);
          }}
        />
        <div className="text-sm text-muted-foreground">
          {isFetching ? "Loading..." : `${rows.length} shown`}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Mapped Player
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td className="px-6 py-6" colSpan={5}>
                  {isFetching ? "Loading..." : "No bio data found."}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.bio_data_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    <div className="flex flex-col">
                      <span className="font-medium text-[#1E1E1E]">
                        {r.player_name}
                      </span>
                      <span className="text-xs text-[#667085]">
                        {r.player_code ?? "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {r.aa_stats_email ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {r.position ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {r.mapping?.player?.name
                      ? `${r.mapping.player.name}`
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(r)}
                    >
                      Edit
                    </Button>
                    {!r.mapping?.player_id ? (
                      <Button
                        size="sm"
                        className="bg-[#302464] text-white hover:bg-[#302464]"
                        onClick={() => handleImport(r.bio_data_id)}
                      >
                        Import
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUnlink(r.bio_data_id)}
                      >
                        Unlink
                      </Button>
                    )}
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
        <EditBioDataModal
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}


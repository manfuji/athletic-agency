"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchUnmappedBioData,
  importBioDataToPlayer,
  type LegacyBioDataRow,
} from "@/actions/legacyPlayers";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
};

export default function ImportLegacyBioDataModal({
  isOpen,
  onClose,
  onImported,
}: Props) {
  const [page, setPage] = useState(1);
  const [importingId, setImportingId] = useState<string | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: ["legacy-bio-data", page],
    queryFn: () => fetchUnmappedBioData(page),
    enabled: isOpen,
  });

  const rows = useMemo(() => (data?.data ?? []) as LegacyBioDataRow[], [data]);

  const handleImport = async (bioDataId: string) => {
    setImportingId(bioDataId);
    try {
      const res = await importBioDataToPlayer(bioDataId);
      if (res && typeof res === "object" && "error" in res) {
        toast.error(String((res as { error?: unknown }).error ?? "Import failed"));
        return;
      }
      toast.success("Imported into Players");
      onImported();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImportingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="bg-white w-[46rem] max-w-[95vw] max-h-[85vh] overflow-hidden p-0 flex flex-col">
        <div className="px-6 py-5 border-b border-[#EAECF0]">
          <DialogHeader>
          <DialogTitle className="font-evogria text-[#302464]">
            Import Legacy Bio Data
          </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 flex-1 min-h-0 overflow-y-auto">
          <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
            <Table className="rounded-md w-[100%]">
              <TableHeader>
                <TableRow>
                  <TableHead>Player Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {isFetching ? "Loading..." : "No unmapped bio data found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow key={r.bio_data_id}>
                      <TableCell className="max-w-[240px] truncate">
                        {r.player_name}
                      </TableCell>
                      <TableCell>{r.position ?? "-"}</TableCell>
                      <TableCell>{r.nationality ?? "-"}</TableCell>
                      <TableCell>
                        {r.dob
                          ? new Date(r.dob).toLocaleDateString("en-GB")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="bg-[#302464] text-white hover:bg-[#302464]"
                          disabled={importingId === r.bio_data_id}
                          onClick={() => handleImport(r.bio_data_id)}
                        >
                          {importingId === r.bio_data_id ? "Importing..." : "Import"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#EAECF0] flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isFetching}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {page} / {data?.last_page ?? 1}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min((data?.last_page ?? 1), p + 1))}
            disabled={page >= (data?.last_page ?? 1) || isFetching}
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


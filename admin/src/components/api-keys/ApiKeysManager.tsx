"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createApiKey,
  deleteApiKey,
  fetchApiKeys,
  renameApiKey,
  setApiKeyActive,
  type ApiKeyRow,
} from "@/actions/api-keys";
import { queryClient } from "@/providers/query-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ApiKeysManager() {
  const { data, isFetching } = useQuery({
    queryKey: ["api-keys"],
    queryFn: fetchApiKeys,
  });

  const rows = useMemo(() => data ?? [], [data]);

  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [rawKey, setRawKey] = useState<string | null>(null);

  const [renaming, setRenaming] = useState<ApiKeyRow | null>(null);
  const [renameLabel, setRenameLabel] = useState("");

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["api-keys"] });

  const handleCreate = async () => {
    setCreating(true);
    const res = await createApiKey(label.trim() ? label.trim() : null);
    setCreating(false);

    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }

    const created = res as ApiKeyRow;
    setRawKey(created.api_key ?? null);
    setLabel("");
    refresh();
  };

  const toggleActive = async (row: ApiKeyRow) => {
    const res = await setApiKeyActive(row.id, !row.is_active);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Updated");
    refresh();
  };

  const doDelete = async (row: ApiKeyRow) => {
    const res = await deleteApiKey(row.id);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Deleted");
    refresh();
  };

  const openRename = (row: ApiKeyRow) => {
    setRenaming(row);
    setRenameLabel(row.label ?? "");
  };

  const saveRename = async () => {
    if (!renaming) return;
    const res = await renameApiKey(renaming.id, renameLabel.trim() ? renameLabel.trim() : null);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Renamed");
    setRenaming(null);
    refresh();
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-end mb-4">
        <div className="flex-1">
          <div className="text-sm text-muted-foreground mb-1">Label (optional)</div>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. internal-service" />
        </div>
        <Button onClick={handleCreate} disabled={creating} className="bg-[#302464] text-white hover:bg-[#302464] font-evogria">
          {creating ? "Creating..." : "Create API Key"}
        </Button>
      </div>

      {rawKey && (
        <div className="mb-4 p-4 border rounded-md bg-white">
          <div className="font-evogria text-[#101828] mb-2">New API Key (copy now)</div>
          <pre className="text-xs p-3 bg-gray-50 border rounded overflow-auto">{rawKey}</pre>
          <div className="text-xs text-muted-foreground mt-2">
            This value will not be shown again.
          </div>
          <div className="mt-2">
            <Button variant="outline" onClick={() => setRawKey(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Label
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Active
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Created
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td className="px-6 py-6" colSpan={4}>
                  {isFetching ? "Loading..." : "No API keys found."}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {r.label ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {r.is_active ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {r.created_at}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => openRename(r)}>
                      Rename
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleActive(r)}>
                      {r.is_active ? "Disable" : "Enable"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => doDelete(r)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {renaming && (
        <Dialog open onOpenChange={(open) => (!open ? setRenaming(null) : null)}>
          <DialogContent className="bg-white w-[30rem]">
            <DialogHeader>
              <DialogTitle className="font-evogria text-[#101828] text-[18px]">
                Rename API Key
              </DialogTitle>
              <DialogDescription className="font-inter text-[14px] text-[#475467]">
                Update the label for this key.
              </DialogDescription>
            </DialogHeader>
            <Input value={renameLabel} onChange={(e) => setRenameLabel(e.target.value)} placeholder="Label" />
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-2">
              <Button variant="outline" onClick={() => setRenaming(null)} className="w-full bg-transparent font-evogria text-[#344054]">
                Cancel
              </Button>
              <Button onClick={saveRename} className="w-full bg-[#302464] font-evogria text-white">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


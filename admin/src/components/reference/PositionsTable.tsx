"use client";

import { useMemo, useState } from "react";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createPosition,
  deletePosition,
  fetchPositions,
  updatePosition,
  type Position,
} from "@/actions/positions";

export default function PositionsTable({
  initialPositions,
}: {
  initialPositions: Position[];
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: fetchPositions,
    initialData: initialPositions,
  });

  const rows = useMemo(() => data ?? [], [data]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [draftCode, setDraftCode] = useState("");
  const [draftName, setDraftName] = useState("");
  const [selected, setSelected] = useState<Position | null>(null);

  const openEdit = (p: Position) => {
    setSelected(p);
    setDraftCode(p.code);
    setDraftName(p.name);
    setIsEditOpen(true);
  };

  const openDelete = (p: Position) => {
    setSelected(p);
    setIsDeleteOpen(true);
  };

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["positions"] });

  const handleCreate = async () => {
    if (!draftCode.trim() || !draftName.trim()) {
      toast.error("code and name are required");
      return;
    }
    setIsSubmitting(true);
    const res = await createPosition({
      code: draftCode.trim(),
      name: draftName.trim(),
    });
    setIsSubmitting(false);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Position created");
    setIsAddOpen(false);
    setDraftCode("");
    setDraftName("");
    refresh();
  };

  const handleUpdate = async () => {
    if (!selected) return;
    if (!draftCode.trim() || !draftName.trim()) {
      toast.error("code and name are required");
      return;
    }
    setIsSubmitting(true);
    const res = await updatePosition(selected.id, {
      code: draftCode.trim(),
      name: draftName.trim(),
    });
    setIsSubmitting(false);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Position updated");
    setIsEditOpen(false);
    setSelected(null);
    refresh();
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    const res = await deletePosition(selected.id);
    setIsSubmitting(false);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Position deleted");
    setIsDeleteOpen(false);
    setSelected(null);
    refresh();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            setDraftCode("");
            setDraftName("");
            setIsAddOpen(true);
          }}
          className="bg-[#302464] text-white hover:bg-[#302464] hover:text-white font-evogria"
        >
          Add Position
        </Button>
      </div>

      <div className="overflow-x-auto w-full mx-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
        <table className="w-full mx-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Name
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td className="px-6 py-6" colSpan={3}>
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-6" colSpan={3}>
                  No positions found.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {p.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="p-0 h-auto">
                          <MoreVertical className="h-4 w-4 text-[#98A2B3]" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2 flex flex-col gap-2 bg-white">
                        <Button
                          variant="ghost"
                          className="w-full text-left text-[#1E1E1E] font-inter font-medium bg-white hover:bg-gray-100 justify-start"
                          onClick={() => openEdit(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full text-left text-[#FF0000] font-inter font-medium bg-white hover:bg-gray-100 justify-start"
                          onClick={() => openDelete(p)}
                          disabled={isSubmitting}
                        >
                          Delete
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-white w-[30rem]">
          <DialogHeader>
            <DialogTitle className="font-evogria text-[#101828] text-[18px]">
              Add Position
            </DialogTitle>
            <DialogDescription className="font-inter text-[14px] text-[#475467]">
              Create a new position reference.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              value={draftCode}
              onChange={(e) => setDraftCode(e.target.value)}
              placeholder="Code (e.g. FW)"
            />
            <Input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Name (e.g. Forward)"
            />
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={isSubmitting}
              className="w-full bg-transparent font-evogria text-[#344054]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="w-full bg-[#302464] font-evogria text-white"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white w-[30rem]">
          <DialogHeader>
            <DialogTitle className="font-evogria text-[#101828] text-[18px]">
              Edit Position
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input value={draftCode} onChange={(e) => setDraftCode(e.target.value)} />
            <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} />
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSubmitting}
              className="w-full bg-transparent font-evogria text-[#344054]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="w-full bg-[#302464] font-evogria text-white"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-white w-[26rem]">
          <DialogHeader>
            <DialogTitle className="font-evogria text-[#101828] text-[18px] mb-2">
              Delete Position
            </DialogTitle>
            <DialogDescription className="font-inter text-[14px] text-[#475467]">
              Are you sure you want to delete this position?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSubmitting}
              className="w-full bg-transparent font-evogria text-[#344054]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="w-full bg-[#D92D20] font-evogria text-white"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


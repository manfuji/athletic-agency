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
  createEventSeason,
  deleteEventSeason,
  fetchEventSeasons,
  updateEventSeason,
  type EventSeason,
} from "@/actions/event-seasons";

export default function EventSeasonsTable({
  initialSeasons,
}: {
  initialSeasons: EventSeason[];
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["event-seasons"],
    queryFn: fetchEventSeasons,
    initialData: initialSeasons,
  });

  const rows = useMemo(() => data ?? [], [data]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [draftName, setDraftName] = useState("");
  const [draftYear, setDraftYear] = useState(String(new Date().getFullYear()));
  const [draftStart, setDraftStart] = useState("");
  const [draftEnd, setDraftEnd] = useState("");
  const [draftActive, setDraftActive] = useState(true);
  const [draftType, setDraftType] = useState("");
  const [selected, setSelected] = useState<EventSeason | null>(null);

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["event-seasons"] });

  const openEdit = (r: EventSeason) => {
    setSelected(r);
    setDraftName(r.name ?? "");
    setDraftYear(String(r.year ?? ""));
    setDraftStart(r.start_date ?? "");
    setDraftEnd(r.end_date ?? "");
    setDraftActive(Boolean(r.is_active));
    setDraftType(r.competition_type ?? "");
    setIsEditOpen(true);
  };

  const openDelete = (r: EventSeason) => {
    setSelected(r);
    setIsDeleteOpen(true);
  };

  const handleCreate = async () => {
    if (!draftName.trim() || !draftYear.trim()) {
      toast.error("name and year are required");
      return;
    }
    setIsSubmitting(true);
    const res = await createEventSeason({
      name: draftName.trim(),
      year: Number(draftYear),
      start_date: draftStart.trim() ? draftStart.trim() : null,
      end_date: draftEnd.trim() ? draftEnd.trim() : null,
      description: null,
      is_active: draftActive,
      competition_type: draftType.trim() ? draftType.trim() : null,
    });
    setIsSubmitting(false);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Season created");
    setIsAddOpen(false);
    refresh();
  };

  const handleUpdate = async () => {
    if (!selected) return;
    if (!draftName.trim() || !draftYear.trim()) {
      toast.error("name and year are required");
      return;
    }
    setIsSubmitting(true);
    const res = await updateEventSeason(selected.id, {
      name: draftName.trim(),
      year: Number(draftYear),
      start_date: draftStart.trim() ? draftStart.trim() : null,
      end_date: draftEnd.trim() ? draftEnd.trim() : null,
      is_active: draftActive,
      competition_type: draftType.trim() ? draftType.trim() : null,
    });
    setIsSubmitting(false);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Season updated");
    setIsEditOpen(false);
    setSelected(null);
    refresh();
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    const res = await deleteEventSeason(selected.id);
    setIsSubmitting(false);
    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      return;
    }
    toast.success("Season deleted");
    setIsDeleteOpen(false);
    setSelected(null);
    refresh();
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            setDraftName("");
            setDraftYear(String(new Date().getFullYear()));
            setDraftStart("");
            setDraftEnd("");
            setDraftActive(true);
            setDraftType("");
            setIsAddOpen(true);
          }}
          className="bg-[#302464] text-white hover:bg-[#302464] hover:text-white font-evogria"
        >
          Add Season
        </Button>
      </div>

      <div className="overflow-x-auto w-full mx-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
        <table className="w-full mx-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Active
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Start
              </th>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                End
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td className="px-6 py-6" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-6 py-6" colSpan={6}>
                  No seasons found.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {r.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {r.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {r.is_active ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {r.start_date ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {r.end_date ?? "-"}
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
                          onClick={() => openEdit(r)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full text-left text-[#FF0000] font-inter font-medium bg-white hover:bg-gray-100 justify-start"
                          onClick={() => openDelete(r)}
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
        <DialogContent className="bg-white w-[34rem]">
          <DialogHeader>
            <DialogTitle className="font-evogria text-[#101828] text-[18px]">
              Add Season
            </DialogTitle>
            <DialogDescription className="font-inter text-[14px] text-[#475467]">
              Create a new event season.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} placeholder="Name" />
            <Input value={draftYear} onChange={(e) => setDraftYear(e.target.value)} placeholder="Year" />
            <Input value={draftType} onChange={(e) => setDraftType(e.target.value)} placeholder="Competition type (optional)" />
            <Input value={draftStart} onChange={(e) => setDraftStart(e.target.value)} placeholder="Start date (YYYY-MM-DD, optional)" />
            <Input value={draftEnd} onChange={(e) => setDraftEnd(e.target.value)} placeholder="End date (YYYY-MM-DD, optional)" />
            <label className="flex items-center gap-2 font-inter text-[14px] text-[#475467]">
              <input type="checkbox" checked={draftActive} onChange={(e) => setDraftActive(e.target.checked)} />
              Active
            </label>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-2">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting} className="w-full bg-transparent font-evogria text-[#344054]">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isSubmitting} className="w-full bg-[#302464] font-evogria text-white">
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-white w-[34rem]">
          <DialogHeader>
            <DialogTitle className="font-evogria text-[#101828] text-[18px]">
              Edit Season
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} />
            <Input value={draftYear} onChange={(e) => setDraftYear(e.target.value)} />
            <Input value={draftType} onChange={(e) => setDraftType(e.target.value)} />
            <Input value={draftStart} onChange={(e) => setDraftStart(e.target.value)} />
            <Input value={draftEnd} onChange={(e) => setDraftEnd(e.target.value)} />
            <label className="flex items-center gap-2 font-inter text-[14px] text-[#475467]">
              <input type="checkbox" checked={draftActive} onChange={(e) => setDraftActive(e.target.checked)} />
              Active
            </label>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSubmitting} className="w-full bg-transparent font-evogria text-[#344054]">
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting} className="w-full bg-[#302464] font-evogria text-white">
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-white w-[26rem]">
          <DialogHeader>
            <DialogTitle className="font-evogria text-[#101828] text-[18px] mb-2">
              Delete Season
            </DialogTitle>
            <DialogDescription className="font-inter text-[14px] text-[#475467]">
              Are you sure you want to delete this season?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isSubmitting} className="w-full bg-transparent font-evogria text-[#344054]">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting} className="w-full bg-[#D92D20] font-evogria text-white">
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


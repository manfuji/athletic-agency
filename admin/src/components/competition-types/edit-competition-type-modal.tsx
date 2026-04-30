"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function EditCompetitionTypeModal({
  isOpen,
  onClose,
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onSave,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  description: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSave: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[24px] font-evogria">Edit Competition Type</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <label className="text-sm">Name</label>
            <Input value={name} onChange={(e) => onNameChange(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Description</label>
            <Textarea rows={4} value={description} onChange={(e) => onDescriptionChange(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={onSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

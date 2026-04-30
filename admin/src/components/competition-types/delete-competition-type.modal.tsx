import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";

interface DeleteCompetitionTypeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  competitionTypeId: string;
  onDelete: (competitionTypeId: string) => Promise<void>;
}

export default function DeleteCompetitionTypeModal({
  isOpen,
  onOpenChange,
  competitionTypeId,
  onDelete,
}: DeleteCompetitionTypeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    await onDelete(competitionTypeId);
    setIsLoading(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[24px] font-evogria text-[#000000] font-normal">
            Delete Competition Type
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-[16px] font-inter text-[#667085]">
          Are you sure you want to delete this competition type?
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-[#344054] text-[16px] font-evogria"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="uppercase text-[16px] font-evogria"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

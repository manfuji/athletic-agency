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

interface DeleteFixtureModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fixtureId: string;
  onDelete: (fixtureId: string) => Promise<void>;
}

export default function DeleteFixtureModal({
  isOpen,
  onOpenChange,
  fixtureId,
  onDelete,
}: DeleteFixtureModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    await onDelete(fixtureId);
    setIsLoading(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[24px] font-evogria text-[#000000] font-normal">
            Delete Fixture
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-[16px] font-inter text-[#667085]">
          This fixture may have recorded match results or statistics. Deleting
          it will permanently remove all associated data and may impact reports
          or player records.
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

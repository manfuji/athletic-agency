import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from "react";
import { deleteCompetition } from "@/actions/competitions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SetupCompetitionHeaderProps {
  allStepsCompleted: boolean;
  canPublish: boolean;
  competitionStatus: string;
  onPublishToggle: (checked: boolean) => void;
  onStartCompetition: () => void;
  isPublished: boolean;
  competitionId: string;
}

const SetupCompetitionHeader: React.FC<SetupCompetitionHeaderProps> = ({
  canPublish,
  competitionStatus,
  onPublishToggle,
  onStartCompetition,
  isPublished,
  competitionId,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCompetition(competitionId);
      toast.success('Competition deleted successfully');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete competition:', error);
      toast.error('Failed to delete competition');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="ml-4 w-[85%] px-2 py-6 mx-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Setup Competition
      </h1>
      <p className="font-inter text-[15px] text-[#475467] font-normal">
        Easily set up your competition.
      </p>
      <div className="flex flex-wrap items-center justify-between mt-[1.9rem] gap-4">
        <div className="flex items-center gap-4">
          <Switch
            checked={isPublished}
            onCheckedChange={onPublishToggle}
            disabled={!canPublish}
          />
          <span className="font-inter text-[16px] text-[#898d94] font-medium">
            Publish competition to website
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            className="flex items-center gap-2 bg-[#D92D20] hover:bg-[#D92D20] font-evogria text-white"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Competition
          </Button>
          <Button
            onClick={onStartCompetition}
            disabled={competitionStatus !== 'started'}
            className={`flex items-center gap-2 font-evogria text-white ${
              competitionStatus === 'started'
                ? 'bg-[#302464] hover:bg-[#1f1656]'
                : 'bg-[#D0D5DD] cursor-not-allowed'
            }`}
          >
            {competitionStatus === 'started'
              ? 'End Challenge'
              : 'Start Challenge'}
          </Button>
        </div>
      </div>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-white w-[26rem]">
          <DialogHeader>
            <DialogTitle className="font-evogria text-[#101828] text-[18px] mb-2">
              Delete Competition
            </DialogTitle>
            <DialogDescription className="font-inter text-[14px] text-[#475467]">
              Are you sure want to delete this? All competition data will be
              lost. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="w-full bg-transparent font-evogria text-[#344054]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full bg-[#D92D20] font-evogria text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SetupCompetitionHeader;

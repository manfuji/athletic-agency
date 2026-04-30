import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface EditCategoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  setCategoryName: (name: string) => void;
  onSaveCategory: () => void;
  isSubmitting: boolean;
}

export default function EditCategoryModal({
  isOpen,
  onOpenChange,
  categoryName,
  setCategoryName,
  onSaveCategory,
  isSubmitting,
}: EditCategoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[24px] mb-6 font-evogria text-[#000000] font-normal">
            Edit Category
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label
            htmlFor="edit-category-name"
            className="font-inter font-medium text-[#344054]"
          >
            category name
          </Label>
          <Input
            id="edit-category-name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </div>
        <DialogFooter className="mt-8">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-[#344054] text-[16px] font-evogria"
          >
            Cancel
          </Button>
          <Button
            onClick={onSaveCategory}
            disabled={isSubmitting}
            className="bg-[#302464] text-[16px] text-white hover:bg-[#302464] hover:text-white font-evogria"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

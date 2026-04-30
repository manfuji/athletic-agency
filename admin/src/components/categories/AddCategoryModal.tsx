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

interface AddCategoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  setCategoryName: (name: string) => void;
  onAddCategory: () => void;
  isSubmitting: boolean;
}

export default function AddCategoryModal({
  isOpen,
  onOpenChange,
  categoryName,
  setCategoryName,
  onAddCategory,
  isSubmitting,
}: AddCategoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[24px] mb-6 font-evogria text-[#000000] font-normal">
            Add Category
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label
            htmlFor="category-name"
            className="font-inter font-medium text-[#344054]"
          >
            Category Name
          </Label>
          <Input
            id="category-name"
            placeholder="Name of category"
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
            onClick={onAddCategory}
            disabled={isSubmitting}
            className="bg-[#302464] text-[16px] text-white hover:bg-[#302464] hover:text-white font-evogria"
          >
            {isSubmitting ? 'Adding...' : 'Add Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

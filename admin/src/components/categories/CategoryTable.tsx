"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { Category } from "@/types/categories";
import { toast } from "sonner";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/categories";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/actions/categories";
import { queryClient } from "@/providers/query-provider";
interface CategoryTableProps {
  initialCategories: Category[];
}

export default function CategoryTable({
  initialCategories,
}: CategoryTableProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [editCategoryName, setEditCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
    initialData: initialCategories,
  });

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    setIsSubmitting(true);
    try {
      const slug = newCategoryName.toLowerCase();
      await createCategory({ name: newCategoryName, slug });
      toast.success("Category created successfully");
      setIsAddModalOpen(false);
      setNewCategoryName("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      toast.error("Failed to create category");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setEditCategoryName(category.name);
    setIsEditModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!editCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      const slug = editCategoryName.toLowerCase();
      await updateCategory(selectedCategory.id, {
        name: editCategoryName,
        slug,
      });
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      setEditCategoryName("");
    } catch (error) {
      toast.error("Failed to update category");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteCategory(categoryToDelete);
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      toast.error("Failed to delete category");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div>
      {/* Add Category Button */}
      <div className="flex justify-end mb-4 ">
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#302464] text-white hover:bg-[#302464] hover:text-white font-evogria"
        >
          Add Category
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full mx-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
        <table className="w-full mx-auto divide-y divide-gray-200">
          <thead className="bg-gray-50 ">
            <tr>
              <th className="px-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Category
              </th>
              <th className="pl-[20rem] pr-6 py-3 text-left text-[15px] font-medium text-[#475467] tracking-wider">
                Date added
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories &&
              !isLoading &&
              categories?.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {category.name}
                  </td>
                  <td className="pl-[10rem] pr-6 py-4 whitespace-nowrap text-[14px] font-inter text-[#475467]">
                    {format(parseISO(category.created_at), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right ">
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
                          onClick={() => handleEditCategory(category)}
                        >
                          Edit Category
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full text-left text-[#FF0000] font-inter font-medium bg-white hover:bg-gray-100 justify-start"
                          onClick={() => handleDeleteClick(category.id)}
                          disabled={isSubmitting}
                        >
                          Delete Category
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        categoryName={newCategoryName}
        setCategoryName={setNewCategoryName}
        onAddCategory={handleAddCategory}
        isSubmitting={isSubmitting}
      />

      <EditCategoryModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        categoryName={editCategoryName}
        setCategoryName={setEditCategoryName}
        onSaveCategory={handleSaveCategory}
        isSubmitting={isSubmitting}
      />

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-white w-[26rem]">
          <DialogHeader>
            <DialogTitle className="font-evogria text-[#101828] text-[18px] mb-2">
              Delete Category
            </DialogTitle>
            <DialogDescription className="font-inter text-[14px] text-[#475467]">
              Are you sure you want to delete this category?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
              className="w-full bg-transparent font-evogria text-[#344054]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
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

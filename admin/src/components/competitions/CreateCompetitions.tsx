"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CloudUpload } from "lucide-react";
import CustomButton from "@/reusables/CustomButton";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { competitionSchema } from "@/lib/validationSchema";
import { z } from "zod";
import { createCompetition, updateCompetition } from "@/actions/competitions";
import AddCategoryModal from "../categories/AddCategoryModal";
import { getCompetitionCategories } from "@/actions/competitions";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";
import { createCategory } from "@/actions/competitions";
import AddCompetitionTypeModal from "../competition-types/add-competition-type-modal";
import { fetchCompetitionTypes } from "@/actions/competiton-types";

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface CompetitionType {
  id: string;
  name: string;
}

export interface CompetitionForForm {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  category: string;
  image: string;
  location: string;
  structureId: string | null;
  competitionType: string;
}

interface CreateCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCompetition?: CompetitionForForm | null;
}

export default function CreateCompetitionModal({
  isOpen,
  onClose,
  editingCompetition,
}: CreateCompetitionModalProps) {
  const [competition, setCompetition] = useState<CompetitionForForm>(
    editingCompetition
      ? {
          ...editingCompetition,
          description: editingCompetition.description ?? "",
        }
      : {
          id: "",
          title: "",
          startDate: "",
          endDate: "",
          description: "",
          category: "",
          image: "",
          location: "",
          structureId: null,
          competitionType: "",
        }
  );
  const [initialCompetition, setInitialCompetition] =
    useState<CompetitionForForm | null>(null);
  const [errors, setErrors] = useState<z.ZodFormattedError<CompetitionForForm>>(
    { _errors: [] }
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddCompetitionTypeModalOpen, setIsAddCompetitionTypeModalOpen] =
    useState(false);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: categories } = useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: () => {
      const res = getCompetitionCategories();
      return res;
    },
  });

  const { data: competitionTypes } = useQuery<CompetitionType[], Error>({
    queryKey: ["competition-types"],
    queryFn: () => fetchCompetitionTypes(),
  });

  useEffect(() => {
    if (editingCompetition && editingCompetition.id) {
      // Normalize the image URL
      let correctedImageUrl = editingCompetition.image || "";
      if (correctedImageUrl) {
        // Replace API base URL with Spaces base URL, if necessary
        correctedImageUrl = correctedImageUrl.replace(
          process.env.NEXT_PUBLIC_API_BASE_URL || "",
          process.env.NEXT_PUBLIC_SPACES_BASE_URL || ""
        );
        // Remove '/Uploads' or 'Uploads' from the path
        correctedImageUrl = correctedImageUrl.replace(
          /\/Uploads|Uploads/gi,
          ""
        );
      }

      setCompetition({
        ...editingCompetition,
        description: editingCompetition.description ?? "",
        image: correctedImageUrl,
      });
      setUploadedFileName(editingCompetition.image ? "Existing Image" : null);
      setInitialCompetition({
        ...editingCompetition,
        description: editingCompetition.description ?? "",
        image: correctedImageUrl,
      });
    } else {
      const defaultData = {
        id: "",
        title: "",
        startDate: "",
        endDate: "",
        description: "",
        category: "",
        image: "",
        location: "",
        structureId: null,
        competitionType: "",
      };
      setCompetition(defaultData);
      setUploadedFileName(null);
      setInitialCompetition(null);
    }
  }, [editingCompetition]);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setCompetition({ ...competition, [e.target.id]: e.target.value });
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Only PNG and JPG are supported.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setCompetition((prev: CompetitionForForm) => ({
          ...prev,
          image: reader.result as string,
        }));
        setUploadedFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const hasChanges = () => {
    if (!initialCompetition) return true;
    return (
      competition.title !== initialCompetition.title ||
      competition.description !== initialCompetition.description ||
      competition.category !== initialCompetition.category ||
      competition.location !== initialCompetition.location ||
      competition.startDate !== initialCompetition.startDate ||
      competition.endDate !== initialCompetition.endDate ||
      competition.competitionType !== initialCompetition.competitionType ||
      (fileInputRef.current &&
        fileInputRef.current.files &&
        fileInputRef.current.files.length > 0)
    );
  };

  const getChangedFields = () => {
    if (!initialCompetition) return competition;
    const changedFields: Partial<CompetitionForForm> = {};
    if (competition.title !== initialCompetition.title)
      changedFields.title = competition.title;
    if (competition.description !== initialCompetition.description)
      changedFields.description = competition.description;
    if (competition.category !== initialCompetition.category)
      changedFields.category = competition.category;
    if (competition.location !== initialCompetition.location)
      changedFields.location = competition.location;
    if (competition.startDate !== initialCompetition.startDate) {
      changedFields.startDate = competition.startDate;
    }
    if (competition.endDate !== initialCompetition.endDate) {
      changedFields.endDate = competition.endDate;
    }
    if (competition.competitionType !== initialCompetition.competitionType) {
      changedFields.competitionType = competition.competitionType;
    }
    return changedFields;
  };

  const validateDates = (start: string, end: string) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate < currentDate) {
      toast.error("Start date cannot be in the past.");
      return false;
    }
    if (endDate < startDate) {
      toast.error("End date cannot be before start date.");
      return false;
    }
    return true;
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      const slug = newCategoryName.toLowerCase();
      const response = await createCategory(newCategoryName, slug);
      if ("error" in response) {
        toast.error(response.error);
        return;
      }

      const updatedCategories =
        (await getCompetitionCategories()) as Category[];

      const newCategory = updatedCategories.find(
        (cat) => cat.name === newCategoryName && cat.slug === slug
      );

      if (newCategory) {
        setCompetition((prev) => ({ ...prev, category: newCategory.id }));
      } else {
        console.warn("New category not found in updated list");
      }

      toast.success("Category created successfully");
      setIsAddCategoryModalOpen(false);
      setNewCategoryName("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      toast.error("Failed to create category");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = competitionSchema.safeParse(competition);
    if (!validation.success) {
      setErrors(validation.error.format());
      return;
    }

    if (!validateDates(competition.startDate, competition.endDate)) {
      return;
    }

    setIsLoading(true);

    try {
      if (editingCompetition && editingCompetition.id) {
        if (!hasChanges()) {
          onClose();
          return;
        }

        const changedFields = getChangedFields();
        const updateData: Record<string, string> = {};

        Object.entries(changedFields).forEach(([key, value]) => {
          if (key === "startDate" && value !== null)
            updateData["start_date"] = value;
          else if (key === "endDate" && value !== null)
            updateData["end_date"] = value;
          else if (key === "category" && value !== null)
            updateData["category_id"] = value;
          else if (key === "competitionType" && value !== null)
            updateData["competition_type_id"] = value;
          else if (key !== "image" && value !== null) updateData[key] = value;
        });

        if (fileInputRef.current?.files?.[0]) {
          const formData = new FormData();
          formData.append("banner", fileInputRef.current.files[0]);
          await updateCompetition(editingCompetition.id, formData);
        }

        if (Object.keys(updateData).length > 0) {
          const res = await updateCompetition(editingCompetition.id, updateData);
          if ("error" in res) {
            toast.error(res.error);
            return;
          }
        }

        toast.success("Competition Updated Successfully");

        const updatedComp = { ...editingCompetition, ...changedFields };
        if (fileInputRef.current?.files?.[0]) {
          updatedComp.image = URL.createObjectURL(
            fileInputRef.current.files[0]
          );
        }
        setInitialCompetition(updatedComp);
        // onCompetitionUpdated?.(updatedComp);
        queryClient.invalidateQueries({ queryKey: ["competitions"] });
        queryClient.invalidateQueries({
          queryKey: ["competition", editingCompetition.id],
        });
        // router.push("/");
        router.refresh();
      } else {
        const formData = new FormData();
        formData.append("title", competition.title || "");
        formData.append("category_id", competition.category || "");
        if (competition.description) {
          formData.append("description", competition.description);
        }
        formData.append("start_date", competition.startDate || "");
        formData.append("end_date", competition.endDate || "");
        formData.append("location", competition.location || "");
        formData.append(
          "competition_type_id",
          competition.competitionType || ""
        );
        if (fileInputRef.current?.files?.[0]) {
          formData.append("banner", fileInputRef.current.files[0]);
        }

        const res = await createCompetition(formData);
        if (res && typeof res === "object" && "error" in res) {
          toast.error(String((res as { error: unknown }).error));
          return;
        }
        toast.success("Competition Created Successfully");

        queryClient.invalidateQueries({ queryKey: ["competitions"] });
        router.push(`/setup-competition/${(res as { id: string }).id}`);
      }
      onClose();
    } catch (error: unknown) {
      console.error("Error submitting competition:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to submit competition");
      } else {
        toast.error("Failed to submit competition");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-[24px] font-evogria font-normal text-[#000000] dark:text-white">
            {editingCompetition ? "Edit Competition" : "Create Competition"}
          </DialogTitle>
          <p className="font-inter text-[14px] font-normal text-[#475467]">
            Bring your competition to life with just a few steps.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 mt-4">
            <div className="sm:col-span-2">
              <Label
                htmlFor="competitionType"
                className="font-inter font-medium text-[14px] text-[#344054]"
              >
                Select competition type
              </Label>
              <select
                id="competitionType"
                onChange={handleChange}
                value={competition.competitionType}
                className={`w-full border p-2 rounded-md ${
                  competition.competitionType === ""
                    ? "text-[#667085] font-inter font-normal"
                    : ""
                }`}
                disabled={isLoading}
              >
                <option
                  key="default"
                  value=""
                  className="text-[#667085] font-inter font-normal"
                >
                  Select competition type
                </option>
                {competitionTypes?.map((type: CompetitionType) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <p className="text-[#475467] text-[14px] font-inter font-medium mt-1">
                Competition type not listed?
                <button
                  type="button"
                  onClick={() => setIsAddCompetitionTypeModalOpen(true)}
                  className="text-[#1570EF] font-medium ml-1"
                >
                  Add it here
                </button>
              </p>
              {errors.competitionType && (
                <p className="text-red-600 text-sm">
                  {errors.competitionType._errors[0]}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="category"
                className="font-inter font-medium text-[14px] text-[#344054]"
              >
                Select competition sport category
              </Label>
              <select
                id="category"
                onChange={handleChange}
                value={competition.category}
                className={`w-full border p-2 rounded-md ${
                  competition.category === ""
                    ? "text-[#667085] font-inter font-normal"
                    : ""
                }`}
                disabled={isLoading}
              >
                <option
                  key="default"
                  value=""
                  className="text-[#667085] font-inter font-normal"
                >
                  Select category
                </option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-[#475467] text-[14px] font-inter font-medium mt-1">
                Category not listed?
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="text-[#1570EF] font-medium ml-1"
                >
                  Add it here
                </button>
              </p>
              {errors.category && (
                <p className="text-red-600 text-sm">
                  {errors.category._errors[0]}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="title"
                className="font-inter font-medium text-[14px] text-[#344054]"
              >
                Competition title
              </Label>
              <Input
                id="title"
                type="text"
                value={competition.title}
                onChange={handleChange}
                placeholder="Enter title"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-red-600 text-sm">
                  {errors.title._errors[0]}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label
                htmlFor="description"
                className="font-inter font-medium text-[14px] text-[#344054]"
              >
                Competition description (optional)
              </Label>
              <Textarea
                id="description"
                rows={4}
                value={competition.description}
                onChange={handleChange}
                placeholder="Enter a description"
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-red-600 text-sm">
                  {errors.description._errors[0]}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Label
                htmlFor="location"
                className="font-inter font-medium text-[14px] text-[#344054]"
              >
                Location
              </Label>
              <Input
                id="location"
                type="text"
                value={competition.location}
                onChange={handleChange}
                placeholder="Enter location"
                disabled={isLoading}
              />
              {errors.location && (
                <p className="text-red-600 text-sm">
                  {errors.location._errors[0]}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="startDate"
                className="font-inter font-medium text-[14px] text-[#344054]"
              >
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={competition.startDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setCompetition((prev) => ({
                    ...prev,
                    startDate: value,
                  }));
                }}
                placeholder="Select start date"
                disabled={isLoading}
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.startDate && (
                <p className="text-red-600 text-sm">
                  {errors.startDate._errors[0]}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="endDate"
                className="font-inter font-medium text-[14px] text-[#344054]"
              >
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={competition.endDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setCompetition((prev) => ({
                    ...prev,
                    endDate: value,
                  }));
                }}
                placeholder="Select end date"
                disabled={isLoading}
                min={
                  competition.startDate ||
                  new Date().toISOString().split("T")[0]
                }
              />
              {errors.endDate && (
                <p className="text-red-600 text-sm">
                  {errors.endDate._errors[0]}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <div
                className="relative flex flex-col items-center rounded-md justify-center w-full h-[7.5rem] border border-gray-300 cursor-pointer"
                onClick={handleFileUploadClick}
              >
                {competition.image ? (
                  <>
                    <Image
                      src={competition.image}
                      alt="Uploaded preview"
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-md mb-2"
                      unoptimized={
                        competition.image.startsWith("data:") ||
                        competition.image.startsWith("blob:")
                      }
                    />
                    <p className="text-[12px] text-[#344054] font-inter">
                      {uploadedFileName}
                    </p>
                  </>
                ) : (
                  <>
                    <CloudUpload size={25} />
                    <p className="mt-2 text-[15px] text-[#6941C6] font-inter font-semibold">
                      click to upload cover photo (optional)
                    </p>
                    <p className="mt-1 text-[12px] text-[#475467] font-inter">
                      Supported file type PNG, JPG
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-6 mt-6 w-full">
            <CustomButton
              text="Cancel"
              type="button"
              onClick={onClose}
              bgColor="bg-transparent"
              color="text-[#344054]"
              className="hover:bg-white"
            />
            <CustomButton
              text={editingCompetition ? "Update" : "Create"}
              bgColor="bg-[#302464]"
              className="hover:bg-[#1f1656]"
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
            />
          </DialogFooter>
        </form>

        <AddCategoryModal
          isOpen={isAddCategoryModalOpen}
          onOpenChange={setIsAddCategoryModalOpen}
          categoryName={newCategoryName}
          setCategoryName={setNewCategoryName}
          onAddCategory={handleAddCategory}
          isSubmitting={isLoading}
        />
        <AddCompetitionTypeModal
          isOpen={isAddCompetitionTypeModalOpen}
          onClose={() => setIsAddCompetitionTypeModalOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

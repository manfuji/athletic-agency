"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CustomButton from "@/reusables/CustomButton";
import { CloudUpload, Plus } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { fetchCategories } from "@/actions/categories";
import { createTeamSchema, editTeamSchema } from "@/lib/validationSchema";
import {
  updateTeam,
  createTeam,
  createTeamWithCompetition,
} from "@/actions/teams";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@/types/categories";
interface CreateTeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitionId: string;
  onTeamAdded: () => void;
  isEditMode?: boolean;
  teamId?: string;
  initialData?: {
    logo: string | null;
    name: string;
    shortCode: string;
    category: string;
    description: string | null;
  };
}

interface Team {
  logo: string;
  name: string;
  shortCode: string;
  category: string;
  description: string;
  coverPhoto?: string;
}

export default function CreateTeams({
  isOpen,
  onClose,
  onTeamAdded,
  isEditMode = false,
  teamId,
  initialData,
  competitionId,
}: CreateTeamsModalProps) {
  const defaultTeamState = useMemo<Team>(
    () => ({
      logo: "",
      name: "",
      shortCode: "",
      category: "",
      description: "",
      coverPhoto: "",
    }),
    []
  );

  const [team, setTeam] = useState<Team>(defaultTeamState);

  const [errors, setErrors] = useState<z.ZodFormattedError<Team>>({
    _errors: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories() as Promise<Category[]>,
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      setTeam({
        logo: initialData.logo || "",
        name: initialData.name || "",
        shortCode: initialData.shortCode || "",
        category: initialData.category || "",
        description: initialData.description || "",
      });
    } else if (!isEditMode) {
      setTeam(defaultTeamState);
    }
  }, [isEditMode, initialData, defaultTeamState]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setTeam((prevTeam) => ({
      ...prevTeam,
      [id]: value,
    }));
  };

  const handleFileUploadClick = (field: "logo" | "coverPhoto") => {
    if (field === "logo" && logoInputRef.current) {
      logoInputRef.current.click();
    } else if (field === "coverPhoto" && coverPhotoInputRef.current) {
      coverPhotoInputRef.current.click();
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo" | "coverPhoto"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Only PNG and JPG are supported.");
        e.target.value = "";
        return;
      }
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("File size must be less than 5MB");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeam((prevTeam) => ({
          ...prevTeam,
          [field]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const schema = isEditMode ? editTeamSchema : createTeamSchema;
    const validation = schema.safeParse(team);
    if (!validation.success) {
      setErrors(validation.error.format());
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    if (logoInputRef.current?.files?.[0]) {
      formData.append("logo", logoInputRef.current.files[0]);
    }
    if (!isEditMode && coverPhotoInputRef.current?.files?.[0]) {
      formData.append("coverPhoto", coverPhotoInputRef.current.files[0]);
    }
    formData.append("name", team.name);
    formData.append("shortCode", team.shortCode);
    formData.append("category_id", team.category);
    if (team.description) formData.append("description", team.description);

    try {
      if (isEditMode && teamId) {
        await updateTeam(teamId, formData);
        toast.success("Team updated successfully");
      } else {
        if (competitionId) {
          const res = await createTeamWithCompetition(competitionId, formData);
          if ("error" in res) {
            toast.error(res.error);
            return;
          }
        } else {
          const res = await createTeam(formData);
          if ("error" in res) {
            toast.error(res.error);
            return;
          }
        }
        toast.success("Team created successfully");
      }
      setTeam(defaultTeamState);
      if (logoInputRef.current) logoInputRef.current.value = "";
      if (coverPhotoInputRef.current) coverPhotoInputRef.current.value = "";
      onTeamAdded();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditMode ? "Failed to update team" : "Failed to create team"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-[24px] font-evogria font-normal text-[#000000] dark:text-white">
            {isEditMode ? "EDIT TEAM" : "ADD TEAM"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 mt-4">
            <div className="sm:col-span-2 flex flex-col items-center gap-2">
              <Label
                htmlFor="logo"
                className="font-inter font-medium text-[14px] text-[#344054]"
              >
                Upload Logo
              </Label>
              <div
                className="relative border-white border-4 bg-gray-200 flex items-center justify-center cursor-pointer shadow-xl h-40 w-40 rounded-full"
                onClick={() => handleFileUploadClick("logo")}
              >
                {!team.logo ? (
                  <CloudUpload size={40} />
                ) : (
                  <Image
                    src={team.logo}
                    alt="Team Logo"
                    className="h-full w-full object-cover rounded-full"
                    width={160}
                    height={160}
                  />
                )}
                <input
                  type="file"
                  ref={logoInputRef}
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => handleFileChange(e, "logo")}
                  disabled={isLoading}
                />
                <div className="absolute bottom-2 right-2 rounded-full bg-white p-1">
                  <Plus size={20} className="text-gray-500" />
                </div>
              </div>
              {errors.logo && (
                <p className="text-red-600 text-sm text-center">
                  {errors.logo._errors[0]}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="name"
                className="font-inter font-medium text-[14px] text-[#344054] mb-4"
              >
                Team Name
              </Label>
              <Input
                id="name"
                type="text"
                value={team.name}
                onChange={handleChange}
                placeholder="Enter team name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-600 text-sm">{errors.name._errors[0]}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="shortCode"
                className="font-inter font-medium text-[14px] text-[#344054] mb-4"
              >
                Team Short Code
              </Label>
              <Input
                id="shortCode"
                type="text"
                value={team.shortCode}
                onChange={handleChange}
                placeholder="e.g., FCB"
                disabled={isLoading}
              />
              {errors.shortCode && (
                <p className="text-red-600 text-sm">
                  {errors.shortCode._errors[0]}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="category"
                className="font-inter font-medium text-[14px] text-[#344054] mb-4"
              >
                Team Sport Category
              </Label>
              <select
                id="category"
                onChange={handleChange}
                value={team.category}
                className={`w-full border p-2 rounded-md ${
                  team.category === ""
                    ? "text-[#667085] font-inter font-normal"
                    : ""
                }`}
                disabled={isLoading}
              >
                <option value="">Select category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm">
                  {errors.category._errors[0]}
                </p>
              )}
            </div>
            {!isEditMode && (
              <div className="sm:col-span-2">
                <Label className="font-inter font-medium text-[14px] text-[#344054] mb-4">
                  Cover Photo
                </Label>
                <div
                  className="relative flex flex-col items-center rounded-md justify-center w-full h-40 border border-gray-300 cursor-pointer mt-2"
                  onClick={() => handleFileUploadClick("coverPhoto")}
                >
                  {!team.coverPhoto ? (
                    <>
                      <CloudUpload size={25} />
                      <p className="mt-2 text-[15px] text-[#6941C6] font-inter font-semibold">
                        Click to upload cover photo
                      </p>
                      <p className="mt-1 text-[12px] text-[#475467] font-inter">
                        Supported file types: PNG, JPG
                      </p>
                    </>
                  ) : (
                    <Image
                      src={team.coverPhoto}
                      alt="Cover Photo"
                      className="h-full w-full object-cover rounded-md"
                      width={300}
                      height={160}
                    />
                  )}
                  <input
                    type="file"
                    ref={coverPhotoInputRef}
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => handleFileChange(e, "coverPhoto")}
                    disabled={isLoading}
                  />
                </div>
                {errors.coverPhoto && (
                  <p className="text-red-600 text-sm">
                    {errors.coverPhoto._errors[0]}
                  </p>
                )}
              </div>
            )}
            <div className="sm:col-span-2">
              <Label
                htmlFor="description"
                className="font-inter font-medium text-[14px] text-[#344054] mb-4"
              >
                Team Description or Bio (Optional)
              </Label>
              <Textarea
                id="description"
                rows={4}
                value={team.description}
                onChange={handleChange}
                placeholder="Say something about the team..."
                disabled={isLoading}
              />
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
              text={isEditMode ? "Update" : "Create"}
              bgColor="bg-[#302464]"
              className="hover:bg-[#1f1656]"
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

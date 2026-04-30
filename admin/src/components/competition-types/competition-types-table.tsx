"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { MoreVertical } from "lucide-react";

import {
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
} from "../ui/dropdown-menu";
import { motion } from "framer-motion";
import AddCompetitionTypeModal from "./add-competition-type-modal";
import { CompetitionType } from "@/types/competition-types";
import { useQuery } from "@tanstack/react-query";
import {
  deleteCompetitionType,
  fetchCompetitionTypes,
  updateCompetitionType,
} from "@/actions/competiton-types";
import DeleteCompetitionTypeModal from "@/components/competition-types/delete-competition-type.modal";
import { queryClient } from "@/providers/query-provider";
import { toast } from "sonner";
import EditCompetitionTypeModal from "./edit-competition-type-modal";
interface CompetitionTypesTableProps {
  initialCompetitionTypes: CompetitionType[];
}

export default function CompetitionTypesTable({
  initialCompetitionTypes,
}: CompetitionTypesTableProps) {
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(value));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [competitionTypeId, setCompetitionTypeId] = useState<string | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: competitionTypes } = useQuery<CompetitionType[]>({
    queryKey: ["competition-types"],
    queryFn: () => fetchCompetitionTypes(),
    initialData: initialCompetitionTypes,
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteCompetitionType = async (competitionTypeId: string) => {
    const res = await deleteCompetitionType(competitionTypeId);
    if ("error" in res) {
      toast.error(String(res.error));
      return;
    } else {
      toast.success("Competition type deleted successfully");
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["competition-types"] });
    }
  };

  const handleOpenDeleteModal = (open: boolean) => {
    setIsDeleteModalOpen(open);
  };

  const openEditModal = (item: CompetitionType) => {
    setCompetitionTypeId(item.id);
    setEditName(item.name || "");
    setEditDescription(item.description || "");
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!competitionTypeId) return;
    setIsUpdating(true);
    const res = await updateCompetitionType(competitionTypeId, {
      name: editName,
      description: editDescription,
    });
    if ("error" in res) {
      toast.error(String(res.error));
      setIsUpdating(false);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["competition-types"] });
    setIsEditModalOpen(false);
    setIsUpdating(false);
    toast.success("Competition type updated");
  };

  return (
    <main className="w-full flex flex-col gap-4">
      <Button className="ml-auto hover:bg-primary" onClick={handleOpenModal}>
        Add type
      </Button>
      <motion.div
        className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Table className="rounded-md">
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium font-inter text-[14px] text-[#475467]">
                Types
              </TableHead>
              <TableHead className="font-medium font-inter text-[14px] text-[#475467]">
                Date added
              </TableHead>
              <TableHead className="font-medium font-inter text-[14px] text-[#475467]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitionTypes?.map((competitionType) => (
              <TableRow key={competitionType.id}>
                <TableCell className="font-inter text-[14px] text-[#475467]">
                  {competitionType.name}
                </TableCell>
                <TableCell className="font-inter text-[14px] text-[#475467]">
                  {competitionType.created_at
                    ? formatDate(competitionType.created_at)
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        aria-label="Open menu"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4 text-[#98A2B3]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="font-inter hover:font-semibold"
                        onClick={() => openEditModal(competitionType)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="font-inter hover:font-semibold"
                        onClick={() => {
                          setCompetitionTypeId(competitionType.id);
                          handleOpenDeleteModal(true);
                        }}
                      >
                        <span style={{ color: "#D92D20" }}>Remove</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
      <AddCompetitionTypeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      {competitionTypeId && (
        <DeleteCompetitionTypeModal
          isOpen={isDeleteModalOpen}
          onOpenChange={handleOpenDeleteModal}
          competitionTypeId={competitionTypeId}
          onDelete={handleDeleteCompetitionType}
        />
      )}
      <EditCompetitionTypeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        name={editName}
        description={editDescription}
        onNameChange={setEditName}
        onDescriptionChange={setEditDescription}
        onSave={handleSaveEdit}
        isSubmitting={isUpdating}
      />
    </main>
  );
}

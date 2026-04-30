"use client";

import React, { useState } from "react";
import { ExistingDataTable } from "./existing-data-table";
import { cols } from "./existing-columns";
import CustomButton from "@/reusables/CustomButton";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { debounce } from "@/lib/debounce";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllCollators,
  fetchCompetitionCollators,
  assignCollators,
} from "@/actions/collators";

interface ExistingCollatorsProps {
  isOpen: boolean;
  onClose: () => void;
  competitionId: string;
}

export type ExistingCollatorType = {
  id: string;
  name: string;
  email: string;
};

type AssignedCollatorType = {
  id: string;
};

export default function ExistingCollators({
  isOpen,
  onClose,
  competitionId,
}: ExistingCollatorsProps) {
  const [selectedCollatorIds, setSelectedCollatorIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: allCollators = [], isLoading: isLoadingCollators } = useQuery({
    queryKey: ["collators"],
    queryFn: () => fetchAllCollators("1"),
    enabled: isOpen,
  });

  const { data: assignedCollators = [], isLoading: isLoadingAssigned } =
    useQuery({
      queryKey: ["assignedCollators", competitionId],
      queryFn: () => fetchCompetitionCollators(competitionId),
      enabled: isOpen && !!competitionId,
    });

  const assignCollatorsMutation = useMutation({
    mutationFn: (collatorIds: string[]) =>
      assignCollators(competitionId, collatorIds),
    onSuccess: (res) => {
      if (res && typeof res === "object" && "error" in res) {
        toast.error(String(res.error));
        return;
      }
      toast.success("Collators assigned successfully!");
      queryClient.invalidateQueries({
        queryKey: ["assignedCollators", competitionId],
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign collators: ${error.message}`);
    },
  });

  const assignedCollatorIds = Array.isArray(assignedCollators)
    ? assignedCollators.map((collator: AssignedCollatorType) => collator.id)
    : [];

  const availableCollators = allCollators.filter(
    (collator) => !assignedCollatorIds.includes(collator.id)
  );

  const filteredCollators = availableCollators.filter((collator) =>
    `${collator.first_name} ${collator.last_name} ${collator.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const filteredForTable: ExistingCollatorType[] = filteredCollators.map(
    (c) => ({
      id: c.id,
      name: `${c.first_name} ${c.last_name}`.trim(),
      email: c.email,
    })
  );

  const handleRowSelectionChange = (rowSelection: Record<string, boolean>) => {
    const selectedIds = Object.entries(rowSelection)
      .filter(([, isSelected]) => isSelected)
      .map(([index]) => filteredForTable[parseInt(index, 10)].id);
    setSelectedCollatorIds(selectedIds);
  };

  const handleSubmit = () => {
    if (!competitionId) {
      toast.error("Competition ID is missing.");
      return;
    }
    const allCollatorIds = [...assignedCollatorIds, ...selectedCollatorIds];
    assignCollatorsMutation.mutate(allCollatorIds);
  };

  const handleClose = () => {
    setSelectedCollatorIds([]);
    setSearchQuery("");
    onClose();
  };

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  if (!isOpen) return null;

  const isLoading = isLoadingCollators || isLoadingAssigned;
  const isSubmitting = assignCollatorsMutation.isPending;
  const isAddDisabled =
    isLoading ||
    filteredCollators.length === 0 ||
    isSubmitting ||
    selectedCollatorIds.length === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4 rounded-t-lg border-b border-gray-200">
          <h2 className="text-[24px] font-evogria font-bold mb-4">
            Add Collators
          </h2>
          <div className="relative w-full">
            <Input
              placeholder="Search by email or name"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isSubmitting}
            />
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
              size={18}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
          {isLoading ? (
            <p>Loading collators...</p>
          ) : filteredForTable.length === 0 ? (
            <div className="text-center p-6 bg-gray-100 border border-gray-300 rounded-lg">
              <p className="text-lg text-gray-600 font-semibold font-inter">
                {searchQuery
                  ? "No collators match your search."
                  : "No available collators to add to this competition."}
              </p>
            </div>
          ) : (
            <ExistingDataTable
              columns={cols}
              data={filteredForTable}
              onRowSelectionChange={handleRowSelectionChange}
              searchValue={searchQuery}
            />
          )}
        </div>
        <div className="flex justify-end mt-4 gap-2 px-6 pb-6 border-gray-200">
          <CustomButton
            text="Cancel"
            type="button"
            onClick={handleClose}
            bgColor="bg-transparent"
            color="text-gray-700"
            className="font-evogria hover:bg-gray-100"
            disabled={isSubmitting}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CustomButton
                  text="Add Collators"
                  type="button"
                  onClick={handleSubmit}
                  bgColor={isAddDisabled ? "bg-gray-400" : "bg-[#302464]"}
                  color="text-white"
                  className={`font-evogria ${
                    isAddDisabled ? "cursor-not-allowed" : "hover:bg-[#1f1656]"
                  }`}
                  disabled={isAddDisabled}
                  isLoading={isSubmitting}
                />
              </TooltipTrigger>
              {isAddDisabled && (
                <TooltipContent>
                  {isLoading
                    ? "Loading collators..."
                    : filteredForTable.length === 0
                      ? "No collators available"
                      : selectedCollatorIds.length === 0
                        ? "Select at least one collator"
                        : "Submitting..."}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

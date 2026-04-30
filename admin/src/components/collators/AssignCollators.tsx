"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import SearchInput from "@/reusables/SearchInput";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { toast } from "sonner";
import ExistingCollators from "./ExistingCollators";
import { fetchCompetitionCollators, removeCollatorFromCompetition } from "@/actions/collators";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/providers/query-provider";

interface Collator {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface AssignCollatorsProps {
  competitionId: string;
}

export default function AssignCollators({
  competitionId,
}: AssignCollatorsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCollatorModalOpen, setIsAddCollatorModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: collators, isLoading: collatorsLoading } = useQuery<Collator[], Error>({
    queryKey: ["assignedCollators", competitionId],
    queryFn: () => fetchCompetitionCollators(competitionId),
  });

  const handleRemoveCollator = async (collatorId: string) => {
    setIsSubmitting(true);
    try {
      const response = await removeCollatorFromCompetition(competitionId, collatorId);
      if ("error" in response) {
        toast.error(String(response.error));
      } else {
        toast.success("Collator removed successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["assignedCollators", competitionId] });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove collator. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCollators = collators
    ? collators
        .filter((collator) =>
          `${collator.first_name} ${collator.last_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        )
    .sort((a, b) => {
      const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
      const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
      return nameA.localeCompare(nameB);
    }) : [];


  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <SearchInput
          placeholder="Search by name"
          onSearch={(query: string) => setSearchQuery(query)}
        />
        <Button
          onClick={() => setIsAddCollatorModalOpen(true)}
          className="bg-[#302464] text-white hover:bg-[#302464] hover:text-white font-evogria"
        >
          Add Collator
        </Button>
      </div>

      {collatorsLoading ? (
        <div className="bg-white w-full rounded-lg shadow-md border border-[#e9e9e9] p-12 mt-4">
          <p className="text-center mt-4 font-evogria text-[17px] text-[#302464]">
            Loading collators...
          </p>
        </div>
      ) : filteredCollators.length === 0 ? (
        <div className="bg-white w-full rounded-lg shadow-md border border-[#e9e9e9] p-12 mt-4">
          <p className="text-center mt-4 font-evogria text-[17px] text-[#302464]">
            {searchQuery
              ? `No collators found for "${searchQuery}"`
              : "No collators assigned to this competition."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
          <Table className="rounded-md">
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium font-inter text-[14px] text-[#475467] px-4">
                  Collators ({filteredCollators.length})
                </TableHead>
                <TableHead className="font-medium font-inter text-[14px] text-[#475467] px-4">
                  Date Added
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollators.map((collator) => (
                <TableRow key={collator.id} className="hover:bg-gray-100">
                  <TableCell>
                    <div>
                      <div className="font-inter text-[#101828] font-medium text-[14px]">
                        {collator.first_name} {collator.last_name}
                      </div>
                      <div className="text-[14px] text-[#475467] font-normal">
                        {collator.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[#475467] font-inter text-[14px] font-normal">
                    {new Date(collator.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="p-0 h-auto">
                          <MoreVertical className="h-4 w-4 text-[#98A2B3]" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2 flex flex-col gap-2 bg-white">
                        <Button
                          variant="ghost"
                          className="w-full text-left text-[#FF0000] font-inter font-medium bg-white hover:bg-gray-100 justify-start"
                          onClick={() => handleRemoveCollator(collator.id)}
                          disabled={isSubmitting}
                        >
                          Remove Collator
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ExistingCollators
        isOpen={isAddCollatorModalOpen}
        onClose={() => setIsAddCollatorModalOpen(false)}
        competitionId={competitionId}
        // onCollatorAssigned={handleCollatorAssigned}
      />
    </div>
  );
}

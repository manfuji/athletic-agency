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
import { Button } from "@/components/ui/button";
import SearchInput from "@/reusables/SearchInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import AddCollatorModal from "./AddCollatorModal";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllCollators,
  deleteCollator,
  type CollatorRow,
} from "@/actions/collators";
import { queryClient } from "@/providers/query-provider";
export default function CollatorsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddCollatorModalOpen, setIsAddCollatorModalOpen] = useState(false);
  const { data: collators, isLoading } = useQuery<CollatorRow[], Error>({
    queryKey: ["collators"],
    queryFn: () => fetchAllCollators(),
  });

  const filteredCollators = collators?.filter((collator) =>
    `${collator.first_name} ${collator.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleRemoveCollator = async (collatorId: string) => {
    try {
      const response = await deleteCollator(collatorId);
      if ("error" in response) {
        toast.error(
          String(response.error) ||
            "Failed to remove collator. Please try again."
        );
        return;
      }
      toast.success("Collator removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["collators"] });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove collator. Please try again."
      );
    }
  };


  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <SearchInput
          placeholder="Search by name..."
          onSearch={(query) => setSearchQuery(query)}
        />
        <Button
          onClick={() => setIsAddCollatorModalOpen(true)}
          className="bg-[#302464] text-white hover:bg-[#302464] hover:text-white font-evogria"
        >
          Add Collator
        </Button>
      </div>
      {isLoading ? (
        <div className="bg-white w-full rounded-lg shadow-md border border-[#e9e9e9] p-12 mt-4">
          <p className="text-center mt-4 font-evogria text-[17px] text-[#302464]">
            Loading collators...
          </p>
        </div>
      ) : filteredCollators?.length === 0 ? (
        <div className="bg-white w-full rounded-lg shadow-md border border-[#e9e9e9] p-12 mt-4">
          <p className="text-center mt-4 font-evogria text-[17px] text-[#302464]">
            {searchQuery
              ? `No collators found for "${searchQuery}"`
              : "No collators found."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
          <Table className="rounded-md">
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium font-inter text-[14px] text-[#475467]">
                  Collators ({filteredCollators?.length})
                </TableHead>
                <TableHead className="font-medium font-inter text-[14px] text-[#475467]">
                  Assigned Competitions
                </TableHead>
                <TableHead className="font-medium font-inter text-[14px] text-[#475467]">
                  Status
                </TableHead>
                <TableHead className="font-medium font-inter text-[14px] text-[#475467]">
                  Date Added
                </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollators?.map((collator) => (
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
                  <TableCell className="font-semibold text-[#302464] font-inter">
                    {collator.assigned_competitions_count}
                  </TableCell>
                  <TableCell className="font-medium font-inter text-[14px]">
                    <span
                      className={
                        collator.status === 1
                          ? "text-[#027A48] py-[0.65rem] px-4 bg-[#ECFDF3] rounded-full"
                          : "text-[#B54708] py-[0.65rem] px-4 bg-[#FFFAEB] rounded-full"
                      }
                    >
                      {collator.status === 1 ? "Active" : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-[#475467] font-inter text-[14px] font-normal">
                    {new Date(collator.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4 text-[#98A2B3]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="font-inter hover:font-semibold"
                          onClick={() => handleRemoveCollator(collator.id)}
                        >
                          <span style={{ color: "#D92D20" }}>
                            Remove Collator
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {isAddCollatorModalOpen && (
        <AddCollatorModal
          isOpen={isAddCollatorModalOpen}
          onClose={() => setIsAddCollatorModalOpen(false)}
        />
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ExistingDataTable } from '@/lib/team/existing-data-table';
import { cols } from '@/lib/team/existing-columns';
import CustomButton from '@/reusables/CustomButton';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { getImageUrl } from '@/lib/api';
import { fetchTeamsNotInCompetition, addExistingTeamsToCompetition } from '@/actions/teams';
import { useQuery } from '@tanstack/react-query';
import { Team } from '@/types/fixtures';

interface ExistingTeamsProps {
  isOpen: boolean;
  onClose: () => void;
  competitionId: string;
}

export type ExistingTeamType = {
  id: string;
  name: string;
  code: string;
  icon: string;
};

export default function ExistingTeams({
  isOpen,
  onClose,
  competitionId,
}: ExistingTeamsProps) {
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  // const [teams, setTeams] = useState<ExistingTeamType[]>([]);
  // const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: teams, isLoading } = useQuery<ExistingTeamType[]>({
    queryKey: ["availableTeams", competitionId],
    queryFn: async () => {
      const availableTeamsData = await fetchTeamsNotInCompetition(competitionId);
      return availableTeamsData.map((team: Team) => ({
        id: team.id,
        name: team.name,
        code: team.shortCode || "N/A",
        icon: getImageUrl(team.logo) || "/TeamLogo.png",
      }));
    },
  });

  const handleRowSelectionChange = (rowSelection: Record<string, boolean>) => {
    const selectedIds = Object.entries(rowSelection)
      .filter(([, isSelected]) => isSelected)
      .map(([index]) => teams?.[parseInt(index, 10)]?.id || "");
    setSelectedTeamIds(selectedIds);
  };

  const handleSubmit = async () => {
    if (selectedTeamIds.length === 0) {
      toast.error('Please select at least one team.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addExistingTeamsToCompetition(competitionId, selectedTeamIds);
      toast.success('Teams added successfully!');
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Failed to add teams: ${error.message}`);
      } else {
        toast.error('Failed to add teams');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isAddDisabled =
    isLoading ||
    teams?.length === 0 ||
    isSubmitting ||
    selectedTeamIds.length === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-xl w-full max-h-[90vh] flex flex-col">
        <div className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4 rounded-t-lg border-b border-gray-200">
          <h2 className="text-xl font-evogria font-bold mb-4">
            Add Existing Teams
          </h2>
          <div className="relative w-full">
            <Input
              placeholder="Search by team name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            <p>Loading teams...</p>
          ) : teams?.length === 0 ? (
            <div className="text-center p-6 bg-gray-100 border border-gray-300 rounded-lg">
              <p className="text-lg text-gray-600 font-semibold font-inter">
                No available teams to add to this competition.
              </p>
            </div>
          ) : (
            <ExistingDataTable
              columns={cols}
              data={teams || []}
              onRowSelectionChange={handleRowSelectionChange}
              searchValue={searchQuery}
            />
          )}
        </div>
        <div className="flex justify-end mt-4 gap-2 px-6 pb-6 border-gray-200">
          <CustomButton
            text="Cancel"
            type="button"
            onClick={onClose}
            bgColor="bg-transparent"
            color="text-gray-700"
            className="font-evogria hover:bg-gray-100"
            disabled={isSubmitting}
          />
          <CustomButton
            text="Add Teams"
            type="button"
            onClick={handleSubmit}
            bgColor={isAddDisabled ? 'bg-gray-400' : 'bg-[#302464]'}
            color="text-white"
            className={`font-evogria ${
              isAddDisabled ? 'cursor-not-allowed' : 'hover:bg-[#1f1656]'
            }`}
            disabled={isAddDisabled}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}

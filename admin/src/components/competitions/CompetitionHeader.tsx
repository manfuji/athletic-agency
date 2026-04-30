'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import SearchInput from '@/reusables/SearchInput';
import Filter from '@/reusables/Filter';
import { Plus } from 'lucide-react';
import CreateCompetitionModal from './CreateCompetitions';
import { useSession } from '@/providers/supabase-auth';

interface CompetitionHeaderProps {
  setSearchQuery: (query: string) => void;
    // onCompetitionCreated?: (newComp: CompetitionForForm) => void;
    // onCompetitionUpdated?: (updatedComp: CompetitionForForm) => void;
  setFilterStatus: (status: string) => void;
}

const CompetitionHeader = ({
  setSearchQuery,
  // onCompetitionCreated,
  // onCompetitionUpdated,
  setFilterStatus,
}: CompetitionHeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session, status } = useSession();

  const canCreateCompetition =
    status === 'authenticated' && session?.user?.role !== 'collator';

  return (
    <div>
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Competitions
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Create and manage tournaments easily.
      </p>
      <div className="flex flex-wrap items-center justify-between mt-[1.9rem] gap-4">
        <div className="flex md:flex-wrap items-center gap-2">
          <SearchInput
            placeholder="Search competitions"
            onSearch={setSearchQuery}
          />
          <Filter
            options={['All', 'Draft', 'Published', 'Started', 'Ended']}
            placeholder="Filter by status"
            onValueChange={setFilterStatus}
          />
        </div>
        {canCreateCompetition && (
          <Button
            className="flex items-center gap-2 bg-[#302464] font-evogria text-white hover:bg-[#1f1656]"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} className="text-white" /> Create Competition
          </Button>
        )}
      </div>

      {isModalOpen && (
        <CreateCompetitionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          // onCompetitionCreated={onCompetitionCreated}
          // onCompetitionUpdated={onCompetitionUpdated}
        />
      )}
    </div>
  );
};

export default CompetitionHeader;

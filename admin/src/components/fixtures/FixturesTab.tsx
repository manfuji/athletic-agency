'use client';

import { useState } from 'react';
import SearchInput from '@/reusables/SearchInput';
import Filter from '@/reusables/Filter';
import { Button } from '@/components/ui/button';
import CreateMatchModal from './CreateMatchModal';
import { FixtureList } from './FixtureList';
import { useFixtures } from '@/hooks/useFixtures';
import { InlineReferenceCreate } from '@/components/reference/InlineReferenceCreate';
import { createStage } from '@/actions/stages';

interface FixturesTabProps {
  competitionId: string;
}

export default function FixturesTab({ competitionId }: FixturesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    fixtures,
    teams,
    stages,
    groups,
    standings,
    isLoading,
    formData,
    setFormData,
    handleCreateMatch,
  } = useFixtures(competitionId);

  const onCreateMatch = async () => {
    try {
      await handleCreateMatch();
      setIsModalOpen(false);
      window.dispatchEvent(
        new CustomEvent('setupUpdated', { detail: { competitionId } })
      );
    } catch (error) {
      console.error('Failed to create match:', error);
    }
  };

  const filterOptions = [
    'All dates',
    ...Object.keys(fixtures).map(
      (date) => new Date(date).toISOString().split('T')[0]
    ),
  ];

  return (
    <div className="rounded-lg">
      {stages.length === 0 ? (
        <InlineReferenceCreate
          title="No match stages yet"
          helpText="Create at least one stage before scheduling fixtures. You can also manage stages under Reference in the sidebar."
          namePlaceholder='e.g. "Group stage"'
          queryKeysToInvalidate={[["stages"]]}
          onSubmit={(payload) => createStage(payload)}
        />
      ) : null}
      <div className="flex items-center gap-4 mb-6">
        <SearchInput
          placeholder="Search by team name"
          onSearch={setSearchQuery}
        />
        <Filter
          options={filterOptions}
          placeholder="Filter by date"
          onValueChange={(value) => {
            const newFilterDate = value === 'All dates' ? undefined : value;
            setFilterDate(newFilterDate);
          }}
        />
        <Button
          className="ml-auto bg-[#302464] hover:bg-[#332579] text-white font-evogria"
          onClick={() => setIsModalOpen(true)}
        >
          Create Match
        </Button>
      </div>

      {isLoading && Object.keys(fixtures).length === 0 ? (
        <div className="text-center text-[17px] text-[#302464] font-evogria py-6">
          Loading fixtures...
        </div>
      ) : (
        <FixtureList
          fixtures={fixtures}
          searchQuery={searchQuery}
          filterDate={filterDate}
        />
      )}

      <CreateMatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teams={teams}
        stages={stages}
        groups={groups}
        standings={standings}
        formData={formData}
        setFormData={setFormData}
        onCreateMatch={onCreateMatch}
        isLoading={isLoading}
      />
    </div>
  );
}

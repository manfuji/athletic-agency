'use client';

import { useState } from 'react';
import SearchInput from '@/reusables/SearchInput';
import Filter from '@/reusables/Filter';
import { ResultList } from './ResultList';
import { Fixture } from '@/types/fixtures';

interface ResultsTabProps {
  fixtures: { [date: string]: Fixture[] };
}

export default function ResultsTab({ fixtures }: ResultsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);

  const filterOptions = [
    'All dates',
    ...Object.keys(fixtures).map(
      (date) => new Date(date).toISOString().split('T')[0]
    ),
  ];

  return (
    <div className="rounded-lg">
      <div className="flex items-center gap-4 mb-6">
        <SearchInput
          placeholder="Search by team name"
          onSearch={setSearchQuery}
        />
        <Filter
          options={filterOptions}
          placeholder="Filter by match date"
          onValueChange={(value) =>
            setFilterDate(value === 'All dates' ? undefined : value)
          }
        />
      </div>

      <ResultList
        fixtures={fixtures}
        searchQuery={searchQuery}
        filterDate={filterDate}
      />
    </div>
  );
}

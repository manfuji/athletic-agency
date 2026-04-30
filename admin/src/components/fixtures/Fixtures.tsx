'use client';

import { useMemo, useState, memo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Fixture } from '@/types/fixtures';
import { MatchCard } from './MatchCard';

interface FixtureListProps {
  fixtures: { [date: string]: Fixture[] };
  searchQuery: string;
  filterDate?: string;
}

export const FixtureList = memo(
  ({ fixtures, searchQuery, filterDate }: FixtureListProps) => {
    const ITEMS_PER_PAGE = 10;
    const [page, setPage] = useState(1);

    const filteredFixtures = useMemo(() => {
      return Object.entries(fixtures).reduce(
        (acc, [date, matches]) => {
          const filtered = matches.filter((match) => {
            const matchesSearch =
              !searchQuery ||
              match.home_team.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              match.away_team.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            let matchDate: string;
            try {
              matchDate = new Date(match.match_date)
                .toISOString()
                .split('T')[0];
            } catch {
              console.warn(
                `Invalid match_date for match ${match.id}: ${match.match_date}`
              );
              matchDate = '';
            }

            let normalizedFilterDate: string | undefined;
            if (filterDate && filterDate.trim() !== '') {
              try {
                normalizedFilterDate = new Date(filterDate)
                  .toISOString()
                  .split('T')[0];
              } catch {
                console.warn(`Invalid filterDate: ${filterDate}`);
                normalizedFilterDate = undefined;
              }
            } else {
              normalizedFilterDate = undefined;
            }

            const matchesDate = normalizedFilterDate
              ? matchDate === normalizedFilterDate
              : true;

            return matchesSearch && matchesDate;
          });
          if (filtered.length > 0) acc[date] = filtered;
          return acc;
        },
        {} as { [date: string]: Fixture[] }
      );
    }, [fixtures, searchQuery, filterDate]);

    const paginatedFixtures = useMemo(() => {
      const allDates = Object.entries(filteredFixtures).slice(
        0,
        page * ITEMS_PER_PAGE
      );
      return Object.fromEntries(allDates);
    }, [filteredFixtures, page]);

    const hasMore =
      Object.keys(filteredFixtures).length > page * ITEMS_PER_PAGE;
    const hasMatches = Object.keys(filteredFixtures).length > 0;

    const formatDate = (dateString: string) =>
      new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

    if (!hasMatches) {
      return searchQuery ? (
        <div className="bg-white rounded-md py-12 font-semibold text-center text-[#1D2939] font-inter">
          <p className="text-gray-500">
            No teams found matching `&quot;{searchQuery}&quot;`.
          </p>
          <p className="mt-2">
            Try searching with different keywords or check back later.
          </p>
        </div>
      ) : (
        <div className="font-evogria w-full bg-white shadow-md border border-[#e9e9e9] rounded-lg py-12 text-[17px] text-[#302464] text-center">
          No fixtures available yet.
        </div>
      );
    }

    return (
      <div>
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(paginatedFixtures).map(([date, matches]) => (
            <AccordionItem key={date} value={date} className="mb-6">
              <AccordionTrigger className="bg-[#302464] text-white px-8 rounded-t-lg font-evogria text-[18px]">
                {formatDate(date)}
              </AccordionTrigger>
              <AccordionContent className="bg-white text-[#1D2939] font-inter flex flex-col items-center">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {hasMore && (
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="mt-4 bg-[#302464] text-white px-4 py-2 rounded-md mx-auto block"
          >
            Load More
          </button>
        )}
      </div>
    );
  }
);
FixtureList.displayName = 'FixtureList';

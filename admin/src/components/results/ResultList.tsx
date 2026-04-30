'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Fixture, Team, MinimalTeam } from '@/types/fixtures';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/api';

interface ResultCardProps {
  fixture: Fixture;
}

const isFullTeam = (team: Team | MinimalTeam): team is Team => 'logo' in team;

const ResultCard: React.FC<ResultCardProps> = ({ fixture }) => {
  const router = useRouter();
  const hasResult = !!fixture.result;

  let scoreDisplay: string;
  if (hasResult) {
    scoreDisplay = fixture.result
      ? `${fixture.result.home_team_score} - ${fixture.result.away_team_score}`
      : 'No result available';
  } else {
    scoreDisplay = fixture.time.slice(0, 5) + ' GMT';
  }

  const handleReportResult = () => {
    router.push(
      `/setup-competition/${fixture.competition_id}/report-result/${fixture.id}`
    );
  };

  return (
    <div className="py-4 flex items-center gap-4 w-[85%] mx-auto">
      {/* Home team div */}
      <div className="flex items-center gap-2 flex-1 justify-start">
        {isFullTeam(fixture.home_team) && fixture.home_team.logo ? (
          <Image
            src={getImageUrl(fixture.home_team.logo) || '/default-logo.png'}
            alt={`${fixture.home_team.name} logo`}
            width={50}
            height={50}
            className="object-contain"
          />
        ) : (
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
        )}
        <span className="font-evogria text-[18px]">
          {fixture.home_team.name || 'Unknown Home Team'}
        </span>
      </div>
      {/* Score div */}
      <div className="flex-1 text-center">
        <span
          className={
            hasResult
              ? 'font-evogria text-[17px] text-white px-4 py-2 rounded-md bg-[#039855]'
              : 'font-evogria text-[17px] text-gray-500'
          }
        >
          {scoreDisplay}
        </span>
      </div>
      {/* Away team div */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        {isFullTeam(fixture.away_team) && fixture.away_team.logo ? (
          <Image
            src={getImageUrl(fixture.away_team.logo) || '/default-logo.png'}
            alt={`${fixture.away_team.name} logo`}
            width={50}
            height={50}
            className="object-contain"
          />
        ) : (
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
        )}
        <span className="font-evogria text-[18px]">
          {fixture.away_team.name || 'Unknown Away Team'}
        </span>
      </div>
      {/* Button */}
      <div className="flex-1 flex justify-end">
        <Button
          className="bg-transparent border rounded-lg border-[#D0D5DD] font-semibold hover:bg-[#302464] hover:text-white text-[#344054] font-inter"
          onClick={handleReportResult}
        >
          Report results
        </Button>
      </div>
    </div>
  );
};

interface ResultListProps {
  fixtures: { [date: string]: Fixture[] };
  searchQuery: string;
  filterDate?: string;
}

export const ResultList: React.FC<ResultListProps> = ({
  fixtures,
  searchQuery,
  filterDate,
}) => {
  const filteredFixtures = useMemo(() => {
    return Object.entries(fixtures).reduce(
      (acc, [date, fixtureList]) => {
        const filtered = fixtureList.filter((fixture) => {
          const matchesSearch =
            !searchQuery ||
            fixture.home_team.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            fixture.away_team.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

          const matchDate = new Date(fixture.match_date)
            .toISOString()
            .split('T')[0];
          const matchesDate = filterDate ? matchDate === filterDate : true;

          return matchesSearch && matchesDate;
        });
        if (filtered.length > 0) acc[date] = filtered;
        return acc;
      },
      {} as { [date: string]: Fixture[] }
    );
  }, [fixtures, searchQuery, filterDate]);

  const hasFixtures = Object.keys(filteredFixtures).length > 0;

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    return `${weekday}, ${day}${getOrdinalSuffix(day)} ${month}`;
  };

  if (!hasFixtures) {
    return searchQuery ? (
      <div className="bg-white rounded-md py-12 font-semibold text-center text-[#1D2939] font-inter">
        <p className="text-gray-500">
          No fixtures found matching `&quot;{searchQuery}&quot;`.
        </p>
        <p className="mt-2">
          Try searching with different keywords or check back later.
        </p>
      </div>
    ) : (
      <div className="font-evogria w-full bg-white shadow-md border border-[#e9e9e9] rounded-lg py-12 text-[17px] text-[#302464] text-center">
        No results available yet...
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {Object.entries(filteredFixtures).map(([date, fixtureList]) => (
        <AccordionItem key={date} value={date} className="mb-6">
          <AccordionTrigger className="bg-[#302464] text-white px-8 rounded-t-lg font-evogria text-[16px]">
            {formatDate(date)}
          </AccordionTrigger>
          <AccordionContent className="bg-white text-[#1D2939] font-inter flex flex-col items-center">
            {fixtureList.map((fixture) => (
              <ResultCard key={fixture.id} fixture={fixture} />
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

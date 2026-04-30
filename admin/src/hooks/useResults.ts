'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Fixture } from '@/types/fixtures';
import { fetchFixtures, fetchTeams } from '@/lib/api';

interface UseResultsReturn {
  fixtures: { [date: string]: Fixture[] };
  isLoading: boolean;
}

export const useResults = (competitionId: string): UseResultsReturn => {
  const [fixtures, setFixtures] = useState<{ [date: string]: Fixture[] }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFixtures = async () => {
      setIsLoading(true);
      try {
        const [fixturesData, teamsData] = await Promise.all([
          fetchFixtures(competitionId),
          fetchTeams(competitionId),
        ]);

        const enrichedFixtures = Object.fromEntries(
          Object.entries(fixturesData).map(([date, fixtureList]) => {
            const enrichedList = fixtureList.map((fixture) => ({
              ...fixture,
              home_team: {
                id: fixture.home_team.id,
                name: fixture.home_team.name,
                logo:
                  teamsData.data.find((t) => t.id === fixture.home_team.id)
                    ?.logo || null,
              },
              away_team: {
                id: fixture.away_team.id,
                name: fixture.away_team.name,
                logo:
                  teamsData.data.find((t) => t.id === fixture.away_team.id)
                    ?.logo || null,
              },
              result: fixture.result ?? null,
            }));
            return [new Date(date).toISOString().split('T')[0], enrichedList];
          })
        );

        setFixtures(enrichedFixtures);
      } catch (error) {
        console.error('Error loading fixtures:', error);
        toast.error('Failed to load fixtures');
      } finally {
        setIsLoading(false);
      }
    };
    loadFixtures();
  }, [competitionId]);

  return { fixtures, isLoading };
};

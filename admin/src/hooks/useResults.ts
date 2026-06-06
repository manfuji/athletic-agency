'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Fixture } from '@/types/fixtures';
import { getFixtures } from '@/actions/fixtures';

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
        const fixturesData = await getFixtures(competitionId);
        if (fixturesData && typeof fixturesData === 'object' && 'error' in fixturesData) {
          throw new Error(String(fixturesData.error));
        }

        const normalized = Object.fromEntries(
          Object.entries(fixturesData as { [date: string]: Fixture[] }).map(
            ([date, fixtureList]) => [
              new Date(date).toISOString().split('T')[0],
              fixtureList,
            ]
          )
        );

        setFixtures(normalized);
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

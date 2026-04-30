'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchStandings } from '@/actions/groups';
import { GroupStanding } from '@/types/fixtures';
import { useQuery } from '@tanstack/react-query';
interface UseStandingsReturn {
  groupStandings: GroupStanding[];
  isLoading: boolean;
}

export const useStandings = (competitionId: string): UseStandingsReturn => {
  const [groupStandings, setGroupStandings] = useState<GroupStanding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: standings } = useQuery({
    queryKey: ['groups', competitionId],
    queryFn: () => fetchStandings(competitionId) as Promise<{ groups: GroupStanding[] }>,
  });

  useEffect(() => {
    const loadStandings = async () => {
      setIsLoading(true);
      try {
        const groups = Array.isArray(standings?.groups) ? standings.groups : [];
        const transformedStandings = groups.map((group) => ({
          group_id: group.group_id || 'unknown',
          group_name: group.group_name || 'Unnamed Group',
          standings: Array.isArray(group.standings) ? group.standings : [],
        }));

        setGroupStandings(transformedStandings);
      } catch (error) {
        console.error('Error loading standings:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to load standings'
        );
        setGroupStandings([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadStandings();
  }, [standings]);

  return { groupStandings, isLoading };
};

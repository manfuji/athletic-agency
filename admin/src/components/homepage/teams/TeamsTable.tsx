'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/api';
import { fetchAllTeams, deleteTeam } from '@/actions/teams';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import SearchInput from '@/reusables/SearchInput';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, MoreVertical } from 'lucide-react';
import { Team } from '@/types/teams';
import AddTeamsModal from './AddTeamsModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/providers/query-provider';

interface TeamsTableProps {
  initialTeams: Team[];
}

export default function TeamsTable({ initialTeams }: TeamsTableProps) {
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const { data: allTeams, isLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => fetchAllTeams(),
    initialData: initialTeams,
    // Prevent hydration mismatches: keep initialData for first client render.
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const mutation = useMutation({
    mutationFn: async (teamId: string) => {
      setDeletingTeamId(teamId);
      const res = await deleteTeam(teamId);
      if (res && typeof res === 'object' && 'error' in res) {
        throw new Error(String(res.error));
      }
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setDeletingTeamId(null);
    },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const teamsPerPage = 10;

  const router = useRouter();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredTeams = allTeams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * teamsPerPage,
    currentPage * teamsPerPage
  );

  const goToPage = (page: number) => {
    const maxPage = Math.ceil(filteredTeams.length / teamsPerPage);
    if (page >= 1 && page <= maxPage && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleRowClick = (teamId: string) => {
    router.push(`/team/${teamId}`);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <SearchInput
          placeholder="Search by team name"
          onSearch={(query) => setSearchQuery(query)}
        />
        <Button
          onClick={() => setIsAddTeamModalOpen(true)}
          className="bg-[#302464] text-white hover:bg-[#302464] hover:text-white font-evogria"
        >
          Add Team
        </Button>
      </div>

      {isLoading ? (
        <p className="font-evogria text-[17px] text-[#302464] text-center">
          Loading Teams...
        </p>
      ) : filteredTeams.length === 0 ? (
        <div className="bg-white w-full rounded-lg shadow-md border border-[#e9e9e9] p-12 mt-4">
          <p className="text-center mt-4 font-evogria text-[17px] text-[#302464]">
            {searchQuery
              ? `No teams found for "${searchQuery}"`
              : 'No teams found.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
          <Table className="rounded-md">
            <TableHeader>
              <TableRow>
                <TableHead>Teams ({filteredTeams.length})</TableHead>
                <TableHead>Number of Players</TableHead>
                <TableHead>Date Joined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTeams.map((team) => (
                <TableRow
                  key={team.id}
                  onClick={() => handleRowClick(team.id)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <TableCell>
                    <div className="flex items-center">
                      <Image
                        src={getImageUrl(team.logo) || '/Avatar.svg'}
                        alt={team.name}
                        height={40}
                        width={40}
                        className="w-8 h-8 object-cover rounded-full mr-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/TeamLogo.png';
                        }}
                      />
                      <div>
                        <div>{team.name}</div>
                        <div className="text-sm text-gray-500">
                          {team.shortCode}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{team.players_count}</TableCell>
                  <TableCell>
                    {new Date(team.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
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
                          disabled={mutation.isPending && deletingTeamId === team.id}
                          onClick={() => mutation.mutate(team.id)}
                        >
                          <span style={{ color: '#D92D20' }}>
                            {mutation.isPending && deletingTeamId === team.id
                              ? 'Removing...'
                              : 'Remove Team'}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredTeams.length > teamsPerPage && (
            <>
              <hr />
              <div className="flex justify-between items-center mt-4 px-4 pb-4">
                <Button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-white text-black font-bold border border-gray-600 flex items-center gap-1 hover:text-white hover:bg-[#332579]"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from(
                    { length: Math.ceil(filteredTeams.length / teamsPerPage) },
                    (_, i) => i + 1
                  ).map((page) => (
                    <Button
                      key={page}
                      onClick={() => goToPage(page)}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      className={
                        page === currentPage
                          ? 'bg-[#F9F5FF] text-[#302464] hover:bg-[#EDE9FE]'
                          : 'bg-white text-[#302464] border-gray-300 hover:bg-gray-100'
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={
                    currentPage ===
                    Math.ceil(filteredTeams.length / teamsPerPage)
                  }
                  className="bg-white text-black font-bold border border-gray-600 flex items-center gap-1 hover:text-white hover:bg-[#332579]"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {isAddTeamModalOpen && (
        <AddTeamsModal
          isOpen={isAddTeamModalOpen}
          onClose={() => setIsAddTeamModalOpen(false)}
          onTeamAdded={() => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
          }}
        />
      )}
    </div>
  );
}

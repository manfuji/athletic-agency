'use client';

import { ColumnDef, CellContext } from '@tanstack/react-table';
import { MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { removeTeamFromCompetition } from '@/actions/teams';

export type TeamType = {
  id: string;
  name: string;
  code: string;
  icon: string;
  players: number;
  joined: Date;
  slug: string;
};

export const columns: ColumnDef<TeamType, string>[] = [
  {
    id: 'name',
    header: ({ table }) => `Teams (${table.getRowModel().rows.length})`,
    accessorFn: (row) => row.name,
    cell: ({ row }: CellContext<TeamType, string>) => {
      return (
        <div className="flex items-center gap-2">
          <Image
            src={row.original.icon}
            alt={`${row.original.name} icon`}
            style={{ width: 40, height: 40, marginRight: 8 }}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <span className="text-[#101828] font-inter font-medium">
              {row.original.name}
            </span>
            <span className="text-sm font-normal text-[#475467]">
              {row.original.code}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'players',
    header: 'Number of players',
    cell: ({ getValue }) => (
      <span className="text-[#302464] font-semibold">{getValue()}</span>
    ),
  },
  {
    id: 'joined',
    header: 'Date joined',
    accessorFn: (row) => row.joined.toISOString(),
    cell: ({ row }: CellContext<TeamType, string>) => {
      const joinedDate = new Date(row.original.joined);
      const formattedDate = joinedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return (
        <span className="text-[#475467] font-normal">{formattedDate}</span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const teamId = row.original.id;
      const competitionId = (table.options.meta as { competitionId?: string })
        ?.competitionId;
      const refreshTeams = (
        table.options.meta as { refreshTeams?: () => Promise<void> }
      )?.refreshTeams;

      const handleRemoveTeam = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!competitionId) {
          toast.error('Competition ID is missing');
          return;
        }

        try {
          await removeTeamFromCompetition(competitionId, teamId);
          toast.success(
            `${row.original.name} has been removed from the competition`
          );
          if (refreshTeams) {
            await refreshTeams();
          }
        } catch {
          toast.error('Failed to remove team from competition');
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4 text-[#98A2B3]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleRemoveTeam}
              className="font-inter hover:font-semibold"
            >
              <span style={{ color: '#D92D20' }}>
                Remove team from competition
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

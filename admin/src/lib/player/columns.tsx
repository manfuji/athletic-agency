'use client';

import { ColumnDef, CellContext } from '@tanstack/react-table';
import Image from 'next/image';
import { EllipsisVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { removePlayerFromTeam } from '@/actions/players';
import { Player } from '@/types/players';
import { getImageUrl } from '@/lib/api';
import { queryClient } from '@/providers/query-provider';

export const columns: ColumnDef<Player>[] = [
  {
    accessorKey: 'name',
    header: ({ table }) => {
      const playerCount =
        (table.options.meta as { playerCount?: number })?.playerCount || 0;
      return `Players (${playerCount})`;
    },
    cell: ({ row }: CellContext<Player, unknown>) => {
      return (
        <div className="flex items-center gap-2">
          <Image
            src={getImageUrl(row.original.profile_picture) || 'https://ui-avatars.com/api/?name=' + row.original.name}
            alt={`${row.original.name} icon`}
            style={{
              width: 40,
              height: 40,
              marginRight: 8,
              borderRadius: '50%',
            }}
            width={40}
            height={40}
            className="object-cover rounded-full"
          />
          <span className="text-[#475467] font-medium">
            {row.original.name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'position',
    header: 'Position',
    cell: ({ getValue }) => (
      <span className="text-[#475467] font-normal">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'joined',
    header: 'Date joined',
    cell: ({ row }: CellContext<Player, unknown>) => {
      const joinedDate = new Date(row.original.created_at);
      return (
        <span className="text-[#475467] font-normal">
          {joinedDate.toLocaleDateString('en-GB')}{' '}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const playerId = row.original.id;
      const teamId = (table.options.meta as { teamId?: string })?.teamId;
      const handleRemovePlayer = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!teamId) {
          toast.error('Team ID is missing');
          return;
        }

        try {
          await removePlayerFromTeam(playerId, teamId);
          queryClient.invalidateQueries({
            queryKey: ['team', teamId],
          });
          toast.success(`${row.original.name} has been removed from the team`);
        } catch {
          toast.error('Failed to remove player from team');
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleRemovePlayer}
              className="font-inter hover:font-semibold cursor-pointer"
            >
              <span style={{ color: '#D92D20' }}>Remove player from team</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

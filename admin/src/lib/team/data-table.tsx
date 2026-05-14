'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, ArrowLeft, ArrowRight } from 'lucide-react';
import CreateTeams from '@/components/teams/CreateTeams';
import ExistingTeams from '@/components/teams/ExistingTeam';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { fetchTeams, fetchTeamDetails } from '@/actions/teams';
import { getImageUrl } from '@/lib/api';
import { ensureArray, teamDetailsPlayerCount } from '@/lib/normalize';
import { Team } from '@/types/teams';
export interface TeamType {
  id: string;
  name: string;
  code: string;
  icon: string;
  players: number;
  joined: Date;
  slug: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  competitionId: string;
  initialPageCount: number;
  perPage: number;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData extends TeamType, TValue>({
  columns,
  data: initialData,
  competitionId,
  initialPageCount,
  perPage,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [isNewTeamModalOpen, setIsNewTeamModalOpen] = React.useState(false);
  const [isExistingTeamModalOpen, setIsExistingModalOpen] =
    React.useState(false);
  const [teams, setTeams] = React.useState<TData[]>(initialData);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(initialPageCount);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    const fetchPage = async () => {
      try {
        const response = await fetchTeams(competitionId, pageIndex + 1);
        const newTeams: TeamType[] = await Promise.all(
          response.data.map(async (team: Team) => {
            const teamDetails = await fetchTeamDetails(team.id);
            return {
              id: team.id,
              name: team.name,
              code: team.shortCode,
              icon: getImageUrl(team.logo ?? null) || '/TeamLogo.png',
              players: teamDetailsPlayerCount(teamDetails),
              joined: new Date(team.created_at),
              slug: team.slug,
            };
          })
        );
        setTeams(newTeams as TData[]);
        setPageCount(response.last_page);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
        toast.error('Failed to load teams');
      }
    };
    fetchPage();
  }, [pageIndex, competitionId, isInitialLoad]);

  const refreshTeams = async () => {
    try {
      const response = await fetchTeams(competitionId, 1);
      const updatedTeams: TeamType[] = await Promise.all(
        response.data.map(async (team: Team) => {
          const teamDetails = await fetchTeamDetails(team.id);
          return {
            id: team.id,
            name: team.name,
            code: team.shortCode,
            icon: getImageUrl(team.logo ?? null) || '/TeamLogo.svg',
            players: teamDetailsPlayerCount(teamDetails),
            joined: new Date(team.created_at),
            slug: team.slug,
          };
        })
      );
      setTeams(updatedTeams as TData[]);
      setPageIndex(0);
      setPageCount(response.last_page);
    } catch (error) {
      console.error('Error refreshing teams:', error);
      toast.error('Failed to refresh teams');
    }
  };

  const defaultOnRowClick = (row: TData) => {
    router.push(`/setup-competition/${competitionId}/teams/${row.id}`);
  };

  const handleRowClick = onRowClick || defaultOnRowClick;

  const table = useReactTable({
    data: teams,
    columns,
    pageCount,
    manualPagination: true,
    state: {
      columnFilters,
      pagination: {
        pageIndex,
        pageSize: perPage,
      },
    },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize: perPage })
          : updater;
      setPageIndex(newPagination.pageIndex);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      competitionId,
      refreshTeams,
    },
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4 mt-6">
        <div className="relative w-[35rem]">
          <Input
            placeholder="Search by team name"
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="w-full"
          />
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
            size={18}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="flex items-center gap-2 bg-[#302464] font-evogria text-white hover:bg-[#1f1656]">
              ADD TEAM
              <ChevronDown size={20} className="text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem
              onClick={() => setIsNewTeamModalOpen(true)}
              className="font-inter text-[14px] font-medium text-[#344054]"
            >
              Add new team
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsExistingModalOpen(true)}
              className="font-inter text-[14px] font-medium text-[#344054]"
            >
              Add Existing team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            {table.getHeaderGroups().map((headerGroup, groupIndex) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, headerIndex) => (
                  <TableHead
                    key={header.id}
                    className={`text-[#475467] font-medium ${
                      groupIndex === 0 && headerIndex === 0
                        ? 'rounded-tl-md'
                        : ''
                    } ${
                      groupIndex === 0 &&
                      headerIndex === headerGroup.headers.length - 1
                        ? 'rounded-tr-md'
                        : ''
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => handleRowClick(row.original)}
                  className="cursor-pointer hover:bg-gray-100 font-inter"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <hr />
        <div className="flex justify-between items-center mt-4 px-4 pb-4">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-white text-black font-bold border border-gray-600 flex items-center gap-1 hover:text-white hover:bg-[#332579]"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  onClick={() => table.setPageIndex(page - 1)}
                  variant={
                    page === table.getState().pagination.pageIndex + 1
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  className={
                    page === table.getState().pagination.pageIndex + 1
                      ? 'bg-[#F9F5FF] text-[#302464] hover:bg-[#EDE9FE]'
                      : 'bg-white text-[#302464] border-gray-300 hover:bg-gray-100'
                  }
                >
                  {page}
                </Button>
              )
            )}
          </div>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="bg-white text-black font-bold border border-gray-600 flex items-center gap-1 hover:text-white hover:bg-[#332579]"
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {isNewTeamModalOpen && (
        <CreateTeams
          isOpen={isNewTeamModalOpen}
          onClose={() => {
            setIsNewTeamModalOpen(false);
            refreshTeams();
          }}
          competitionId={competitionId}
          onTeamAdded={() => {
            setIsNewTeamModalOpen(false);
            refreshTeams();
          }}
        />
      )}
      {isExistingTeamModalOpen && (
        <ExistingTeams
          isOpen={isExistingTeamModalOpen}
          onClose={() => {
            setIsExistingModalOpen(false);
            refreshTeams();
          }}
          competitionId={competitionId}
        />
      )}
    </>
  );
}

'use client';

import React from 'react';
import { ColumnDef, CellContext } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

export type ExistingTeamType = {
  id: string;
  name: string;
  code: string;
  icon: string;
};

export const cols: ColumnDef<ExistingTeamType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Select existing team to add to the competition',
    cell: ({ row }: CellContext<ExistingTeamType, unknown>) => {
      return (
        <div className="flex items-center gap-2 border-red-500">
          <Image
            src={row.original.icon}
            alt={`${row.original.name} icon`}
            style={{ width: 40, height: 40, marginRight: 8 }}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <span className="font-medium font-inter text-[14px]">
              {row.original.name}
            </span>
            <span className="text-sm font-bold">{row.original.code}</span>
          </div>
        </div>
      );
    },
  },
];

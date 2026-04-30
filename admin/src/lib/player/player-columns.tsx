'use client';

import React from 'react';
import { ColumnDef, CellContext } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';

export type ExistingPlayerType = {
  id: string;
  name: string;
  icon: string;
};

export const cols: ColumnDef<ExistingPlayerType>[] = [
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
    header: 'Select existing player to add to the team',
    cell: ({ row }: CellContext<ExistingPlayerType, unknown>) => {
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
          <span>{row.original.name}</span>
        </div>
      );
    },
  },
];

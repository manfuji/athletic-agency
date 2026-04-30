'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { ExistingCollatorType } from '@/components/collators/ExistingCollators';

export const cols: ColumnDef<ExistingCollatorType>[] = [
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
    header: 'Select collators to add to competition',
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium font-inter text-[14px]">
            {row.original.name}
          </span>
          <span className="text-sm text-[#475467]">{row.original.email}</span>
        </div>
      );
    },
  },
];

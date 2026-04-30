import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-2">
      <Skeleton className="w-[55%] sm:w-[35%] md:w-[25%] h-4 rounded-2xl" />
      <div className="space-y-12">
        {[...Array(3)].map((_, i) => (
          <Table key={i} className="bg-white rounded-[8px] p-4">
            <TableHeader>
              <TableRow className="border-none">
                <TableHead>
                  <Skeleton className="w-20 h-5 rounded-2xl" />
                </TableHead>
                {[...Array(8)].map((_, i) => (
                  <TableHead key={i} className="w-[5px]">
                    <Skeleton className="w-3.5 h-3.5 rounded-none" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="flex items-center gap-x-4 min-w-[250px]">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="w-[55%] sm:w-[35%] md:w-[25%] h-4 rounded-2xl" />
                  </TableCell>
                  {[...Array(8)].map((_, i) => (
                    <TableCell key={i}>
                      <Skeleton className="w-3.5 h-3.5 rounded-none" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ))}
      </div>
    </div>
  );
}

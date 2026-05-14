"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStages, createStage } from "@/actions/stages";
import type { Stage } from "@/types/fixtures";
import { InlineReferenceCreate } from "./InlineReferenceCreate";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StagesPanel({ initialStages }: { initialStages: Stage[] }) {
  const { data: stages = initialStages } = useQuery({
    queryKey: ["stages"],
    queryFn: fetchStages,
    initialData: initialStages,
  });

  return (
    <div className="space-y-6">
      <InlineReferenceCreate
        title="Add stage"
        helpText="Stages are shared across competitions and are used when creating groups and fixtures."
        submitLabel="Add stage"
        queryKeysToInvalidate={[["stages"]]}
        onSubmit={(payload) => createStage(payload)}
      />
      <div className="rounded-lg border border-[#e9e9e9] bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-inter font-semibold">Name</TableHead>
              <TableHead className="font-inter font-semibold">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stages.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center text-muted-foreground font-inter py-8"
                >
                  No stages yet. Add one above.
                </TableCell>
              </TableRow>
            ) : (
              stages.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-inter font-medium">{s.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {s.id}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCompetitionStructures,
  createCompetitionStructure,
} from "@/actions/competitions";
import { InlineReferenceCreate } from "./InlineReferenceCreate";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StructureRow = {
  id: string;
  name: string;
  description?: string;
};

export function StructuresPanel({
  initialStructures,
}: {
  initialStructures: StructureRow[];
}) {
  const { data: structures = initialStructures } = useQuery({
    queryKey: ["structures"],
    queryFn: () => getCompetitionStructures() as Promise<StructureRow[]>,
    initialData: initialStructures,
  });

  return (
    <div className="space-y-6">
      <InlineReferenceCreate
        title="Add competition structure"
        helpText="Structures describe the competition format. Use the exact name Group Stage + Knockout if you need that format enabled during setup."
        namePlaceholder="Structure name"
        submitLabel="Create structure"
        queryKeysToInvalidate={[["structures"]]}
        onSubmit={({ name }) =>
          createCompetitionStructure({ name, description: "" })
        }
      />
      <div className="rounded-lg border border-[#e9e9e9] bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-inter font-semibold">Name</TableHead>
              <TableHead className="font-inter font-semibold">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {structures.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center text-muted-foreground font-inter py-8"
                >
                  No structures yet. Add one above or from competition setup.
                </TableCell>
              </TableRow>
            ) : (
              structures.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-inter font-medium">{s.name}</TableCell>
                  <TableCell className="font-inter text-sm text-muted-foreground">
                    {s.description ?? "—"}
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

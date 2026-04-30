export const dynamic = "force-dynamic";

import { getStandings } from "@/actions/competition";
import AnimationsWrapper from "@/components/animations/animations-wrapper";
import EmptyState from "@/components/common/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leagueTableHeaders } from "@/lib/loops";
import { getImage } from "@/lib/utils";
import Image from "next/image";

export default async function TablePage({
  params,
}: {
  params: Promise<{ competitionSlug: string }>;
}) {
  const { competitionSlug } = await params;
  const { groups } = await getStandings(competitionSlug);

  return (
    <div className="w-full max-w-[1187px] mx-auto font-inter space-y-2">
      <AnimationsWrapper variant="slideUp" className="space-y-12">
        {groups?.map((group, i) => (
          <Table key={i} className="bg-white rounded-[8px]">
            <TableHeader>
              <TableRow className="border-none">
                <TableHead className=" text-black font-bold text-base md:text-xl">
                  {group?.group_name}
                </TableHead>
                {leagueTableHeaders.map((header, i) => (
                  <TableHead
                    key={i}
                    className="w-[5px] px-0 text-center text-xs md:text-base text-black font-bold"
                  >
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {group?.standings?.map((standing, i) => (
                <TableRow key={i} className="text-sm md:text-base font-bold">
                  <TableCell className="flex items-center gap-x-4 min-w-[250px]">
                    <h1>{i + 1}</h1>
                    <div className="flex items-center gap-x-2">
                      <Image
                        src={getImage(
                          standing.team?.logo,
                          "/images/TEAM_PLACEHOLDER.png"
                        )}
                        width={50}
                        height={50}
                        alt="team logo"
                        quality={100}
                        priority
                        className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain"
                      />
                      <p className="font-medium text-gray-500">
                        {standing.team.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {standing.played}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {standing.won}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {standing.draw}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {standing.lost}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {standing.goals_for}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {standing.goals_against}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {standing.goal_difference}
                  </TableCell>
                  <TableCell>{standing.point}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ))}
      </AnimationsWrapper>
      {groups?.length === 0 && (
        <EmptyState
          message="No standings available yet. Standings will appear once fixtures are
          played."
        />
      )}
    </div>
  );
}

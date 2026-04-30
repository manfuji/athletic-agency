'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Image from 'next/image';
import { Standing } from '@/types/fixtures';
import { getImageUrl } from '@/lib/api';
import { ensureArray } from '@/lib/normalize';

const COMMON_TEXT = 'font-amaranth text-[15px] font-normal';
const HEADER_TEXT = `${COMMON_TEXT} text-[#000000]`;
const CELL_TEXT = `${COMMON_TEXT} text-[#475467]`;
const CELL_TEXT_BOLD = `${COMMON_TEXT} text-[#000000]`;

interface GroupStanding {
  group_id: string;
  group_name: string;
  standings: Standing[];
}

interface StandingsTabProps {
  groupStandings: GroupStanding[];
}

export default function StandingsTab({ groupStandings }: StandingsTabProps) {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(2);
    const hours = now.getHours() % 12 || 12;
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'pm' : 'am';
    const formattedDate = `${day}/${month}/${year}, ${hours}:${minutes}${ampm}`;
    setLastUpdated(formattedDate);
  }, []);

  const hasStandings = ensureArray<GroupStanding>(groupStandings).some(
    (group) => ensureArray<Standing>(group.standings).length > 0
  );

  return (
    <div>
      {lastUpdated && (
        <p className="mb-4 font-amaranth text-[15px] font-normal text-[#667085]">
          Last updated: {lastUpdated}
        </p>
      )}
      {!hasStandings ? (
        <div className="font-evogria w-full bg-white shadow-md border border-[#e9e9e9] rounded-lg py-12 text-[17px] text-[#302464] text-center">
          No standings available yet.
        </div>
      ) : (
        <div className="space-y-8">
          {ensureArray<GroupStanding>(groupStandings).map((group) => (
            <div
              key={group.group_id}
              className="overflow-x-auto bg-white rounded-lg shadow-md border border-[#e9e9e9]"
            >
              <Table>
                <TableHeader className="bg-[#F9FAFB]">
                  <TableRow>
                    <TableHead
                      colSpan={3}
                      className="text-left font-inter text-[18px] font-bold text-[#000000]"
                    >
                      {group.group_name}
                    </TableHead>
                    <TableHead className={`text-right ${HEADER_TEXT}`}>
                      PL
                    </TableHead>
                    <TableHead className={`text-right ${HEADER_TEXT}`}>
                      W
                    </TableHead>
                    <TableHead className={`text-right ${HEADER_TEXT}`}>
                      D
                    </TableHead>
                    <TableHead className={`text-right ${HEADER_TEXT}`}>
                      L
                    </TableHead>
                    <TableHead className={`text-right ${HEADER_TEXT}`}>
                      F
                    </TableHead>
                    <TableHead className={`text-right ${HEADER_TEXT}`}>
                      A
                    </TableHead>
                    <TableHead className={`text-right ${HEADER_TEXT}`}>
                      GD
                    </TableHead>
                    <TableHead className={`text-right ${HEADER_TEXT}`}>
                      Pts
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ensureArray<Standing>(group.standings).length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center text-[#475467] py-4"
                      >
                        No standings available for this group.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ensureArray<Standing>(group.standings).map((team, index) => (
                      <TableRow key={team.id}>
                        <TableCell className={`${COMMON_TEXT} text-center`}>
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          {team.team.logo ? (
                            <Image
                              src={
                                getImageUrl(team.team.logo) ||
                                '/default-logo.png'
                              }
                              alt={team.team.name}
                              width={30}
                              height={30}
                              className="object-contain rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full" />
                          )}
                        </TableCell>
                        <TableCell className={`${COMMON_TEXT} text-[#667085]`}>
                          {team.team.name}
                        </TableCell>
                        <TableCell className={`text-right ${CELL_TEXT}`}>
                          {team.played}
                        </TableCell>
                        <TableCell className={`text-right ${CELL_TEXT}`}>
                          {team.won}
                        </TableCell>
                        <TableCell className={`text-right ${CELL_TEXT}`}>
                          {team.draw}
                        </TableCell>
                        <TableCell className={`text-right ${CELL_TEXT}`}>
                          {team.lost}
                        </TableCell>
                        <TableCell className={`text-right ${CELL_TEXT}`}>
                          {team.goals_for}
                        </TableCell>
                        <TableCell className={`text-right ${CELL_TEXT}`}>
                          {team.goals_against}
                        </TableCell>
                        <TableCell className={`text-right ${CELL_TEXT}`}>
                          {team.goal_difference}
                        </TableCell>
                        <TableCell className={`text-right ${CELL_TEXT_BOLD}`}>
                          {team.point}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

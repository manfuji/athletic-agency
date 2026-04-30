"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { useFilterTeam } from "@/hooks/use-filter";
import Link from "next/link";
import AnimationsWrapper from "../animations/animations-wrapper";
import Pagination from "../common/Pagination";
import { getImage } from "@/lib/utils";
import EmptyState from "../common/empty-state";

export default function Teams({ teams }: { teams: TeamPagination }) {
  const totalPages = Math.ceil(teams?.total / teams?.per_page) ?? 0;

  const { team, setTeam, filteredData } = useFilterTeam(teams?.data, "name");

  return (
    <>
      {teams?.data?.length > 0 && (
        <div className="w-full max-w-[1187px] mx-auto font-inter space-y-10 bg-white p-5 md:p-8 rounded-[8px]">
          <AnimationsWrapper variant="slideInRight" scrollTrigger>
            <div className="flex items-center max-w-[320px] border border-gray-300 px-4 py-1 rounded-[12px] shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] ">
              <Input
                placeholder="Search teams"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="text-gray-500 text-lg bg-transparent border-none "
              />
              <Search className="text-gray-400" size={24} />
            </div>
          </AnimationsWrapper>
          <AnimationsWrapper variant="slideUp">
            <Table>
              <TableBody>
                {filteredData?.map((team, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Link
                        href={`/team-profile/${team?.slug}`}
                        className="flex items-center gap-2"
                      >
                        <Image
                          src={getImage(
                            team?.logo,
                            "/images/TEAM_PLACEHOLDER.png"
                          )}
                          width={50}
                          height={50}
                          alt="team logo"
                          quality={100}
                          priority
                          className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain"
                        />
                        <h4 className="font-bold text-base md:text-xl">
                          {team?.name}
                        </h4>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredData?.length === 0 && (
              <div className="font-evogria text-xl text-primary text-center">
                We couldn&rsquo;t find a team matching your search.
              </div>
            )}
            {!teams || teams?.data?.length === 0 ? null : (
              <div className=" flex items-center justify-between  w-full mt-5 text-[#C5C5C5] font-varela text-[0.8rem] ">
                <div className=" flex items-center text-base gap-x-2">
                  <p className=" text-[#000000]">{teams?.to}</p>
                  <p>of</p>
                  <p>{teams?.total}</p>
                </div>
                <Pagination totalPages={totalPages!} />
              </div>
            )}
          </AnimationsWrapper>
        </div>
      )}

      {teams?.data?.length === 0 && (
        <EmptyState
          message="No teams available yet. Teams will appear here once added to the
          competition."
        />
      )}
    </>
  );
}

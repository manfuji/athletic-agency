"use client";

import { getImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function PlayerRankCard({
  number,
  person,
}: {
  number: number;
  person: GoalStats | AssistStats | YellowCardStats | RedCardStats;
}) {
  const path = usePathname();
   const params = useParams<{ competitionSlug: string }>();
  const competitionSlug = params?.competitionSlug

  return (
    <Link
      href={`/player-profile/${person?.slug}`}
      className="border-b border-gray-300 flex items-center gap-x-4 py-3"
    >
      <h1 className="text-base sm:text-lg md:text-2xl 2xl:text-lg font-evogria">
        {number + 1}
      </h1>
      <div className="w-full flex gap-x-6 items-center justify-between">
        <div className="flex items-center gap-x-2 md:gap-x-4">
          <Image
            src={getImage(person?.profilePicture, "/images/AVATAR.png")}
            alt="player image"
            quality={100}
            width={1000}
            height={1000}
            priority
            className="w-11 h-11 md:w-16 md:h-16 2xl:w-11 2xl:h-11 object-cover rounded-full"
          />
          <div>
            <p className="text-base font-semibold">{person?.name}</p>
            {path.includes(`${competitionSlug}`) && (
              <div className="flex items-center gap-x-1">
                <Image
                  src={getImage(
                    person?.team?.logo,
                    "/images/TEAM_PLACEHOLDER.png"
                  )}
                  alt="team logo"
                  width={1000}
                  height={1000}
                  priority
                  quality={100}
                  className="w-5 h-5 2xl:w-4 2xl:h-4"
                />
                <p className="text-sm text-gray-500">{person.team?.name}</p>
              </div>
            )}

            {path.includes("/team-profile") && (
              <p className="text-sm text-gray-500">{person?.position}</p>
            )}
          </div>
        </div>
        <h2 className="text-2xl">
          {"goalCount" in person
            ? person?.goalCount
            : "assistCount" in person
              ? person?.assistCount
              : "cardCount" in person
                ? person?.cardCount
                : ""}
        </h2>
      </div>
    </Link>
  );
}

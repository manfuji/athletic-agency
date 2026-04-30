"use client";

import { leagueTabs } from "@/lib/loops";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LeagueTabs({
  competitionTypeSlug,
  competitionSlug,
}: {
  competitionTypeSlug: string;
  competitionSlug: string;
}) {
  const pathname = usePathname();

  const basePath = `/competitions/${competitionTypeSlug}/competition/${competitionSlug}`;

  const tabs = leagueTabs(basePath);

  return (
    <div className="bg-white max-w-[1187px] mx-auto rounded-[8px] pt-6 md:pt-12">
      <div className="flex items-center w-fit mx-auto gap-x-5 px-2 sm:gap-x-8 border-b-2 border-gray-400">
        {tabs.map((tab, i) => (
          <Link
            href={`${tab.path}`}
            prefetch
            key={i}
            className={`font-evogria cursor-pointer text-xs sm:text-sm md:text-lg text-center sm:px-3 py-2 -mb-[1.8px] ${
              pathname === tab.path
                ? "border-b-2 border-primary text-primary"
                : "text-[#767676]"
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

import { formatTimeToGMT, getImage } from "@/lib/utils";
import Image from "next/image";

export default function GameCard({ data }: { data: IGame }) {
  return (
    <div className="w-full max-w-[715px] mx-auto">
      <div className="flex items-center justify-between font-evogria text-xs sm:text-base lg:text-lg">
        <div className="flex items-center gap-x-2">
          <Image
            src={getImage(data.home_team?.logo, "/images/TEAM_PLACEHOLDER.png")}
            alt="team logo"
            priority
            quality={100}
            width={1000}
            height={1000}
            className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-14 lg:h-14 object-contain"
          />
          <p className="w-[150px]">{data.home_team?.name}</p>
        </div>
        {data.home_team?.score != null && data.away_team?.score != null ? (
          <p className="bg-[#039855] text-white px-4 md:px-6 py-2 rounded-[6px] md:rounded-[8px] min-w-fit ">
            {`${data?.home_team?.score} - ${data?.away_team?.score}`}
          </p>
        ) : (
          <p className="text-gray-500 min-w-fit ">
            {formatTimeToGMT(data?.time)}
          </p>
        )}
        <div className="flex items-center gap-x-2">
          <Image
            src={getImage(data.away_team?.logo, "/images/TEAM_PLACEHOLDER.png")}
            alt="team logo"
            priority
            quality={100}
            width={1000}
            height={1000}
            className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-14 lg:h-14 object-contain"
          />
          <p className="w-[150px]">{data.away_team?.name}</p>
        </div>
      </div>
    </div>
  );
}

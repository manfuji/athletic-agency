import { getCountryName, getImage } from "@/lib/utils";
import Image from "next/image";

export default function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 border border-gray-300 py-6 px-4 rounded-[8px]">
      <Image
        src={getImage(player?.profile_picture as string, "/images/AVATAR.png")}
        alt="player"
        quality={100}
        width={1000}
        height={1000}
        className="w-full sm:w-[170px] sm:min-h-[216px] sm:max-h-[216px] object-cover rounded-[8px]"
      />
      <div className="font-evogria uppercase flex flex-col gap-y-4 ">
        <div>
          <h1 className=" text-lg">{player.name}</h1>
          <h3 className="text-sm text-gray-500">
            {getCountryName(player.nationality)}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs">
          <div>
            <h3 className="text-gray-500">Position</h3>
            <h1>{player.position}</h1>
          </div>
          <div>
            <h3 className="text-gray-500">Height</h3>
            <h1>{player.height}</h1>
          </div>
          <div>
            <h3 className="text-gray-500">Prev experience</h3>
            <h1 className="line-clamp-1">{player.previous_experience}</h1>
          </div>
          <div>
            <h3 className="text-gray-500">Preferred foot</h3>
            <h1>{player.preferred_foot}</h1>
          </div>
          <div>
            <h3 className="text-gray-500">Weight</h3>
            <h1>{player.weight}</h1>
          </div>
          <div>
            <h3 className="text-gray-500 ">Reason</h3>
            <h1 className="line-clamp-1">{player.reason_for_joining}</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

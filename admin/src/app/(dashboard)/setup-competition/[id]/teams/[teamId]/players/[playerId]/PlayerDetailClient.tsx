"use client";

import { useState } from "react";
import Image from "next/image";
import CustomButton from "@/reusables/CustomButton";
import { Calendar, Trophy } from "lucide-react";
import CreatePlayer from "@/components/players/CreatePlayer";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { StatCard } from "@/lib/player/StatCard";
import { PlayerAccordion } from "@/lib/player/PlayerAccordion";
import { getImageUrl } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { fetchPlayer } from "@/actions/players";
import { PlayerDetails } from "@/types/players";
import { StatsAccordion } from "@/lib/player/stats-accordion";
import { getCompetitions } from "@/actions/competitions";

// Register English locale
countries.registerLocale(enLocale);

interface PlayerDetailClientProps {
  player: PlayerDetails;
  competitionId: string;
  teamId: string;
  playerId: string;
}

interface Stat {
  label: string;
  value: string | number;
  suffix?: string;
  category: "Attack" | "Defense & Discipline" | "Physical";
}

type CompetitionStatsFilter = "all" | string; // string for competition ID


export default function PlayerDetailClient({
  player: initialPlayer,
  competitionId,
  teamId,
  playerId,
}: PlayerDetailClientProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [competitionFilter, setCompetitionFilter] =
    useState<CompetitionStatsFilter>(competitionId || "all");

  // Fetch competitions for the filter dropdown
  const { data: competitionsData } = useQuery({
    queryKey: ["competitions"],
    queryFn: getCompetitions,
  });

  const competitions = competitionsData && !("error" in competitionsData)
    ? competitionsData
    : [];

  const { data: player } = useQuery<PlayerDetails>({
    queryKey: ["player", playerId, competitionFilter],
    queryFn: () =>
      fetchPlayer(
        playerId,
        competitionFilter === "all" ? undefined : competitionFilter
      ) as Promise<PlayerDetails>,
    initialData: initialPlayer,
  });

  const getCountryCode = (nationality: string): string => {
    const normalizedNationality = nationality.toLowerCase().trim();
    if (
      normalizedNationality.length === 2 &&
      countries.isValid(normalizedNationality)
    ) {
      return normalizedNationality;
    }
    const countryEntry = Object.entries(
      countries.getNames("en", { select: "official" })
    ).find(([, name]) => name.toLowerCase() === normalizedNationality);
    const code = countryEntry ? countryEntry[0].toLowerCase() : "unknown";
    return code;
  };

  const getCountryName = (nationality: string): string => {
    const normalizedNationality = nationality.toLowerCase().trim();
    if (
      normalizedNationality.length === 2 &&
      countries.isValid(normalizedNationality)
    ) {
      const name = countries.getName(normalizedNationality, "en", {
        select: "official",
      });
      return name || nationality;
    }
    const countryEntry = Object.entries(
      countries.getNames("en", { select: "official" })
    ).find(([, name]) => name.toLowerCase() === normalizedNationality);
    return countryEntry ? countryEntry[1] : nationality;
  };

  const getTeamName = (team: string): string => {
    if (!team) return "Unknown Team";
    return team;
  }
  const statsMap = new Map(
    player?.stats.map((stat) => [stat.title.toLowerCase(), stat.value])
  );

  // Helper function to format numeric values to at most 3 decimal places
  const formatStatValue = (value: string | number): string | number => {
    if (typeof value === "number") {
      // Format to 3 decimal places and remove trailing zeros
      return parseFloat(value.toFixed(3));
    }
    if (typeof value === "string") {
      // Try to parse as number
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && isFinite(numValue)) {
        // Format to 3 decimal places and remove trailing zeros
        return parseFloat(numValue.toFixed(3));
      }
    }
    return value;
  };

  const stats = [
    { value: player?.position, label: "Position" },
    { value: player?.preferred_foot, label: "Preferred Foot" },
    { value: player?.weight || "N/A", label: "Weight", suffix: "kg" },
    { value: player?.height || "N/A", label: "Height", suffix: "cm" },
    { value: formatStatValue(statsMap.get("matches") || "0"), label: "Matches" },
    { value: formatStatValue(statsMap.get("goals") || "0"), label: "Goals" },
    { value: formatStatValue(statsMap.get("yellow cards") || "0"), label: "Yellow Cards" },
    { value: formatStatValue(statsMap.get("red cards") || "0"), label: "Red Cards" },
    { value: formatStatValue(statsMap.get("shot accuracy") || statsMap.get("shooting accuracy") || "0"), label: "Shooting Accuracy", suffix: "%" },
    { value: formatStatValue(statsMap.get("pass accuracy") || "0"), label: "Pass Accuracy", suffix: "%" },
    { value: formatStatValue(statsMap.get("max speed") || "0"), label: "Max Speed", suffix: "m/s" },
    { value: formatStatValue(statsMap.get("total distance") || "0"), label: "Total Distance", suffix: "m" },
  ];

  // Helper function to get stat value from statsMap
  const getStatValue = (key: string, defaultValue: number | string = 0): number | string => {
    return statsMap.get(key.toLowerCase()) || defaultValue;
  };

  // Map actual player stats to accordion format
  const accordionStats: Stat[] = [
    // Attack stats
    { label: "Saves", value: formatStatValue(getStatValue("saves")), category: "Attack" },
    { label: "Goals", value: formatStatValue(getStatValue("goals")), category: "Attack" },
    { label: "Shots on target", value: formatStatValue(getStatValue("shots on target")), category: "Attack" },
    { label: "Shots Blocked", value: formatStatValue(getStatValue("shots blocked")), category: "Attack" },
    { label: "Shooting Accuracy", value: formatStatValue(getStatValue("shot accuracy", 0)), suffix: "%", category: "Attack" },
    { label: "Attempted pass", value: formatStatValue(getStatValue("attempted pass")), category: "Attack" },
    { label: "Completed pass", value: formatStatValue(getStatValue("completed pass")), category: "Attack" },
    { label: "Key passes", value: formatStatValue(getStatValue("key passes")), category: "Attack" },
    { label: "Pass accuracy", value: formatStatValue(getStatValue("pass accuracy", 0)), suffix: "%", category: "Attack" },
    { label: "Assists", value: formatStatValue(getStatValue("assists")), category: "Attack" },
    { label: "Successful Dribble", value: formatStatValue(getStatValue("successful dribble")), category: "Attack" },
    { label: "Unsuccessful Dribble", value: formatStatValue(getStatValue("unsuccessful dribble")), category: "Attack" },
    { label: "Dribble success rate", value: formatStatValue(getStatValue("dribble success rate", 0)), suffix: "%", category: "Attack" },
    { label: "Foul won", value: formatStatValue(getStatValue("foul won")), category: "Attack" },

    // Defense & Discipline stats
    { label: "Foul committed", value: formatStatValue(getStatValue("foul commited")), category: "Defense & Discipline" },
    { label: "Tackle won", value: formatStatValue(getStatValue("tackle won")), category: "Defense & Discipline" },
    { label: "Interception", value: formatStatValue(getStatValue("interception")), category: "Defense & Discipline" },
    { label: "Block", value: formatStatValue(getStatValue("block")), category: "Defense & Discipline" },
    { label: "Clearance", value: formatStatValue(getStatValue("clearance")), category: "Defense & Discipline" },
    { label: "Yellow card", value: formatStatValue(getStatValue("yellow cards")), category: "Defense & Discipline" },
    { label: "Red card", value: formatStatValue(getStatValue("red cards")), category: "Defense & Discipline" },

    // Physical stats
    { label: "Calories", value: formatStatValue(getStatValue("calories")), suffix: "kcal", category: "Physical" },
    { label: "Deceleration", value: formatStatValue(getStatValue("decelerations")), suffix: "m/s²", category: "Physical" },
    { label: "DSL", value: formatStatValue(getStatValue("dsl")), category: "Physical" },
    { label: "HID Per Min", value: formatStatValue(getStatValue("hid per min")), suffix: "m", category: "Physical" },
    { label: "High Intensity Distance", value: formatStatValue(getStatValue("high intensity distance")), suffix: "m", category: "Physical" },
    { label: "High Speed Running", value: formatStatValue(getStatValue("high speed running")), suffix: "m", category: "Physical" },
    { label: "HSR Per Min", value: formatStatValue(getStatValue("hsr per min")), suffix: "m", category: "Physical" },
    { label: "Impacts", value: formatStatValue(getStatValue("impacts")), category: "Physical" },
    { label: "Max Speed", value: formatStatValue(getStatValue("max speed")), suffix: "m/s", category: "Physical" },
    { label: "Number of Sprints", value: formatStatValue(getStatValue("no of sprints")), category: "Physical" },
    { label: "Sprint Distance Per Min", value: formatStatValue(getStatValue("sprint distance per min")), suffix: "m", category: "Physical" },
    { label: "Total Distance", value: formatStatValue(getStatValue("total distance")), suffix: "m", category: "Physical" },
    { label: "Step Balance (L)", value: formatStatValue(getStatValue("step balance l", 0)), suffix: "%", category: "Physical" },
    { label: "Step Balance (R)", value: formatStatValue(getStatValue("step balance r", 0)), suffix: "%", category: "Physical" },
    { label: "Time In Red Zone", value: formatStatValue(getStatValue("time in red zone")), suffix: "m", category: "Physical" },
  ];

  const handleStatsFilterChange = (value: CompetitionStatsFilter) => {
    setCompetitionFilter(value);
  };

  const accordionItems = [
    {
      value: "stats",
      title: "Player Stats",
      content: (
        <StatsAccordion
          stats={accordionStats}
          competitions={competitions}
          currentCompetitionId={competitionId}
          onFilterChange={handleStatsFilterChange}
        />
      ),
    },
    {
      value: "bio",
      title: "Biography",
      content: player?.bio || "No bio available.",
    },
    {
      value: "previous_experience",
      title: "Previous Experience",
      content:
        player?.previous_experience || "No previous experience provided.",
    },
    {
      value: "reason_for_joining",
      title: "Reason for Joining AA Summer Series",
      content: player?.reason_for_joining || "No reason provided.",
    },
  ];

  return (
    <div className="w-[85%] px-4 py-6 ml-8">
      {/* Profile Picture */}
      <div className="flex justify-center">
        {player?.profile_picture ? (
          <Image
            src={getImageUrl(player?.profile_picture) || "/Avatar.svg"}
            alt={`${player?.name} profile`}
            width={184}
            height={184}
            className="rounded-full object-cover w-[184px] h-[184px]"
          />
        ) : (
          <Image
            src="/Avatar.svg"
            alt="Fallback image"
            width={184}
            height={184}
            className="rounded-full object-cover w-[184px] h-[184px]"
          />
        )}
      </div>

      {/* Name */}
      <h1 className="text-center mt-4 font-evogria text-[#1D2939] text-[27px] font-normal">
        {player?.name}
      </h1>

      {/* Nationality and DOB */}
      <div className="flex justify-center gap-4 mt-2">
        <div className="flex items-center gap-2 border border-[#D0D5DD] bg-white py-2 px-4 rounded-full">
          <Image
            src={`https://flagcdn.com/24x18/${getCountryCode(
              player?.nationality || ""
            )}.png`}
            alt={`${getCountryName(player?.nationality || "")} flag`}
            width={24}
            height={18}
            onError={(e) =>
              (e.currentTarget.src = "https://flagcdn.com/24x18/xx.png")
            }
            className="rounded-full object-cover"
          />
          <p className="text-[#344054] font-inter md:text-[16px] text-[14px]">
            {getCountryName(player?.nationality || "")}
          </p>
        </div>
        {/* added team name */}
        <div className="flex justify-between border border-[#D0D5DD] gap-2 bg-white py-2 px-4 rounded-full">
          <Trophy className="w-5 h-5 inline-block text-[#344054]" />
          <p className="text-[#344054] font-inter md:text-[16px] text-[14px]">
            {getTeamName(player?.team || "Not Available")}
          </p>
        </div>
        <div className="flex justify-between border border-[#D0D5DD] gap-2 bg-white py-2 px-4 rounded-full">
          <Calendar className="w-5 h-5 inline-block text-[#344054]" />
          <p className="text-[#344054] font-inter">
            {new Date(player?.dob || "").toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="flex justify-center my-6">
        <CustomButton
          text="Edit Profile"
          onClick={() => setIsEditModalOpen(true)}
          bgColor="bg-white"
          color="text-[#344054]"
          className="text-[16px] border border-[#D0D5DD] font-evogria hover:bg-white"
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 ml-0 mr-auto">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            value={`${stat.value}${stat.suffix || ""}`}
            label={stat.label}
          />
        ))}
      </div>

      {/* Player Accordion */}
      <PlayerAccordion items={accordionItems} />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <CreatePlayer
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          teamId={teamId}
          initialData={{
            image: getImageUrl(player?.profile_picture) || "",
            name: player?.name,
            country: getCountryCode(player?.nationality || ""),
            dob: new Date(player?.dob || ""),
            height: player?.height || "",
            weight: player?.weight || "",
            bio: player?.bio || undefined,
            experience: player?.previous_experience || undefined,
            reason: player?.reason_for_joining || undefined,
            position: player?.position,
            preferredFoot: player?.preferred_foot,
          }}
          isEditMode={true}
          playerId={playerId}
        />
      )}
    </div>
  );
}

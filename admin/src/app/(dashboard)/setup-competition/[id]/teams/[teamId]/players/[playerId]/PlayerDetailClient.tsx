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
import {
  buildImportableAccordionStats,
  STAT_LABELS,
  type StatDisplayCategory,
} from "@/lib/playerStatistics";

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
  category: StatDisplayCategory;
}

type CompetitionStatsFilter = "all" | string;

function resolveInitialCompetitionFilter(
  competitionId: string,
  player: PlayerDetails
): CompetitionStatsFilter {
  if (competitionId) return competitionId;
  if (player.statistics_competition_id) {
    return player.statistics_competition_id;
  }
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("lastImportedCompetitionId");
    if (stored) return stored;
  }
  return "all";
}

export default function PlayerDetailClient({
  player: initialPlayer,
  competitionId,
  teamId,
  playerId,
}: PlayerDetailClientProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [competitionFilter, setCompetitionFilter] =
    useState<CompetitionStatsFilter>(() =>
      resolveInitialCompetitionFilter(competitionId, initialPlayer)
    );

  const { data: competitionsData } = useQuery({
    queryKey: ["competitions"],
    queryFn: getCompetitions,
  });

  const competitions =
    competitionsData && !("error" in competitionsData)
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
  };

  const statsMap = new Map(
    player?.stats.map((stat) => [stat.title.toLowerCase(), stat.value])
  );

  const formatStatValue = (value: string | number): string | number => {
    if (typeof value === "number") {
      return parseFloat(value.toFixed(3));
    }
    if (typeof value === "string") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && isFinite(numValue)) {
        return parseFloat(numValue.toFixed(3));
      }
    }
    return value;
  };

  const getStatValue = (label: string, defaultValue: number | string = 0) =>
    statsMap.get(label.toLowerCase()) ?? defaultValue;

  const profileCards: {
    value: string | number | undefined;
    label: string;
    suffix?: string;
  }[] = [
    { value: player?.position, label: "Position" },
    { value: player?.preferred_foot, label: "Preferred Foot" },
    { value: player?.weight || "N/A", label: "Weight", suffix: "kg" },
    { value: player?.height || "N/A", label: "Height", suffix: "cm" },
  ];

  const importedHighlightCards: {
    value: string | number;
    label: string;
    suffix?: string;
  }[] = [
    {
      value: formatStatValue(getStatValue(STAT_LABELS.minutes_played)),
      label: STAT_LABELS.minutes_played,
    },
    {
      value: formatStatValue(getStatValue(STAT_LABELS.shots_on_target)),
      label: STAT_LABELS.shots_on_target,
    },
    {
      value: formatStatValue(getStatValue(STAT_LABELS.tackles)),
      label: STAT_LABELS.tackles,
    },
    {
      value: formatStatValue(getStatValue(STAT_LABELS.interceptions)),
      label: STAT_LABELS.interceptions,
    },
  ];

  const stats = [...profileCards, ...importedHighlightCards];

  const accordionStats: Stat[] = buildImportableAccordionStats(statsMap).map(
    (stat) => ({
      ...stat,
      value: formatStatValue(stat.value),
    })
  );

  const handleStatsFilterChange = (value: CompetitionStatsFilter) => {
    setCompetitionFilter(value);
  };

  const activeCompetitionId =
    competitionFilter === "all"
      ? player?.statistics_competition_id ?? competitionId
      : competitionFilter;

  const accordionItems = [
    {
      value: "stats",
      title: "Player Stats",
      content: (
        <StatsAccordion
          stats={accordionStats}
          competitions={competitions}
          currentCompetitionId={activeCompetitionId || undefined}
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

      <h1 className="text-center mt-4 font-evogria text-[#1D2939] text-[27px] font-normal">
        {player?.name}
      </h1>

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

      <div className="flex justify-center my-6">
        <CustomButton
          text="Edit Profile"
          onClick={() => setIsEditModalOpen(true)}
          bgColor="bg-white"
          color="text-[#344054]"
          className="text-[16px] border border-[#D0D5DD] font-evogria hover:bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 ml-0 mr-auto">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            value={`${stat.value}${stat.suffix || ""}`}
            label={stat.label}
          />
        ))}
      </div>

      <PlayerAccordion items={accordionItems} />

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

import Image from "next/image";
import { Trophy } from "lucide-react";
import { LuCalendar } from "react-icons/lu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import StatCard from "@/components/player-profile/stat-card";
import { getPlayerProfile } from "@/actions/player";
import { getTeamById } from "@/actions/team";
import {
  dobFormat,
  getCountryCode,
  getCountryName,
  getImage,
  getTeamName,
} from "@/lib/utils";
import AnimationsWrapper from "@/components/animations/animations-wrapper";

type ExtendedPlayerData = PlayerDetails["data"] & {
  team_id?: string;
  team_name?: string | null;
  // Backend may return team as a string or object
  team?: string | { name?: string | null };
};

export default async function PlayerProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data }: PlayerDetails = await getPlayerProfile(slug);

  // Fetch team data if team_id exists but team object is missing or lacks a name
  let teamName: string | null = null;
  const apiData = data as ExtendedPlayerData;
  const hasValidTeamObject =
    apiData?.team &&
    typeof apiData.team === "object" &&
    apiData.team.name;
  const hasTeamNameString =
    typeof apiData?.team === "string" ? apiData.team : apiData?.team_name;
  
  if (apiData?.team_id && !hasValidTeamObject && !hasTeamNameString) {
    const teamResponse = await getTeamById(apiData.team_id);
    if (teamResponse) {
      teamName = teamResponse.name ?? null;
    }
  }

  // Handle both old format (stats array) and new format (statistics object)
  let statsArray: { title: string; value: string | number }[] = [];
  
  // Check if we have statistics object (new format) or stats array (old format)
  interface StatisticsObject {
    matches?: number;
    goals?: number;
    assists?: number;
    yellow_cards?: number;
    yellow_card?: number;
    red_cards?: number;
    red_card?: number;
    shots_on_target?: number;
    shots_off_target?: number;
    shots_blocked?: number;
    shot_accuracy?: number;
    attempted_pass?: number;
    completed_pass?: number;
    key_passes?: number;
    pass_accuracy?: number;
    successful_dribble?: number;
    unsuccessful_dribble?: number;
    dribble_success_rate?: number;
    foul_won?: number;
    foul_commited?: number;
    tackle_won?: number;
    interception?: number;
    block?: number;
    clearance?: number;
    saves?: number;
    total_distance?: number;
    max_speed?: number;
    high_speed_running?: number;
    sprint_distance?: number;
    no_of_sprints?: number;
    accelerations?: number;
    decelerations?: number;
    impacts?: number;
    calories?: number;
    time_in_red_zone?: number;
    distance_per_min?: number;
    dsl?: number;
    hid_per_min?: number;
    high_intensity_distance?: number;
    hsr_per_min?: number;
    sprint_distance_per_min?: number;
    step_balance_l?: number;
    step_balance_r?: number;
  }
  
  if (data && "statistics" in data && typeof data.statistics === "object" && data.statistics !== null) {
    // New format: statistics object - convert to stats array
    const statistics = data.statistics as StatisticsObject;
    
    statsArray = [
      { title: "matches", value: statistics.matches || 0 },
      { title: "goals", value: statistics.goals || 0 },
      { title: "assists", value: statistics.assists || 0 },
      { title: "yellow cards", value: statistics.yellow_cards || statistics.yellow_card || 0 },
      { title: "red cards", value: statistics.red_cards || statistics.red_card || 0 },
      { title: "shots on target", value: statistics.shots_on_target || 0 },
      { title: "shots off target", value: statistics.shots_off_target || 0 },
      { title: "shots blocked", value: statistics.shots_blocked || 0 },
      { title: "shot accuracy", value: statistics.shot_accuracy || 0 },
      { title: "attempted pass", value: statistics.attempted_pass || 0 },
      { title: "completed pass", value: statistics.completed_pass || 0 },
      { title: "key passes", value: statistics.key_passes || 0 },
      { title: "pass accuracy", value: statistics.pass_accuracy || 0 },
      { title: "successful dribble", value: statistics.successful_dribble || 0 },
      { title: "unsuccessful dribble", value: statistics.unsuccessful_dribble || 0 },
      { title: "dribble success rate", value: statistics.dribble_success_rate || 0 },
      { title: "foul won", value: statistics.foul_won || 0 },
      { title: "foul commited", value: statistics.foul_commited || 0 },
      { title: "tackle won", value: statistics.tackle_won || 0 },
      { title: "interception", value: statistics.interception || 0 },
      { title: "block", value: statistics.block || 0 },
      { title: "clearance", value: statistics.clearance || 0 },
      { title: "saves", value: statistics.saves || 0 },
      { title: "total distance", value: statistics.total_distance || 0 },
      { title: "max speed", value: statistics.max_speed || 0 },
      { title: "high speed running", value: statistics.high_speed_running || 0 },
      { title: "sprint distance", value: statistics.sprint_distance || 0 },
      { title: "no of sprints", value: statistics.no_of_sprints || 0 },
      { title: "accelerations", value: statistics.accelerations || 0 },
      { title: "decelerations", value: statistics.decelerations || 0 },
      { title: "impacts", value: statistics.impacts || 0 },
      { title: "calories", value: statistics.calories || 0 },
      { title: "time in red zone", value: statistics.time_in_red_zone || 0 },
      { title: "distance per min", value: statistics.distance_per_min || 0 },
      { title: "dsl", value: statistics.dsl || 0 },
      { title: "hid per min", value: statistics.hid_per_min || 0 },
      { title: "high intensity distance", value: statistics.high_intensity_distance || 0 },
      { title: "hsr per min", value: statistics.hsr_per_min || 0 },
      { title: "sprint distance per min", value: statistics.sprint_distance_per_min || 0 },
      { title: "step balance l", value: statistics.step_balance_l || 0 },
      { title: "step balance r", value: statistics.step_balance_r || 0 },
    ];
  } else if (data?.stats && Array.isArray(data.stats)) {
    // Old format: stats array
    statsArray = data.stats;
  }

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

  // Create a map of stats for easy lookup
  const statsMap = new Map(
    statsArray.map((stat) => [stat.title.toLowerCase(), stat.value])
  );

  // Get position, weight, height, preferred foot from stats array or data fields
  const position = statsMap.get("position") || data?.position || "";
  const weight = statsMap.get("weight") || data?.weight || "";
  const height = statsMap.get("height") || data?.height || "";
  const preferredFoot = statsMap.get("preferred foot") || data?.preferred_foot || "";

  // Define stat type with optional unit
  type StatWithUnit = {
    title: string;
    value: string;
    unit?: string;
  };

  // Define priority stats (these will be shown first)
  const priorityStats: StatWithUnit[] = [
    ...(position ? [{ title: "Position", value: String(position) }] : []),
    ...(preferredFoot ? [{ title: "Preferred Foot", value: String(preferredFoot) }] : []),
    ...(weight ? [{ title: "Weight", value: String(formatStatValue(weight)), unit: "kg" }] : []),
    ...(height ? [{ title: "Height", value: String(formatStatValue(height)), unit: "cm" }] : []),
    { title: "Matches", value: String(formatStatValue(statsMap.get("matches") ?? 0)) },
    { title: "Goals", value: String(formatStatValue(statsMap.get("goals") || "0")) },
    { title: "Yellow Cards", value: String(formatStatValue(statsMap.get("yellow cards") || statsMap.get("yellow card") || "0")) },
    { title: "Red Cards", value: String(formatStatValue(statsMap.get("red cards") || statsMap.get("red card") || "0")) },
    { title: "Shooting Accuracy", value: String(formatStatValue(statsMap.get("shot accuracy") || statsMap.get("shooting accuracy") || "0")), unit: "%" },
    { title: "Pass Accuracy", value: String(formatStatValue(statsMap.get("pass accuracy") || "0")), unit: "%" },
    { title: "Max Speed", value: String(formatStatValue(statsMap.get("max speed") || "0")), unit: "m/s" },
    { title: "Total Distance", value: String(formatStatValue(statsMap.get("total distance") || "0")), unit: "m" },
  ];

  // Get all other stats from the API that aren't in priority stats, excluding "assists"
  const priorityStatTitles = new Set(priorityStats.map(s => s.title.toLowerCase()));
  const otherStats: StatWithUnit[] = statsArray
    .filter(stat => {
      const statTitle = stat.title.toLowerCase();
      // Exclude stats that are already in priority list, metadata fields, and "assists"
      return !priorityStatTitles.has(statTitle) && 
             !["position", "weight", "height", "preferred foot", "assists"].includes(statTitle);
    })
    .map(stat => ({
      title: stat.title.charAt(0).toUpperCase() + stat.title.slice(1), // Capitalize first letter
      value: String(formatStatValue(stat.value)),
    }));

  // Combine priority stats with other stats from API, exclude "Assists", and limit to 12
  const allStats = [...priorityStats, ...otherStats]
    .filter(stat => {
      // Filter out empty values and "Assists"
      return stat.value !== "" && 
             stat.value !== null && 
             stat.value !== undefined &&
             stat.title.toLowerCase() !== "assists";
    })
    .slice(0, 12); // Limit to first 12 stats



  return (
    <div className="relative">
      <div className="h-80 md:h-[448px] bg-primary absolute top-0 left-0 right-0 w-full z-10" />
      <div className="bg-[#F2F4F7] px-[25px] lg:px-20 py-40 md:py-44">
        <div className="flex flex-col gap-y-14 z-20 relative ">
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col items-center gap-y-4 md:gap-y-6">
              <AnimationsWrapper variant="slideDown">
                <Image
                  src={getImage(data?.profile_picture, "/images/AVATAR.png")}
                  alt="player image"
                  width={520}
                  height={520}
                  priority
                  quality={100}
                  className="w-[327px] h-[327px] md:w-[520px] md:h-[520px] rounded-[20.62px] object-cover"
                />
              </AnimationsWrapper>

              <div className="flex flex-col gap-y-4 md:gap-y-6">
                <AnimationsWrapper variant="slideUp" scrollTrigger>
                  <h1 className="text-5xl sm:text-7xl font-evogria">
                    {data?.name}
                  </h1>
                </AnimationsWrapper>

                <AnimationsWrapper variant="slideInRight" scrollTrigger>
                  <div className="font-inter font-medium flex items-center gap-x-3 justify-center text-gray-700">
                    <p className="flex items-center gap-x-2 bg-white border border-gray-300 rounded-2xl px-3 py-1 w-fit">
                      <Image
                        src={`https://flagcdn.com/24x18/${getCountryCode(
                          data?.nationality
                        )}.png`}
                        alt="country flag"
                        width={1000}
                        height={1000}
                        priority
                        quality={100}
                        className="w-5 h-5 object-contain"
                      />
                      {getCountryName(data?.nationality)}
                    </p>
                    {/* get team name */}
                    <p className="flex items-center gap-x-2 bg-white border border-gray-300 rounded-2xl px-3 py-1 w-fit">
                      <Trophy size={14} className="text-gray-500" />
                      {(() => {
                        const resolvedTeamName =
                          apiData?.team_name ||
                          (typeof apiData?.team === "string"
                            ? apiData.team
                            : apiData?.team?.name) ||
                          teamName;
                        return resolvedTeamName ? getTeamName(resolvedTeamName) : "Not Available";
                      })()}
                    </p>
                    <p className="flex items-center gap-x-2 bg-white border border-gray-300 rounded-2xl px-3 py-1 w-fit">
                      <LuCalendar size={14} className="text-gray-500" />
                      {dobFormat(data?.dob)}
                    </p>
                  </div>
                </AnimationsWrapper>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-[842px] mx-auto place-items-center">
              <AnimationsWrapper variant="listAnimationY" scrollTrigger isList>
                {allStats.map((stat, i) => (
                  <StatCard 
                    key={i} 
                    title={stat.title} 
                    value={stat.unit ? `${stat.value}${stat.unit}` : stat.value} 
                  />
                ))}
              </AnimationsWrapper>
            </div>
          </div>
          <div className="flex flex-col gap-y-6">
            {data?.sections?.map((section, i) => (
              <Accordion
                type="single"
                collapsible
                defaultValue="item-1"
                className="w-full max-w-[970px] mx-auto"
                key={i}
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger className="hover:no-underline font-evogria text-lg bg-primary text-white px-5 rounded-t-[8px]">
                    <AnimationsWrapper variant="slideUp" scrollTrigger>
                      {section?.title}
                    </AnimationsWrapper>
                  </AccordionTrigger>
                  {/* added this */}
                  <AccordionContent className="bg-white px-5 py-5 rounded-b-[8px] border-t-0 border-r border-b border-l border-gray-300 font-inter text-base">
                    <AnimationsWrapper variant="slideInRight" scrollTrigger>
                      {section?.content || "No content available."}
                    </AnimationsWrapper>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PlayerCard from "@/components/team/player-card";
import TeamRecordCard from "@/components/team/team-record-card";
import { getTeamProfile } from "@/actions/team";
import Link from "next/link";
import StatsLeaders from "@/components/competitions/stats-leaders";
import AnimationsWrapper from "@/components/animations/animations-wrapper";
import { getImage } from "@/lib/utils";
import EmptyState from "@/components/common/empty-state";

export default async function TeamProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const team = await getTeamProfile(slug);

  return (
    <div className="relative">
      <AnimationsWrapper variant="fadeIn">
        <Image
          src={getImage(team?.coverPhoto, "/images/BANNER_PLACEHOLDER.png")}
          alt="team bg"
          priority
          quality={100}
          width={1000}
          height={1000}
          className="w-full h-80 md:h-[448px] absolute top-0 left-0 right-0 z-10 object-cover"
        />
      </AnimationsWrapper>

      <div className="bg-[#F2F4F7] px-[25px] lg:px-20 py-[270px] md:py-[400px] lg:py-[370px] ">
        <div className="z-20 relative flex flex-col gap-y-24">
          <AnimationsWrapper variant="slideUp">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="bg-white p-6 border w-full max-w-[126px] sm:max-w-[161.5px] md:max-w-[197px] lg:max-w-[232px]  md:rounded-[27px] lg:rounded-[36px] rounded-[18px]">
                <Image
                  src={getImage(team?.logo, "/images/TEAM_PLACEHOLDER.png")}
                  alt="team logo"
                  width={1000}
                  height={1000}
                  priority
                  quality={100}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <p className="bg-gray-200 font-inter text-xs font-medium text-gray-700 w-fit px-2 py-1 rounded-full">
                  {team?.category.name}
                </p>
                <h1 className="font-evogria text-2xl uppercase">{team.name}</h1>
                <p className="text-sm text-gray-700 font-inter md:line-clamp-3 md:hover:line-clamp-none lg:line-clamp-none">
                  {team?.description}
                </p>
              </div>
            </div>
          </AnimationsWrapper>

          <div className="flex flex-col 2xl:flex-row-reverse gap-y-14 gap-x-6">
            <div className="gap-4 md:px-5 space-y-5 md:space-y-11 font-inter text-base">
              <div className="flex justify-center sm:justify-start gap-x-7">
                <AnimationsWrapper
                  variant="listAnimationX"
                  scrollTrigger
                  isList
                >
                  {team?.stats &&
                    Object?.entries(team?.stats).map(([label, value], i) => (
                      <TeamRecordCard key={i} data={{ label, value }} />
                    ))}
                </AnimationsWrapper>
              </div>

              <StatsLeaders />
            </div>
            <div className="w-full flex flex-col gap-y-10">
              {team?.players &&
                Object?.entries(team?.players).map(([position, playerList]) => (
                  <div key={position} className="w-full">
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full max-w-[1187px] mx-auto"
                      defaultValue="item-1"
                    >
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="hover:no-underline font-evogria text-lg bg-primary text-white px-5 rounded-t-[8px]">
                          <AnimationsWrapper
                            variant="slideInLeft"
                            scrollTrigger
                          >
                            {position} ({playerList?.length})
                          </AnimationsWrapper>
                        </AccordionTrigger>
                        <AccordionContent className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white px-5 py-5 rounded-b-[8px] border-t-0 border-r border-b border-l border-gray-300 font-inter text-base">
                          <AnimationsWrapper
                            variant="listAnimationY"
                            scrollTrigger
                            isList
                          >
                            {playerList?.map((player, i) => (
                              <Link
                                key={i}
                                href={`/player-profile/${player?.slug}`}
                              >
                                <PlayerCard player={player} />
                              </Link>
                            ))}
                          </AnimationsWrapper>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ))}
              {Object.keys(team?.players ?? {}).length === 0 && (
                <EmptyState message="This team doesn't have any players listed yet. Check back later!" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

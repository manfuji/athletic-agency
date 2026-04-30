import { getCompetitionsByType } from "@/actions/competition";
import AnimationsWrapper from "@/components/animations/animations-wrapper";
import EmptyState from "@/components/common/empty-state";
import CompetitionCard from "@/components/competitions/competition-card";

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable caching

export default async function Competitions({
  params,
}: {
  params: Promise<{ competitionTypeSlug: string }>;
}) {
  const { competitionTypeSlug } = await params;
  const competition = await getCompetitionsByType(competitionTypeSlug);

  return (
    <div>
      <div className="bg-primary font-evogria px-[25px] lg:px-20 py-10 lg:py-24 flex flex-col gap-y-8 ">
        <AnimationsWrapper variant="slideDown">
          <h1 className="text-[46px] md:text-[82px] text-white">
            {competition?.name}
          </h1>
        </AnimationsWrapper>
        <div className="bg-white p-5 md:p-10 rounded-2xl ">
          <h2 className="text-[30px] md:text-[40px]">
            About {competition?.name}
          </h2>
          <p className="font-inter font-medium ">{competition?.description}</p>
        </div>
      </div>
      <div className="bg-[#F5F5F5] px-[25px] lg:px-20 py-10 lg:py-24 flex flex-col gap-y-8">
        <AnimationsWrapper variant="listAnimationY" isList scrollTrigger>
          {competition?.competitions?.map((competition, i) => (
            <CompetitionCard
              competition={competition}
              slug={competitionTypeSlug}
              key={i}
            />
          ))}
        </AnimationsWrapper>

        {competition?.competitions?.length === 0 && (
          <EmptyState message="No competitions available yet." />
        )}
      </div>
    </div>
  );
}

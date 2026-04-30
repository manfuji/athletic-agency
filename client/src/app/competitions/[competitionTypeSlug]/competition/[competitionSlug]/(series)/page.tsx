export const dynamic = "force-dynamic";

import { getCompetitionHighlights } from "@/actions/competition";
import AnimationsWrapper from "@/components/animations/animations-wrapper";
import EmptyState from "@/components/common/empty-state";
import MediaCard from "@/components/videos/media-card";
import Link from "next/link";

export default async function HighlightsPage({
  params,
}: {
  params: Promise<{ competitionTypeSlug: string; competitionSlug: string }>;
}) {
  const { competitionTypeSlug, competitionSlug } = await params;
  const { data } = await getCompetitionHighlights(competitionSlug);

  return (
    <div className="flex flex-col gap-y-14 max-w-[1187px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-3">
        <AnimationsWrapper variant="listAnimationX" scrollTrigger isList>
          {data?.map((highlights) => 
            highlights?.slug ? (
              <Link
                href={`/competitions/${competitionTypeSlug}/competition/${competitionSlug}/highlights/${highlights.slug}`}
                key={highlights?.id}
              >
                <MediaCard
                  data={highlights}
                  thumbnail
                  video_post
                  classNames={{
                    cardImage:
                      "min-h-[245.31px] md:min-h-[468px] max-h-[568px] object-cover",
                    playButton: "sm:text-5xl md:text-6xl lg:text-8xl ",
                  }}
                />
              </Link>
            ) : null
          )}
        </AnimationsWrapper>
      </div>

      {data?.length === 0 && (
        <EmptyState message="No highlights available yet." />
      )}
    </div>
  );
}

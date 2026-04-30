export const dynamic = "force-dynamic";

import { getCompetitionNews } from "@/actions/competition";
import AnimationsWrapper from "@/components/animations/animations-wrapper";
import EmptyState from "@/components/common/empty-state";
import MediaCard from "@/components/videos/media-card";
import Link from "next/link";

export default async function NewsPage({
  params,
}: {
  params: Promise<{ competitionTypeSlug: string; competitionSlug: string }>;
}) {
  const { competitionTypeSlug, competitionSlug } = await params;
  const { data } = await getCompetitionNews(competitionSlug);

  return (
    <div className="flex flex-col gap-y-14 max-w-[1187px] mx-auto">
      <AnimationsWrapper variant="listAnimationY" scrollTrigger isList>
        {data?.map((news) => 
          news?.slug ? (
            <Link
              href={`/competitions/${competitionTypeSlug}/competition/${competitionSlug}/news/${news.slug}`}
              key={news?.id}
            >
              <MediaCard
                data={news}
                news_post
                thumbnail
                classNames={{
                  cardImage: "min-h-[245.31px] max-h-[568px] object-cover",
                }}
              />
            </Link>
          ) : null
        )}
      </AnimationsWrapper>
      {data?.length === 0 && <EmptyState message="No news available yet." />}
    </div>
  );
}

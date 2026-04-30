import {
  getCompetitionHighlights
} from "@/actions/competition";
import { getSingleVideo } from "@/actions/videos";
import GoBack from "@/components/common/go-back";
import MediaCard from "@/components/videos/media-card";
import Link from "next/link";

export default async function HighlightDetails({
  params,
}: {
  params: Promise<{
    competitionTypeSlug: string;
    competitionSlug: string;
    slug: string;
  }>;
}) {
  const { competitionTypeSlug, competitionSlug, slug } = await params;

  const [{ data }, { data: highlights }] = await Promise.all([
    getSingleVideo(slug),
    getCompetitionHighlights(competitionSlug),
  ]);

  return (
    <div className="bg-[#F2F4F7] px-[25px] lg:px-20 py-8">
      <GoBack
        path={`/competitions/${competitionTypeSlug}/competition/${competitionSlug}`}
      />
      <div className="space-y-14 sm:space-y-10">
        <div>
          <MediaCard data={data} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-3">
          {highlights
            ?.filter((highlights) => highlights?.id !== data?.id && highlights?.slug)
            .map((highlights, i) => (
              <Link
                href={`/competitions/${competitionTypeSlug}/competition/${competitionSlug}/highlights/${highlights.slug}`}
                key={i}
              >
                <MediaCard
                  data={highlights}
                  thumbnail
                  classNames={{
                    playButton: "sm:text-5xl md:text-6xl",
                  }}
                />
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

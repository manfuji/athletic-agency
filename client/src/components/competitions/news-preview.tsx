import NewsItemPreview from "../news/news-preview";
import { getFeaturedCompetitionNews } from "@/actions/competition";

export default async function NewsPreview({
  competitionTypeSlug,
  competitionSlug,
}: {
  competitionTypeSlug: string;
  competitionSlug: string;
}) {
  const { data } = await getFeaturedCompetitionNews(competitionSlug);

  return (
    <div>
      <NewsItemPreview
        news={data}
        path={`/competitions/${competitionTypeSlug}/competition/${competitionSlug}/news`}
      />
    </div>
  );
}

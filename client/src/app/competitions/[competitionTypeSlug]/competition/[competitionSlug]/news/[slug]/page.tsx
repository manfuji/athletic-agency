import { getSingleNews } from "@/actions/news";
import NewsItem from "@/components/news/news-item";

export default async function NewsDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await getSingleNews(slug);

  return (
    <div>
      <NewsItem news={data} />
    </div>
  );
}

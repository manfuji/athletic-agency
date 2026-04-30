import { fetchNews } from "@/actions/news";
import NewsManager from "@/components/news/NewsManager";

export const dynamic = "force-dynamic";

export default async function News() {
  const initialNews = await fetchNews();
  return <NewsManager initialNews={initialNews} />;
}

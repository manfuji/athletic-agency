export const dynamic = "force-dynamic";

import { getAllNews, getFeaturedNews, getNewsLiveVideo } from "@/actions/news";
import NewsItemPreview from "@/components/news/news-preview";
import MediaCard from "@/components/videos/media-card";
import Link from "next/link";

export default async function MainNews() {
  const [{ data: news }, { data: featuredNews }, { data: liveVideo }] =
    await Promise.all([getAllNews(), getFeaturedNews(), getNewsLiveVideo()]);

  return (
    <div className="bg-[#F2F4F7] ">
      <NewsItemPreview news={featuredNews} path="/news" />
      <div className="space-y-16 px-[25px] lg:px-20 py-28">
        {liveVideo?.title ? (
          <div>
            <MediaCard data={liveVideo} live />
          </div>
        ) : null}
        <div className="space-y-6 ">
          <h1 className="font-semibold font-inter text-lg">Recent Posts</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-3">
            {news?.map((news, i) => (
              <Link href={`/news/${news?.slug}`} key={news?.id}>
                <MediaCard
                  key={i}
                  data={news}
                  news_post
                  thumbnail
                  classNames={{
                    cardImage: "min-h-[245.31px] max-h-[245.31px] object-cover",
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

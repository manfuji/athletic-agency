import Image from "next/image";
import { FullDate, getImage, getYouTubeId } from "@/lib/utils";
import { YouTubeEmbed } from "@next/third-parties/google";
import { getServerHtmlContent } from "@/lib/server-utlis";

export default async function NewsItem({ news }: { news: News }) {
  return (
    <div>
      <div className="relative w-full h-80 md:h-[464px] lg:h-[664px]">
        <Image
          src={getImage(news?.cover_image as string, "")}
          alt="news image"
          quality={100}
          priority
          fill
          className="object-cover"
        />
      </div>
      <div className="max-w-[803px] mx-auto flex flex-col gap-y-20 px-[25px] lg:px-20  py-20">
        <div className="space-y-4">
          <p className="bg-gray-100 text-gray-700 w-fit px-2 py-1 rounded-full font-inter text-xs sm:text-sm md:text-base">
            {news?.category?.name}
          </p>
          <h1 className="font-evogria text-2xl md:text-3xl lg:text-4xl uppercase">
            {news?.title}
          </h1>
          <p className="font-inter text-gray-500">
            {FullDate(news?.published_at)}
          </p>
        </div>
        {news?.youtube_url && (
          <div className="w-full max-h-[461px] ">
            <YouTubeEmbed
              videoid={getYouTubeId(news?.youtube_url) as string}
              params="controls=1"
              style="width: 100%; height: fit-content; border-radius:25px"
            />
          </div>
        )}
        {news?.content && (
          <div
            className="space-y-6 text-base md:text-lg font-inter"
            dangerouslySetInnerHTML={{
              __html: await getServerHtmlContent(news?.content),
            }}
          />
        )}
      </div>
    </div>
  );
}

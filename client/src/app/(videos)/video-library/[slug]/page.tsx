import { getSingleVideo, getVideos } from "@/actions/videos";
import GoBack from "@/components/common/go-back";
import MediaCard from "@/components/videos/media-card";
import Link from "next/link";

export default async function VideoDetails({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const [{ data }, { data: videos }] = await Promise.all([
    getSingleVideo(slug),
    getVideos(),
  ]);

  return (
    <div className="bg-[#F2F4F7] px-[25px] lg:px-20 py-8">
      <GoBack path={`/video-library`} />
      <div className="space-y-14 sm:space-y-10">
        <div>
          <MediaCard data={data} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-3">
          {videos
            ?.filter((video) => video?.competition === null)
            ?.filter((video) => video?.id !== data?.id)
            .map((video, i) => (
              <Link href={`/video-library/${video.slug}`} key={i}>
                <MediaCard
                  data={video}
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

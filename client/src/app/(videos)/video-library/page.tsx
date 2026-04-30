export const dynamic = "force-dynamic";

import { getVideos } from "@/actions/videos";
import VideoLibrary from "@/components/videos/video-library";

export default async function MainVideoLibrary() {
  const { data } = await getVideos();

  return (
    <div>
      <VideoLibrary data={data} />
    </div>
  );
}

export const dynamic = "force-dynamic";

import { getLiveVideosCalendar } from "@/actions/videos";
import LiveVideos from "@/components/videos/live-videos";

export default async function MainLiveVideos() {
  const { data } = await getLiveVideosCalendar();
  return (
    <div>
      <LiveVideos data={data} />
    </div>
  );
}

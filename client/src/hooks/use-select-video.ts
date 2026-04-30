import { videoType } from "@/lib/loops";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function useSelectVideo() {
  const [selected, setSelected] = useState("");

  const router = useRouter();
  const pathname = usePathname();

  const matchedVideo = videoType?.find((video) =>
    pathname.includes(video.path)
  );

  useEffect(() => {
    const isVideoPath = videoType.some((video) =>
      pathname.includes(video.path)
    );

    if (!isVideoPath) {
      setSelected("");
      return;
    }

    if (matchedVideo) {
      setSelected(matchedVideo.path);
    }
  }, [pathname, matchedVideo]);

  const handleSelectType = (value: string) => {
    setSelected(value);
    router.push(`${value}`);
  };

  const onSelectedClick = (value: string) => {
    router.push(`${value}`);
  };

  return {
    selected,
    handleSelectType,
    onSelectedClick,
    matchedVideo,
    videoType,
  };
}

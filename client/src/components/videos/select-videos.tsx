"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSelectVideo from "@/hooks/use-select-video";

interface SelectVideosProps {
  onClose?: () => void;
}

export default function SelectVideos({ onClose }: SelectVideosProps) {
  const {
    selected,
    handleSelectType,
    matchedVideo,
    onSelectedClick,
    videoType,
  } = useSelectVideo();

  return (
    <Select
      value={selected}
      onValueChange={(value) => {
        handleSelectType(value);
      }}
    >
      <SelectTrigger
        className={`${matchedVideo && "lg:text-primary"} bg-transparent pl-0 lg:px-3 text-xl  w-fit  lg:w-auto lg:text-base border-none outline-none focus:outline-none focus:ring-0 focus:ring-offset-0`}
      >
        <SelectValue placeholder={selected ? selected : "Videos"} />
      </SelectTrigger>
      <SelectContent>
        {videoType?.map((video, i) => (
          <SelectItem
            value={video.path}
            key={i}
            onPointerDown={() => {
              onSelectedClick(video.path);
              if (onClose) {
                onClose();
              }
            }}
          >
            {video.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

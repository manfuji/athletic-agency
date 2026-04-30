"use client";

import Image from "next/image";
import { CgPlayButtonO } from "react-icons/cg";
import { cn, getImage, normalizeData, TimeAgo } from "@/lib/utils";
import VideoPlayer from "../common/video-player";

type MediaCardClassNames = {
  cardImage?: string;
  playButton?: string;
  title?: string;
};

export default function MediaCard({
  live,
  news_post,
  video_post,
  thumbnail,
  data,
  classNames,
}: {
  live?: boolean;
  news_post?: boolean;
  thumbnail?: boolean;
  video_post?: boolean;
  data: MediaData;
  classNames?: MediaCardClassNames;
}) {
  const { title, image, videoUrl, category, date, type, mediaFile } =
    normalizeData(data);

  return (
    <div className="cursor-pointer hover:underline flex flex-col gap-y-5 bg-white border border-gray-300 rounded-[4.41px] py-4 px-2">
      {image && thumbnail && (
        <div className="relative">
          <Image
            src={getImage(image, "")}
            alt="image"
            width={1000}
            height={1000}
            priority
            quality={100}
            className={cn("w-full rounded-[4.41px]", classNames?.cardImage)}
          />
          {!news_post && (
            <div className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0000003b] w-full h-full flex items-center justify-center rounded-[4.41px]">
              <CgPlayButtonO
                className={cn("text-white text-4xl", classNames?.playButton)}
              />
            </div>
          )}
        </div>
      )}

      {(videoUrl || mediaFile) && !thumbnail && (
        <VideoPlayer
          url={
            (type === "media" ? getImage(mediaFile as string, "") : videoUrl) ??
            ""
          }
        />
      )}

      <div className="flex flex-col gap-y-3">
        <div className="font-inter text-xs font-medium flex items-start gap-x-2">
          {live && (
            <p className="bg-gray-100 text-gray-700  w-fit px-2 py-1 rounded-full">
              Live
            </p>
          )}

          {category && (
            <p className="bg-gray-100 text-gray-700  w-fit px-2 py-1 rounded-full">
              {category}
            </p>
          )}

          {video_post && (
            <p className="bg-gray-100 text-gray-500 w-fit px-2 py-1 rounded-full">
              {TimeAgo(date as string)}
            </p>
          )}
        </div>
        <div className="font-evogria">
          <h1
            className={cn(
              "text-xl sm:text-2xl uppercase line-clamp-2 ",
              classNames?.title
            )}
          >
            {title}
          </h1>
          {news_post && (
            <p className="text-gray-700 text-sm font-inter ">
              {TimeAgo(date as string)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

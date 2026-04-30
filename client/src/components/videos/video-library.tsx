"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterCategory } from "@/hooks/use-filter";
import { Video } from "lucide-react";
import MediaCard from "./media-card";
import Link from "next/link";

export default function VideoLibrary({ data }: { data: VideoLibrary[] }) {
  const { category, setCategory, filteredData } = useFilterCategory(
    data,
    "category",
    "name"
  );

  const categories = ["All", ...data?.map((item) => item?.category?.name)];

  return (
    <div>
      <div className="h-40 md:h-[214px] bg-primary flex items-center justify-center">
        <h1 className="uppercase font-evogria text-3xl md:text-5xl text-white">
          Video Library
        </h1>
      </div>
      <div className="bg-[#F2F4F7] px-[25px] lg:px-20 py-28">
        <div className="flex flex-col gap-y-14 max-w-[1506.54px] mx-auto">
          <Select onValueChange={setCategory}>
            <SelectTrigger className="w-fit font-semibold text-gray-700 gap-x-4 focus:outline-none focus:ring-0 focus:ring-offset-0 border border-gray-300 px-[14px] py-[1.5rem]  rounded-[10px] font-inter text-base shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]">
              <SelectValue placeholder="Select sport category">
                {category || "Select sport category"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="font-inter">
              {categories?.map((category, i) => (
                <SelectItem key={i} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filteredData?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-3">
              {filteredData
                ?.filter((video) => video?.competition === null)
                ?.map((video, i) => (
                  <Link key={i} href={`/video-library/${video.slug}`}>
                    <MediaCard data={video} video_post thumbnail />
                  </Link>
                ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <Video className="size-1/5 text-gray-400" />
              <p className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-evogria text-gray-700 font-bold">
                {`No videos`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

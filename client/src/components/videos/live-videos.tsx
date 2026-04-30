"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import useSWR from "swr";
import { getLiveVideosByDate } from "@/actions/videos";
import { useFilterCategory } from "@/hooks/use-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MediaCard from "./media-card";
import { Radio } from "lucide-react";
import Loading from "./live-videos-skeletion";
import Link from "next/link";
import { formatAsYYYYMMDD, liveVideoStatus } from "@/lib/utils";

export default function LiveVideos({
  data: liveVideosCalendar,
}: {
  data: Pick<LiveVideo, "scheduled_at" | "status" | "title" | "slug">[];
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const formattedDate = formatAsYYYYMMDD(date);

  const { data, isLoading } = useSWR(
    formattedDate ? `/cms/live-videos/date?date=${formattedDate}` : null,
    async () => {
      return await getLiveVideosByDate(formattedDate as string);
    },
    { revalidateOnMount: true }
  );

  const { category, setCategory, filteredData } = useFilterCategory(
    data?.data ?? [],
    "category",
    "name"
  );

  const categories = [
    "All",
    ...(data?.data?.map((item) => item?.category?.name) ?? []),
  ];

  return (
    <div>
      <div className="h-40 md:h-[214px] bg-primary flex items-center justify-center">
        <h1 className="uppercase font-evogria text-3xl md:text-5xl text-white">
          live videos
        </h1>
      </div>
      <div className="bg-[#F2F4F7] px-[25px] lg:px-20 py-28">
        <div className="flex flex-col gap-y-9 md:gap-y-14 max-w-[1440px] mx-auto">
          <Select onValueChange={setCategory}>
            <SelectTrigger className="w-fit text-gray-700 font-semibold gap-x-4 focus:outline-none focus:ring-0 focus:ring-offset-0 border border-gray-300 px-[14px] py-[1.5rem]  rounded-[10px] font-inter text-base shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]">
              <SelectValue placeholder="Select sport category">
                {category || "Select sport category"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="font-inter">
              {categories.map((category, i) => (
                <SelectItem key={i} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-col-reverse md:flex-row md:gap-x-8 lg:gap-x-14 items-start gap-y-6 md:gap-y-10">
            {isLoading && <Loading />}
            {!isLoading && (
              <div className="w-full max-w-[989px] flex flex-col gap-y-8 md:gap-y-14">
                {filteredData?.length ? (
                  filteredData?.map((video, i) => (
                    <Link
                      key={i}
                      href={`/live-videos/${video.slug}?date=${formattedDate}`}
                    >
                      <MediaCard
                        data={video}
                        thumbnail
                        classNames={{
                          playButton: "sm:text-6xl",
                          title: "md:text-4xl",
                        }}
                      />
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col justify-center items-center">
                    <Radio className="size-1/5 text-gray-400" />
                    <p className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-evogria text-gray-700 font-bold">{`No live videos`}</p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-[8px] flex flex-col gap-y-4 border border-gray-200 px-4 py-4 w-fit">
              <h1 className="font-evogria text-xl sm:text-2xl">
                Live Video SchedulE
              </h1>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full font-inter p-0"
                hideNavigation={true}
                modifiers={liveVideoStatus(liveVideosCalendar)}
                modifiersClassNames={{
                  live: "status live",
                  ended: "status ended",
                  scheduled: "status scheduled",
                }}
                classNames={{
                  caption: "none",
                  caption_label: "text-xl sm:text-2xl text-[#222B45]",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

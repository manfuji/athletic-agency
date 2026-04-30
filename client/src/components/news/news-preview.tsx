"use client";

import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Image from "next/image";
import Button from "../common/Button";
import Link from "next/link";
import { getClientHtmlContent, getImage } from "@/lib/utils";

export default function NewsItemPreview({
  news,
  path,
}: {
  news: News[];
  path?: string;
}) {
  return (
    <div className="relative bg-white">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        speed={1000}
        pagination={{
          clickable: true,
          el: ".custom-pagination",
        }}
        loop
        navigation={false}
        modules={[Autoplay, Pagination]}
        className="mySwiper relative"
      >
        {news?.map((news) => (
          <SwiperSlide key={news.id}>
            <div className="flex flex-col lg:flex-row">
              <div className="relative w-full h-80 md:h-[464px] lg:h-[664px] lg:w-[65%]">
                <Image
                  src={getImage(news?.cover_image as string, "")}
                  alt="news image"
                  quality={100}
                  priority
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4 px-10 pt-12 pb-36 border-t bg-white lg:h-[664px] lg:w-[35%]">
                <div className="space-y-4">
                  <p className="bg-gray-100 text-gray-700 w-fit px-2 py-1 rounded-full font-inter text-xs md:text-sm">
                    {news?.category?.name}
                  </p>
                  <h1 className="font-evogria text-xl sm:text-2xl md:text-3xl uppercase">
                    {news?.title}
                  </h1>
                  <p
                    className="font-inter text-sm md:text-base line-clamp-6"
                    dangerouslySetInnerHTML={{
                      __html: getClientHtmlContent(news?.content),
                    }}
                  />
                </div>
                {news?.slug && path ? (
                  <Link href={`${path}/${news.slug}`}>
                    <Button className="mt-4">read more</Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </SwiperSlide>
        ))}
        <div className="absolute bottom-16 right-0 z-50 px-10 w-full lg:w-[35%]">
          <div className="custom-pagination flex w-fit gap-x-3" />
        </div>
      </Swiper>
    </div>
  );
}

"use client";

import { Mission } from "@/lib/loops";
import Image from "next/image";
import React, { useState } from "react";
import AnimationsWrapper from "../animations/animations-wrapper";
import { getYouTubeId } from "@/lib/utils";
import { Play } from "lucide-react";

const STAY_IN_GAME_VIDEO_SRC = "https://youtu.be/p6udUv4DBIU";
const STAY_IN_GAME_THUMBNAIL_SRC = "/images/thumbnail.JPG";

export default function OurMission() {
  const youtubeId = getYouTubeId(STAY_IN_GAME_VIDEO_SRC);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-white flex flex-col gap-y-24 py-10 lg:py-32 px-[25px] lg:px-20">
      <div className="flex flex-col gap-y-12 lg:gap-y-14">
        <div className="flex flex-col gap-y-2 lg:gap-y-5">
          <AnimationsWrapper variant="slideInLeft" scrollTrigger>
            <h1 className="text-center text-[40px] md:text-[62px] font-evogria">
              OUR MISSION
            </h1>
          </AnimationsWrapper>
          <AnimationsWrapper variant="slideUp" scrollTrigger>
            <p className="font-inter font-medium text-base text-center max-w-[1240px] mx-auto">
              We are dedicated to inspiring and empowering the next generation
              of athletes. Our mission is to bridge the data and visibility gap
              in youth sports, ensuring that talented athletes gain the exposure
              and opportunities they deserve. By fostering connections between
              athletes, coaches, and scouts, we aim to enhance access to
              scholarships and professional career pathways, helping young
              athletes realize their full potential both on and off the field.
            </p>
          </AnimationsWrapper>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <AnimationsWrapper variant="listAnimationY" scrollTrigger isList>
            {Mission.map((item, index) => (
              <div
                key={index}
                className="relative w-full max-w-[442px] aspect-square overflow-hidden rounded-lg"
              >
                <Image
                  src={item}
                  alt="mission"
                  fill
                  priority={index < 2}
                  quality={100}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 442px"
                />
              </div>
            ))}
          </AnimationsWrapper>
        </div>
      </div>
      <div className="overflow-x-hidden flex flex-col md:flex-row md:justify-between md:items-center md:gap-x-16 gap-y-12 lg:gap-y-14">
        <div className="flex flex-col gap-y-2 lg:gap-y-5">
          <AnimationsWrapper variant="fadeIn" scrollTrigger>
            <h1 className="font-evogria text-[40px]  md:text-[56px] ">
              STAY IN THE <br className="hidden md:block" /> GAME
            </h1>

            <p className="font-inter font-semibold text-base">
              Catch every moment—watch live events as they happen!
            </p>
          </AnimationsWrapper>
        </div>
        <AnimationsWrapper
          className="w-full md:w-1/2"
          variant="slideInRight"
          scrollTrigger
        >
          {/* Show thumbnail first; start video on click */}
          {!isPlaying ? (
            <button
              type="button"
              className="relative w-full overflow-hidden rounded-lg group focus:outline-none"
              style={{ paddingBottom: "56.25%" }}
              onClick={() => setIsPlaying(true)}
            >
              <Image
                src={STAY_IN_GAME_THUMBNAIL_SRC}
                alt="AA Summer Series video thumbnail"
                fill
                priority
                quality={100}
                className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <span className="inline-flex items-center justify-center rounded-full bg-white/95 text-primary h-16 w-16 shadow-lg">
                  <Play className="h-7 w-7 ml-0.5" />
                </span>
              </div>
            </button>
          ) : youtubeId ? (
            <div
              className="relative w-full overflow-hidden rounded-lg"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title="AA Summer Series video"
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              className="rounded-lg w-full h-full object-cover"
              controls
              autoPlay
              poster={STAY_IN_GAME_THUMBNAIL_SRC}
            >
              <source src={STAY_IN_GAME_VIDEO_SRC} />
              Your browser does not support the video tag.
            </video>
          )}
        </AnimationsWrapper>
      </div>
    </div>
  );
}

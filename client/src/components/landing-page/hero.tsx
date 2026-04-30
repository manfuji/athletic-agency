import Image from "next/image";
import React from "react";
import Button from "../common/Button";
import AnimationsWrapper from "../animations/animations-wrapper";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="bg-primary  px-[25px] lg:px-20 py-10 lg:py-24 flex flex-col gap-y-8 ">
      <AnimationsWrapper variant="slideDown">
        <h1 className="text-[46px] md:text-[82px] font-evogria text-white">
          AA SUMMER SERIES 2026
        </h1>
   
      </AnimationsWrapper>

      <AnimationsWrapper variant="slideUp">
        <div className="bg-white px-[14px] py-6 rounded-2xl flex flex-col md:flex-row md:gap-x-6 md:items-center lg:items-stretch gap-y-4 ">
          <Image
            src="/images/banner2026.jpg"
            alt="hero-image"
            width={1000}
            height={1000}
            priority
            quality={100}
            className="w-full md:min-w-[312px] object-cover lg:min-w-[390px] lg:max-w-[512px] rounded-lg "
          />
          <div className="flex flex-col gap-y-5 lg:justify-between">
            <div className="flex flex-col gap-y-[10px]">
              <div className="flex gap-x-[13px] font-inter font-semibold">
                <p className="px-3 py-[2px] text-orange-700 bg-orange-50 rounded-2xl ">
                  Upcoming
                </p>
                <p className="px-3 py-[2px] text-gray-700 bg-gray-50 rounded-2xl ">
                  Football
                </p>
              </div>
              <div className="flex flex-col gap-y-3">
                <h3 className="text-2xl lg:text-4xl font-evogria">
                  AA SUMMER SERIES 2026
                </h3>
                <h2 className="text-xl lg:text-3xl text-gray-500 font-evogria">
                All Star Draft Edition
                </h2>
                <div className="font-inter text-base font-medium">
                  <p>
                  The AA Summer Series 2026 – All-Star Draft Edition is a structured, data-driven youth football showcase designed to identify, evaluate, and expose high-potential players aged
                  16–21. <br className="md:hidden" /> 
                  <br className="md:hidden" /> 
                  Hosted by The Athletic Agency at the University of Ghana Training Pitch(July–August 2026), the event combines formal evaluation sessions, a live All-Star Draft, and a competitive tournament phase to provide players and coaches with measurable and comparable performance data.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-y-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="font-evogria flex flex-col gap-y-[7px]">
                <h3 className="text-base lg:text-lg">VENUE: University of Ghana Training Pitch </h3>
                  <h2 className="text-xl lg:text-xl text-gray-500">
                    July–August 2026 | Ages 16–21
                  </h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  href="https://forms.gle/BtbwKGtHmJtNgMK78 " target="_blank"
                  scroll={false}
                >
                  <Button className="w-full lg:w-fit bg-transparent border-2 border-primary text-primary">
                  Register Now
                  </Button>
                </Link>
                <Link href="#inquiry">
                  <Button className="w-full lg:w-fit">Make Enquiry</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AnimationsWrapper>
    </div>
  );
}

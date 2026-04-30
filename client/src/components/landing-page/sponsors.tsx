import React from "react";
import AA_LOGO from "../common/AA-LOGO";
import { LOGO } from "@/lib/constant";
import AnimationsWrapper from "../animations/animations-wrapper";

export default function Sponsors() {
  return (
    <div className="bg-white px-[25px] lg:px-20 py-10 lg:py-32 flex flex-col gap-y-10 md:flex-row md:items-center gap-x-10">
      <AnimationsWrapper variant="slideInLeft" scrollTrigger>
        <h1 className="text-3xl lg:text-[42px] font-evogria text-center md:text-left max-w-[616px] md:leading-[3.5rem]">
          TOGETHER, WE INSPIRE AND ELEVATE THE NEXT <br /> GENERATION OF
          ATHLETES
        </h1>
      </AnimationsWrapper>

      <div className="w-full md:w-2/3 flex justify-center">
        <div className="w-fit grid grid-cols-2 justify-center items-center place-items-center gap-6">
          <AnimationsWrapper variant="listAnimationY" scrollTrigger isList>
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="min-w-[168px] max-w-[224px] h-[144px] flex items-center justify-center border border-gray-300 rounded-lg"
              >
                <AA_LOGO logo={LOGO.PRIMARY} className="w-full h-[62px]" />
              </div>
            ))}
          </AnimationsWrapper>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import InquiryForm from "./inquiry-form";
import AnimationsWrapper from "../animations/animations-wrapper";

export default function Inquiry() {
  return (
    <div
      id="inquiry"
      className="flex flex-col gap-y-4  items-center md:flex-row md:gap-x-10 md:justify-between md:items-center bg-inquiry-bg bg-cover bg-center bg-no-repeat px-[25px] lg:px-20 py-10 lg:py-32 text-white"
    >
      <AnimationsWrapper variant="slideUp" scrollTrigger>
        <div className="flex flex-col  gap-y-2 lg:gap-y-5">
          <h1 className="text-[42px] md:text-[92px] lg:text-[102px] font-evogria">
            THE <br />
            ATHLETIC <br className="hidden lg:block" /> AGENCY
          </h1>
          <p className="font-inter text-base md:text-2xl">
            Inspire and elevate the next generation of athletes
          </p>
        </div>
      </AnimationsWrapper>
      <AnimationsWrapper className="w-full flex justify-center md:justify-end"  variant="slideUp" scrollTrigger>
        <InquiryForm />
      </AnimationsWrapper>
    </div>
  );
}

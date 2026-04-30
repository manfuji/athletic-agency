import React from "react";
import AnimationsWrapper from "../animations/animations-wrapper";

const steps = [
  {
    title: "Open Registration",
    description: "Players complete the official registration form.",
  },
  {
    title: "Elite Evaluation Sessions",
    description:
      "Players participate in drills, small-sided games, and match scenarios.",
  },
  {
    title: "Draft Day",
    description:
      "Top players are drafted into balanced teams. (GHS100 fee to secure position)",
  },
  {
    title: "Game Day",
    description: "Drafted teams compete in the Summer Series tournament.",
  },
];

export default function HowSummerWorks() {
  return (
    <section className="bg-white px-[25px] lg:px-20 py-12 lg:py-20">
      <div className="max-w-6xl mx-auto flex flex-col gap-y-10">

        <AnimationsWrapper variant="slideDown" scrollTrigger>
          <h2 className="text-center text-[32px] md:text-[40px] lg:text-[48px] font-evogria text-[#101828]">
            HOW THE SUMMER SERIES WORKS
          </h2>
        </AnimationsWrapper>

        <AnimationsWrapper variant="slideUp" scrollTrigger>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="flex flex-col gap-y-3 bg-[#302464] text-white rounded-2xl px-6 py-6 shadow-md"
              >
                <div className="flex items-center gap-x-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0F58B0] font-evogria text-sm">
                    {index + 1}
                  </span>

                  <h3 className="font-evogria text-lg md:text-xl leading-snug">
                    {step.title}
                  </h3>
                </div>

                <p className="font-inter text-sm md:text-base text-[#E5F0FF]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </AnimationsWrapper>

      </div>
    </section>
  );
}
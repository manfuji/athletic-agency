import React from "react";
import AnimationsWrapper from "../animations/animations-wrapper";

const reasons = [
  "GPS Physical Performance Tracking",
  "Advanced Match Statistics",
  "Video Performance Analysis",
  "Individual Performance Awards",
  "Exposure to Professional and Academic Scouting Networks",
  "Structured Player Evaluation",
];

export default function WhyPlayersShouldJoin() {
  return (
    <section className="bg-primary px-[25px] lg:px-20 py-12 lg:py-20">
      <div className="max-w-5xl mx-auto flex flex-col gap-y-8">
        <AnimationsWrapper variant="slideDown" scrollTrigger>
          <h2 className="text-center text-[32px] md:text-[40px] lg:text-[48px] font-evogria text-white">
            WHY PLAYERS SHOULD JOIN
          </h2>
        </AnimationsWrapper>

        <AnimationsWrapper
          variant="slideUp"
          scrollTrigger
          className="bg-[#22174F] rounded-2xl px-6 md:px-10 py-8 shadow-lg"
        >
          <ul className="space-y-3 md:space-y-4">
            {reasons.map((reason) => (
              <li
                key={reason}
                className="flex items-start gap-x-3 font-inter text-sm md:text-base text-white"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-[#FBBF24]" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </AnimationsWrapper>
      </div>
    </section>
  );
}


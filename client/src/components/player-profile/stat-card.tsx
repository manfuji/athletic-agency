import React from "react";

export default function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="w-[200px] h-[120px] mx-auto flex flex-col gap-y-2 font-evogria uppercase bg-white border border-gray-300 rounded-lg text-center py-6 px-6 md:py-[34px] justify-center items-center">
      <h3 className="text-xl md:text-2xl">{value}</h3>
      <h6 className="text-sm md:text-base text-gray-600">{title}</h6>
    </div>
  );
}

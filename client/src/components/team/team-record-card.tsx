import { getStatColor } from "@/lib/utils";

export default function TeamRecordCard({data}:{data: Stat}) {
  const color = getStatColor(data.label);
  return (
    <div style={{backgroundColor: color}} className="px-2 sm:px-5 md:px-7 py-2 sm:py-5 md:py-7 font-evogria space-y-1 sm:space-y-2.5 md:space-y-4 uppercase text-center rounded-[7.31px] text-white">
      <h1 className="text-2xl sm:text-3xl md:text-[44px]">{data.value}</h1>
      <h3 className="text-lg sm:text-xl md:text-[22px]">{data.label}</h3>
    </div>
  );
}

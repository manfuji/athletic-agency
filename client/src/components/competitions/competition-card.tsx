import Image from "next/image";
import Button from "../common/Button";
import {
  formatDateRangeWithOrdinal,
  getCompetitionStatusInfo,
  getImage,
} from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function CompetitionCard({
  competition,
  slug,
}: {
  competition: Competition;
  slug: string;
}) {
  const { colors, label } = getCompetitionStatusInfo(competition?.status);
  return (
    <div className="bg-white px-[14px] py-6 rounded-2xl flex flex-col md:flex-row md:gap-x-6 lg:items-stretch gap-y-4">
      {competition?.banner && (
        <Image
          src={getImage(
            competition?.banner as string,
            "/images/BANNER_PLACEHOLDER.png"
          )}
          alt="hero-image"
          width={1000}
          height={1000}
          priority
          quality={100}
          className="w-full object-cover md:max-w-[390px] max-h-[305.5px] lg:h-[305.5px] rounded-lg "
        />
      )}

      <div className="flex flex-col gap-y-5 lg:justify-between w-full">
        <div className="flex flex-col gap-y-[10px]">
          <div className="flex gap-x-[13px] font-inter font-semibold">
            <p
              className="px-3 py-[2px] text-sm sm:text-base rounded-2xl"
              style={{
                backgroundColor: colors.backgroundColor,
                color: colors.textColor,
              }}
            >
              {label}
            </p>
          </div>
          <div className="flex flex-col gap-y-3">
            <h3 className="text-2xl lg:text-4xl font-evogria">
              {competition?.title}
            </h3>
            <div className="font-inter text-base font-medium">
              <p>{competition?.description || "No description available."}</p>
            </div>
          </div>
        </div>
        <div
          className={`flex flex-col gap-y-6 ${competition?.banner ? "b1400:flex-row b1400:items-end" : "lg:flex-row lg:items-end"}  lg:justify-between`}
        >
          <div className="font-evogria flex flex-col gap-y-[7px]">
            <h3 className="text-base lg:text-2xl">
              VENUE: {competition?.location}
            </h3>
            <h2 className="text-xl lg:text-3xl text-gray-500">
              {formatDateRangeWithOrdinal(
                competition?.start_date,
                competition?.end_date
              )}
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            {competition?.ticket_url ? (
              <Link href={competition.ticket_url} target="_blank">
                <Button className="w-full lg:w-fit flex justify-center gap-x-4 bg-transparent border-2 border-primary text-primary">
                  Buy Ticket
                  <ArrowUpRight />
                </Button>
              </Link>
            ) : null}
            {competition?.slug ? (
              <Link
                href={`/competitions/${slug}/competition/${competition.slug}`}
                scroll={false}
              >
                <Button className="w-full lg:w-fit">View Details</Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

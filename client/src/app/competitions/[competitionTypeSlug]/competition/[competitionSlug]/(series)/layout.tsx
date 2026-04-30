import ScrollToTop from "@/components/common/scroll-restoration";
import LeagueTabs from "@/components/competitions/league-tabs";
import NewsPreview from "@/components/competitions/news-preview";
import StatsLeaders from "@/components/competitions/stats-leaders";
import Loading from "@/components/competitions/stats-leaders-skeleton";
import { Suspense } from "react";

export default async function CompetitionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ competitionTypeSlug: string; competitionSlug: string }>;
}) {
  const { competitionTypeSlug, competitionSlug } = await params;
  return (
    <>
      <ScrollToTop />
      <main className="h-full w-full bg-[#F2F4F7]">
        <NewsPreview
          competitionTypeSlug={competitionTypeSlug}
          competitionSlug={competitionSlug}
        />
        <div className="px-[14px] lg:px-20 py-28">
          <div className="flex flex-col 2xl:flex-row-reverse gap-y-14 gap-x-6">
            <Suspense fallback={<Loading />}>
              <StatsLeaders />
            </Suspense>

            <div className="w-full">
              <div className="space-y-10">
                <LeagueTabs
                  competitionTypeSlug={competitionTypeSlug}
                  competitionSlug={competitionSlug}
                />
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

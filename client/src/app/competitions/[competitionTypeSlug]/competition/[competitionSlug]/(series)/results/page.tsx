export const dynamic = "force-dynamic";

import { getFixturesResults } from "@/actions/competition";
import AnimationsWrapper from "@/components/animations/animations-wrapper";
import EmptyState from "@/components/common/empty-state";
import GameCard from "@/components/competitions/game-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DayDate } from "@/lib/utils";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ competitionSlug: string }>;
}) {
  const { competitionSlug } = await params;
  const { data } = await getFixturesResults(competitionSlug);
  return (
    <div className="w-full flex flex-col gap-y-10">
      {data?.map((resultList, i) => (
        <div className="w-full" key={i}>
          <Accordion
            type="single"
            collapsible
            className="w-full max-w-[1187px] mx-auto"
            defaultValue="item-1"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="hover:no-underline font-evogria text-sm md:text-lg bg-primary text-white px-5 rounded-t-[8px]">
                <AnimationsWrapper variant="slideInLeft">
                  {DayDate(resultList?.date)}
                </AnimationsWrapper>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-10 bg-white px-2 md:px-5 py-5 border-t-0 border-r border-b border-l border-gray-300">
                <AnimationsWrapper variant="listAnimationY" isList>
                  {resultList?.matches?.map((result, i) => (
                    <GameCard key={i} data={result} />
                  ))}
                </AnimationsWrapper>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
      {data?.length === 0 && <EmptyState message="No results available yet." />}
    </div>
  );
}

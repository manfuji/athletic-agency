import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full flex flex-col gap-y-10">
      {[...Array(3)].map((_, i) => (
        <div className="w-full" key={i}>
          <Accordion
            type="single"
            collapsible={false}
            className="w-full max-w-[1187px] mx-auto"
            defaultValue="item-1"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="bg-primary px-5 rounded-t-[8px]">
                <Skeleton className="w-1/2 sm:w-[25%] h-5 rounded-2xl" />
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-10 bg-white px-2 md:px-5 py-5 rounded-b-[8px] border-t-0 border-r border-b border-l border-gray-300">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-full max-w-[715px] mx-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-x-2">
                        <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full" />
                        <Skeleton className="w-20 sm:w-36 h-3 md:h-4 rounded-2xl" />
                      </div>
                      <Skeleton className="w-[60px] max-w-[90px] rounded-[12px] h-[22px] md:h-[34px]" />
                      <div className="flex items-center gap-x-2">
                        <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full" />
                        <Skeleton className="w-20 sm:w-36 h-3 md:h-4 rounded-2xl" />
                      </div>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  );
}

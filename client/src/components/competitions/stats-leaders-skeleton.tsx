import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import LeadershipBoard from "../team/skeleton";
import { Skeleton } from "../ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full 2xl:max-w-[472px]">
      <Accordion
        type="single"
        collapsible={false}
        className="w-full"
        defaultValue="item-1"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="hover:no-underline bg-white px-5 rounded-t-[8px]">
            <Skeleton className="w-[30%] h-12" />
          </AccordionTrigger>
          <AccordionContent className="bg-white px-5 py-5 rounded-b-[8px]">
          <Skeleton className="w-full h-7" />
            <LeadershipBoard />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

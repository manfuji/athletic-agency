import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import LeadershipBoard from "../team/leadership-board";

export default async function StatsLeaders() {
  return (
    <div className="w-full 2xl:max-w-[472px]">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="uppercase font-evogria text-lg sm:text-xl md:text-2xl hover:no-underline bg-white px-5 rounded-t-[8px]">
            stats leaders
          </AccordionTrigger>
          <AccordionContent className="bg-white px-5 py-5 rounded-b-[8px]">
            <LeadershipBoard />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

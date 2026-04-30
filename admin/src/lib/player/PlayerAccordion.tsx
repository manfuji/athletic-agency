import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface AccordionItemData {
  value: string;
  title: string;
  content: React.ReactNode;
}

interface PlayerAccordionProps {
  items: AccordionItemData[];
}

export function PlayerAccordion({ items }: PlayerAccordionProps) {
  return (
    <Accordion type="single" collapsible className="mt-12">
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value} className="mb-6">
          <AccordionTrigger className="bg-[#302464] text-white px-8 rounded-t-lg font-evogria text-[18px]">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="bg-white text-[#1D2939] font-inter p-6 text-[15px]">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

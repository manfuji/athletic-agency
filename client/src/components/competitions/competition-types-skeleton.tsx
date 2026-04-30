import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent, SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function Loading() {
  return (
    <Select>
      <SelectTrigger className="w-auto text-base border-none outline-none focus:outline-none focus:ring-0 focus:ring-offset-0">
        <SelectValue placeholder="Competitions" />
      </SelectTrigger>
      <SelectContent>
        <div className="flex flex-col gap-y-2 py-2 px-1">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className=" w-full h-8 px-2 py-1 rounded-md" />
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

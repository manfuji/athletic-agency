import { cn } from "@/lib/utils";

export default function EmptyState({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-evogria w-full bg-white shadow-md border border-[#e9e9e9] rounded-lg px-2 py-12 text-xl text-primary text-center",
        className
      )}
    >
      {message}
    </div>
  );
}

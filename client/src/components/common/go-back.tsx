import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GoBack({ path }: { path: string }) {
  return (
    <Link
      href={path}
      prefetch
      className="text-lg flex items-center gap-x-2 font-inter w-fit mb-11 font-semibold"
    >
      <ArrowLeft />
      <p>Go back</p>
    </Link>
  );
}

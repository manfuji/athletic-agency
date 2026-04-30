import { cn } from "@/lib/utils";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import React from "react";

const AA_LOGO = ({
  logo,
  className,
}: {
  logo: StaticImageData;
  className?: string;
}) => {
  return (
    <Link href="/" className="flex justify-center items-center w-fit">
      <Image
        src={logo}
        alt="logo"
        width={500}
        height={500}
        priority
        quality={100}
        className={cn(
          "w-[110px] h-[40px]  sm:w-[168px] sm:h-[62px] object-contain",
          className
        )}
      />
    </Link>
  );
};

export default AA_LOGO;

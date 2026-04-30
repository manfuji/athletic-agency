"use client";

import { navLinks } from "@/lib/loops";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const path = usePathname();
  return (
    <>
      {navLinks.map((nav, i) => (
        <Link
          key={i}
          href={nav.path}
          className={`${path === nav.path && "lg:text-primary"}`}
        >
          {nav.title}
        </Link>
      ))}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavGroups } from "./adminNavConfig";

function titleFromPath(path: string) {
  const direct = adminNavGroups
    .flatMap((g) => g.items)
    .find((i) => i.path === path);
  return direct?.name ?? null;
}

export default function AdminBreadcrumbs() {
  const pathname = usePathname();

  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { name: string; href: string }[] = [];
  let href = "";
  for (const p of parts) {
    href += `/${p}`;
    if (href === "/admin") {
      crumbs.push({ name: "Admin", href });
      continue;
    }
    const name = titleFromPath(href) ?? p.replace(/-/g, " ");
    crumbs.push({ name, href });
  }

  if (!crumbs.length) return null;

  return (
    <nav className="text-xs text-[#667085] font-inter">
      <ol className="flex items-center gap-2 flex-wrap">
        {crumbs.map((c, idx) => (
          <li key={c.href} className="flex items-center gap-2">
            {idx === crumbs.length - 1 ? (
              <span className="text-[#101828] font-medium">{c.name}</span>
            ) : (
              <Link href={c.href} className="hover:underline">
                {c.name}
              </Link>
            )}
            {idx !== crumbs.length - 1 && <span className="text-[#D0D5DD]">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}


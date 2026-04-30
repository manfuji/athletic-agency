"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { adminNavGroups } from "./adminNavConfig";
import AdminBreadcrumbs from "./AdminBreadcrumbs";

function isPathActive(pathname: string, itemPath: string) {
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export default function AdminTopNav() {
  const pathname = usePathname();
  const activeGroup = useMemo(() => {
    return (
      adminNavGroups.find((g) => g.items.some((it) => isPathActive(pathname, it.path))) ??
      adminNavGroups[0]
    );
  }, [pathname]);

  const [selected, setSelected] = useState(activeGroup.value);

  const group = useMemo(() => {
    return adminNavGroups.find((g) => g.value === selected) ?? activeGroup;
  }, [activeGroup, selected]);

  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-[#EAECF0]">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="text-[14px] font-evogria text-[#101828]">Admin</div>
            <AdminBreadcrumbs />
          </div>
          <Link
            href="/admin"
            className="text-xs font-inter text-[#475467] hover:underline"
          >
            Overview
          </Link>
        </div>
      </div>

      <div className="px-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {adminNavGroups.map((g) => {
            const isActive = g.value === group.value;
            return (
              <button
                key={g.value}
                onClick={() => setSelected(g.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-inter whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-[#302464] text-white"
                    : "bg-white hover:bg-gray-50 text-[#344054] border border-[#EAECF0]"
                )}
              >
                <span className={cn(isActive ? "text-white" : "text-[#667085]")}>
                  {g.icon}
                </span>
                {g.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {group.items.map((it) => {
            const active = isPathActive(pathname, it.path);
            return (
              <Link
                key={it.path}
                href={it.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-inter whitespace-nowrap transition-colors",
                  active
                    ? "bg-gray-100 text-[#101828] font-semibold"
                    : "hover:bg-gray-50 text-[#475467]"
                )}
              >
                <span className="text-[#98A2B3]">{it.icon}</span>
                {it.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}


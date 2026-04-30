import Link from "next/link";
import { adminNavGroups } from "@/components/navigation/adminNavConfig";

export const dynamic = "force-dynamic";

export default function AdminOverviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-evogria text-[#101828] text-[24px] font-normal">
          Admin
        </h1>
        <p className="font-inter text-[14px] text-[#475467]">
          Choose an area to manage. All sensitive actions are admin-only and audited where applicable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {adminNavGroups.map((g) => (
          <div
            key={g.value}
            className="rounded-xl border border-[#EAECF0] bg-white p-4"
          >
            <div className="flex items-center gap-2">
              <div className="text-[#667085]">{g.icon}</div>
              <div className="font-inter font-semibold text-[#101828]">
                {g.name}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {g.items.slice(0, 6).map((it) => (
                <Link
                  key={it.path}
                  href={it.path}
                  className="px-3 py-2 rounded-lg text-sm font-inter border border-[#EAECF0] hover:bg-gray-50 text-[#344054]"
                >
                  {it.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


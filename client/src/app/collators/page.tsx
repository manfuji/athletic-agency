import Link from "next/link";
import { redirect } from "next/navigation";

export default function CollatorsRedirectPage() {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
  if (adminUrl) {
    redirect(`${adminUrl.replace(/\/$/, "")}/collators`);
  }

  const fallback =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3001/collators"
      : "/";

  return (
    <main className="px-[18px] lg:px-20 py-10 font-inter">
      <h1 className="font-evogria text-2xl mb-2">Collators</h1>
      <p className="text-sm text-muted-foreground">
        This page belongs to the Admin dashboard. You’re likely on the public
        site.
      </p>
      <div className="mt-6">
        <Link
          href={fallback}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-white"
        >
          Go to Admin Collators
        </Link>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Tip: set <code>NEXT_PUBLIC_ADMIN_URL</code> in <code>client/.env.local</code>{" "}
        to automatically redirect here.
      </p>
    </main>
  );
}


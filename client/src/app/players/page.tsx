import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PlayersPage() {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, "");

  return (
    <main className="px-[18px] lg:px-20 py-10 font-inter">
      <h1 className="font-evogria text-2xl mb-2">Players</h1>
      <p className="text-sm text-muted-foreground">
        Player profiles and listings for the public site will live here.
      </p>

      {adminUrl ? (
        <div className="mt-6">
          <Link
            href={`${adminUrl}/players`}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-white"
          >
            Go to Admin Players
          </Link>
        </div>
      ) : null}
    </main>
  );
}

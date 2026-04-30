import { fetchFootPreferences } from "@/actions/foot-preferences";
import FootPreferencesTable from "@/components/reference/FootPreferencesTable";

export const dynamic = "force-dynamic";

export default async function FootPreferencesPage() {
  const rows = await fetchFootPreferences();
  return (
    <div className="w-[100%] 2xl:w-[60%] px-4 py-6 ml-0 mr-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Foot Preferences
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Manage preferred foot reference data.
      </p>
      <div className="mt-6">
        <FootPreferencesTable initialRows={rows} />
      </div>
    </div>
  );
}


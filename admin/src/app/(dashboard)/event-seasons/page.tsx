import { fetchEventSeasons } from "@/actions/event-seasons";
import EventSeasonsTable from "@/components/reference/EventSeasonsTable";

export const dynamic = "force-dynamic";

export default async function EventSeasonsPage() {
  const seasons = await fetchEventSeasons();
  return (
    <div className="w-[100%] 2xl:w-[75%] px-4 py-6 ml-0 mr-auto">
      <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
        Event Seasons
      </h1>
      <p className="font-inter text-[16px] text-[#475467] font-normal">
        Manage seasons used by legacy imports and event operations.
      </p>
      <div className="mt-6">
        <EventSeasonsTable initialSeasons={seasons} />
      </div>
    </div>
  );
}


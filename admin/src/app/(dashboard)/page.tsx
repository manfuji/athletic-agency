export const dynamic = "force-dynamic";
import Competitions from "@/components/competitions/Competitions";
import {
  getCompetitions,
  getCompetitionCategories,
} from "@/actions/competitions";

export default async function Home() {
  try {
    const [competitions, categories] = await Promise.all([
      getCompetitions(),
      getCompetitionCategories(),
    ]);

    return (
      <div className="w-[98%] px-4 py-6 mx-auto">
        {competitions && categories && (
          <Competitions
            initialCompetitions={competitions}
            categories={categories}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="w-[98%] px-4 py-6 mx-auto">
        <h1 className="font-evogria text-[#1D2939] text-[25px] font-normal">
          Competitions
        </h1>
        <p className="font-inter text-[16px] text-[#475467] font-normal">
          Create and manage tournaments easily.
        </p>
        <div className="mt-6 text-center p-6 bg-gray-100 border border-gray-300 rounded-lg">
          <p className="text-lg text-gray-600 font-semibold font-inter">
            Unable to load competitions at this time.
          </p>
          <p className="text-[14px] text-gray-500 mt-2 font-inter">
            Please check your connection or try again later.
          </p>
        </div>
      </div>
    );
  }
}

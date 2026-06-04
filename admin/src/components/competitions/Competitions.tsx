"use client";

import { useState } from "react";
import { useSession } from "@/providers/supabase-auth";
import CompetitionHeader from "./CompetitionHeader";
import CompetitionCard from "./CompetitionCard";
import CompetitionCardSkeleton from "./CompetitionCardSkeleton";
import { getCompetitions } from "@/actions/competitions";
import { useQuery } from "@tanstack/react-query";

interface Competition {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  banner?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  isPublished?: number;
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id: string;
  name: string;
}

interface CompetitionsProps {
  initialCompetitions: Competition[];
  categories: Category[];
}

export default function Competitions({
  initialCompetitions,
  categories,
}: CompetitionsProps) {
  const { data: competitions, isLoading: isCompetitionsLoading } = useQuery({
    queryKey: ["competitions"],
    queryFn: getCompetitions,
    initialData: initialCompetitions,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [, setHasSearched] = useState<boolean>(false);
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const getFilterMessage = (status: string) => {
    const messages = {
      Draft: "There are currently no competitions in Draft.",
      Published: "There are currently no published competitions.",
      Started: "There are currently no started competitions.",
      Ended: "There are currently no ended competitions.",
    };
    return (
      messages[status as keyof typeof messages] || "No competitions found."
    );
  };

  const filteredCompetitions = competitions ? competitions?.filter((comp: Competition) => {
    const matchesSearch = comp.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (filterStatus === "All") return matchesSearch;

    const lowerFilterStatus = filterStatus.toLowerCase();
    const compStatus = comp.status.toLowerCase();
    const isPublished = comp.isPublished === 1;

    if (lowerFilterStatus === "published") {
      return matchesSearch && isPublished;
    } else if (lowerFilterStatus === "draft") {
      return matchesSearch && compStatus === "draft";
    } else if (lowerFilterStatus === "started") {
      return matchesSearch && compStatus === "started";
    } else if (lowerFilterStatus === "ended") {
      return matchesSearch && compStatus === "ended";
    }

    return matchesSearch;
  }) : [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setHasSearched(true);
  };

  return (
    <div>
      <CompetitionHeader
        setSearchQuery={handleSearch}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />
      <div className="mt-6">
        {isCompetitionsLoading ? (
          <>
            <CompetitionCardSkeleton />
            <CompetitionCardSkeleton />
            <CompetitionCardSkeleton />
          </>
        ) : (competitions ?? []).length === 0 ? (
          <div className="bg-white w-[80%] mx-auto ml-0 text-center rounded-lg shadow-md border border-[#e9e9e9] p-12 mt-4">
            <p className="text-lg text-gray-600 font-semibold font-evogria">
              {userRole === "collator"
                ? "You have no competitions assigned yet."
                : "No competitions available at the moment."}
            </p>
            {userRole !== "collator" && (
              <p className="text-[14px] text-gray-500 mt-2 font-evogria">
                Please check back later or create one.
              </p>
            )}
          </div>
        ) : filteredCompetitions.length > 0 ? (
          filteredCompetitions.map((comp: Competition) => (
            <CompetitionCard
              key={comp.id}
              comp={comp}
              categories={categories}
            />
          ))
        ) : (
          <div className="text-center p-16 bg-white border border-gray-300 rounded-lg mt-6">
            <p className="text-lg font-semibold text-gray-600 font-inter">
              {filterStatus === "All"
                ? `No competitions found matching "${searchQuery}".`
                : getFilterMessage(filterStatus)}
            </p>
            {filterStatus === "All" && (
              <p className="text-sm text-gray-500 mt-2 font-inter">
                Try searching with different keywords or check back later.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import Image from "next/image";
import { Fixture, Team, MinimalTeam } from "@/types/fixtures";
import { getImageUrl } from "@/lib/api";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import DeleteFixtureModal from "./delete-fixture-modal";
import { deleteFixture } from "@/actions/fixtures";
import { toast } from "sonner";
import { queryClient } from "@/providers/query-provider";
interface MatchCardProps {
  match: Fixture;
}

const isFullTeam = (team: Team | MinimalTeam): team is Team => "logo" in team;

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async (fixtureId: string) => {
    const res = await deleteFixture(fixtureId);
    if ("error" in res) {
      toast.error(res.error);
      setIsDeleteModalOpen(false);
      return
    } else {
      toast.success("Fixture deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["fixtures"] });
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="py-4 flex justify-between gap-16 items-center">
      <div className="flex justify-center items-center gap-4">
        {isFullTeam(match.home_team) && match.home_team.logo ? (
          <Image
            src={getImageUrl(match.home_team.logo) || "/TeamLogo.png"}
            alt={`${match.home_team.name} logo`}
            width={50}
            height={50}
            className="object-contain"
          />
        ) : (
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
        )}
        <span className="font-evogria text-[20px]">{match.home_team.name}</span>
      </div>
      <span className="font-evogria text-[17px] text-gray-400">
        {match.time.slice(0, 5) + " GMT"}
      </span>
      <div className="flex justify-center items-center gap-4">
        {isFullTeam(match.away_team) && match.away_team.logo ? (
          <Image
            src={getImageUrl(match.away_team.logo) || "/TeamLogo.png"}
            alt={`${match.away_team.name} logo`}
            width={50}
            height={50}
            className="object-contain"
          />
        ) : (
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
        )}
        <span className="font-evogria text-[20px]">{match.away_team.name}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsDeleteModalOpen(true)}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
      <DeleteFixtureModal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        fixtureId={match.id}
        onDelete={handleDelete}
      />
    </div>
  );
};

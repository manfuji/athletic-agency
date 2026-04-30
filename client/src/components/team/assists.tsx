import AnimationsWrapper from "../animations/animations-wrapper";
import EmptyState from "../common/empty-state";
import PlayerRankCard from "./player-rank-card";

export default function Assists({ assists }: { assists: AssistStats[] }) {
  return (
    <div className="font-inter mt-4">
      <p className="text-right text-xs sm:text-base 2xl:text-sm text-gray-500">
        Number of assists
      </p>
      <div>
        <AnimationsWrapper variant="listAnimationX" scrollTrigger isList>
          {assists.map((person, i) => (
            <PlayerRankCard key={i} number={i} person={person} />
          ))}
          {assists?.length === 0 && (
            <EmptyState
              className="shadow-none border-0"
              message="No assist statistics available at the moment."
            />
          )}
        </AnimationsWrapper>
      </div>
    </div>
  );
}

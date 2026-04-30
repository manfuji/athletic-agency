import AnimationsWrapper from "../animations/animations-wrapper";
import EmptyState from "../common/empty-state";
import PlayerRankCard from "./player-rank-card";

export default function RedCards({ redCards }: { redCards: RedCardStats[] }) {
  return (
    <div className="font-inter mt-4">
      <p className="text-right text-xs sm:text-base 2xl:text-sm text-gray-500">
        Number of red cards
      </p>
      <div>
        <AnimationsWrapper variant="listAnimationX" scrollTrigger isList>
          {redCards.map((person, i) => (
            <PlayerRankCard key={i} number={i} person={person} />
          ))}
          {redCards?.length === 0 && (
            <EmptyState
              className="shadow-none border-0"
              message="No red card statistics available at the moment."
            />
          )}
        </AnimationsWrapper>
      </div>
    </div>
  );
}

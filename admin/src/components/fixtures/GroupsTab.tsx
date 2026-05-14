'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGroups } from '@/hooks/useGroups';
import CustomButton from '@/reusables/CustomButton';
import { GroupCard } from './GroupCard';
import { InlineReferenceCreate } from '@/components/reference/InlineReferenceCreate';
import { createStage } from '@/actions/stages';

interface GroupsTabProps {
  competitionId: string;
}

export default function GroupsTab({ competitionId }: GroupsTabProps) {
  const {
    groups,
    knockoutGames,
    teams,
    stages,
    isStagesLoading,
    isLoading,
    isSaving,
    isAddingGroup,
    isAddingKnockoutGame,
    addGroup,
    updateGroupTitle,
    addGroupTeam,
    updateGroupTeam,
    removeGroupTeam,
    deleteGroup,
    addKnockoutGame,
    updateKnockoutTitle,
    addKnockoutTeam,
    updateKnockoutTeam,
    removeKnockoutTeam,
    deleteKnockoutGame,
    getAvailableTeamsForGroup,
    getAvailableTeamsForKnockout,
    saveFixtures,
  } = useGroups(competitionId);

  const handleSaveFixtures = async () => {
    try {
      await saveFixtures();
      window.dispatchEvent(
        new CustomEvent('setupUpdated', { detail: { competitionId } })
      );
    } catch (error) {
      console.error('SaveFixtures failed:', error);
    }
  };

  const accordionItems = [
    {
      value: 'group-stage',
      title: 'Group Stage',
      content: (
        <div className="flex flex-wrap gap-6">
          {groups && groups.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id}
              title={group.title}
              teams={group.teams}
              maxTeams={4}
              availableTeams={getAvailableTeamsForGroup()}
              allTeams={teams}
              updateTitle={updateGroupTitle}
              addTeam={addGroupTeam}
              updateTeam={updateGroupTeam}
              removeTeam={removeGroupTeam}
              deleteCard={deleteGroup}
              isSaved={group.isSaved} // Pass isSaved
            />
          ))}
          <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 w-64 flex flex-col items-center justify-center flex-shrink-0 h-[160px]">
            <Plus className="w-20 h-20 text-gray-400 mb-2" />
            <Button
              onClick={addGroup}
              disabled={
                isLoading ||
                isSaving ||
                isAddingGroup ||
                (!isStagesLoading && stages.length === 0)
              }
              isLoading={isAddingGroup}
              loadingText="Adding..."
              className="bg-white text-[#344054] border px-4 py-2 font-evogria rounded-lg font-[14px]"
            >
              Add Group
            </Button>
          </div>
        </div>
      ),
    },
    {
      value: 'knockout-stage',
      title: 'Knockout Stage',
      content: (
        <div className="flex flex-wrap gap-6">
          {knockoutGames && knockoutGames.map((game) => (
            <GroupCard
              key={game.id}
              id={game.id}
              title={game.title}
              teams={game.teams}
              maxTeams={2}
              availableTeams={getAvailableTeamsForKnockout()}
              allTeams={teams}
              updateTitle={updateKnockoutTitle}
              addTeam={addKnockoutTeam}
              updateTeam={updateKnockoutTeam}
              removeTeam={removeKnockoutTeam}
              deleteCard={deleteKnockoutGame}
              isSaved={game.isSaved}
            />
          ))}
          <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 w-64 flex flex-col items-center justify-center flex-shrink-0 h-[160px]">
            <Plus className="w-20 h-20 text-gray-400 mb-2" />
            <Button
              onClick={addKnockoutGame}
              disabled={
                isLoading ||
                isSaving ||
                isAddingKnockoutGame ||
                (!isStagesLoading && stages.length === 0)
              }
              isLoading={isAddingKnockoutGame}
              loadingText="Adding..."
              className="bg-white text-[#344054] border px-4 py-2 font-evogria rounded-lg font-[14px]"
            >
              Add Knockout Stage
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div />
        <CustomButton
          text="Save Progress"
          bgColor="bg-[#302464]"
          color="text-white"
          className="hover:bg-[#332579] px-6 py-2 rounded-md"
          onClick={handleSaveFixtures}
          isLoading={isSaving}
          disabled={isLoading || isSaving}
        />
      </div>
      {!isStagesLoading && stages.length === 0 ? (
        <InlineReferenceCreate
          title="No match stages yet"
          helpText="Create at least one stage (for example Group stage or Knockout) before adding groups. You can also manage stages under Reference in the sidebar."
          namePlaceholder='e.g. "Group stage"'
          queryKeysToInvalidate={[["stages"]]}
          onSubmit={(payload) => createStage(payload)}
        />
      ) : null}
      {isLoading ? (
        <div className="rounded-lg border border-[#e9e9e9] bg-white p-6 text-sm text-[#667085]">
          Loading groups and teams...
        </div>
      ) : null}
      <Accordion type="single" collapsible className="w-full">
        {accordionItems.map((item) => (
          <AccordionItem key={item.value} value={item.value} className="mb-6">
            <AccordionTrigger className="bg-[#302464] text-white px-8 rounded-t-lg font-evogria text-[18px]">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="bg-white text-[#1D2939] font-inter p-6">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

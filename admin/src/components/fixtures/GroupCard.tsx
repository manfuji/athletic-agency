'use client';

import { Plus, Trash2, X } from 'lucide-react';
import { Team } from '@/types/fixtures';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GroupCardProps {
  id: string;
  title: string;
  teams: ({ id: string; name: string } | null)[];
  maxTeams: number;
  availableTeams: Team[];
  allTeams: Team[];
  updateTitle: (id: string, title: string) => void;
  addTeam: (id: string) => void;
  updateTeam: (id: string, index: number, teamId: string) => void;
  removeTeam: (id: string, index: number) => void;
  deleteCard: (id: string) => void;
  isSaved: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  id,
  title,
  teams,
  maxTeams,
  availableTeams,
  updateTitle,
  addTeam,
  updateTeam,
  removeTeam,
  deleteCard,
  isSaved,
}) => {
  const getContainerHeight = (teamCount: number) => `${140 + 40 * teamCount}px`;

  return (
    <div
      className="border rounded-lg p-4 w-64 flex-shrink-0 text-black"
      style={{ height: getContainerHeight(teams.length) }}
    >
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => updateTitle(id, e.target.value)}
          className="w-full px-2 py-1 border rounded font-inter text-lg text-[#101828]"
        />
        <button
          type="button"
          onClick={() => deleteCard(id)}
          className="p-2 border rounded-md hover:bg-gray-100"
          aria-label="Delete group"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </button>
      </div>
      <div className="teams flex flex-col gap-2">
        {teams.map((team, index) => {
          const selectOptions = team
            ? [team, ...availableTeams.filter((t) => t.id !== team.id)]
            : availableTeams;
          return (
            <div
              key={index}
              className="team flex justify-between items-center gap-2"
            >
              <Select
                value={team?.id || ''}
                onValueChange={(value) => {
                  updateTeam(id, index, value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-40 w-full">
                    {selectOptions.map((optionTeam) => (
                      <SelectItem key={optionTeam.id} value={optionTeam.id}>
                        {optionTeam.name}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <button
                onClick={() => removeTeam(id, index)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          );
        })}
      </div>
      {teams.length < maxTeams && (
        <button
          onClick={() => addTeam(id)}
          className="flex items-center justify-center gap-2 border w-full p-2 rounded-md mt-4 text-[16px] text-black font-inter"
        >
          <Plus className="w-5 h-5" />
          <span className="font-inter">Add another team</span>
        </button>
      )}
      {isSaved && (
        <p className="text-xs text-gray-500 mt-3 font-inter">Saved</p>
      )}
    </div>
  );
};

'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createSubstitution } from '@/actions/results';
import { emitLogUpdate } from '@/lib/eventEmitter';

interface Player {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
}

interface Team {
  id: string;
  name: string;
}

interface SubstitutionTrackerProps {
  players: Player[];
  teams: Team[];
  fixtureId: string;
}

export default function SubstitutionTracker({
  players,
  teams,
  fixtureId,
}: SubstitutionTrackerProps) {
  const [team, setTeam] = useState<string>('');
  const [playerOut, setPlayerOut] = useState<string>('');
  const [playerIn, setPlayerIn] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teamPlayers = players.filter((p) => p.teamId === team);
  const playerInOptions = teamPlayers.filter((p) => p.id !== playerOut);

  const handleSubmit = async () => {
    if (!team || !playerOut || !playerIn) {
      toast.error('Please fill all fields');
      return;
    }
    if (playerOut === playerIn) {
      toast.error('Player In cannot be the same as Player Out');
      return;
    }
    setIsSubmitting(true);
    try {
      await createSubstitution({
        fixture_id: fixtureId,
        player_out_id: playerOut,
        player_in_id: playerIn,
        team_id: team,
      });
      toast.success('Substitution added successfully');
      emitLogUpdate(fixtureId);
      setTeam('');
      setPlayerOut('');
      setPlayerIn('');
    } catch (error) {
      console.error('Error adding substitution:', error);
      toast.error('Failed to add substitution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F2F4F7] p-4 rounded-lg mr-3">
      <h3 className="text-lg font-semibold mb-4 font-evogria">Substitution</h3>
      <div className="space-y-4">
        <Select value={team} onValueChange={setTeam}>
          <SelectTrigger>
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={playerOut} onValueChange={setPlayerOut} disabled={!team}>
          <SelectTrigger>
            <SelectValue placeholder="Select player out" />
          </SelectTrigger>
          <SelectContent>
            {teamPlayers.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={playerIn}
          onValueChange={setPlayerIn}
          disabled={!team || !playerOut}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select player in" />
          </SelectTrigger>
          <SelectContent>
            {playerInOptions.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#302464] hover:bg-[#332579] text-white font-evogria"
        >
          {isSubmitting ? 'Adding...' : 'Add Substitution'}
        </Button>
      </div>
    </div>
  );
}

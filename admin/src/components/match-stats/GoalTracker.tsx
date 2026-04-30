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
import { createGoal } from '@/actions/results';
import { emitLogUpdate } from '@/lib/eventEmitter';

interface Player {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
}

interface GoalTrackerProps {
  players: Player[];
  fixtureId: string;
}

export default function GoalTracker({ players, fixtureId }: GoalTrackerProps) {
  const [scorer, setScorer] = useState<string>('');
  const [goalType, setGoalType] = useState<string>('');
  const [assist, setAssist] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scorerTeamId = players.find((p) => p.id === scorer)?.teamId;
  const assistOptions = players.filter(
    (p) => p.teamId === scorerTeamId && p.id !== scorer
  );

  const handleSubmit = async () => {
    if (!scorer || !goalType) {
      toast.error('Please fill in the scorer and goal type fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createGoal({
        fixture_id: fixtureId,
        scorer_id: scorer,
        assist_player_id: assist || null,
        goal_type: goalType,
      });

      if ("error" in response) {
        toast.error(String(response.error));
        setIsSubmitting(false);
        return;
      }
      toast.success('Goal added successfully');
      emitLogUpdate(fixtureId);
      setScorer('');
      setGoalType('');
      setAssist('');
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F2F4F7] p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 font-evogria">Goal Tracker</h3>
      <div className="space-y-4">
        <Select value={scorer} onValueChange={setScorer}>
          <SelectTrigger>
            <SelectValue placeholder="Select goal scorer" />
          </SelectTrigger>
          <SelectContent>
            {players.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                ({player.teamName}) {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={goalType} onValueChange={setGoalType}>
          <SelectTrigger>
            <SelectValue placeholder="Select goal type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Open play goal">Open play goal</SelectItem>
            <SelectItem value="Free kick">Free kick</SelectItem>
            <SelectItem value="Penalty">Penalty</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assist} onValueChange={setAssist} disabled={!scorer}>
          <SelectTrigger>
            <SelectValue placeholder="Select assist player (optional)" />
          </SelectTrigger>
          <SelectContent>
            {assistOptions.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                ({player.teamName}) {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#302464] hover:bg-[#332579] text-white font-evogria"
        >
          {isSubmitting ? 'Adding...' : 'Add Goal'}
        </Button>
      </div>
    </div>
  );
}

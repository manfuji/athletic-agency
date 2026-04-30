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
import { createCard } from '@/actions/results';
import { emitLogUpdate } from '@/lib/eventEmitter';

interface Player {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
}

interface CardTrackerProps {
  players: Player[];
  fixtureId: string;
}

export default function CardTracker({ players, fixtureId }: CardTrackerProps) {
  const [player, setPlayer] = useState<string>('');
  const [cardType, setCardType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!player || !cardType) {
      toast.error('Please fill all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await createCard({
        fixture_id: fixtureId,
        player_id: player,
        card_type: cardType.toLowerCase(),
      });
      toast.success('Card added successfully');
      emitLogUpdate(fixtureId);
      setPlayer('');
      setCardType('');
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error('Failed to add card');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F2F4F7] p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 font-evogria">Card Tracker</h3>
      <div className="space-y-4">
        <Select value={player} onValueChange={setPlayer}>
          <SelectTrigger>
            <SelectValue placeholder="Select player" />
          </SelectTrigger>
          <SelectContent>
            {players.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                ({player.teamName}) {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={cardType} onValueChange={setCardType}>
          <SelectTrigger>
            <SelectValue placeholder="Select card type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Yellow">Yellow</SelectItem>
            <SelectItem value="Red">Red</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#302464] hover:bg-[#332579] text-white font-evogria"
        >
          {isSubmitting ? 'Adding...' : 'Add Card'}
        </Button>
      </div>
    </div>
  );
}

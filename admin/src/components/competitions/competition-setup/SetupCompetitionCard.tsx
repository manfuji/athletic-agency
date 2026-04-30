'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SetupDetails } from './SetupDetails';
import CompetitionStructure from '../competition-structure/CompetitionStructure';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getCompetitionStructures } from '@/actions/competitions';
import { useQuery } from '@tanstack/react-query';
interface SetupCompetitionCardProps {
  title: string;
  progress: number;
  showCheckmark: boolean;
  onEdit: () => void;
  onStepComplete: (
    step: 'basicDetails' | 'structure' | 'registration' | 'fixtures' | 'start',
    structureId?: string
  ) => Promise<void>;
  stepCompletion: {
    basicDetails: boolean;
    structure: boolean;
    registration: boolean;
    fixtures: boolean;
    start: boolean;
  };
  competition: { id: string; name: string } | null;
  selectedStructure?: string | null;
  competitionStatus: string;
  onCompetitionAction: () => void;
}

const SetupCompetitionCard: React.FC<SetupCompetitionCardProps> = ({
  title,
  progress,
  onEdit,
  onStepComplete,
  stepCompletion,
  competition,
  selectedStructure,
  competitionStatus,
  onCompetitionAction,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formatTitle, setFormatTitle] = useState<string | null>(null);
  const { data: structures } = useQuery({
    queryKey: ['competition-structures'],
    queryFn: getCompetitionStructures,
    enabled: !!selectedStructure,
  });
  const router = useRouter();

  useEffect(() => {
    if (selectedStructure && structures) {
      const fetchStructureName = async () => {
        const structure = structures.find(
          (s: { id: string }) => s.id === selectedStructure
        );
        setFormatTitle(structure?.name || null);
      };
      fetchStructureName();
    }
  }, [selectedStructure, structures]);

  return (
    <>
      <Card className="w-[85%] ml-6 p-4 mt-5 mb-8 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-[#475467] font-inter font-bold text-[18px]">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} />
          <SetupDetails
            title="Basic competition details"
            description="Some basic details about this"
            buttonText="Edit"
            onEdit={onEdit}
            showCheckmark={stepCompletion.basicDetails}
          />
          <SetupDetails
            title="Setup competition structure"
            description="Choose the format (Group stage + knockout, league, etc)"
            buttonText={stepCompletion.structure ? 'Edit' : 'Get Started'}
            onEdit={() => setIsModalOpen(true)}
            showCheckmark={stepCompletion.structure}
            formatTitle={formatTitle}
          />
          <SetupDetails
            title="Register teams & players"
            description="Create teams and players participating in the competition."
            buttonText={stepCompletion.registration ? 'Edit' : 'Get Started'}
            onEdit={() => {
              if (competition?.id) {
                router.push(`/setup-competition/${competition.id}/teams`);
              } else {
                toast.error('Competition ID not available');
              }
            }}
            showCheckmark={stepCompletion.registration}
          />
          {competition && (
            <SetupDetails
              title="Set up competition fixtures"
              description="Create the match fixtures and schedules."
              buttonText={stepCompletion.fixtures ? 'Edit' : 'Get Started'}
              onEdit={() =>
                router.push(`/setup-competition/${competition.id}/fixtures`)
              }
              showCheckmark={stepCompletion.fixtures}
            />
          )}
          <SetupDetails
            title="Start competition"
            description="Launch the competition and track progress in real-time."
            buttonText={
              competitionStatus === 'started'
                ? 'End Challenge'
                : 'Start Challenge'
            }
            onEdit={onCompetitionAction}
            showCheckmark={stepCompletion.start}
          />
        </CardContent>
      </Card>

      <CompetitionStructure
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStepComplete={(structureId) =>
          onStepComplete('structure', structureId)
        }
        competition={competition}
        selectedStructure={selectedStructure}
      />
    </>
  );
};

export default SetupCompetitionCard;

"use client";

import { useState } from "react";
import SetupCompetition, { CompetitionForForm } from "./SetupCompetition";

interface CompetitionSetupWrapperProps {
  competitionId: string;
  initialCompetition?: CompetitionForForm;
  initialStepCompletion?: {
    basicDetails: boolean;
    structure: boolean;
    registration: boolean;
    fixtures: boolean;
    start: boolean;
  };
  initialCompletedSteps?: number;
  initialProgress?: number;
  initialSelectedStructure?: string | null;
  initialCompetitionStatus?: string;
  initialIsPublished?: boolean;
}

export default function CompetitionSetupWrapper({
  competitionId,
  initialCompetition,
  initialStepCompletion,
  initialCompletedSteps,
  initialProgress,
  initialSelectedStructure,
  initialCompetitionStatus,
  initialIsPublished,
}: CompetitionSetupWrapperProps) {
  const [, setSteps] = useState(initialCompletedSteps || 0);

  const handleStepChange = (newSteps: number) => {
    setSteps(newSteps);
  };

  return (
    <SetupCompetition
      competitionId={competitionId}
      onStepChange={handleStepChange}
      initialCompetition={initialCompetition}
      initialStepCompletion={initialStepCompletion}
      initialCompletedSteps={initialCompletedSteps}
      initialProgress={initialProgress}
      initialSelectedStructure={initialSelectedStructure}
      initialCompetitionStatus={initialCompetitionStatus}
      initialIsPublished={initialIsPublished}
    />
  );
}

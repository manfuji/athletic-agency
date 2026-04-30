"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import SetupCompetitionHeader from "./SetupCompetitionHeader";
import SetupCompetitionCard from "./SetupCompetitionCard";
import SetupCompetitionCardSkeleton from "./SetupCompetitionCardSkeleton";
import dynamic from "next/dynamic";
import { toast } from "sonner";

import {
  getCompetitionById,
  updateCompetitionStatus,
  publishCompetition,
  updateCompetitionStructure,
} from "@/actions/competitions";
import { getAllTeamsForCompetition, fetchTeamDetails } from "@/actions/teams";
import { getFixtures } from "@/actions/fixtures";
import { ensureArray } from "@/lib/normalize";

const CreateCompetitionModal = dynamic(() => import("../CreateCompetitions"), {
  ssr: false,
});

export interface CompetitionForForm {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  category: string;
  image: string;
  structureId: string | null;
  location: string;
  competitionType: string;
}

interface SetupCompetitionProps {
  competitionId: string | string[] | undefined;
  onStepChange?: (steps: number) => void;
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

interface CompetitionData {
  competition: CompetitionForForm;
  stepCompletion: {
    basicDetails: boolean;
    structure: boolean;
    registration: boolean;
    fixtures: boolean;
    start: boolean;
  };
  completedSteps: number;
  progress: number;
  selectedStructure: string | null;
  competitionStatus: string;
  isPublished: boolean;
}

export default function SetupCompetition({
  competitionId,
  onStepChange,
  initialCompetition,
  initialStepCompletion,
  initialCompletedSteps,
  initialProgress,
  initialSelectedStructure,
  initialCompetitionStatus,
  initialIsPublished,
}: SetupCompetitionProps) {
  const [selectedCompetition, setSelectedCompetition] =
    useState<CompetitionForForm | null>(initialCompetition || null);
  const [completedSteps, setCompletedSteps] = useState(
    initialCompletedSteps || 1
  );
  const [progress, setProgress] = useState(initialProgress || 20);
  const [stepCompletion, setStepCompletion] = useState(
    initialStepCompletion || {
      basicDetails: true,
      structure: false,
      registration: false,
      fixtures: false,
      start: false,
    }
  );
  const [selectedStructure, setSelectedStructure] = useState<string | null>(
    initialSelectedStructure || null
  );
  const [competitionStatus, setCompetitionStatus] = useState<string>(
    initialCompetitionStatus || "draft"
  );
  const [isPublished, setIsPublished] = useState<boolean>(
    initialIsPublished || false
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: competitionData,
    isLoading,
    refetch,
  } = useQuery<CompetitionData>({
    queryKey: ["competition", competitionId],
    queryFn: async () => {
      if (!competitionId || typeof competitionId !== "string") {
        throw new Error("Invalid competition ID");
      }

      const [comp, allTeams, fixturesData] = await Promise.all([
        getCompetitionById(competitionId),
        getAllTeamsForCompetition(competitionId),
        getFixtures(competitionId),
      ]);

      const mappedCompetition = {
        id: comp.id,
        title: comp.title,
        startDate: comp.start_date,
        endDate: comp.end_date,
        description: comp.description,
        category: comp.category_id,
        image: comp.banner
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/Uploads/${comp.banner}`
          : "",
        structureId: comp.structure_id,
        location: comp.location,
        competitionType: comp.competition_type_id,
      };

      const teamDetailsList = await Promise.all(
        allTeams.map((team) => fetchTeamDetails(team.id))
      );
      const hasPlayers = teamDetailsList.some(
        (teamDetails) => teamDetails.players && teamDetails.players.length > 0
      );

      const hasFixtures = Object.values(fixturesData).some(
        (matches) => ensureArray(matches).length > 0
      );

      const newStepCompletion = {
        basicDetails: true,
        structure: !!comp.structure_id,
        registration: allTeams.length > 0 && hasPlayers,
        fixtures: hasFixtures,
        start: comp.status === "started" || comp.status === "ended",
      };
      const completedCount =
        Object.values(newStepCompletion).filter(Boolean).length;

      return {
        competition: mappedCompetition,
        stepCompletion: newStepCompletion,
        completedSteps: completedCount,
        progress: completedCount * 20,
        selectedStructure: comp.structure_id,
        competitionStatus: comp.status,
        isPublished: comp.isPublished === 1,
      };
    },
    enabled: !!competitionId && typeof competitionId === "string",
  });

  useEffect(() => {
    if (competitionData) {
      setSelectedCompetition(competitionData.competition);
      setStepCompletion(competitionData.stepCompletion);
      setCompletedSteps(competitionData.completedSteps);
      setProgress(competitionData.progress);
      setSelectedStructure(competitionData.selectedStructure);
      setCompetitionStatus(competitionData.competitionStatus);
      setIsPublished(competitionData.isPublished);
    }
  }, [competitionData]);

  useEffect(() => {
    if (!competitionId || typeof competitionId !== "string") return;

    const handleSetupUpdated = (event: CustomEvent) => {
      if (event.detail.competitionId === competitionId && !isUpdating) {
        refetch();
      }
    };

    window.addEventListener(
      "setupUpdated",
      handleSetupUpdated as EventListener
    );
    return () => {
      window.removeEventListener(
        "setupUpdated",
        handleSetupUpdated as EventListener
      );
    };
  }, [competitionId, isUpdating, refetch]);

  useEffect(() => {
    if (onStepChange) {
      onStepChange(completedSteps);
    }
  }, [completedSteps, onStepChange]);

  const handleStepCompletion = async (
    step: keyof typeof stepCompletion,
    structureId?: string
  ) => {
    if (
      step === "structure" &&
      structureId &&
      competitionId &&
      typeof competitionId === "string"
    ) {
      try {
        const response = await updateCompetitionStructure(
          competitionId,
          structureId
        );

        if ("error" in response) {
          toast.error(response.error);
          return;
        }
        setSelectedCompetition((prev) =>
          prev ? { ...prev, structureId } : prev
        );
      } catch (error) {
        console.error("Error setting structure:", error);
        toast.error("Failed to set competition structure");
        return;
      }
    }

    setStepCompletion((prev) => {
      const newState = { ...prev, [step]: true };
      const completedCount = Object.values(newState).filter(Boolean).length;
      setCompletedSteps(completedCount);
      setProgress(completedCount * 20);
      if (step === "structure" && structureId !== undefined) {
        setSelectedStructure(structureId);
      }
      return newState;
    });
  };

  const handleCompetitionAction = useCallback(async () => {
    if (isUpdating || !competitionId || typeof competitionId !== "string")
      return;
    const newStatus = competitionStatus === "started" ? "ended" : "started";
    setIsUpdating(true);
    try {
      const response = await updateCompetitionStatus(
        competitionId,
        newStatus as "draft" | "started" | "ended"
      );
      setCompetitionStatus(newStatus);
      setStepCompletion((prev) => ({
        ...prev,
        start: newStatus === "started" || newStatus === "ended",
      }));
      toast.success(response.message);
      await refetch();
      window.dispatchEvent(
        new CustomEvent("setupUpdated", { detail: { competitionId } })
      );
    } catch (error) {
      console.error(`Error updating competition status:`, error);
      toast.error("Failed to update competition status");
    } finally {
      setIsUpdating(false);
    }
  }, [competitionId, competitionStatus, refetch, isUpdating]);

  const handlePublishToggle = async (checked: boolean) => {
    if (isUpdating || !competitionId || typeof competitionId !== "string")
      return;
    setIsUpdating(true);
    try {
      const response = await publishCompetition(competitionId, checked);
      setIsPublished(checked);
      toast.success(response.message);
      await refetch();
      window.dispatchEvent(
        new CustomEvent("setupUpdated", { detail: { competitionId } })
      );
    } catch (error) {
      console.error("Error updating publish status:", error);
      toast.error("Failed to update publish status");
    } finally {
      setIsUpdating(false);
    }
  };


  return (
    <div>
      <SetupCompetitionHeader
        allStepsCompleted={completedSteps === 5}
        canPublish={!!selectedCompetition}
        competitionStatus={competitionStatus}
        onPublishToggle={handlePublishToggle}
        onStartCompetition={handleCompetitionAction}
        isPublished={isPublished}
        competitionId={competitionId as string}
      />
      {isLoading || !competitionId || typeof competitionId !== "string" ? (
        <SetupCompetitionCardSkeleton />
      ) : (
        <SetupCompetitionCard
          title={`${completedSteps} out of 5 completed!`}
          progress={progress}
          showCheckmark={stepCompletion.fixtures}
          onEdit={() => {
            if (selectedCompetition) {
              setIsModalOpen(true);
            } else {
              toast.error("Competition data not loaded yet");
            }
          }}
          onStepComplete={handleStepCompletion}
          stepCompletion={stepCompletion}
          competition={
            selectedCompetition
              ? { id: selectedCompetition.id, name: selectedCompetition.title }
              : { id: competitionId, name: "Unknown Competition" }
          }
          selectedStructure={selectedStructure}
          competitionStatus={competitionStatus}
          onCompetitionAction={handleCompetitionAction}
        />
      )}
      <CreateCompetitionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCompetition={selectedCompetition}
      />
    </div>
  );
}

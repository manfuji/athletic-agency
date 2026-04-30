"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  deleteCompetitionPoints,
  fetchCompetitionPoints,
  saveCompetitionPoints,
  updateCompetitionPoints,
} from "@/actions/points";

export default function PointsTab({ competitionId }: { competitionId: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [configId, setConfigId] = useState<string | null>(null);
  const [winPoints, setWinPoints] = useState(3);
  const [drawPoints, setDrawPoints] = useState(1);
  const [lossPoints, setLossPoints] = useState(0);
  const [tieBreak, setTieBreak] = useState("points,goal_difference,goals_for");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const config = await fetchCompetitionPoints(competitionId);
      setConfigId(config.id);
      setWinPoints(config.win_points);
      setDrawPoints(config.draw_points);
      setLossPoints(config.loss_points);
      setTieBreak((config.tie_break_order || []).join(","));
      setIsLoading(false);
    };
    void load();
  }, [competitionId]);

  const onSave = async () => {
    setIsSaving(true);
    const payload = {
      win_points: winPoints,
      draw_points: drawPoints,
      loss_points: lossPoints,
      tie_break_order: tieBreak
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      is_active: true,
    };

    const res = configId
      ? await updateCompetitionPoints(competitionId, configId, payload)
      : await saveCompetitionPoints(competitionId, payload);

    if (res && typeof res === "object" && "error" in res) {
      toast.error(String(res.error));
      setIsSaving(false);
      return;
    }

    const refreshed = await fetchCompetitionPoints(competitionId);
    setConfigId(refreshed.id);
    toast.success("Points configuration saved");
    setIsSaving(false);
  };

  const onReset = async () => {
    setIsResetting(true);
    try {
      if (!configId) {
        setWinPoints(3);
        setDrawPoints(1);
        setLossPoints(0);
        setTieBreak("points,goal_difference,goals_for");
        return;
      }

      const res = await deleteCompetitionPoints(competitionId, configId);
      if (res && typeof res === "object" && "error" in res) {
        toast.error(String(res.error));
        return;
      }

      setConfigId(null);
      setWinPoints(3);
      setDrawPoints(1);
      setLossPoints(0);
      setTieBreak("points,goal_difference,goals_for");
      toast.success("Points configuration reset");
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return <div className="py-10 text-center font-inter">Loading points config...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-[#e9e9e9] p-6 space-y-4">
      <h3 className="font-evogria text-xl text-[#302464]">Competition Points Setup</h3>
      <p className="font-inter text-sm text-[#667085]">
        Configure standings points and tie-break order.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="font-inter text-sm">
          Win Points
          <input
            type="number"
            min={0}
            value={winPoints}
            onChange={(e) => setWinPoints(Number(e.target.value))}
            className="w-full border rounded-md p-2 mt-1"
          />
        </label>
        <label className="font-inter text-sm">
          Draw Points
          <input
            type="number"
            min={0}
            value={drawPoints}
            onChange={(e) => setDrawPoints(Number(e.target.value))}
            className="w-full border rounded-md p-2 mt-1"
          />
        </label>
        <label className="font-inter text-sm">
          Loss Points
          <input
            type="number"
            min={0}
            value={lossPoints}
            onChange={(e) => setLossPoints(Number(e.target.value))}
            className="w-full border rounded-md p-2 mt-1"
          />
        </label>
      </div>

      <label className="font-inter text-sm block">
        Tie-break order (comma separated)
        <input
          type="text"
          value={tieBreak}
          onChange={(e) => setTieBreak(e.target.value)}
          className="w-full border rounded-md p-2 mt-1"
        />
      </label>

      <div className="flex gap-2">
        <Button
          onClick={onSave}
          disabled={isSaving || isResetting}
          isLoading={isSaving}
          loadingText="Saving..."
          className="bg-[#302464] text-white"
        >
          Save Points Config
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isSaving || isResetting}
          isLoading={isResetting}
          loadingText="Resetting..."
        >
          Reset Default
        </Button>
      </div>
    </div>
  );
}

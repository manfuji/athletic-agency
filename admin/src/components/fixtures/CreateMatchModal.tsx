"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

dayjs.extend(customParseFormat);
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import CustomButton from "@/reusables/CustomButton";
import {
  Team,
  Stage,
  FixtureFormData,
  Group,
  GroupStanding,
} from "@/types/fixtures";
import { fixtureSchema } from "@/lib/validationSchema";

interface FormFieldProps {
  label: string;
  id: keyof FixtureFormData;
  type?: "text" | "date" | "time" | "select";
  value: string;
  onChange: (value: string) => void;
  options?: { id: string; name: string }[];
  placeholder?: string;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  options,
  placeholder,
  error,
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="font-inter">
      {label}
    </Label>
    {type === "select" && options ? (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
      />
    )}
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  stages: Stage[];
  groups: Group[];
  standings: GroupStanding[];
  formData: FixtureFormData;
  setFormData: (data: FixtureFormData) => void;
  onCreateMatch: () => void;
  isLoading: boolean;
}

export default function CreateMatchModal({
  isOpen,
  onClose,
  teams,
  stages,
  groups,
  standings,
  formData,
  setFormData,
  onCreateMatch,
  isLoading,
}: CreateMatchModalProps) {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
    watch,
  } = useForm<FixtureFormData>({
    resolver: zodResolver(fixtureSchema),
    defaultValues: formData,
  });

  const watchedMatchDate = watch("match_date");

  // Validate and reset stage_id if it's no longer valid
  useEffect(() => {
    if (formData.stage_id && stages.length > 0) {
      const isValidStage = stages.some((stage) => stage.id === formData.stage_id);
      if (!isValidStage) {
        console.warn("Current stage_id is no longer valid, resetting:", formData.stage_id);
        setFormData({ ...formData, stage_id: "" });
      }
    }
  }, [stages, formData, setFormData]);

  useEffect(() => {
    if (watchedMatchDate) {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (!dateRegex.test(watchedMatchDate)) {
        return;
      }

      const inputDate = dayjs(watchedMatchDate, "DD/MM/YYYY", true);

      if (!inputDate.isValid()) {
        toast.error("Invalid Date", {
          description: "Please enter a valid date.",
        });
        return;
      }

      const today = dayjs().startOf("day");
      if (inputDate.isBefore(today)) {
        toast.error("Invalid Date", {
          description: "Match date cannot be in the past.",
        });
        return;
      }
    }
  }, [watchedMatchDate]);

  const getOrdinalSuffix = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const teamToGroupMap = useMemo(() => {
    const map = new Map<string, string>();
    groups.forEach((group) => {
      group.teams.forEach((team) => {
        if (team) {
          map.set(team.id, group.title);
        }
      });
    });
    return map;
  }, [groups]);

  const teamToPositionMap = useMemo(() => {
    const map = new Map<string, number>();
    standings.forEach((group) => {
      group.standings.forEach((standing, index) => {
        map.set(standing.team.id, index + 1);
      });
    });
    return map;
  }, [standings]);

  const teamOptions = useMemo(() => {
    if (!Array.isArray(teams)) {
      return [];
    }
    const teamsWithGroups = teams.filter((team) => teamToGroupMap.has(team.id));
    return teamsWithGroups.map((team) => {
      const group = teamToGroupMap.get(team.id) || "";
      const position = teamToPositionMap.get(team.id);
      const positionText = position
        ? `${position}${getOrdinalSuffix(position)} place`
        : "N/A";
      const label = `(${group}) ${team.name} - ${positionText}`;
      return { id: team.id, name: label };
    });
  }, [teams, teamToGroupMap, teamToPositionMap]);

  const handleChange = (field: keyof FixtureFormData) => (value: string) => {
    setFormData({ ...formData, [field]: value });
    setValue(field, value);
    trigger(field);
  };

  const onSubmit = () => {
    // Validate stage_id exists in available stages
    if (formData.stage_id) {
      const isValidStage = stages.some((stage) => stage.id === formData.stage_id);
      if (!isValidStage) {
        console.error("Invalid stage_id selected:", {
          selectedStageId: formData.stage_id,
          availableStages: stages.map((s) => ({ id: s.id, name: s.name })),
        });
        toast.error("Invalid Stage", {
          description: "The selected stage is not valid. Please select a stage from the dropdown.",
        });
        return;
      }
    }

    if (watchedMatchDate) {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (!dateRegex.test(watchedMatchDate)) {
        toast.error("Invalid Date Format", {
          description: "Please use DD/MM/YYYY format (e.g., 25/12/2024).",
        });
        return;
      }

      const inputDate = dayjs(watchedMatchDate, "DD/MM/YYYY", true);
      if (!inputDate.isValid()) {
        toast.error("Invalid Date", {
          description: "Please enter a valid date.",
        });
        return;
      }

      const today = dayjs().startOf("day");
      if (inputDate.isBefore(today)) {
        toast.error("Invalid Date", {
          description: "Match date cannot be in the past.",
        });
        return;
      }
    }
    onCreateMatch();
  };

  const fields: FormFieldProps[] = [
    {
      label: "Select Match Stage",
      id: "stage_id",
      type: "select",
      value: formData.stage_id,
      onChange: handleChange("stage_id"),
      options: stages,
      placeholder: "Select options",
      error: errors.stage_id?.message,
    },
    {
      label: "Home Team",
      id: "home_team_id",
      type: "select",
      value: formData.home_team_id,
      onChange: handleChange("home_team_id"),
      options: teamOptions,
      placeholder: "Select home team",
      error: errors.home_team_id?.message,
    },
    {
      label: "Away Team",
      id: "away_team_id",
      type: "select",
      value: formData.away_team_id,
      onChange: handleChange("away_team_id"),
      options: teamOptions,
      placeholder: "Select away team",
      error: errors.away_team_id?.message,
    },
    {
      label: "Date",
      id: "match_date",
      type: "text",
      value: formData.match_date,
      onChange: handleChange("match_date"),
      placeholder: "dd/mm/yyyy",
      error: errors.match_date?.message,
    },
    {
      label: "Time",
      id: "time",
      type: "time",
      value: formData.time,
      onChange: handleChange("time"),
      error: errors.time?.message,
    },
    {
      label: "Location",
      id: "location",
      value: formData.location,
      onChange: handleChange("location"),
      placeholder: "Enter match location",
      error: errors.location?.message,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg sm:max-w-[500px]">
        <div className="max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="pb-2">
            <DialogHeader>
              <DialogTitle className="font-evogria text-[22px]">
                Create Matches
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
              {fields.map((field) => (
                <FormField key={field.id} {...field} />
              ))}
              <div className="flex justify-end gap-4 mt-6">
                <CustomButton
                  text="Cancel"
                  bgColor="bg-transparent"
                  color="text-black"
                  className="border border-gray-300 hover:bg-gray-100"
                  onClick={onClose}
                />
                <CustomButton
                  text="Create Match"
                  bgColor="bg-[#302464]"
                  color="text-white"
                  className="hover:bg-[#332579] px-6 py-2 rounded-md border-none"
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                />
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

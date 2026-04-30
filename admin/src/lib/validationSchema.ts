import { z } from "zod";

export const competitionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  description: z.union([
    z.literal(""),
    z.string().min(5, "Description must be at least 5 characters"),
  ]),
  category: z.string().min(1, "Category is required"),
  competitionType: z.string().min(1, "Competition type is required"),
  image: z.string().optional(),
  structureId: z.string().nullable().optional(),
});

const baseTeamSchema = z.object({
  logo: z.string().min(1, "Logo is required"),
  name: z.string().min(1, "Team name is required"),
  shortCode: z.string().min(1, "Short code is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

export const createTeamSchema = baseTeamSchema.extend({
  coverPhoto: z.string().min(1, "Cover photo is required"),
});

export const editTeamSchema = baseTeamSchema;

export const playerSchema = z.object({
  image: z.string().min(1, "Image is required"),
  name: z.string().min(1, "Player name is required"),
  country: z.string().min(1, "Country is required"),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => /^\d{2}\/\d{2}\/\d{4}$/.test(val), {
      message: "Invalid date format. Please use DD/MM/YYYY",
    })
    .refine(
      (val) => {
        const [dayStr, monthStr, yearStr] = val.split("/");
        const day = parseInt(dayStr, 10);
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);
        const dobDate = new Date(year, month - 1, day);
        return (
          dobDate.getDate() === day &&
          dobDate.getMonth() + 1 === month &&
          dobDate.getFullYear() === year
        );
      },
      {
        message: "Invalid date",
      }
    )
    .refine(
      (val) => {
        const [dayStr, monthStr, yearStr] = val.split("/");
        const day = parseInt(dayStr, 10);
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);
        const dobDate = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dobDate <= today;
      },
      {
        message: "Date of birth cannot be in the future",
      }
    ),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  bio: z.string().optional(),
  experience: z.string().optional(),
  reason: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  preferredFoot: z.string().min(1, "Preferred foot is required"),
});

export const fixtureSchema = z
  .object({
    stage_id: z.string().min(1, "Match stage is required"),
    home_team_id: z.string().min(1, "Home team is required"),
    away_team_id: z.string().min(1, "Away team is required"),
    match_date: z.string().min(1, "Match date is required"),
    time: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)"
      ),
    location: z.string().min(1, "Location is required"),
  })
  .refine((data) => data.away_team_id !== data.home_team_id, {
    message: "Away team must be different from home team",
    path: ["away_team_id"],
  });

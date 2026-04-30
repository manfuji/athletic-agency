import type React from "react";
import { BadgeCheck, Calendar, Clipboard, Database, KeyRound, List } from "lucide-react";

export interface AdminNavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export interface AdminNavGroup {
  name: string;
  value: string;
  icon: React.ReactNode;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    name: "Data",
    value: "data",
    icon: <Database className="h-4 w-4" />,
    items: [
      { name: "Bio Data", icon: <Database className="h-4 w-4" />, path: "/bio-data" },
    ],
  },
  {
    name: "Reference",
    value: "reference",
    icon: <List className="h-4 w-4" />,
    items: [
      { name: "Event Seasons", icon: <Calendar className="h-4 w-4" />, path: "/event-seasons" },
      { name: "Positions", icon: <List className="h-4 w-4" />, path: "/positions" },
      { name: "Nationalities", icon: <List className="h-4 w-4" />, path: "/nationalities" },
      { name: "Affiliations", icon: <List className="h-4 w-4" />, path: "/affiliations" },
      { name: "Foot Preferences", icon: <List className="h-4 w-4" />, path: "/foot-preferences" },
    ],
  },
  {
    name: "Legacy Stats",
    value: "legacy",
    icon: <Database className="h-4 w-4" />,
    items: [
      { name: "Matches", icon: <Database className="h-4 w-4" />, path: "/legacy/matches" },
      { name: "Lineups", icon: <Database className="h-4 w-4" />, path: "/legacy/lineups" },
      { name: "Passes", icon: <Database className="h-4 w-4" />, path: "/legacy/passes" },
      { name: "Shots", icon: <Database className="h-4 w-4" />, path: "/legacy/shots" },
      { name: "Defensive", icon: <Database className="h-4 w-4" />, path: "/legacy/defensive" },
      { name: "Dribbles & Fouls", icon: <Database className="h-4 w-4" />, path: "/legacy/dribbles-and-fouls" },
      { name: "Goalkeeper", icon: <Database className="h-4 w-4" />, path: "/legacy/goalkeeper-stats" },
      { name: "Physical", icon: <Database className="h-4 w-4" />, path: "/legacy/physical-data" },
    ],
  },
  {
    name: "Quality",
    value: "quality",
    icon: <BadgeCheck className="h-4 w-4" />,
    items: [
      { name: "QA Log", icon: <BadgeCheck className="h-4 w-4" />, path: "/quality/qa-log" },
      { name: "Video Verification", icon: <BadgeCheck className="h-4 w-4" />, path: "/quality/video-verification" },
    ],
  },
  {
    name: "Ops",
    value: "ops",
    icon: <Clipboard className="h-4 w-4" />,
    items: [
      { name: "Evaluators", icon: <Clipboard className="h-4 w-4" />, path: "/ops/evaluators" },
      { name: "Eval Sessions", icon: <Clipboard className="h-4 w-4" />, path: "/ops/evaluation-sessions" },
      { name: "Player Evaluations", icon: <Clipboard className="h-4 w-4" />, path: "/ops/player-evaluations" },
      { name: "Top64 Selection", icon: <Clipboard className="h-4 w-4" />, path: "/ops/top64-selection" },
      { name: "Draft Events", icon: <Clipboard className="h-4 w-4" />, path: "/ops/draft-events" },
      { name: "Draft Picks", icon: <Clipboard className="h-4 w-4" />, path: "/ops/draft-picks" },
      { name: "API Import Log", icon: <Database className="h-4 w-4" />, path: "/ops/api-import-log" },
      { name: "Sheets Import", icon: <Database className="h-4 w-4" />, path: "/ops/google-sheets-import" },
      { name: "Partner Cache", icon: <Database className="h-4 w-4" />, path: "/ops/partner-live-cache" },
    ],
  },
  {
    name: "Security",
    value: "security",
    icon: <KeyRound className="h-4 w-4" />,
    items: [
      { name: "API Keys", icon: <KeyRound className="h-4 w-4" />, path: "/api-keys" },
    ],
  },
];


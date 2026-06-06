"use client"

import { useState } from "react"

interface Stat {
  label: string;
  value: string | number;
  suffix?: string;
  category: "Attack" | "Defense & Discipline" | "General" | "Physical";
}

interface Competition {
  id: string;
  title: string;
}

type StatsFilter = "all" | string; // string for competition ID

interface StatsAccordionProps {
  stats: Stat[];
  competitions?: Competition[];
  currentCompetitionId?: string;
  onFilterChange?: (value: StatsFilter) => void;
}

export function StatsAccordion({ 
  stats, 
  competitions = [],
  currentCompetitionId,
  onFilterChange 
}: StatsAccordionProps) {
  const [filter, setFilter] = useState<StatsFilter>(currentCompetitionId || "all");

  // Group stats by category
  const groupedStats = stats.reduce<Record<string, Stat[]>>((acc, stat) => {
    if (!acc[stat.category]) acc[stat.category] = []
    acc[stat.category].push(stat)
    return acc
  }, {})

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
        <h3 className="font-semibold text-lg uppercase tracking-wide">
          Player Stats
        </h3>
        <select
          value={filter}
          onChange={(e) => {
            const value = e.target.value as StatsFilter;
            setFilter(value);
            onFilterChange?.(value);
          }}
          className="bg-white text-gray-900 border rounded px-3 py-1 text-sm"
        >
          <option value="all">All Competitions</option>
          {competitions.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row bg-gray-50 gap-4">
        {Object.entries(groupedStats).map(([category, categoryStats]) => (
          <div
            key={category}
            className="bg-white border-b md:border-b-0 md:border-r border-gray-200 last:border-r-0 flex-1 border-2 rounded-md"
          >
            {/* Column header */}
            <div className="bg-gray-100 px-6 py-3 border-b border-gray-200">
              <h4 className="font-semibold text-gray-800 uppercase tracking-wide text-sm">{category}</h4>
            </div>

            {/* Stats rows */}
            <div className="divide-y divide-gray-100">
              {categoryStats.map((stat) => (
                <div
                  key={stat.label}
                  className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700 text-sm">{stat.label}</span>
                  <span className="font-medium text-gray-900 text-sm">
                    {stat.value}
                    {stat.suffix || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

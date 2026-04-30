'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ResultsTab from './ResultsTab';
import StandingsTab from './StandingsTab';
import { Fixture } from '@/types/fixtures';
import { useStandings } from '@/hooks/useStandings';

interface TabbedResultsProps {
  competitionId: string;
  fixtures: { [date: string]: Fixture[] };
}

const tabData = [
  { id: 'results', label: 'Results' },
  { id: 'standings', label: 'Standings' },
];

export default function TabbedResults({
  competitionId,
  fixtures,
}: TabbedResultsProps) {
  const [activeTab, setActiveTab] = useState('results');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const { groupStandings } = useStandings(competitionId);

  useEffect(() => {
    const activeIndex = tabData.findIndex((tab) => tab.id === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab]);

  return (
    <div className="w-full">
      <div className="relative flex gap-8 border-b border-gray-200">
        {tabData.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 text-[16px] font-inter ${
              activeTab === tab.id
                ? 'text-[#302464] font-bold'
                : 'text-[#667085]'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <motion.div
          className="absolute bottom-0 h-[2px] bg-[#302464]"
          style={{ left: underlineStyle.left, width: underlineStyle.width }}
          initial={false}
          animate={{ left: underlineStyle.left, width: underlineStyle.width }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="mt-6">
        {activeTab === 'results' && <ResultsTab fixtures={fixtures} />}
        {activeTab === 'standings' && (
          <StandingsTab groupStandings={groupStandings} />
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GroupsTab from './GroupsTab';
import FixturesTab from './FixturesTab';
import PointsTab from './PointsTab';

const tabData = [
  { id: 'groups', label: 'Groups setup' },
  { id: 'fixtures', label: 'Fixtures setup' },
  { id: 'points', label: 'Points setup' },
];

export default function TabbedAccordion({
  competitionId,
}: {
  competitionId: string;
}) {
  const [activeTab, setActiveTab] = useState('groups');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const activeIndex = tabData.findIndex((tab) => tab.id === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      setUnderlineStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className="w-full">
      <div className="relative flex justify-between items-center border-b border-gray-200">
        <div className="flex gap-8">
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
        </div>
        <motion.div
          className="absolute bottom-0 h-[2px] bg-[#302464]"
          style={{
            left: underlineStyle.left,
            width: underlineStyle.width,
          }}
          initial={false}
          animate={{
            left: underlineStyle.left,
            width: underlineStyle.width,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="mt-6">
        {activeTab === 'groups' && <GroupsTab competitionId={competitionId} />}
        {activeTab === 'fixtures' && (
          <FixturesTab competitionId={competitionId} />
        )}
        {activeTab === 'points' && <PointsTab competitionId={competitionId} />}
      </div>
    </div>
  );
}

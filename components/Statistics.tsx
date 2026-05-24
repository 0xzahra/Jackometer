import React, { useState } from 'react';

const statsData = {
  today: 125,
  yesterday: 89,
  week: 742,
  month: 3150,
  year: 24890
};

export const Statistics = () => {
  const [timeline, setTimeline] = useState<'today' | 'yesterday' | 'week' | 'month' | 'year'>('today');

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold font-serif text-[var(--text-primary)]">User Statistics</h2>
        <p className="text-[var(--text-secondary)]">Insights into platform usage over time.</p>
      </div>

      <div className="glass-panel p-6 border border-[var(--border-color)]">
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['today', 'yesterday', 'week', 'month', 'year'].map(t => (
            <button
              key={t}
              onClick={() => setTimeline(t as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                timeline === t ? 'bg-[var(--accent)] text-white' : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--text-secondary)]/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center py-12 bg-[var(--surface-color)] rounded-xl border border-[var(--border-color)]">
          <div className="text-6xl font-bold text-[var(--text-primary)] mb-4">{statsData[timeline]}</div>
          <div className="text-[var(--text-secondary)] text-sm tracking-wide uppercase font-bold">Active Users {timeline}</div>
        </div>
      </div>
    </div>
  );
};

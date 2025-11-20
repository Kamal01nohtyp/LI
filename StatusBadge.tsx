import React from 'react';
import { IssueStatus } from './types';
import { Language, translations } from './translations';

interface StatusBadgeProps {
  status: IssueStatus;
  onChange?: (newStatus: IssueStatus) => void;
  lang: Language;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, onChange, lang }) => {
  const t = translations[lang];

  const getColor = (s: IssueStatus) => {
    switch (s) {
      case IssueStatus.NEW: return 'bg-blue-100 text-blue-700 border-blue-200';
      case IssueStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case IssueStatus.CUSTOMS: return 'bg-purple-100 text-purple-700 border-purple-200';
      case IssueStatus.DELIVERY: return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case IssueStatus.DONE: return 'bg-green-100 text-green-700 border-green-200';
      case IssueStatus.STUCK: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!onChange) {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getColor(status)} transition-all duration-200`}>
        {t.statuses[status]}
      </span>
    );
  }

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as IssueStatus)}
      className={`px-3 py-1 rounded-full text-xs font-medium border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200 ${getColor(status)}`}
    >
      {Object.values(IssueStatus).map((s) => (
        <option key={s} value={s}>{t.statuses[s]}</option>
      ))}
    </select>
  );
};
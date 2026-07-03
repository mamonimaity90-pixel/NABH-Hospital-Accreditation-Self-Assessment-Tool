/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Chapter, AssessmentCriterion, EvaluationSession, CriterionAnswer, ResponseOption } from '../types';
import { AlertOctagon, Info, Search, ListCheck, Milestone } from 'lucide-react';

interface AssessmentLayoutProps {
  chapters: Chapter[];
  criteria: AssessmentCriterion[];
  currentSession: EvaluationSession;
  onUpdateAnswer: (criterionId: string, updates: Partial<CriterionAnswer>) => void;
}

export const formatActionPlan = (text: string): React.ReactNode => {
  if (!text) return null;
  
  const parts = text.split(/(?=\b\d+[\.\)])/g);
  const cleanParts = parts.map(p => p.trim()).filter(Boolean);
  
  if (cleanParts.length > 1) {
    return (
      <div className="space-y-2">
        {cleanParts.map((part, index) => (
          <div key={index} className="text-slate-800 text-xs leading-relaxed font-semibold pl-3 border-l-2 border-amber-300">
            {part}
          </div>
        ))}
      </div>
    );
  }

  const sentences = text.split(/(?<=\w\w\.)\s+(?=[A-Z])/g);
  const cleanSentences = sentences.map(s => s.trim()).filter(Boolean);
  if (cleanSentences.length > 1) {
    return (
      <div className="space-y-2">
        {cleanSentences.map((sentence, index) => (
          <div key={index} className="text-slate-800 text-xs leading-relaxed font-semibold pl-3 border-l-2 border-amber-300">
            {sentence}
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-slate-800 text-xs leading-relaxed font-semibold">{text}</p>;
};

export const AssessmentLayout: React.FC<AssessmentLayoutProps> = ({
  chapters,
  criteria,
  currentSession,
  onUpdateAnswer
}) => {
  const [activeChapterId, setActiveChapterId] = useState<string>(chapters[0]?.id || 'AAC');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'missed' | 'gaps' | 'compliant'>('all');

  // Filter criteria logic
  const filteredCriteria = criteria.filter(c => {
    if (c.chapterId !== activeChapterId) return false;

    // Search query check
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesText = c.question.toLowerCase().includes(query) ||
                          c.code.toLowerCase().includes(query) ||
                          c.description.toLowerCase().includes(query);
      if (!matchesText) return false;
    }

    // Status category check
    const ans = currentSession.answers[c.id];
    if (statusFilter === 'missed') {
      return !ans || !ans.response;
    }
    if (statusFilter === 'gaps') {
      return ans && (ans.response === 'non_compliant' || ans.response === 'partially_compliant');
    }
    if (statusFilter === 'compliant') {
      return ans && ans.response === 'compliant';
    }

    return true;
  });

  // Calculate chapter level stats
  const getChapterProgress = (chId: string) => {
    const chCriteria = criteria.filter(c => c.chapterId === chId);
    if (!chCriteria.length) return { answered: 0, total: 0, percentage: 0 };

    const answered = chCriteria.filter(c => {
      const ans = currentSession.answers[c.id];
      return ans && ans.response;
    }).length;

    return {
      answered,
      total: chCriteria.length,
      percentage: Math.round((answered / chCriteria.length) * 100)
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="assessment-main-grid">
      {/* 1. Left Chapters Sidebar Block */}
      <div className="lg:col-span-1 space-y-4" id="chapters-sidebar-panel">
        <div className="px-2 py-0.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          Chapters
        </div>
        <div className="flex flex-col gap-2" id="chapter-list-layout">
          {chapters.map(ch => {
            const isActive = ch.id === activeChapterId;
            const stats = getChapterProgress(ch.id);

            return (
              <button
                key={ch.id}
                onClick={() => {
                  setActiveChapterId(ch.id);
                  setSearchQuery('');
                }}
                className={`w-full text-left p-3.5 rounded-lg border transition-all duration-150 relative flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-cyan-50/70 border-slate-200 border-r-4 border-r-cyan-600 shadow-2xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                }`}
                id={`chapter-tab-${ch.id}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`h-7 w-7 rounded shrink-0 text-xs font-black flex items-center justify-center font-mono ${
                    isActive ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {ch.id}
                  </span>
                  <div className="text-left min-w-0">
                    <p className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-cyan-900' : 'text-slate-800'}`}>
                      {ch.name}
                    </p>
                    <p className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`}>
                      {stats.answered} of {stats.total} • {stats.percentage}%
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main interactive Questions pane */}
      <div className="lg:col-span-3 space-y-6" id="questions-primary-container">
        {/* active chapter summary card */}
        {chapters.find(ch => ch.id === activeChapterId) && (
          <div className="bg-slate-950 text-white p-6 rounded-xl border border-slate-850 relative overflow-hidden" id="chapter-hero-banner">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Milestone className="w-24 h-24 text-white" />
            </div>
            <div className="relative">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/60 border border-cyan-900/40 px-2 py-0.5 rounded-md inline-block mb-2 font-mono">
                ACTIVE SECTION
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white" id="current-chapter-title">
                {activeChapterId}: {chapters.find(ch => ch.id === activeChapterId)?.name}
              </h2>
              <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                {chapters.find(ch => ch.id === activeChapterId)?.description}
              </p>
            </div>
          </div>
        )}

        {/* Search guidelines & status filtering bar */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm" id="table-filters-panel">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, questions, or requirements..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-hidden focus:border-slate-400 font-sans"
            />
          </div>
          <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 'missed', 'gaps', 'compliant'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter === f
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f === 'all' && 'All Standards'}
                {f === 'missed' && 'Unanswered'}
                {f === 'gaps' && 'Critical Gaps'}
                {f === 'compliant' && 'Compliant'}
              </button>
            ))}
          </div>
        </div>

        {/* Criteria Questions Render Loop */}
        <div className="space-y-4" id="questions-listings">
          {filteredCriteria.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-250" id="empty-state">
              <ListCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">No Assessment Criteria Found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting the status filters or standard search input above</p>
            </div>
          ) : (
            filteredCriteria.map(criterion => {
              const ansVal: CriterionAnswer = currentSession.answers[criterion.id] || {
                criterionId: criterion.id,
                response: undefined,
                customActionItem: criterion.defaultActionItem
              };

              const handleResponseSelection = (option: ResponseOption) => {
                onUpdateAnswer(criterion.id, {
                  response: option,
                  customActionItem: ansVal.customActionItem || criterion.defaultActionItem,
                  status: ansVal.status || 'pending',
                  priority: ansVal.priority || 'medium'
                });
              };

              // Determine card background and trim based on selected response
              const getCardHighlights = () => {
                if (ansVal.response === 'compliant') return 'border-2 border-slate-200 border-l-4 border-l-emerald-500';
                if (ansVal.response === 'partially_compliant') return 'border-2 border-amber-200/80 bg-amber-50/10';
                if (ansVal.response === 'non_compliant') return 'border-2 border-rose-200/80 bg-rose-50/10';
                if (ansVal.response === 'not_applicable') return 'border border-slate-200/80 bg-slate-50/20 opacity-80';
                return 'hover:border-slate-300';
              };

              // Get status tag color values
              const getTagClasses = () => {
                if (ansVal.response === 'compliant') return 'text-emerald-700 bg-emerald-50';
                if (ansVal.response === 'partially_compliant') return 'text-amber-700 bg-amber-50';
                if (ansVal.response === 'non_compliant') return 'text-rose-700 bg-rose-50';
                return 'text-slate-500 bg-slate-100';
              };

              // Compute sequential number under this chapter
              const chapterCriteria = criteria.filter(item => item.chapterId === criterion.chapterId);
              const sequenceNumber = chapterCriteria.findIndex(item => item.id === criterion.id) + 1;

              const hasDescription = !!(criterion.description && 
                criterion.description.trim().length > 0 && 
                criterion.description !== 'No description provided.' && 
                criterion.description !== 'Custom added standard question.');

              return (
                <div
                  key={criterion.id}
                  className={`bg-white rounded-xl border border-slate-200 p-5 md:p-6 transition-all shadow-sm relative ${getCardHighlights()}`}
                  id={`criterion-card-${criterion.id}`}
                >
                  {/* Left solid indicator line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                    ansVal.response === 'compliant' ? 'bg-emerald-500' :
                    ansVal.response === 'partially_compliant' ? 'bg-amber-500' :
                    ansVal.response === 'non_compliant' ? 'bg-rose-500' : 'bg-slate-300'
                  }`} />

                  {/* Top code and interactive options */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded font-mono ${getTagClasses()}`}>
                          {criterion.code && criterion.code.trim().length > 0 
                            ? (criterion.id.startsWith('UPLOAD_') ? criterion.code : `${activeChapterId} ${criterion.code}`)
                            : `${activeChapterId} #${sequenceNumber}`
                          }
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Standards Check</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm leading-relaxed pt-1" id={`question-text-${criterion.id}`}>
                        <span className="mr-1.5">{criterion.question}</span>
                        {hasDescription && (
                          <span className="relative group inline-block align-middle">
                            <span
                              className="text-slate-400 hover:text-cyan-600 focus-within:text-cyan-600 transition-colors p-0.5 rounded cursor-help inline-flex items-center"
                              tabIndex={0}
                            >
                              <Info className="w-3.5 h-3.5" />
                            </span>
                            {/* Beautiful tooltip */}
                            <div className="invisible group-hover:visible group-focus-within:visible absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-slate-950 text-slate-100 text-[11px] leading-relaxed rounded-lg shadow-2xl border border-slate-800 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-150 pointer-events-none text-left font-normal">
                              <p className="font-semibold text-[10px] text-cyan-400 uppercase tracking-wider mb-1 font-mono">Guidance Details</p>
                              <span>{criterion.description}</span>
                              {/* Arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
                            </div>
                          </span>
                        )}
                      </h4>
                    </div>

                    {/* Checkbox Options Pills */}
                    <div className="flex flex-wrap gap-1 text-[10px] lg:self-start lg:shrink-0" id={`pills-${criterion.id}`}>
                      {(['compliant', 'partially_compliant', 'non_compliant', 'not_applicable'] as const).map(opt => {
                        const isSelected = ansVal.response === opt;
                        const optShortList: Record<string, string> = {
                          compliant: 'C',
                          partially_compliant: 'PC',
                          non_compliant: 'NC',
                          not_applicable: 'NA'
                        };
                        const optFullLabels: Record<string, string> = {
                          compliant: 'Fully Compliant (C)',
                          partially_compliant: 'Partially Compliant (PC)',
                          non_compliant: 'Non Compliant (NC)',
                          not_applicable: 'Not Applicable (NA)'
                        };

                        const optStyles: Record<string, string> = {
                          compliant: isSelected ? 'bg-emerald-600 text-white shadow-xs border-emerald-600' : 'bg-slate-50 hover:bg-emerald-50 text-slate-500 border border-slate-200/80',
                          partially_compliant: isSelected ? 'bg-amber-500 text-white shadow-xs border-amber-500' : 'bg-slate-50 hover:bg-amber-50 text-slate-500 border border-slate-200/80',
                          non_compliant: isSelected ? 'bg-rose-600 text-white shadow-xs border-rose-600' : 'bg-slate-50 hover:bg-rose-50 text-slate-500 border border-slate-200/80',
                          not_applicable: isSelected ? 'bg-slate-700 text-white shadow-xs border-slate-750' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/80'
                        };

                        return (
                          <button
                            key={opt}
                            onClick={() => handleResponseSelection(opt)}
                            title={optFullLabels[opt]}
                            className={`px-3.5 py-1.5 rounded font-bold transition-all text-[10px] cursor-pointer font-mono ${optStyles[opt]}`}
                            id={`option-${criterion.id}-${opt}`}
                          >
                            {optShortList[opt]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Action plans drawer if partially or non compliant */}
                  {(ansVal.response === 'partially_compliant' || ansVal.response === 'non_compliant') && (
                    <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-150 space-y-3" id={`action-item-panel-${criterion.id}`}>
                      <div className="flex items-center gap-1.5 text-amber-800 text-[10px] font-bold uppercase tracking-wider font-mono">
                        <AlertOctagon className="w-4 h-4 text-amber-600" />
                        <span>Required Action Plan</span>
                      </div>

                      <div className="space-y-3">
                        <div className="w-full text-xs px-3 py-2.5 bg-white border border-amber-200 rounded-md text-slate-800 leading-relaxed font-semibold font-sans">
                          {criterion.defaultActionItem && criterion.defaultActionItem.trim().length > 0 ? (
                            formatActionPlan(criterion.defaultActionItem)
                          ) : (
                            <span className="text-slate-400 italic font-normal">No specific action item recommendation configured by administrator for this question.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

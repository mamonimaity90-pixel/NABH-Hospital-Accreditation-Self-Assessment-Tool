/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ChartData {
  chapterCode: string;
  chapterName: string;
  score: number;
  totalApplicableList: number;
}

interface DashboardChartsProps {
  data: ChartData[];
  overallScore: number;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ data, overallScore }) => {
  // Determine color theme based on score thresholds
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Emerald
    if (score >= 50) return '#f59e0b'; // Amber/Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-container">
      {/* 1. Overall Score Circular Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center" id="overall-gauge-card">
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Overall Preparedness
        </h4>
        <div className="relative flex items-center justify-center w-36 h-36">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              className="stroke-slate-100"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={getScoreColor(overallScore)}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * overallScore) / 100}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold text-slate-800" id="overall-score-percentage">
              {overallScore.toFixed(0)}%
            </span>
            <span className="text-xs font-medium text-slate-400">NABH Hospital Accreditation</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 border-t border-slate-50 pt-3">
            <span>Assessment Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold leading-5 ${
                overallScore >= 80
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : overallScore >= 50
                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                  : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}
            >
              {overallScore >= 80 ? 'Accreditation Ready' : overallScore >= 50 ? 'Progressing' : 'Immediate Gaps'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center italic">
            *NABH pre-requisites suggest scoring at least 50% in each chapter and 70% overall to register for accreditation.
          </p>
        </div>
      </div>

      {/* 2. Chapter scores bar chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2" id="chapter-bar-chart-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-700" id="chapter-performance-title">
              Chapter Compliance Breakdown
            </h4>
            <p className="text-xs text-slate-400">Compliance percentages attained across all 10 standard chapters</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded"></span> ≥80% Target</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500 rounded"></span> 50-79%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded"></span> &lt;50%</span>
          </div>
        </div>

        <div className="h-64 w-full" id="recharts-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="chapterCode"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const payloadData = payload[0].payload as ChartData;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-800 text-xs max-w-xs">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-1">
                          [{payloadData.chapterCode}] {payloadData.chapterName}
                        </p>
                        <p className="flex justify-between gap-6">
                          <span>Compliance Score:</span>
                          <span className="font-semibold text-emerald-400">{payloadData.score}%</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Applicable questions tracked: {payloadData.totalApplicableList}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={30}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

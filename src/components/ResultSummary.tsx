/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Chapter, AssessmentCriterion, EvaluationSession, CriterionAnswer } from '../types';
import { DashboardCharts } from './DashboardCharts';
import { formatActionPlan } from './AssessmentLayout';
import { Download, AlertTriangle, ShieldCheck, CheckSquare, Clock, Calendar, ArrowRight, Kanban, ListTodo, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ResultSummaryProps {
  chapters: Chapter[];
  criteria: AssessmentCriterion[];
  currentSession: EvaluationSession;
  onUpdateAnswer: (criterionId: string, updates: Partial<CriterionAnswer>) => void;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({
  chapters,
  criteria,
  currentSession,
  onUpdateAnswer
}) => {
  // 1. Calculate overall metrics
  let totalScoreWeight = 0;
  let totalApplicableCount = 0;
  let fullyCompliantCount = 0;
  let partiallyCompliantCount = 0;
  let nonCompliantCount = 0;
  let notApplicableCount = 0;
  let totalQuestionsCount = criteria.length;

  // Track chapter analytics
  const chapterAnalytics = chapters.map(ch => {
    const chCriteria = criteria.filter(c => c.chapterId === ch.id);
    let chApplicable = 0;
    let chScorePoints = 0;

    chCriteria.forEach(c => {
      const ans = currentSession.answers[c.id];
      if (ans && ans.response) {
        if (ans.response !== 'not_applicable') {
          chApplicable++;
          if (ans.response === 'compliant') {
            chScorePoints += 10;
          } else if (ans.response === 'partially_compliant') {
            chScorePoints += 5;
          }
        }
      }
    });

    const scorePct = chApplicable > 0 ? (chScorePoints / (chApplicable * 10)) * 100 : 0;

    return {
      chapterCode: ch.id,
      chapterName: ch.name,
      score: Math.round(scorePct),
      totalApplicableList: chApplicable
    };
  });

  // Calculate overall values
  criteria.forEach(c => {
    const ans = currentSession.answers[c.id];
    if (ans && ans.response) {
      if (ans.response === 'not_applicable') {
        notApplicableCount++;
      } else {
        totalApplicableCount++;
        if (ans.response === 'compliant') {
          fullyCompliantCount++;
          totalScoreWeight += 10;
        } else if (ans.response === 'partially_compliant') {
          partiallyCompliantCount++;
          totalScoreWeight += 5;
        } else {
          nonCompliantCount++;
        }
      }
    }
  });

  const parsedOverallScore = totalApplicableCount > 0 ? (totalScoreWeight / (totalApplicableCount * 10)) * 100 : 0;
  const totalGapsCount = partiallyCompliantCount + nonCompliantCount;

  // 2. Identify Dynamic Action Items list
  const gapCriteriaList = criteria.filter(c => {
    const ans = currentSession.answers[c.id];
    return ans && (ans.response === 'non_compliant' || ans.response === 'partially_compliant');
  });

  // Download compiled Action Plan as Report file
  const downloadActionPlanFile = () => {
    let reportText = `NABH HOSPITAL ACCREDITATION COMPLIANCE TRACKER - COMPILED PLAN OF ACTION\n`;
    reportText += `============================================================\n`;
    reportText += `HOSPITAL EVALUATED: ${currentSession.hospitalName}\n`;
    reportText += `CONTACT NUMBER    : ${currentSession.contactNumber}\n`;
    reportText += `EMAIL ID          : ${currentSession.emailId}\n`;
    reportText += `CITY              : ${currentSession.city}\n`;
    reportText += `DATE COMPILED     : ${new Date().toLocaleDateString()}\n`;
    reportText += `OVERALL SCORE     : ${parsedOverallScore.toFixed(1)}%\n`;
    reportText += `TOTAL GAPS FOUND  : ${totalGapsCount} deficiencies\n`;
    reportText += `============================================================\n\n`;

    chapters.forEach(ch => {
      const chGaps = gapCriteriaList.filter(g => g.chapterId === ch.id);
      if (chGaps.length === 0) return;

      reportText += `CHAPTER SEC: [${ch.id}] ${ch.name.toUpperCase()}\n`;
      reportText += `------------------------------------------------------------\n`;

      chGaps.forEach((g, idx) => {
        const ans = currentSession.answers[g.id]!;
        const displayCode = g.code && g.code.trim().length > 0 
          ? g.code 
          : (() => {
              const chapterCriteria = criteria.filter(item => item.chapterId === g.chapterId);
              const seqIdx = chapterCriteria.findIndex(item => item.id === g.id) + 1;
              return `${g.chapterId} #${seqIdx}`;
            })();

        reportText += `${idx + 1}. [${displayCode}] ${g.question}\n`;
        reportText += `   Assess State : ${ans.response === 'non_compliant' ? 'NON-COMPLIANT' : 'PARTIALLY COMPLIANT'}\n`;
        reportText += `   Corrective task recommendation:\n`;
        reportText += `   >> ${g.defaultActionItem || ans.customActionItem || 'No remedial action configured.'}\n`;
        if (ans.notes) {
          reportText += `   Notes        : ${ans.notes}\n`;
        }
        reportText += `\n`;
      });
      reportText += `\n`;
    });

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NABH_Action_Plan_${currentSession.hospitalName.replace(/\s+/g, '_')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDFReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const marginX = 15;
    let currentY = 15;
    const pageHeight = 297;
    const pageWidth = 210;
    const contentWidth = pageWidth - (marginX * 2);

    const drawHeaderDecoration = () => {
      // Accent bar
      doc.setFillColor(0, 47, 86); // Navy #002f56
      doc.rect(0, 0, pageWidth, 4, 'F');
      doc.setFillColor(242, 169, 0); // Gold #f2a900
      doc.rect(0, 4, pageWidth, 1.5, 'F');
      
      // Footer text on every page
      const pageCount = doc.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Official Accreditation Readiness Report • Licensed under NABH eMitra`, marginX, 285);
      doc.text(`Page ${pageCount}`, pageWidth - marginX - 10, 285);
    };

    const checkPageOverflow = (neededHeight: number) => {
      if (currentY + neededHeight > pageHeight - 18) {
        doc.addPage();
        currentY = 15;
        drawHeaderDecoration();
        return true;
      }
      return false;
    };

    // Initialize Page 1 decoration
    drawHeaderDecoration();

    // 1. Heading Header block
    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 47, 86); // Navy
    doc.text("NATIONAL ACCREDITATION BOARD FOR HOSPITALS", marginX, currentY);
    
    currentY += 5.5;
    doc.setFontSize(12);
    doc.text("& HEALTHCARE PROVIDERS (NABH)", marginX, currentY);

    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(242, 169, 0); // Gold
    doc.text("CONSTITUENT BOARD OF QUALITY COUNCIL OF INDIA (QCI)", marginX, currentY);

    // Separator line
    currentY += 4;
    doc.setDrawColor(226, 232, 240); // line border Slate-200
    doc.setLineWidth(0.3);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);

    // 2. Document Title Banner
    currentY += 6;
    doc.setFillColor(245, 247, 250); // Light gray highlight
    doc.rect(marginX, currentY, contentWidth, 11, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("ACCREDITATION PRE-REQUISITE ASSESSMENT REPORT", marginX + 4, currentY + 7);
    
    // Status Tag inside banner
    doc.setFillColor(242, 169, 0); // Gold banner tag
    doc.rect(pageWidth - marginX - 35, currentY + 2.5, 31, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 47, 86); // Navy
    doc.text("NABH v5.0", pageWidth - marginX - 31, currentY + 6.7);

    // 3. Metadata box
    currentY += 11 + 4;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.rect(marginX, currentY, contentWidth, 38, 'FD'); // Box border with white background

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("HOSPITAL NAME:", marginX + 4, currentY + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 47, 86); // Navy
    doc.text(currentSession.hospitalName.toUpperCase(), marginX + 4, currentY + 11.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Contact: ${currentSession.contactNumber}`, marginX + 4, currentY + 18);
    doc.text(`Email: ${currentSession.emailId}`, marginX + 4, currentY + 24);
    doc.text(`City: ${currentSession.city}`, marginX + 4, currentY + 30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("SELF ASSESSMENT DETAILS:", marginX + 110, currentY + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Assessment ID: ${currentSession.id}`, marginX + 110, currentY + 12);
    doc.text(`Timestamp: ${new Date(currentSession.updatedAt).toLocaleString()}`, marginX + 110, currentY + 18);
    doc.text(`Standard Version: QCI-NABH v5.0`, marginX + 110, currentY + 24);
    doc.text(`Type: Prerequisite Gap Check`, marginX + 110, currentY + 30);

    // 4. Executive Summary Score Card
    currentY += 38 + 6;
    checkPageOverflow(40);
    
    doc.setFillColor(0, 47, 86); // Navy
    doc.rect(marginX, currentY, contentWidth, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("EXECUTIVE PERFORMANCE & COMPLIANCE SUMMARY", marginX + 4, currentY + 6);

    currentY += 9;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(250, 250, 252);
    doc.rect(marginX, currentY, contentWidth, 24, 'FD');

    // Score circular percentage or text block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(242, 169, 0); // Gold score color
    const scoreStr = `${parsedOverallScore.toFixed(1)}%`;
    doc.text(scoreStr, marginX + 6, currentY + 15);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("OVERALL READINESS INDEX", marginX + 6, currentY + 21);

    // Detailed stats block columns
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600

    const colX1 = marginX + 70;
    const colX2 = marginX + 125;
    
    doc.text(`• Total Standards Assessed:   ${fullyCompliantCount + partiallyCompliantCount + nonCompliantCount}`, colX1, currentY + 7);
    doc.text(`• Fully Compliant (FC):        ${fullyCompliantCount}`, colX1, currentY + 13);
    doc.text(`• Partially Compliant (PC):  ${partiallyCompliantCount}`, colX1, currentY + 19);

    doc.text(`• Non-Compliant (NC):        ${nonCompliantCount}`, colX2, currentY + 7);
    doc.text(`• Not Applicable (N/A):        ${notApplicableCount}`, colX2, currentY + 13);
    
    // Status indicator tag
    const isHighCompliance = parsedOverallScore >= 80;
    const complianceText = isHighCompliance 
      ? "RECOMMENDED FOR CERTIFICATION AUDIT" 
      : "GAP CORRECTION MANDATORY PRIOR TO AUDIT";
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    if (isHighCompliance) {
      doc.setTextColor(16, 124, 65); // Green
    } else {
      doc.setTextColor(220, 38, 38); // Red
    }
    doc.text(`>> STATUS: ${complianceText}`, colX2, currentY + 19);

    // 5. Chapter Breakdown list
    currentY += 24 + 8;
    checkPageOverflow(40);

    doc.setFillColor(242, 169, 0); // Gold title bar
    doc.rect(marginX, currentY, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 47, 86); // Navy
    doc.text("CHAPTER-WISE ACCREDITATION BREAKDOWN", marginX + 4, currentY + 5.5);

    currentY += 8;
    doc.setDrawColor(226, 232, 240);
    
    // Draw table headers for chapter breakdowns
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, currentY, contentWidth, 7, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("CHAPTER CODE & DESCRIPTION", marginX + 3, currentY + 4.8);
    doc.text("STATUS", marginX + 135, currentY + 4.8);
    doc.text("COMPLIANCE PCT", marginX + 165, currentY + 4.8);
    
    currentY += 7;

    chapterAnalytics.forEach((item, index) => {
      checkPageOverflow(8);
      // Alternating list rows
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, currentY, contentWidth, 7, 'F');
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(item.chapterCode, marginX + 3, currentY + 4.8);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      
      const trimmedChapterName = item.chapterName.length > 58 ? `${item.chapterName.substring(0, 56)}...` : item.chapterName;
      doc.text(`- ${trimmedChapterName}`, marginX + 15, currentY + 4.8);

      // Status labels text
      let chStatus = "NON-COMPLIANT";
      if (item.score >= 90) {
        chStatus = "EXCELLENT";
        doc.setTextColor(16, 124, 65);
      } else if (item.score >= 70) {
        chStatus = "SATISFACTORY";
        doc.setTextColor(5, 114, 185);
      } else if (item.score > 0) {
        chStatus = "INSUFFICIENT";
        doc.setTextColor(217, 119, 6);
      } else {
        chStatus = "UNINITIATED / NA";
        doc.setTextColor(148, 163, 184);
      }
      doc.setFont('helvetica', 'bold');
      doc.text(chStatus, marginX + 135, currentY + 4.8);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${item.score}%`, marginX + 170, currentY + 4.8);

      currentY += 7;
    });

    // 6. Action Plan list header
    currentY += 4;
    checkPageOverflow(25);

    doc.setFillColor(0, 47, 86); // Navy
    doc.rect(marginX, currentY, contentWidth, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("COMPILED PLAN OF ACTION & CORRECTIVE DIRECTIVES (NC / PC STANDARDS)", marginX + 4, currentY + 6);
    currentY += 9 + 4;

    if (gapCriteriaList.length === 0) {
      checkPageOverflow(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(16, 124, 65);
      doc.text("PERFECT ACCORDANCE REALIZED", marginX + 5, currentY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("No gaps or corrective action plans are pending. All evaluated standards comply 100% with eMitra regulations.", marginX + 5, currentY + 11);
      currentY += 15;
    } else {
      chapters.forEach(chapter => {
        const chGaps = gapCriteriaList.filter(g => g.chapterId === chapter.id);
        if (chGaps.length === 0) return;

        checkPageOverflow(15);
        currentY += 2;
        doc.setFillColor(242, 169, 0);
        doc.rect(marginX, currentY, 4, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(0, 47, 86);
        doc.text(`${chapter.id} - ${chapter.name.toUpperCase()}`, marginX + 7, currentY + 4.5);
        
        currentY += 8;

        chGaps.forEach(g => {
          const ans = currentSession.answers[g.id]!;
          const displayCode = g.code && g.code.trim().length > 0 ? g.code : `${g.chapterId} Criterion`;
          
          // Question text wrap
          const wrappedQuestion = doc.splitTextToSize(`[${displayCode}] ${g.question}`, contentWidth - 8);
          // Action item wrap
          const actionTextRaw = g.defaultActionItem || ans.customActionItem || 'No specific corrective action item configured.';
          const wrappedAction = doc.splitTextToSize(`Recommended Action: ${actionTextRaw}`, contentWidth - 16);
          
          const questionLines = wrappedQuestion.length;
          const actionLines = wrappedAction.length;
          
          // Notes lines if safe
          let noteLinesWrapped: string[] = [];
          if (ans.notes && ans.notes.trim()) {
            noteLinesWrapped = doc.splitTextToSize(`Notes: ${ans.notes}`, contentWidth - 16);
          }

          // Calculate height required for this block
          let neededBlockHeight = 4 + (questionLines * 4) + 2 + (actionLines * 3.5) + 4;
          if (noteLinesWrapped.length > 0) {
            neededBlockHeight += (noteLinesWrapped.length * 3.5) + 2;
          }
          if (ans.priority || ans.targetDate) {
            neededBlockHeight += 6;
          }

          // Check if block fits, otherwise push to next page
          checkPageOverflow(neededBlockHeight);

          // Draw a soft background card for the corrective plan
          doc.setFillColor(250, 251, 253);
          doc.setDrawColor(226, 232, 240);
          doc.rect(marginX, currentY, contentWidth, neededBlockHeight, 'FD');

          let itemY = currentY + 5;
          
          // Render Question header with Compliance Status indicator label
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(15, 23, 42); // slate-900

          for (let m = 0; m < questionLines; m++) {
            doc.text(wrappedQuestion[m], marginX + 4, itemY);
            itemY += 4;
          }

          // Status Badge label
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          if (ans.response === 'non_compliant') {
            doc.setFillColor(254, 226, 226); // Rose bg
            doc.setTextColor(220, 38, 38);   // Red text
            doc.rect(pageWidth - marginX - 35, currentY + 2.5, 31, 5, 'F');
            doc.text("NON-COMPLIANT", pageWidth - marginX - 32, currentY + 6.1);
          } else {
            doc.setFillColor(254, 243, 199); // Light Yellow
            doc.setTextColor(180, 83, 9);    // Orange
            doc.rect(pageWidth - marginX - 35, currentY + 2.5, 31, 5, 'F');
            doc.text("PARTIAL COMPLIANT", pageWidth - marginX - 33, currentY + 6.1);
          }

          // SOP Corrective Action text
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(51, 65, 85); // slate-700
          
          itemY += 1;
          for (let k = 0; k < actionLines; k++) {
            doc.text(wrappedAction[k], marginX + 8, itemY);
            itemY += 3.5;
          }

          // Notes
          if (noteLinesWrapped.length > 0) {
            itemY += 1;
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 116, 139); // slate-500
            for (let j = 0; j < noteLinesWrapped.length; j++) {
              doc.text(noteLinesWrapped[j], marginX + 8, itemY);
              itemY += 3.5;
            }
          }

          // Priority & Target Date meta if specified
          if (ans.priority || ans.targetDate) {
            itemY += 1.5;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(71, 85, 105);
            
            const pText = ans.priority ? `Priority: ${ans.priority.toUpperCase()}` : `Priority: NOT ASSIGNED`;
            const dText = ans.targetDate ? `Target Date: ${ans.targetDate}` : `Target Date: NOT ASSIGNED`;
            const sText = ans.status ? `Status: ${ans.status.toUpperCase()}` : `Status: PENDING`;

            doc.text(`${pText}  |  ${dText}  |  ${sText}`, marginX + 8, itemY);
          }

          currentY += neededBlockHeight + 3;
        });
      });
    }

    // Save PDF Download
    const fileName = `NABH_Accreditation_Report_${currentSession.hospitalName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="space-y-8" id="result-page-card">
      {/* 1. Header with diagnostics info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded font-mono uppercase tracking-wider">
            READINESS REPORT EXPORT
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#002f56] mt-2.5 tracking-tight font-sans">
            Accreditation Readiness Overview
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Overview generated for <strong className="text-slate-850">{currentSession.hospitalName}</strong> ({currentSession.city}). Updated on {new Date(currentSession.updatedAt).toLocaleDateString()}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 md:self-center">
          <button
            onClick={generatePDFReport}
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg shadow-sm cursor-pointer transition-all bg-[#002f56] hover:bg-[#001f3a] text-white border-b-2 border-[#f2a900]"
            id="dl-pdf-report"
          >
            <FileText className="w-4 h-4 text-[#f2a900]" /> Download PDF Report
          </button>
          <button
            onClick={downloadActionPlanFile}
            disabled={totalGapsCount === 0}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs cursor-pointer transition-all ${
              totalGapsCount === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-white hover:bg-slate-50 text-[#002f56] border border-slate-300'
            }`}
            id="dl-action-plan-main"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export Corrective Plan (.TXT)
          </button>
        </div>
      </div>

      {/* 2. Numerical Score Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-widgets-grid">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-cyan-600" />
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Coverage</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {fullyCompliantCount + partiallyCompliantCount + nonCompliantCount + notApplicableCount}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ {totalQuestionsCount}</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-cyan-600 h-full rounded-full"
              style={{ width: `${((fullyCompliantCount + partiallyCompliantCount + nonCompliantCount + notApplicableCount) / totalQuestionsCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500" />
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Fully Compliant</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-black text-emerald-600 font-mono">
              {fullyCompliantCount}
            </span>
            <span className="text-xs text-slate-400 font-bold">standards</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[9px] text-emerald-600 font-extrabold uppercase font-mono">
            <ShieldCheck className="w-3.5 h-3.5" /> Full adherence
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Identify Gaps</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-black text-rose-600 font-mono">
              {totalGapsCount}
            </span>
            <span className="text-xs text-slate-400 font-bold">milestones</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[9px] text-rose-500 font-extrabold uppercase font-mono">
            <AlertTriangle className="w-3.5 h-3.5" /> Task required
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-400" />
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Excluded</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-black text-slate-500 font-mono">
              {notApplicableCount}
            </span>
            <span className="text-xs text-slate-400 font-bold">exempt</span>
          </div>
          <div className="mt-2.5 text-[9px] text-slate-400 font-extrabold uppercase font-mono leading-relaxed">
            Not Applicable
          </div>
        </div>
      </div>

      {/* 3. Recharts Graphics section */}
      <DashboardCharts data={chapterAnalytics} overallScore={parsedOverallScore} />

      {/* 4. Action plan items list grouped carefully by chapter */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm" id="compiled-action-tasks-panel">
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-200 pb-4">
          <ListTodo className="w-5 h-5 text-cyan-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Compiled Plan of Action Tracker</h3>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider font-mono">Immediate action directives grouped by standard chapters</p>
          </div>
        </div>

        {gapCriteriaList.length === 0 ? (
          <div className="p-8 text-center bg-emerald-50/50 border border-dashed border-emerald-200 rounded-lg" id="clean-action-plans">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-emerald-800 font-mono">Perfect Accordance Realized!</p>
            <p className="text-xs text-emerald-600 mt-1">No gaps or action plans are currently pending tracking. Hospital matches hospital accreditation standards perfectly.</p>
          </div>
        ) : (
          <div className="space-y-6" id="gaps-by-chapters">
            {chapters.map(chapter => {
              const chGaps = gapCriteriaList.filter(g => g.chapterId === chapter.id);
              if (chGaps.length === 0) return null;

              return (
                <div key={chapter.id} className="space-y-3" id={`gap-section-${chapter.id}`}>
                  <div className="flex items-center gap-2 bg-slate-950 text-white px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest font-mono">
                    <span className="bg-cyan-600 text-white px-2 py-0.5 rounded text-[10px] font-black">{chapter.id}</span>
                    <span className="truncate">{chapter.name}</span>
                    <span className="ml-auto bg-slate-800 text-[10px] text-slate-300 font-bold px-2 py-0.5 rounded">
                      {chGaps.length} ACTION REQS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 pl-1">
                    {chGaps.map(g => {
                      const ans = currentSession.answers[g.id]!;
                      
                      return (
                        <div
                          key={g.id}
                          className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-3 text-xs font-medium relative"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-slate-700 whitespace-nowrap bg-white border border-slate-200 px-2.5 py-0.5 rounded font-mono text-[10px]">
                                {g.code && g.code.trim().length > 0 
                                  ? g.code 
                                  : (() => {
                                      const chapterCriteria = criteria.filter(item => item.chapterId === g.chapterId);
                                      const idx = chapterCriteria.findIndex(item => item.id === g.id) + 1;
                                      return `${g.chapterId} #${idx}`;
                                    })()
                                }
                              </span>
                              <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                                ans.response === 'non_compliant'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200/60'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200/60'
                              }`}>
                                {ans.response === 'non_compliant' ? 'NC' : 'PC'}
                              </span>
                            </div>

                            <p className="font-bold text-slate-950 text-xs sm:text-sm">{g.question}</p>

                            <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Configured Corrective SOP Action</span>
                              <div className="text-slate-700 text-xs leading-relaxed">
                                {g.defaultActionItem || ans.customActionItem ? (
                                  formatActionPlan(g.defaultActionItem || ans.customActionItem || '')
                                ) : (
                                  'No specific corrective action item configured by administrator.'
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

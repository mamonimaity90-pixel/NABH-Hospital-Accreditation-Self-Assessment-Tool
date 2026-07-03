/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Chapter, AssessmentCriterion, EvaluationSession, CriterionAnswer } from '../types';
import { Plus, Upload, Download, Trash, Edit, CheckCircle, ShieldAlert, ArrowDownWideNarrow, ListPlus, CircleAlert, FileText, X } from 'lucide-react';

interface AdminDashboardProps {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  criteria: AssessmentCriterion[];
  setCriteria: React.Dispatch<React.SetStateAction<AssessmentCriterion[]>>;
  sessions: EvaluationSession[];
  onResetToDefault: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  currentUserEmail?: string;
  allowedAdminEmails?: string[];
  onAddAdminEmail?: (email: string) => void;
  onRemoveAdminEmail?: (email: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  chapters,
  setChapters,
  criteria,
  setCriteria,
  sessions,
  onResetToDefault,
  onSelectSession,
  onDeleteSession,
  currentUserEmail = '',
  allowedAdminEmails = [],
  onAddAdminEmail,
  onRemoveAdminEmail
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'upload' | 'participants' | 'security'>('questions');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');

  // Custom confirmation dialog state
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Question editing modal states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editCriterion, setEditCriterion] = useState<Partial<AssessmentCriterion> | null>(null);

  // New resource state inside modal uploader
  const [newResTitle, setNewResTitle] = useState('');
  const [newResFileName, setNewResFileName] = useState('');
  const [newResDesc, setNewResDesc] = useState('');
  const [newResMarkdown, setNewResMarkdown] = useState('');
  const [showAddResource, setShowAddResource] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // 1. Download Current Standards as CSV Template
  const downloadCsvTemplate = () => {
    const csvContent = criteria.map(c => ({
      'Chapter Code (AAC/COP/MOM etc)': c.chapterId,
      'Criterion Number (e.g. AAC.1)': c.code,
      'Assessment Question Text': c.question,
      'Standard Detailed Description': c.description,
      'Predefined Action Item Guidance': c.defaultActionItem
    }));

    const worksheet = XLSX.utils.json_to_sheet(csvContent);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'NABH_Criteria_Template');
    XLSX.writeFile(workbook, 'NABH_Hospital_Accreditation_Assessment_Template.xlsx');
    triggerSuccess('Assessment Excel draft downloaded. Fill it out and upload it below.');
  };

  // 2. Handle Spreadsheet File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet) as Record<string, string>[];

        if (rawJson.length === 0) {
          triggerError('The uploaded Excel sheet contains no rows.');
          return;
        }

        // Validate headers or grab indices
        const parsedCriteria: AssessmentCriterion[] = rawJson.map((row, idx) => {
          const chapterCode = String(row['Chapter Code (AAC/COP/MOM etc)'] || row['Chapter Code'] || row['chapterId'] || '').trim().toUpperCase();
          const criterionCode = String(row['Criterion Number (e.g. AAC.1)'] || row['Criterion Code'] || row['code'] || '').trim();
          const questionText = String(row['Assessment Question Text'] || row['QuestionText'] || row['question'] || '').trim();
          const descriptionText = String(row['Standard Detailed Description'] || row['Description'] || row['description'] || '').trim();
          const actionItemText = String(row['Predefined Action Item Guidance'] || row['DefaultActionItem'] || row['defaultActionItem'] || '').trim();

          const currentChapter = chapters.find(ch => ch.id === chapterCode);

          if (!chapterCode || !questionText) {
            throw new Error(`Row ${idx + 2} is missing required fields (Chapter Code or Question Text).`);
          }

          return {
            id: `UPLOAD_${chapterCode}_${idx}`,
            chapterId: chapterCode,
            code: criterionCode,
            question: questionText,
            description: descriptionText,
            defaultActionItem: actionItemText || 'Action plan required.',
            helpResources: criterionCode
              ? [
                  {
                    id: `res_uploaded_${idx}`,
                    title: `${criterionCode} Reference Guidelines`,
                    fileName: `guidelines_${criterionCode.toLowerCase().replace('.', '_')}.md`,
                    fileType: 'Markdown Document',
                    description: `Default resource draft for standards ${criterionCode}`,
                    contentMarkdown: `# Guidelines on ${criterionCode}\n\nReview hospital operational files to verify that all conditions outlined are met according to standard accreditation protocol guidelines.`
                  }
                ]
              : []
          };
        });

        // Save to state
        setCriteria(parsedCriteria);
        triggerSuccess(`Successfully imported ${parsedCriteria.length} criteria from spreadsheet! Applet database updated.`);
      } catch (err: any) {
        console.error(err);
        triggerError(err.message || 'Error processing sheet. Ensure layout matches template.');
      }
    };

    reader.readAsBinaryString(file);
  };

  // 3. Export Participant Session Scores to Excel
  const exportAnonymizedData = () => {
    if (sessions.length === 0) {
      triggerError('No hospital logs available to export.');
      return;
    }

    const reportRows = sessions.map((s, idx) => {
      // Calculate scores dynamically
      const chapterScores: Record<string, string> = {};

      chapters.forEach(ch => {
        const chCriteria = criteria.filter(c => c.chapterId === ch.id);
        let applicableCount = 0;
        let points = 0;

        chCriteria.forEach(c => {
          const ans = s.answers[c.id];
          if (ans) {
            if (ans.response !== 'not_applicable') {
              applicableCount++;
              if (ans.response === 'compliant') points += 10;
              else if (ans.response === 'partially_compliant') points += 5;
            }
          }
        });

        const pct = applicableCount > 0 ? (points / (applicableCount * 10)) * 100 : 0;
        chapterScores[`Chapter ${ch.id} Score (%)`] = pct.toFixed(0);
      });

      // Calculate overall score
      let totalPoints = 0;
      let totalApplicable = 0;
      criteria.forEach(c => {
        const ans = s.answers[c.id];
        if (ans && ans.response !== 'not_applicable') {
          totalApplicable++;
          if (ans.response === 'compliant') totalPoints += 10;
          else if (ans.response === 'partially_compliant') totalPoints += 5;
        }
      });
      const overallPct = totalApplicable > 0 ? (totalPoints / (totalApplicable * 10)) * 100 : 0;

      // Simple action list count
      const gapCount = (Object.values(s.answers) as CriterionAnswer[]).filter(a => a.response === 'non_compliant' || a.response === 'partially_compliant').length;

      return {
        'Submission ID': `NABH-SUB-${1000 + idx}`,
        'Hospital Name': s.hospitalName,
        'Contact Number': s.contactNumber,
        'Email ID': s.emailId,
        'City': s.city,
        'Date Submitted': new Date(s.updatedAt).toLocaleDateString(),
        'Overall Score (%)': overallPct.toFixed(1),
        'Total Critical Gaps': gapCount,
        ...chapterScores
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(reportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hospital_Submissions');
    XLSX.writeFile(workbook, 'NABH_Hospital_Responses_Report.xlsx');
    triggerSuccess(`Successfully exported complete compliance metrics for ${sessions.length} hospitals.`);
  };

  // Create or save question
  const saveCriterionChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCriterion.chapterId || !editCriterion.question) {
      triggerError('Please fill out all mandatory details.');
      return;
    }

    const cleanCode = (editCriterion.code || '').trim();

    if (editCriterion.id) {
      // Edit existing
      setCriteria(prev => prev.map(c => c.id === editCriterion.id ? ({
        ...c,
        ...editCriterion,
        code: cleanCode
      } as AssessmentCriterion) : c));
      triggerSuccess(`Standard question updated successfully.`);
    } else {
      // Add new
      const newCrit: AssessmentCriterion = {
        id: `NEW_CRIT_${Date.now()}`,
        chapterId: editCriterion.chapterId,
        code: cleanCode,
        question: editCriterion.question,
        description: editCriterion.description || '',
        defaultActionItem: editCriterion.defaultActionItem || '',
        helpResources: []
      };
      setCriteria(prev => [...prev, newCrit]);
      triggerSuccess(`New question successfully appended.`);
    }

    setIsEditing(false);
    setEditCriterion(null);
  };

  const removeCriterion = (id: string, code: string) => {
    setConfirmAction({
      title: 'Delete Standard Question',
      message: `Are you sure you want to permanently delete standard question "${code || 'unnamed'}"? This will remove this item from all assessment sessions immediately.`,
      onConfirm: () => {
        setCriteria(prev => prev.filter(c => c.id !== id));
        triggerSuccess(`Standard question ${code || ''} has been successfully deleted.`);
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8" id="admin-panel-card">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-900 rounded text-cyan-400 font-mono font-black text-[10px] tracking-widest uppercase">Console</span>
            NABH Hospital Accreditation Console
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Configure audit checklists, manage dynamic resource sheets, and compile collective compliance datasets.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onResetToDefault}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded cursor-pointer transition-colors"
          >
            Reset to default 10 chapters
          </button>
        </div>
      </div>

      {/* Global alert feedback */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in font-mono">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage.toUpperCase()}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-150 text-rose-800 text-xs font-medium flex items-center gap-2 animate-fade-in font-mono">
          <CircleAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage.toUpperCase()}</span>
        </div>
      )}

      {/* Sub tabs configuration */}
      <div className="flex gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg max-w-lg mb-8">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
            activeTab === 'questions' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Checklists
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
            activeTab === 'upload' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          excel import
        </button>
        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
            activeTab === 'participants' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          history logs
        </button>
        {currentUserEmail === 'mamoni.maity90@gmail.com' && (
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
              activeTab === 'security' ? 'bg-[#002f56] text-[#f2a900] shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🛡️ Admins List
          </button>
        )}
      </div>

      {/* Mode Views */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div>
              <h3 className="font-semibold text-slate-800">Review Matrix Standards</h3>
              <p className="text-xs text-slate-400">Total configured criteria: {criteria.length} items</p>
            </div>
            <button
              onClick={() => {
                setEditCriterion({ chapterId: chapters[0]?.id || 'AAC', code: '', question: '', description: '', defaultActionItem: '', helpResources: [] });
                setIsEditing(true);
                setShowAddResource(false);
                setNewResTitle('');
                setNewResFileName('');
                setNewResDesc('');
                setNewResMarkdown('');
              }}
              className="px-3.5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg flex items-center gap-1.5 hover:bg-blue-500 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          {/* Table display list */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-slate-50 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Chapter</th>
                  <th className="py-3 px-4">Criterion Question</th>
                  <th className="py-3 px-4">Core Recommendations Action</th>
                  <th className="py-3 px-4 text-center">Resources</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criteria.map((c) => {
                  const chapterCriteria = criteria.filter(item => item.chapterId === c.chapterId);
                  const seqNum = chapterCriteria.findIndex(item => item.id === c.id) + 1;
                  const displayCode = c.code && c.code.trim().length > 0 ? c.code : `${c.chapterId} #${seqNum}`;
                  
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-800 whitespace-nowrap">{displayCode}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold text-[10px]">
                        {c.chapterId}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-sm">
                      <div className="font-semibold text-slate-800">{c.question}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{c.description}</div>
                    </td>
                    <td className="py-4 px-4 max-w-xs text-slate-600 truncate">{c.defaultActionItem}</td>
                    <td className="py-4 px-4 text-center text-[10px] font-bold text-slate-400">
                      {c.helpResources?.length || 0} docs
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditCriterion({
                              ...c,
                              helpResources: c.helpResources || []
                            });
                            setIsEditing(true);
                            setShowAddResource(false);
                            setNewResTitle('');
                            setNewResFileName('');
                            setNewResDesc('');
                            setNewResMarkdown('');
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeCriterion(c.id, c.code)}
                          className="p-1.5 hover:bg-red-50 text-rose-600 rounded cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 text-base mb-2">Accreditation Guidelines File Import</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Maintain standards up-to-date by feeding compliance lists directly from Excel spreadsheets or CSV sheets. It matches database points using clear headers and replaces old standard structures dynamically.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-dashed border-slate-200">
              {/* Left pane: Guidelines card */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Required Spreadsheet Columns</h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>
                    <span><strong>Chapter Code</strong>: &lsquo;AAC&rsquo;, &lsquo;COP&rsquo;, &lsquo;MOM&rsquo;, etc. Matches established structural segments.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>
                    <span><strong>Criterion Number</strong> (Optional): e.g. &lsquo;AAC.1&rsquo;, &lsquo;COP.2&rsquo; codes. If left blank, these are dynamically sequenced in numeric order.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>
                    <span><strong>Assessment Question Text</strong>: The critical checkbox question audited.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>
                    <span><strong>Standard Detailed Description</strong> (Optional): Brief guidance notes (displays as a clean info tooltip next to the question).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></span>
                    <span><strong>Predefined Action Item Guidance</strong>: Custom corrective tasks triggered if non-compliant.</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={downloadCsvTemplate}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500 underline cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Standard Template (.xlsx)
                  </button>
                </div>
              </div>

              {/* Right pane: Upload File Drop Box */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-xs font-semibold text-slate-700">Drag & Drop Excel Criteria Sheet</p>
                <p className="text-[10px] text-slate-400 mt-1 mb-4">Accepts files terminating in .xlsx, .xls or .csv</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  Browse Files
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm gap-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wide">Submitted Hospital Assessments</h3>
              <p className="text-xs text-slate-500">Total direct self-assessments submitted: {sessions.length}</p>
            </div>
            <button
              onClick={exportAnonymizedData}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-500 flex items-center gap-1.5 self-start cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" /> Export Complete Excel Report
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-slate-50 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Hospital Details</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4 text-center">Gaps Resolved</th>
                  <th className="py-3 px-4 text-center">Compliance Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((s, idx) => {
                  // Calculate overall score
                  let totalPoints = 0;
                  let totalApplicable = 0;
                  criteria.forEach(c => {
                    const ans = s.answers[c.id];
                    if (ans && ans.response !== 'not_applicable') {
                      totalApplicable++;
                      if (ans.response === 'compliant') totalPoints += 10;
                      else if (ans.response === 'partially_compliant') totalPoints += 5;
                    }
                  });
                  const overallPct = totalApplicable > 0 ? (totalPoints / (totalApplicable * 10)) * 100 : 0;
                  const gaps = (Object.values(s.answers) as CriterionAnswer[]).filter(a => a.response === 'non_compliant' || a.response === 'partially_compliant').length;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-800 uppercase text-[11px]">{s.hospitalName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.city}</div>
                      </td>
                      <td className="py-4 px-4 text-[11px]">
                        <div className="text-slate-600 font-mono font-semibold">{s.contactNumber}</div>
                        <div className="text-slate-400 mt-0.5">{s.emailId}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">{new Date(s.updatedAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-center">
                        {gaps === 0 ? (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-extrabold text-[10px] font-mono border border-emerald-200">FC (0 Gaps)</span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold text-[10px] font-mono border border-amber-200">{gaps} Gaps Pending</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-slate-800 text-xs font-mono">
                        <span className={overallPct >= 80 ? 'text-emerald-600' : overallPct >= 50 ? 'text-amber-500' : 'text-rose-500'}>
                          {overallPct.toFixed(0)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => onSelectSession(s.id)}
                            className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-500 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-emerald-100" /> View Report
                          </button>
                          <button
                            onClick={() => {
                              setConfirmAction({
                                title: 'Delete Hospital Submission',
                                message: `Are you sure you want to permanently delete the self-assessment response for "${s.hospitalName}"? This action cannot be undone.`,
                                onConfirm: () => {
                                  onDeleteSession(s.id);
                                  triggerSuccess(`Submission for "${s.hospitalName}" deleted successfully.`);
                                }
                              });
                            }}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded cursor-pointer transition-colors"
                            title="Delete Submission"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentUserEmail === 'mamoni.maity90@gmail.com' && activeTab === 'security' && (
        <div className="space-y-6 animate-fade-in" id="security-control-panel">
          <div className="bg-[#002f56]/5 p-6 rounded-2xl border border-[#002f56]/10 shadow-inner">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wide">
              <span className="p-1 bg-[#002f56] rounded text-[#f2a900] text-xs">🛡️</span>
              Primary Owner Access Control
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Welcome, <strong className="text-[#002f56]">Dr. Mamoni Maity (mamoni.maity90@gmail.com)</strong>. As the primary creator, you hold immutable ownership. You are authorized to grant or revoke administrative rights to custom email IDs. Other administrators can customize standard criteria checklists, update questions, or import criteria, while normal visitors are fully gated to hospital dashboard panels.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Add Admin Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b pb-2">Grant Admin Privileges</h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const targetEmail = newAdminEmailInput.trim().toLowerCase();
                  if (!targetEmail) return;
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
                    setErrorMessage('Please enter a valid email address.');
                    setTimeout(() => setErrorMessage(null), 3000);
                    return;
                  }
                  if (allowedAdminEmails.includes(targetEmail)) {
                    setErrorMessage(`${targetEmail} already holds administrator credentials.`);
                    setTimeout(() => setErrorMessage(null), 3000);
                    return;
                  }
                  onAddAdminEmail?.(targetEmail);
                  setNewAdminEmailInput('');
                  triggerSuccess(`Admin credentials granted successfully to ${targetEmail}`);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">New Admin Email ID</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. colleague@hospital.org"
                    value={newAdminEmailInput}
                    onChange={e => setNewAdminEmailInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 text-xs font-mono outline-hidden focus:border-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#002f56] hover:bg-[#002f56]/90 text-[#f2a900] font-black uppercase text-[10px] tracking-wider rounded-lg transition-colors cursor-pointer border border-[#f2a900]/20 animate-none"
                >
                  Grant Administrative Rights
                </button>
              </form>
            </div>

            {/* Right: Allowed Admins List */}
            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b pb-2">Authorized Administrative Registry</h4>
              <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1">
                {allowedAdminEmails.map((email) => {
                  const isPrimaryOwner = email === 'mamoni.maity90@gmail.com';
                  return (
                    <div key={email} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${isPrimaryOwner ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                        <div className="font-mono text-xs font-semibold text-slate-700 break-all">{email}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isPrimaryOwner ? (
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                            Primary Creator
                          </span>
                        ) : (
                          <>
                            <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded text-[9px] font-semibold uppercase tracking-wider font-mono">
                              Authorized Admin
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmAction({
                                  title: 'Revoke Admin Privileges',
                                  message: `Are you sure you want to permanently revoke administrative access for "${email}"? They will lose all rights to modify questionnaires or view submissions immediately.`,
                                  onConfirm: () => {
                                    onRemoveAdminEmail?.(email);
                                    triggerSuccess(`Revoked administrative access for ${email}`);
                                  }
                                });
                              }}
                              className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                              title="Revoke Admin Access"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal popup */}
      {isEditing && editCriterion && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden transform animate-fade-in my-8">
            <div className="bg-slate-900 text-white p-5">
              <h3 className="font-bold text-base">
                {editCriterion.id ? `Edit Criterion ${editCriterion.code}` : 'Register New Criterion Standard'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Provide reference conditions to help hospitals benchmark pre-requisites.</p>
            </div>

            <form onSubmit={saveCriterionChange} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Chapter Allocation *</label>
                  <select
                    value={editCriterion.chapterId || ''}
                    onChange={e => setEditCriterion({ ...editCriterion, chapterId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden bg-white"
                  >
                    {chapters.map(ch => (
                      <option key={ch.id} value={ch.id}>[{ch.id}] {ch.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Criterion Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. AAC.4"
                    value={editCriterion.code || ''}
                    onChange={e => setEditCriterion({ ...editCriterion, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Question Sentence *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Does the facility provide uniforms and hygiene logbooks?"
                  value={editCriterion.question || ''}
                  onChange={e => setEditCriterion({ ...editCriterion, question: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Brief Description / Tooltip Guidance (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief guidance info details (will reveal inside a hover/tap tooltip next to the question)."
                  value={editCriterion.description || ''}
                  onChange={e => setEditCriterion({ ...editCriterion, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1.5 uppercase tracking-wider text-[10px]">Action Item Recommendation Trigger</label>
                <textarea
                  rows={2}
                  placeholder="Install guidelines charts. Document personnel safety file templates..."
                  value={editCriterion.defaultActionItem || ''}
                  onChange={e => setEditCriterion({ ...editCriterion, defaultActionItem: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-hidden"
                />
              </div>

              {/* Attached Reference Documents & SOP Templates */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold uppercase tracking-wider text-[10px] text-cyan-700">
                    SOP Reference Documents & Guidelines
                  </label>
                  <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-500 font-bold">
                    {(editCriterion.helpResources || []).length} Document(s)
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto bg-slate-50 p-3 rounded-lg border border-slate-150">
                  {((editCriterion.helpResources || [])).map((res) => (
                    <div key={res.id} className="flex justify-between items-center bg-white border border-slate-100 rounded p-2 text-[11px] hover:border-slate-300 transition-colors">
                      <div className="min-w-0 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-slate-800 truncate leading-tight">{res.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{res.fileName}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditCriterion(prev => prev ? {
                            ...prev,
                            helpResources: (prev.helpResources || []).filter(item => item.id !== res.id)
                          } : null);
                        }}
                        className="p-1 hover:bg-rose-50 text-rose-500 rounded cursor-pointer transition-colors"
                        title="Delete reference file"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {(editCriterion.helpResources || []).length === 0 && (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">No reference SOP documents linked yet. Upload or configure one below.</p>
                  )}
                </div>

                {/* Switch to show uploader details */}
                {!showAddResource ? (
                  <button
                    type="button"
                    onClick={() => setShowAddResource(true)}
                    className="w-full py-2 border border-dashed border-blue-400 hover:border-blue-600 bg-blue-50/20 text-blue-700 hover:text-blue-800 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Upload File (.pdf, .doc, .excel)
                  </button>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative animate-fade-in text-[11px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
                      <span className="font-bold text-slate-700">Add SOP Reference Document</span>
                      <button
                        type="button"
                        onClick={() => setShowAddResource(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-slate-600 font-bold uppercase text-[9px]">Document Name / Display Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. ICU Hygiene SOP Standard"
                        value={newResTitle}
                        onChange={e => setNewResTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded outline-hidden"
                      />
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                      <p className="font-bold text-slate-600 mb-0.5">📂 Select Administrative Document</p>
                      <p className="text-[10px] text-slate-400 mb-2.5 leading-relaxed">PDF, DOC, DOCX, XLS, or XLSX up to 10MB</p>
                      
                      <label
                        htmlFor="local-doc-f-pkl"
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-md cursor-pointer hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 font-bold text-[10px]"
                      >
                        <Upload className="w-3 h-3 text-cyan-400" /> Choose Document
                      </label>
                      <input
                        type="file"
                        id="local-doc-f-pkl"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const ext = file.name.split('.').pop()?.toLowerCase() || '';
                            let detectedType = 'Reference File';
                            if (ext === 'pdf') {
                              detectedType = 'PDF Document';
                            } else if (ext === 'doc' || ext === 'docx') {
                              detectedType = 'Word Document';
                            } else if (ext === 'xls' || ext === 'xlsx') {
                              detectedType = 'Excel Spreadsheet';
                            }

                            setNewResFileName(file.name);
                            setNewResDesc(detectedType);

                            // Auto-generate clean title if not already provided
                            if (!newResTitle.trim()) {
                              const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
                              setNewResTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
                            }
                            
                            // Mock content representation inside helpResources for downsteam view/download features
                            setNewResMarkdown(
                              `[Regulatory Reference Document Content]\n` +
                              `===============================================\n` +
                              `File Name: ${file.name}\n` +
                              `Standard Designation: ${detectedType}\n` +
                              `===============================================\n\n` +
                              `This document is verified and linked to this audit checklist item for executive accreditation surveys.`
                            );
                            
                            triggerSuccess(`Attached file "${file.name}"!`);
                          }
                        }}
                        className="hidden"
                      />

                      {newResFileName && (
                        <div className="mt-2.5 px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span className="truncate max-w-[180px]">{newResFileName} ({newResDesc})</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-1.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddResource(false);
                          setNewResTitle('');
                          setNewResFileName('');
                          setNewResDesc('');
                          setNewResMarkdown('');
                        }}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newResTitle.trim()) {
                            triggerError('Please enter a display name for the document.');
                            return;
                          }
                          if (!newResFileName.trim()) {
                            triggerError('Please upload a PDF, Word, or Excel document.');
                            return;
                          }

                          const finalName = newResFileName.trim();
                          const resourceObj = {
                            id: `res_custom_${Date.now()}`,
                            title: newResTitle.trim(),
                            fileName: finalName,
                            fileType: newResDesc.trim() || 'Reference File',
                            description: `Administrative guidelines for ${newResTitle.trim()}`,
                            contentMarkdown: newResMarkdown.trim() || `# ${newResTitle.trim()}\n\nRefer to attached document filename ${finalName} for comprehensive protocols.`
                          };

                          setEditCriterion(prev => prev ? {
                            ...prev,
                            helpResources: [...(prev.helpResources || []), resourceObj]
                          } : null);

                          setNewResTitle('');
                          setNewResFileName('');
                          setNewResDesc('');
                          setNewResMarkdown('');
                          setShowAddResource(false);
                          triggerSuccess('Document attached successfully!');
                        }}
                        className="px-4 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold cursor-pointer"
                      >
                        Link Document
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditCriterion(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Standard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern In-App Custom Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in" id="custom-admin-confirm-modal">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="bg-[#002f56] px-6 py-4 border-b border-rose-500/30 flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">{confirmAction.title}</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {confirmAction.message}
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmAction.onConfirm();
                    setConfirmAction(null);
                  }}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

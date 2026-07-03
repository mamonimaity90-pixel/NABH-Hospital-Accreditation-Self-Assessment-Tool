/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Chapter, AssessmentCriterion, EvaluationSession, CriterionAnswer } from './types';
import { DEFAULT_CHAPTERS, DEFAULT_CRITERIA, MOCK_EVALUATION_SESSIONS } from './data';
import { AssessmentLayout } from './components/AssessmentLayout';
import { ResultSummary } from './components/ResultSummary';
import { AdminDashboard } from './components/AdminDashboard';
import {
  ShieldAlert,
  ClipboardCheck,
  BarChart3,
  Settings2,
  ListTodo,
  Plus,
  Network,
  Users2,
  Building,
  Activity,
  Award
} from 'lucide-react';

export default function App() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>([]);
  const [sessions, setSessions] = useState<EvaluationSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  // User identity / Active Profile session
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return localStorage.getItem('nabh_current_user_email') || '';
  });

  const [currentUserProfile, setCurrentUserProfile] = useState<any>(() => {
    const email = localStorage.getItem('nabh_current_user_email');
    if (email) {
      const emailLower = email.trim().toLowerCase();
      const raw = localStorage.getItem('nabh_profile_' + emailLower);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch (e) {}
      }
      const legacyRaw = localStorage.getItem('nabh_current_user_profile');
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          if (parsed && parsed.emailId && parsed.emailId.trim().toLowerCase() === emailLower) {
            return parsed;
          }
        } catch (e) {}
      }
    }
    return null;
  });

  const [accessEmailInput, setAccessEmailInput] = useState<string>('');

  const [allowedAdminEmails, setAllowedAdminEmails] = useState<string[]>(() => {
    const raw = localStorage.getItem('nabh_allowed_admin_emails');
    let emails: string[] = ['mamoni.maity90@gmail.com'];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          emails = parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    if (!emails.includes('mamoni.maity90@gmail.com')) {
      emails.unshift('mamoni.maity90@gmail.com');
    }
    return emails;
  });

  // Tab views state
  const [activeTab, setActiveTab] = useState<'checklist' | 'dashboard' | 'admin'>('checklist');

  // Input state for starting new session
  const [newHospitalName, setNewHospitalName] = useState<string>('');
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactNumber, setNewContactNumber] = useState<string>('');
  const [newEmailId, setNewEmailId] = useState<string>('');
  const [newCity, setNewCity] = useState<string>('');
  const [showSessionCreator, setShowSessionCreator] = useState<boolean>(false);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  // Derive Admin Access
  const isUserAdmin = currentUserEmail ? allowedAdminEmails.map(e => e.trim().toLowerCase()).includes(currentUserEmail.trim().toLowerCase()) : false;

  // Admin authentication states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const email = localStorage.getItem('nabh_current_user_email') || '';
    const rawAdmins = localStorage.getItem('nabh_allowed_admin_emails');
    let admins = ['mamoni.maity90@gmail.com'];
    if (rawAdmins) {
      try {
        const parsed = JSON.parse(rawAdmins);
        if (Array.isArray(parsed)) admins = parsed;
      } catch (e) {}
    }
    return email ? admins.map(e => e.toLowerCase()).includes(email.toLowerCase()) : false;
  });
  const [adminPasscodeInput, setAdminPasscodeInput] = useState<string>('');
  const [adminLoginError, setAdminLoginError] = useState<string>('');

  // Initialize data from LocalStorage or pre-seeding
  useEffect(() => {
    const storedChapters = localStorage.getItem('nabh_chapters');
    const storedCriteria = localStorage.getItem('nabh_criteria');
    const storedSessions = localStorage.getItem('nabh_sessions');
    const storedActiveSessionId = localStorage.getItem('nabh_active_session_id');

    let migrated = false;

    let loadedChapters = DEFAULT_CHAPTERS;
    if (storedChapters) {
      try {
        const parsed = JSON.parse(storedChapters);
        if (Array.isArray(parsed)) {
          loadedChapters = parsed.map(ch => {
            // Force migration of old chapter name/code structure
            if (ch.id === 'HIC') {
              migrated = true;
              return { ...ch, id: 'IPC', code: 'IPC', name: 'Infection Prevention and Control' };
            }
            if (ch.id === 'CQI') {
              migrated = true;
              return { ...ch, id: 'PSQ', code: 'PSQ', name: 'Patient Safety and Quality Improvement' };
            }
            // Ensure canonical correct names for all chapters
            if (ch.id === 'AAC' && ch.name !== 'Access, Assessment and Continuity of Care') {
              migrated = true;
              return { ...ch, name: 'Access, Assessment and Continuity of Care' };
            }
            if (ch.id === 'COP' && ch.name !== 'Care of Patients') {
              migrated = true;
              return { ...ch, name: 'Care of Patients' };
            }
            if (ch.id === 'MOM' && ch.name !== 'Management of Medication') {
              migrated = true;
              return { ...ch, name: 'Management of Medication' };
            }
            if (ch.id === 'PRE' && ch.name !== 'Patient Rights and Education') {
              migrated = true;
              return { ...ch, name: 'Patient Rights and Education' };
            }
            if (ch.id === 'ROM' && ch.name !== 'Responsibilities of Management') {
              migrated = true;
              return { ...ch, name: 'Responsibilities of Management' };
            }
            if (ch.id === 'FMS' && ch.name !== 'Facilities Management and Safety') {
              migrated = true;
              return { ...ch, name: 'Facilities Management and Safety' };
            }
            if (ch.id === 'HRM' && ch.name !== 'Human Resource Management') {
              migrated = true;
              return { ...ch, name: 'Human Resource Management' };
            }
            if (ch.id === 'IMS' && ch.name !== 'Information Management System') {
              migrated = true;
              return { ...ch, name: 'Information Management System' };
            }
            return ch;
          });
        }
      } catch (e) {
        console.error('Failed to parse storage chapters', e);
      }
    }
    setChapters(loadedChapters);

    let loadedCriteria = DEFAULT_CRITERIA;
    if (storedCriteria) {
      try {
        const parsed = JSON.parse(storedCriteria);
        if (Array.isArray(parsed)) {
          loadedCriteria = parsed.map(cr => {
            // Migrate criteria structure if they belong to old chapter IDs
            if (cr.chapterId === 'HIC') {
              migrated = true;
              const newId = cr.id.replace('HIC', 'IPC');
              const newCode = cr.code.replace('HIC', 'IPC');
              return { ...cr, id: newId, chapterId: 'IPC', code: newCode };
            }
            if (cr.chapterId === 'CQI') {
              migrated = true;
              const newId = cr.id.replace('CQI', 'PSQ');
              const newCode = cr.code.replace('CQI', 'PSQ');
              return { ...cr, id: newId, chapterId: 'PSQ', code: newCode };
            }
            return cr;
          });
        }
      } catch (e) {
        console.error('Failed to parse storage criteria', e);
      }
    }
    setCriteria(loadedCriteria);

    let loadedSessions = MOCK_EVALUATION_SESSIONS;
    if (storedSessions) {
      try {
        const parsed = JSON.parse(storedSessions);
        if (Array.isArray(parsed)) {
          loadedSessions = parsed.map(sess => {
            const updatedAnswers = { ...sess.answers };
            let sessionUpdated = false;
            if (updatedAnswers['HIC_1']) {
              updatedAnswers['IPC_1'] = { ...updatedAnswers['HIC_1'], criterionId: 'IPC_1' };
              delete updatedAnswers['HIC_1'];
              sessionUpdated = true;
            }
            if (updatedAnswers['HIC_2']) {
              updatedAnswers['IPC_2'] = { ...updatedAnswers['HIC_2'], criterionId: 'IPC_2' };
              delete updatedAnswers['HIC_2'];
              sessionUpdated = true;
            }
            if (updatedAnswers['CQI_1']) {
              updatedAnswers['PSQ_1'] = { ...updatedAnswers['CQI_1'], criterionId: 'PSQ_1' };
              delete updatedAnswers['CQI_1'];
              sessionUpdated = true;
            }
            if (sessionUpdated) {
              migrated = true;
              return { ...sess, answers: updatedAnswers };
            }
            return sess;
          });
        }
      } catch (e) {
        console.error('Failed to parse storage sessions', e);
      }
    }
    setSessions(loadedSessions);

    // Pick active session
    const activeEmail = localStorage.getItem('nabh_current_user_email') || '';
    const storedAdminsRaw = localStorage.getItem('nabh_allowed_admin_emails');
    let adminEmailsList = ['mamoni.maity90@gmail.com'];
    if (storedAdminsRaw) {
      try {
        const parsed = JSON.parse(storedAdminsRaw);
        if (Array.isArray(parsed)) adminEmailsList = parsed;
      } catch (e) {}
    }
    const isAdmin = activeEmail ? adminEmailsList.map(e => e.toLowerCase()).includes(activeEmail.toLowerCase()) : false;

    if (isAdmin) {
      // Admins can view any active session, default to stored or first
      if (storedActiveSessionId && loadedSessions.find(s => s.id === storedActiveSessionId)) {
        setCurrentSessionId(storedActiveSessionId);
      } else if (loadedSessions.length > 0) {
        setCurrentSessionId(loadedSessions[0].id);
      }
    } else if (activeEmail) {
      // Normal hospital user should load their own session
      const ownSession = loadedSessions.find(s => s.emailId.trim().toLowerCase() === activeEmail.trim().toLowerCase());
      if (ownSession) {
        setCurrentSessionId(ownSession.id);
      } else {
        // Create session on-demand if logged in but missing
        const profileRaw = localStorage.getItem('nabh_current_user_profile');
        let profile = { hospitalName: 'My Hospital', contactName: '', contactNumber: '', city: '' };
        if (profileRaw) {
          try {
            profile = JSON.parse(profileRaw);
          } catch (e) {}
        }
        const newSessId = `session_user_${Date.now()}`;
        const newSess: EvaluationSession = {
          id: newSessId,
          hospitalName: profile.hospitalName || 'My Hospital',
          contactName: profile.contactName || '',
          contactNumber: profile.contactNumber || '',
          emailId: activeEmail,
          city: profile.city || '',
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCompleted: false,
          answers: {}
        };
        loadedSessions.unshift(newSess);
        setSessions([...loadedSessions]);
        setCurrentSessionId(newSessId);
      }
    } else {
      // No active email, will display registration/login page
      setCurrentSessionId('');
    }

    // Force persist clean migrated state so the old cache is wiped immediately
    if (migrated) {
      localStorage.setItem('nabh_chapters', JSON.stringify(loadedChapters));
      localStorage.setItem('nabh_criteria', JSON.stringify(loadedCriteria));
      localStorage.setItem('nabh_sessions', JSON.stringify(loadedSessions));
    }
  }, []);

  // Save to localStorage when states change
  useEffect(() => {
    if (chapters.length > 0) {
      localStorage.setItem('nabh_chapters', JSON.stringify(chapters));
    }
  }, [chapters]);

  useEffect(() => {
    if (criteria.length > 0) {
      localStorage.setItem('nabh_criteria', JSON.stringify(criteria));
    }
  }, [criteria]);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('nabh_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('nabh_active_session_id', currentSessionId);
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (allowedAdminEmails.length > 0) {
      localStorage.setItem('nabh_allowed_admin_emails', JSON.stringify(allowedAdminEmails));
    }
  }, [allowedAdminEmails]);

  // Handle single question answer update
  const handleUpdateAnswer = (criterionId: string, updates: Partial<CriterionAnswer>) => {
    setSessions(prevSessions => {
      return prevSessions.map(sess => {
        if (sess.id !== currentSessionId) return sess;

        const currentAnswer = sess.answers[criterionId] || {
          criterionId,
          response: 'not_applicable'
        };

        const updatedAnswer = {
          ...currentAnswer,
          ...updates
        };

        return {
          ...sess,
          updatedAt: new Date().toISOString(),
          answers: {
            ...sess.answers,
            [criterionId]: updatedAnswer
          }
        };
      });
    });
  };

  // Reset to default standard database
  const handleResetToDefault = () => {
    setConfirmDialog({
      title: 'Reset Database to Standard',
      message: 'This will restore all questions and default demonstration data to the standard NABH definitions. Any custom questions, uploaded excel items, or changes will be replaced. Proceed?',
      confirmText: 'Restore Defaults',
      onConfirm: () => {
        setChapters(DEFAULT_CHAPTERS);
        setCriteria(DEFAULT_CRITERIA);
        setSessions(MOCK_EVALUATION_SESSIONS);
        setCurrentSessionId(MOCK_EVALUATION_SESSIONS[0].id);
        localStorage.setItem('nabh_chapters', JSON.stringify(DEFAULT_CHAPTERS));
        localStorage.setItem('nabh_criteria', JSON.stringify(DEFAULT_CRITERIA));
        localStorage.setItem('nabh_sessions', JSON.stringify(MOCK_EVALUATION_SESSIONS));
        localStorage.setItem('nabh_active_session_id', MOCK_EVALUATION_SESSIONS[0].id);
        setActiveTab('checklist');
      }
    });
  };

  // Initialize or update custom audit evaluation session
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospitalName.trim() || !newContactName.trim() || !newContactNumber.trim() || !newEmailId.trim() || !newCity.trim()) return;

    const email = newEmailId.trim().toLowerCase();

    if (isEditingProfile && currentSessionId) {
      const updatedProfile = {
        hospitalName: newHospitalName.trim(),
        contactName: newContactName.trim(),
        contactNumber: newContactNumber.trim(),
        emailId: email,
        city: newCity.trim(),
      };

      // If updating our logged in user profile, save in states/storage
      const currentActiveEmail = sessions.find(s => s.id === currentSessionId)?.emailId || '';
      if (currentUserEmail && currentActiveEmail.toLowerCase() === currentUserEmail.toLowerCase()) {
        localStorage.setItem('nabh_current_user_email', email);
        localStorage.setItem('nabh_current_user_profile', JSON.stringify(updatedProfile));
        setCurrentUserEmail(email);
        setCurrentUserProfile(updatedProfile);
      }

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            hospitalName: newHospitalName.trim(),
            contactName: newContactName.trim(),
            contactNumber: newContactNumber.trim(),
            emailId: email,
            city: newCity.trim(),
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      }));
      setIsEditingProfile(false);
      setShowSessionCreator(false);
    } else {
      const newSessId = `session_user_${Date.now()}`;
      const newSessionState: EvaluationSession = {
        id: newSessId,
        hospitalName: newHospitalName.trim(),
        contactName: newContactName.trim(),
        contactNumber: newContactNumber.trim(),
        emailId: email,
        city: newCity.trim(),
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCompleted: false,
        answers: {}
      };

      setSessions(prev => [newSessionState, ...prev]);
      setCurrentSessionId(newSessId);
      setNewHospitalName('');
      setNewContactName('');
      setNewContactNumber('');
      setNewEmailId('');
      setNewCity('');
      setShowSessionCreator(false);
      setActiveTab('checklist');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nabh_current_user_email');
    localStorage.removeItem('nabh_current_user_profile');
    localStorage.removeItem('nabh_active_session_id');
    setCurrentUserEmail('');
    setCurrentUserProfile(null);
    setCurrentSessionId('');
    setIsAdminAuthenticated(false);
    setActiveTab('checklist');
    setAccessEmailInput('');
  };

  const handleEmailAccess = (e: React.FormEvent) => {
    e.preventDefault();
    const email = accessEmailInput.trim().toLowerCase();
    if (!email) return;

    localStorage.setItem('nabh_current_user_email', email);
    setCurrentUserEmail(email);

    // Check if this user is an admin
    const isAdmin = allowedAdminEmails.map(ae => ae.trim().toLowerCase()).includes(email);
    setIsAdminAuthenticated(isAdmin);

    if (isAdmin) {
      // Pick active session
      const storedActiveSessionId = localStorage.getItem('nabh_active_session_id');
      if (storedActiveSessionId && sessions.find(s => s.id === storedActiveSessionId)) {
        setCurrentSessionId(storedActiveSessionId);
      } else if (sessions.length > 0) {
        setCurrentSessionId(sessions[0].id);
      } else {
        setCurrentSessionId('');
      }
      setActiveTab('checklist');
    } else {
      // Normal hospital user
      const rawProfile = localStorage.getItem('nabh_profile_' + email);
      if (rawProfile) {
        try {
          const profile = JSON.parse(rawProfile);
          setCurrentUserProfile(profile);
          
          const existingSession = sessions.find(s => s.emailId.trim().toLowerCase() === email);
          if (existingSession) {
            setCurrentSessionId(existingSession.id);
          } else {
            const newSessId = `session_user_${Date.now()}`;
            const newSessionState: EvaluationSession = {
              id: newSessId,
              hospitalName: profile.hospitalName,
              contactName: profile.contactName,
              contactNumber: profile.contactNumber,
              emailId: email,
              city: profile.city,
              startedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isCompleted: false,
              answers: {}
            };
            setSessions(prev => [newSessionState, ...prev]);
            setCurrentSessionId(newSessId);
          }
          setActiveTab('checklist');
        } catch (err) {
          setCurrentUserProfile(null);
          setCurrentSessionId('');
          setNewEmailId(email);
        }
      } else {
        setCurrentUserProfile(null);
        setCurrentSessionId('');
        setNewEmailId(email);
      }
    }
  };

  const handleRegisterUser = (e: React.FormEvent, registrationData: {
    hospitalName: string;
    contactName: string;
    contactNumber: string;
    emailId: string;
    city: string;
  }) => {
    e.preventDefault();
    const email = registrationData.emailId.trim().toLowerCase();
    if (!email) return;

    const profile = {
      hospitalName: registrationData.hospitalName.trim(),
      contactName: registrationData.contactName.trim(),
      contactNumber: registrationData.contactNumber.trim(),
      emailId: email,
      city: registrationData.city.trim(),
    };

    localStorage.setItem('nabh_current_user_email', email);
    localStorage.setItem('nabh_profile_' + email, JSON.stringify(profile));
    localStorage.setItem('nabh_current_user_profile', JSON.stringify(profile));
    setCurrentUserEmail(email);
    setCurrentUserProfile(profile);

    // Check if an evaluation session already exists for this email
    const existingSession = sessions.find(s => s.emailId.trim().toLowerCase() === email);
    if (existingSession) {
      setCurrentSessionId(existingSession.id);
    } else {
      // Create a brand new session matching this profile
      const newSessId = `session_user_${Date.now()}`;
      const newSessionState: EvaluationSession = {
        id: newSessId,
        hospitalName: profile.hospitalName,
        contactName: profile.contactName,
        contactNumber: profile.contactNumber,
        emailId: email,
        city: profile.city,
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isCompleted: false,
        answers: {}
      };

      setSessions(prev => [newSessionState, ...prev]);
      setCurrentSessionId(newSessId);
    }

    const isAdmin = allowedAdminEmails.map(ae => ae.trim().toLowerCase()).includes(email);
    setIsAdminAuthenticated(isAdmin);
    setActiveTab('checklist');
    setNewHospitalName('');
    setNewContactName('');
    setNewContactNumber('');
    setNewEmailId('');
    setNewCity('');
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (currentSessionId === sessionId) {
        if (filtered.length > 0) {
          setCurrentSessionId(filtered[0].id);
        } else {
          setCurrentSessionId('');
        }
      }
      return filtered;
    });
  };

  // Get active session record details
  const activeSessionDetails = sessions.find(s => s.id === currentSessionId);

  // Quick statistics overview
  const getOverallProgressStats = () => {
    if (!activeSessionDetails) return { score: 0, answered: 0, total: criteria.length };

    let totalPoints = 0;
    let applicableCount = 0;
    let answeredCount = 0;

    criteria.forEach(c => {
      const ans = activeSessionDetails.answers[c.id];
      if (ans && ans.response) {
        answeredCount++;
        if (ans.response !== 'not_applicable') {
          applicableCount++;
          if (ans.response === 'compliant') totalPoints += 10;
          else if (ans.response === 'partially_compliant') totalPoints += 5;
        }
      }
    });

    const scorePct = applicableCount > 0 ? (totalPoints / (applicableCount * 10)) * 100 : 0;

    return {
      score: Math.round(scorePct),
      answered: answeredCount,
      total: criteria.length
    };
  };

  const progressSummary = getOverallProgressStats();

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col" id="applet-wrapper">
      {/* 1. Official Brand Header Bar (White Background matching nabh.co) */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8" id="official-brand-header">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logos and Bilingual Titles */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/d/df/Quality_Council_of_India_Logo_2.png"
                alt="QCI Logo"
                className="h-10 sm:h-12 w-auto object-contain flex-shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              <img
                src="https://upload.wikimedia.org/wikipedia/en/8/87/National_Accreditation_Board_for_Hospitals_%26_Healthcare_Providers_Logo.png"
                alt="NABH Logo"
                className="h-10 sm:h-12 w-auto object-contain flex-shrink-0"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="space-y-0.5">
              <div className="text-[10px] sm:text-xs font-bold text-[#002f56]/80 tracking-tight leading-tight font-sans">
                राष्ट्रीय अस्पताल और स्वास्थ्यचर्या प्रदाता प्रत्यायन बोर्ड
              </div>
              <h1 className="text-xs sm:text-sm lg:text-base font-black text-[#002f56] tracking-tight leading-tight uppercase" id="brand-title">
                National Accreditation Board for Hospitals & Healthcare Providers
              </h1>
              <p className="text-[9px] sm:text-[10px] text-[#009fe3] font-extrabold tracking-wider uppercase mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                <span>Constituent Board of Quality Council of India (QCI)</span>
              </p>
            </div>
          </div>

          {/* Live Portal Tag & Quick Stats */}
          <div className="hidden lg:flex flex-col items-end text-right gap-1">
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Accreditation 6th Edition Portal</span>
            </div>
            <div className="text-[9px] text-slate-400 font-mono tracking-wider font-semibold uppercase">
              Ref Standard: NABH-HOSP-ACC-6TH
            </div>
          </div>
          
        </div>
      </div>

      {/* 2. Sticky Navigation Bar & Content */}
      {!currentUserEmail ? (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <div className="bg-white w-full rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden animate-fade-in grid grid-cols-1 md:grid-cols-12">
            {/* Left side info block */}
            <div className="md:col-span-5 bg-[#002f56] p-8 text-white flex flex-col justify-between border-r border-slate-100">
              <div className="space-y-6">
                <span className="px-2 py-1 bg-[#f2a900] text-[#002f56] text-[9px] font-black uppercase tracking-widest rounded">
                  NABH Portal
                </span>
                <div className="space-y-2">
                  <h2 className="text-lg font-black leading-tight text-white font-sans uppercase tracking-tight">
                    NABH ACCREDITATION SELF-ASSESSMENT PORTAL
                  </h2>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Access standard checklists, map accreditation gaps, and generate automated corrective action plans for hospital compliance audits.
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10 text-[11px]">
                  <div className="flex gap-2.5">
                    <span className="text-[#f2a900] font-black">✓</span>
                    <span className="text-slate-200">Standard NABH compliance chapters</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-[#f2a900] font-black">✓</span>
                    <span className="text-slate-200">Real-time gap-analysis graphs</span>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="text-[#f2a900] font-black">✓</span>
                    <span className="text-slate-200">Immutable corrective action directives</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side form: ONLY email input */}
            <div className="md:col-span-7 p-8 col-span-1 flex flex-col justify-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 border-b pb-3 mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-[#002f56]/5 text-[#002f56] rounded-full text-xs">🔑</span>
                Sign In / Access Portal
              </h3>

              <form 
                onSubmit={handleEmailAccess}
                className="space-y-5 text-xs"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Enter Your Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. colleague@hospital.org"
                    value={accessEmailInput}
                    onChange={e => setAccessEmailInput(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg outline-hidden focus:border-[#002f56] font-mono"
                  />
                </div>

                <div className="bg-[#002f56]/5 p-3.5 rounded-lg border border-[#002f56]/10 text-[10px] text-slate-600 leading-relaxed">
                  <strong>Access Policy:</strong> Authorized administrative emails automatically unlock question editing, checklist configuration, and global registry access. Hospital users can create, complete, and download custom self-assessment reports.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#002f56] hover:bg-[#002f56]/90 text-[#f2a900] font-black uppercase tracking-wider rounded-lg transition-all text-[11px] cursor-pointer shadow-md"
                >
                  Continue to Portal
                </button>
              </form>
            </div>
          </div>
        </main>
      ) : (!currentUserProfile && !isUserAdmin) ? (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center animate-fade-in">
          <div className="bg-white w-full rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
            {/* Left side info block */}
            <div className="md:col-span-5 bg-[#002f56] p-8 text-white flex flex-col justify-between border-r border-slate-100">
              <div className="space-y-6">
                <span className="px-2 py-1 bg-[#f2a900] text-[#002f56] text-[9px] font-black uppercase tracking-widest rounded">
                  NABH Portal
                </span>
                <div className="space-y-2">
                  <h2 className="text-lg font-black leading-tight text-white font-sans uppercase tracking-tight">
                    HOSPITAL PROFILE SETUP
                  </h2>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    First-time visitor profile registration. Please complete your hospital details to activate your self-assessment workspace.
                  </p>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-[11px] font-mono space-y-1">
                  <div className="text-slate-400">Logged in email ID:</div>
                  <div className="text-amber-300 font-bold truncate">{currentUserEmail}</div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase text-[10px] tracking-wider rounded transition-colors cursor-pointer"
                >
                  Change Email ID
                </button>
              </div>
            </div>

            {/* Right side form */}
            <div className="md:col-span-7 p-8 col-span-1">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 border-b pb-3 mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-[#002f56]/5 text-[#002f56] rounded-full text-xs">🏥</span>
                Complete Hospital Profile
              </h3>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newHospitalName.trim() || !newContactName.trim() || !newContactNumber.trim() || !newCity.trim()) return;
                  handleRegisterUser(e, {
                    hospitalName: newHospitalName.trim(),
                    contactName: newContactName.trim(),
                    contactNumber: newContactNumber.trim(),
                    emailId: currentUserEmail,
                    city: newCity.trim(),
                  });
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Hospital Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo Hospital Delhi"
                    value={newHospitalName}
                    onChange={e => setNewHospitalName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-[#002f56]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Contact Submitter Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Satish Kumar"
                      value={newContactName}
                      onChange={e => setNewContactName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-[#002f56]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Delhi"
                      value={newCity}
                      onChange={e => setNewCity(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-[#002f56]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Contact Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={newContactNumber}
                    onChange={e => setNewContactNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-[#002f56] font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#002f56] hover:bg-[#002f56]/90 text-[#f2a900] font-black uppercase tracking-wider rounded-lg transition-all text-[11px] cursor-pointer shadow-md"
                >
                  Activate Self-Assessment & Begin
                </button>
              </form>
            </div>
          </div>
        </main>
      ) : (
        <>
          {/* 2. Sticky Navigation Bar (Deep Navy Blue matching nabh.co) */}
          <header className="bg-[#002f56] border-b border-[#f2a900]/30 sticky top-0 z-40 shadow-md" id="top-navbar-hdr">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left Title Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#f2a900] animate-pulse"></div>
            <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-white uppercase font-sans">
              Digital Self-Assessment & Gap-Analysis Portal
            </span>
          </div>

          {/* Tab Selection Navigation layout */}
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg self-start sm:self-auto border border-white/10" id="main-navigation-tabs">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-[#f2a900] text-[#002f56] shadow-sm font-black'
                  : 'text-white/85 hover:text-white hover:bg-white/10 font-black'
              }`}
              id="tab-btn-checklist"
            >
              <ClipboardCheck className={`w-3.5 h-3.5 ${activeTab === 'checklist' ? 'text-[#002f56]' : 'text-[#f2a900]'}`} />
              <span>DIAGNOSTIC CHECKLIST</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#f2a900] text-[#002f56] shadow-sm font-black'
                  : 'text-white/85 hover:text-white hover:bg-white/10 font-black'
              }`}
              id="tab-btn-dashboard"
            >
              <BarChart3 className={`w-3.5 h-3.5 ${activeTab === 'dashboard' ? 'text-[#002f56]' : 'text-[#f2a900]'}`} />
              <span>PREPAREDNESS REPORT</span>
            </button>
            {isUserAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-[#f2a900] text-[#002f56] shadow-sm font-black'
                    : 'text-white/85 hover:text-white hover:bg-white/10 font-black'
                }`}
                id="tab-btn-admin"
              >
                <Settings2 className={`w-3.5 h-3.5 ${activeTab === 'admin' ? 'text-[#002f56]' : 'text-[#f2a900]'}`} />
                <span>CONFIG CONSOLE</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. active Hospital / Inspector Profile Information Bar */}
      <section className="bg-nabh-navy text-white py-3 border-b border-nabh-gold/30 shadow-inner" id="profile-strip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
          
          {/* Left: Active session details */}
          <div className="flex items-center gap-3">
            <Building className="w-4 h-4 text-nabh-gold flex-shrink-0" />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-300 uppercase tracking-widest font-black text-[10px]">Hospital:</span>
              {activeSessionDetails ? (
                <>
                  <strong className="text-amber-300 font-extrabold text-[12px] uppercase">{activeSessionDetails.hospitalName}</strong>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300 uppercase tracking-widest font-black text-[10px]">Contact Person:</span>
                  <span className="font-bold text-slate-200">{activeSessionDetails.contactName || 'N/A'}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300 uppercase tracking-widest font-black text-[10px]">City:</span>
                  <span className="font-bold text-slate-200">{activeSessionDetails.city}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-300 uppercase tracking-widest font-black text-[10px]">Contact:</span>
                  <span className="font-bold text-slate-200">{activeSessionDetails.contactNumber}</span>
                </>
              ) : (
                <span className="text-rose-400 font-extrabold uppercase">No Profile Loaded</span>
              )}
            </div>
          </div>

          {/* Right: Hospital Selection Dropdown Menu & Create Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {isUserAdmin && (
              <div className="flex items-center gap-2">
                <span className="text-slate-300 uppercase tracking-widest font-black text-[10px]">Switch Session:</span>
                <select
                  value={currentSessionId}
                  onChange={e => {
                    setCurrentSessionId(e.target.value);
                    setShowSessionCreator(false);
                  }}
                  className="bg-slate-800 text-white border border-[#f2a900]/30 rounded font-bold px-2 py-1 text-xs focus:ring-1 focus:ring-[#f2a900] outline-hidden cursor-pointer"
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.hospitalName.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeSessionDetails && (
              <>
                <button
                  onClick={() => {
                    setNewHospitalName(activeSessionDetails.hospitalName);
                    setNewContactName(activeSessionDetails.contactName || '');
                    setNewContactNumber(activeSessionDetails.contactNumber);
                    setNewEmailId(activeSessionDetails.emailId);
                    setNewCity(activeSessionDetails.city);
                    setIsEditingProfile(true);
                    setShowSessionCreator(true);
                  }}
                  className="px-3 py-1 bg-nabh-gold hover:bg-nabh-gold-dark text-slate-950 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5 text-slate-950 font-black" /> Edit Hospital Profile
                </button>

                <button
                  onClick={() => {
                    setConfirmDialog({
                      title: 'Reset/Start Fresh Assessment',
                      message: 'Are you sure you want to clear all compliance assessment answers for this hospital? This will wipe the slate clean so you can restart. This action cannot be undone.',
                      confirmText: 'Reset Answers',
                      onConfirm: () => {
                        setSessions(prev => prev.map(s => {
                          if (s.id === currentSessionId) {
                            return {
                              ...s,
                              answers: {},
                              updatedAt: new Date().toISOString()
                            };
                          }
                          return s;
                        }));
                      }
                    });
                  }}
                  className="px-3 py-1 bg-[#f2a900]/15 hover:bg-[#f2a900]/25 border border-[#f2a900]/40 text-[#f2a900] rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-[#f2a900]" /> Restart Answers
                </button>
              </>
            )}

            {isUserAdmin && (
              <button
                onClick={() => {
                  setNewHospitalName('');
                  setNewContactName('');
                  setNewContactNumber('');
                  setNewEmailId('');
                  setNewCity('');
                  setIsEditingProfile(false);
                  setShowSessionCreator(!showSessionCreator);
                }}
                className="px-3 py-1 bg-[#f2a900] hover:bg-[#f2a900]/90 text-slate-950 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-slate-950 font-black" /> Add New Session
              </button>
            )}

            {currentUserEmail && (
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/40 text-rose-300 hover:text-white rounded text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. New Evaluation Creation Modal Overlay (Slide Drawer inline) */}
      {showSessionCreator && (
        <div className="bg-slate-100 border-b border-slate-200 py-6 px-4 animate-fade-in" id="evaluation-creation-bar">
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
            <h3 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> {isEditingProfile ? 'Update Hospital / Clinic Profile' : 'Start New Hospital Self-Assessment'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isEditingProfile 
                ? 'Modify your organization\'s setup details and active point of contact information below.' 
                : 'Enter your hospital\'s profile details to generate a customized compliance gap-analysis and action plan.'}
            </p>

            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Hospital / Clinic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City General Hospital"
                    value={newHospitalName}
                    onChange={e => setNewHospitalName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Contact Person / Submitter Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Satish Kumar"
                    value={newContactName}
                    onChange={e => setNewContactName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Delhi"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Contact Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={newContactNumber}
                    onChange={e => setNewContactNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-slate-400 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Email ID *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. info@hospital.org"
                    value={newEmailId}
                    onChange={e => setNewEmailId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-hidden focus:border-slate-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSessionCreator(false);
                    setIsEditingProfile(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-2xs cursor-pointer"
                >
                  {isEditingProfile ? 'Save Profile Details' : 'Begin Assessment Sheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Core Body View Panels wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full" id="root-tabs-manager">
        {!activeSessionDetails ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-200 max-w-xl mx-auto my-12 shadow-sm">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No Assessment Profile Loaded</h3>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              To proceed with evaluating certifications, please load an existing demo profile or create a custom profile using the button above.
            </p>
            <button
              onClick={() => handleResetToDefault()}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              Load Default Audit Profiles
            </button>
          </div>
        ) : (
          <div id="content-container-block">
            {/* Quick persistent Progress strip */}
            {activeTab !== 'admin' && (
              <div className="bg-white px-5 py-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-6 mb-6" id="overall-progress-indicator-strip">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-cyan-600 animate-pulse" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Overall Prerequisite Score Progress
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-600 transition-all duration-500" style={{ width: `${progressSummary.score}%` }} />
                    </div>
                    <span className={`text-xs font-extrabold font-mono ${
                      progressSummary.score >= 80 ? 'text-emerald-600' : progressSummary.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {progressSummary.score}%
                    </span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">
                  {progressSummary.answered} OF {progressSummary.total} ASSESSED
                </div>
              </div>
            )}

            {/* View switching render */}
            {activeTab === 'checklist' && (
              <AssessmentLayout
                chapters={chapters}
                criteria={criteria}
                currentSession={activeSessionDetails}
                onUpdateAnswer={handleUpdateAnswer}
              />
            )}

            {activeTab === 'dashboard' && (
              <ResultSummary
                chapters={chapters}
                criteria={criteria}
                currentSession={activeSessionDetails}
                onUpdateAnswer={handleUpdateAnswer}
              />
            )}

            {activeTab === 'admin' && (
              !isAdminAuthenticated ? (
                <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden" id="admin-passcode-gate">
                  <div className="bg-[#002f56] px-6 py-4 border-b border-[#f2a900]/30 text-center">
                    <Settings2 className="w-8 h-8 text-[#f2a900] mx-auto mb-1.5" />
                    <h3 className="font-extrabold text-white text-xs uppercase tracking-widest">Admin Console Portal</h3>
                    <p className="text-[10px] text-slate-300 uppercase font-bold tracking-wider mt-1">Authorized Access Credentials Required</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed text-center">
                      This panel contains critical hospital submissions, criteria configurations, and report logs. Please authenticate to verify administrative privileges.
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (adminPasscodeInput === 'admin123') {
                          setIsAdminAuthenticated(true);
                          setAdminLoginError('');
                          setAdminPasscodeInput('');
                        } else {
                          setAdminLoginError('Invalid Administrator Passcode. Access denied.');
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                          Enter Admin Passcode
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Hint: admin123"
                          value={adminPasscodeInput}
                          onChange={(e) => setAdminPasscodeInput(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-hidden text-xs focus:ring-1 focus:ring-slate-400 font-mono text-center"
                        />
                      </div>
                      {adminLoginError && (
                        <p className="text-[10px] font-bold text-rose-500 font-mono text-center">{adminLoginError}</p>
                      )}
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#002f56] text-[#f2a900] font-black uppercase text-[10px] tracking-wider rounded-lg shadow-sm hover:bg-[#001f3a] transition-all cursor-pointer border border-[#f2a900]/30"
                      >
                        Verify Admin Credentials
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsAdminAuthenticated(false)}
                      className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
                    >
                      Lock Admin Console
                    </button>
                  </div>
                  <AdminDashboard
                    chapters={chapters}
                    setChapters={setChapters}
                    criteria={criteria}
                    setCriteria={setCriteria}
                    sessions={sessions}
                    onResetToDefault={handleResetToDefault}
                    onSelectSession={(id) => {
                      setCurrentSessionId(id);
                      setActiveTab('dashboard'); // Switch immediately to the Preparedness Report tab!
                    }}
                    onDeleteSession={handleDeleteSession}
                    currentUserEmail={currentUserEmail}
                    allowedAdminEmails={allowedAdminEmails}
                    onAddAdminEmail={(email) => {
                      setAllowedAdminEmails(prev => {
                        const next = [...prev, email];
                        localStorage.setItem('nabh_allowed_admin_emails', JSON.stringify(next));
                        return next;
                      });
                    }}
                    onRemoveAdminEmail={(email) => {
                      setAllowedAdminEmails(prev => {
                        const next = prev.filter(e => e !== email);
                        localStorage.setItem('nabh_allowed_admin_emails', JSON.stringify(next));
                        return next;
                      });
                    }}
                  />
                </div>
              )
            )}
          </div>
        )}
      </main>
    </>
  )}

      {/* 5. Rich Official NABH & QCI Corporate Footer */}
      <footer className="bg-[#002f56] text-white border-t-4 border-[#f2a900] py-10 mt-auto text-xs" id="simple-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1: Vision and Constituent Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f2a900]" />
              <h4 className="font-black text-white uppercase tracking-wider text-xs">National Accreditation Board for Hospitals & Healthcare Providers</h4>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              NABH is a constituent board of the Quality Council of India (QCI), established to operate accreditation and certification programmes for healthcare organizations in complete alignment with global standards.
            </p>
            <div className="pt-1">
              <span className="px-2 py-1 bg-white/10 hover:bg-white/15 rounded text-[10px] font-mono font-bold tracking-wider text-[#f2a900] uppercase border border-white/5 transition-all">
                eMitra Electronic Framework
              </span>
            </div>
          </div>

          {/* Col 2: Official Address */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-[#f2a900] uppercase tracking-wider text-xs">Registered Secretariat Address</h4>
            <div className="text-slate-300 space-y-1 text-[11px] font-sans">
              <p className="font-bold text-white">Quality Council of India (QCI)</p>
              <p>ITPI Building, 5th Floor, 4-A</p>
              <p>Ring Road, I.P. Estate</p>
              <p>New Delhi - 110002, India</p>
            </div>
          </div>

          {/* Col 3: Assistance Support Desk */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[#f2a900] uppercase tracking-wider text-xs">Administrative Helpline & Support</h4>
            <div className="text-slate-300 space-y-1.5 text-[11px]">
              <p className="flex items-center gap-1.5">
                <span className="font-bold text-[#f2a900]">Email:</span> 
                <a href="mailto:helpdesk@nabh.co" className="hover:underline hover:text-white transition-colors">helpdesk@nabh.co</a>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="font-bold text-[#f2a900]">Official Portal:</span>
                <a href="https://nabh.co" target="_blank" rel="noreferrer" className="hover:underline hover:text-white transition-colors flex items-center gap-1">
                  nabh.co
                  <span className="text-[9px] bg-white/10 px-1 rounded">External ↗</span>
                </a>
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-2 leading-relaxed">
                Checklist Standards loaded: Pre-requisites & Mandatory Essential Standards. Form templates conform to standard operating guides.
              </p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} National Accreditation Board for Hospitals & Healthcare Providers (NABH). All Rights Reserved.</p>
          <div className="flex gap-4 font-mono text-[10px]">
            <span>HCO STATUS: AUTHORIZED</span>
            <span>|</span>
            <span>SYSTEM AUDIT VERSION: V2.20</span>
          </div>
        </div>
      </footer>

      {/* Dynamic In-App custom confirmDialog overlay */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in" id="custom-app-confirm-modal">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-fade-in">
            <div className="bg-[#002f56] px-6 py-4 border-b border-rose-500/30 flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">{confirmDialog.title}</h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                {confirmDialog.message}
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  }}
                  className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {confirmDialog.confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

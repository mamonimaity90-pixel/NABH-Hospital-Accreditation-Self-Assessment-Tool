/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HelpResource {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  description: string;
  contentMarkdown: string; // Dynamic helpful guidance that user can download
}

export interface AssessmentCriterion {
  id: string; // e.g. "AAC_1"
  chapterId: string; // e.g. "AAC"
  code: string; // e.g. "AAC.1"
  question: string;
  description: string;
  defaultActionItem: string;
  helpResources: HelpResource[];
}

export interface Chapter {
  id: string; // e.g. "AAC"
  code: string; // e.g. "AAC"
  name: string;
  description: string;
}

export type ResponseOption = 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable';

export interface CriterionAnswer {
  criterionId: string;
  response: ResponseOption;
  customActionItem?: string;
  targetDate?: string;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

export interface EvaluationSession {
  id: string;
  hospitalName: string;
  contactName: string;
  contactNumber: string;
  emailId: string;
  city: string;
  startedAt: string;
  updatedAt: string;
  answers: Record<string, CriterionAnswer>; // criterionId -> Answer
  isCompleted: boolean;
}

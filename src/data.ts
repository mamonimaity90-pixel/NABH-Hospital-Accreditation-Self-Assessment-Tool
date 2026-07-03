import { Chapter, AssessmentCriterion, EvaluationSession } from './types';

export const DEFAULT_CHAPTERS: Chapter[] = [
  {
    id: 'AAC',
    code: 'AAC',
    name: 'Access, Assessment and Continuity of Care',
    description: 'Deals with the ease of registration, formal patient assessment, uniform triage, and structured admission and discharge SOPs.'
  },
  {
    id: 'COP',
    code: 'COP',
    name: 'Care of Patients',
    description: 'Ensures clinical care is uniform, evidence-based, safe, and accommodates high-risk services, emergency guidelines, and uniform CPR resuscitation.'
  },
  {
    id: 'MOM',
    code: 'MOM',
    name: 'Management of Medication',
    description: 'Focuses on pharmacy storage criteria, high-alert drug lists, correct double check practices, and safe prescription workflows.'
  },
  {
    id: 'PRE',
    code: 'PRE',
    name: 'Patient Rights and Education',
    description: 'Upholds patient dignity, privacy, informed consent, and ensures patients are aware of their rights and responsibilities.'
  },
  {
    id: 'IPC',
    code: 'IPC',
    name: 'Infection Prevention and Control',
    description: 'Monitors sterilization techniques, hand hygiene, biomedical waste handling, and healthcare-associated infection monitoring.'
  },
  {
    id: 'PSQ',
    code: 'PSQ',
    name: 'Patient Safety and Quality Improvement',
    description: 'Tracks quality performance indicators (clinical & management) to establish root causes of issues and improve processes.'
  },
  {
    id: 'ROM',
    code: 'ROM',
    name: 'Responsibilities of Management',
    description: 'Defines roles of leadership, compliance with local laws, licences (AERB, Pollution, Pharmacy), and organizational accountability.'
  },
  {
    id: 'FMS',
    code: 'FMS',
    name: 'Facilities Management and Safety',
    description: 'Guarantees the physical facility offers safety through functional fire fighting tools, regular fire audits, and emergency power systems.'
  },
  {
    id: 'HRM',
    code: 'HRM',
    name: 'Human Resource Management',
    description: 'Deals with recruiting qualified healthcare workers, credentialing doctors, executing training plans, and tracking performance reviews.'
  },
  {
    id: 'IMS',
    code: 'IMS',
    name: 'Information Management System',
    description: 'Guarantees security and completeness of medical charts, physical lock storage, electronic records, and structured access audits.'
  }
];

export const DEFAULT_CRITERIA: AssessmentCriterion[] = [
  // 1. AAC
  {
    id: 'AAC_1',
    chapterId: 'AAC',
    code: 'AAC.1',
    question: 'Are there defined registration, admission, and transfer policies and protocols in place?',
    description: 'The hospital must have a standardized registration and admission process. Transfer workflows to external facilities must also follow formal clinical criteria.',
    defaultActionItem: 'Create an SOP for Registration and Admission. Create a standardized transfer agreement/memo template.',
    helpResources: [
      {
        id: 'res_aac_1_1',
        title: 'SOP on Patient Registration & Inpatient Admission',
        fileName: 'SOP_Patient_Registration_Admission.md',
        fileType: 'Markdown Document',
        description: 'Contains standard template guidelines for OPD registration desks, IPD consents, and triage guidelines.',
        contentMarkdown: `# SOP: Patient Registration & Inpatient Admission
## 1. PURPOSE:
To outline a consistent process forpatient registration, triage assessment, and formal administrative admission.

## 2. POLICIES:
- All individuals seeking medical attention must be registered.
- Patient unique identifier (UID) shall be generated.
- Critical emergencies are immediately triaged before paperwork completion.

## 3. PROCEDURE:
1. Patient walks in -> OPD desk captures demographic details.
2. Hospital staff registers emergency cases and immediately sends them to Triaging area.
3. For Inpatients, a valid clinical recommendation is filed and consent signed.`
      },
      {
        id: 'res_aac_1_2',
        title: 'Inter-Hospital Referral & Transfer Form',
        fileName: 'Patient_Transfer_Referral_Form.md',
        fileType: 'Form Template',
        description: 'A structured clinical handout form supporting SBAR transfers.',
        contentMarkdown: `# Inter-Hospital Clinical Transfer Form
## Patient Demographics
- Name: _______________________
- Age/Sex: ___________
- UID: _________________

## Clinical Handover (SBAR Format)
- **S (Situation)**: __________________________________________________
- **B (Background)**: _________________________________________________
- **A (Assessment)**: Vital signs: BP _____, HR _____, Temp _____, SpO2 _____
- **R (Recommendation)**: Reason for transfer and destination department.`
      }
    ]
  },
  {
    id: 'AAC_2',
    chapterId: 'AAC',
    code: 'AAC.2',
    question: 'Are registered patients undergoing standardized initial assessment by doctors and nurses within defined timelines?',
    description: 'Assessments must capture medical history, physical exams, and clinical nursing remarks. This must occur within stipulated timelines.',
    defaultActionItem: 'Establish an Initial Assessment Policy defining maximum time margins (e.g. within 30 min of admission). Standardize initial evaluation forms.',
    helpResources: [
      {
        id: 'res_aac_2_1',
        title: 'Initial Medical & Nursing Assessment Template',
        fileName: 'Initial_Patient_Assessment_Protocol.md',
        fileType: 'Clinical Checklist',
        description: 'Approved format to document medical examinations, nursing vitals, allergy history, and initial treatment plans.',
        contentMarkdown: `# Patient Initial Assessment Form (Medical & Nursing)
**To be completed within 15 minutes by nursing staff and 30 minutes by general practitioners.**

### Emergency Red Flags:
- Respiratory Rate > 30 or < 8
- Systolic BP < 90 mmHg
- GCS < 12

### History and Examination:
1. **Chief Complaint**: ___________________________________________
2. **History of Presenting Illness**: _____________________________
3. **Allergies**: [ ] NKDA [ ] Specifics: _________________________
4. **Vitals**: Temp _____  PR _____  RR _____  NIBP _____`
      }
    ]
  },
  {
    id: 'AAC_3',
    chapterId: 'AAC',
    code: 'AAC.3',
    question: 'Is there a structured discharge protocol that includes a detailed discharge summary provided to all patients?',
    description: 'Each patient must be discharged with a formal clinical discharge summary. It should outline treatments, medication follow-ups, and emergency contacts.',
    defaultActionItem: 'Create a mandatory Discharge Summary check-list. Ensure all clinical summaries contain emergency red-flag contacts.',
    helpResources: [
      {
        id: 'res_aac_3_1',
        title: 'Discharge Summary NABH Compliance Template',
        fileName: 'Discharge_Summary_Template.md',
        fileType: 'Document Standard',
        description: 'SOP and standard checklist outlining elements required in the discharge summary under NABH Hospital Accreditation guidelines.',
        contentMarkdown: `# NABH Compliant Discharge Summary Standard
The discharge summary **MUST** contain the following elements:
1. **Hospital Details & ID numbers (UID / IP No.)**
2. **Clinical Diagnosis and Investigation Summaries**
3. **Treatment Provided / Surgical Procedure Brief**
4. **Physical status upon discharge** (Stable, Relieved, Referred)
5. **Exact Medication Schedule** (Prescribed names, doses, frequencies and durations in simple regional language if appropriate)
6. **Follow-up details / Date**
7. **RED-FLAG Urgent emergency warning indicators** (When to rush back to ER)`
      }
    ]
  },

  // 2. COP
  {
    id: 'COP_1',
    chapterId: 'COP',
    code: 'COP.1',
    question: 'Are clinical services and treatments delivered in a uniform, standardized manner across all patients?',
    description: 'Standard Treatment Guidelines (STGs) must govern diagnostic and therapeutic care, preventing arbitrary variance.',
    defaultActionItem: 'Adopt standard treatment guidelines (STGs) for top 10 clinical conditions in the hospital. Conduct clinical audits.',
    helpResources: [
      {
        id: 'res_cop_1_1',
        title: 'Clinical Audit Checklist & Form',
        fileName: 'Clinical_Audit_Uniform_Care.md',
        fileType: 'Audit Handout',
        description: 'Audit template to check clinical files for adherence to uniform treatment policies.',
        contentMarkdown: `# SOP & Audit Checklist: Uniformity of Clinical Care
## 1. OBJECTIVE:
To confirm clinical treatments are governed by organizational policies and are not provider-dependent.

## 2. AUDIT CRITERIA (Sample 10 files monthly):
- [ ] Is there an initial assessment form completed in 30 minutes?
- [ ] Are medications written in generic formats?
- [ ] Are vitals charted as per critical care protocols?
- [ ] Did the consultant approve the diagnostic plan within 12 hours?`
      }
    ]
  },
  {
    id: 'COP_2',
    chapterId: 'COP',
    code: 'COP.2',
    question: 'Are emergency services and resuscitative care standard and backed by qualified staff trained in CPR?',
    description: 'Basic Life Support (BLS) and Advanced Cardiac Life Support (ACLS) capabilities must be available 24/7. Resuscitation carts (Crash Carts) must be maintained.',
    defaultActionItem: 'Maintain locked CPR/Crash Carts with daily inspection audits. Ensure 100% of duty clinicians hold active BLS/ACLS certificates.',
    helpResources: [
      {
        id: 'res_cop_2_1',
        title: 'Crash Cart (Resuscitation) Daily Inspection Sheet',
        fileName: 'Crash_Cart_Inspection_Log.md',
        fileType: 'Checklist Sheet',
        description: 'A physical checklist log to inspect life-saving defibrillators, crash cart drugs, and emergency airway equipment.',
        contentMarkdown: `# Daily Emergency Crash Cart Log
**Verify every morning shift. Ensure double-locking seal is intact.**

- **Defibrillator Functioning**: [ ] Yes [ ] No
- **Oxygen Cylinder Pressure**: _____ psi
- **Intubation Kit Checked**: [ ] Yes [ ] No
- **Suction Machine Operational**: [ ] Yes [ ] No
- **Core Drugs Availability list (Adrenaline, Atropine, Amiodarone)**: [ ] Verified`
      }
    ]
  },
  {
    id: 'COP_3',
    chapterId: 'COP',
    code: 'COP.3',
    question: 'Are blood transfusion policies implemented with rigorous pre-transfusion cross-matching checks?',
    description: 'Blood transfusion must be safe. Consents must be obtained, and pre-transfusion identity controls executed at the bedside.',
    defaultActionItem: 'Establish dual-witness visual bedside verification before blood administration. Institute formal Transfusion Reaction Protocols.',
    helpResources: [
      {
        id: 'res_cop_3_1',
        title: 'Pre-Transfusion Bedside Safety Protocol',
        fileName: 'Blood_Transfusion_Safety.md',
        fileType: 'Protocol Standard',
        description: 'Detailed two-person identification protocol before starting blood transfusions.',
        contentMarkdown: `# Pre-Transfusion Patient Bedside Audit Sheet
**To be completed by TWO healthcare professionals (Doctor/Nursing) immediately before needle prick.**

1. **Verify Patient Identity**: Full Name, Age, Sex, IP NO.
2. **Cross-match bag label**: Blood group matching (ABO/Rh Compatibility sheet).
3. **Check Expiry date of the Blood bag**: Marked ______________
4. **Informed Consent Signatures Checked**: [ ] Yes, present in file
5. **Baseline Vital Signs Log**:
   - Temp: _____  BP: _____  PR: _____`
      }
    ]
  },

  // 3. MOM
  {
    id: 'MOM_1',
    chapterId: 'MOM',
    code: 'MOM.1',
    question: 'Is there a designated Pharmacy layout with secure, climate-monitored storage for medication?',
    description: 'Medication must be stored in appropriate climatic environments. High-risk, narcotic, and look-alike drugs must be distinctly labeled and restricted.',
    defaultActionItem: 'Purchase temperature-monitoring loggers for pharmacy refrigerators. Establish separate locked cabinets for Narcotics and Look-Alike Sound-Alike (LASA) medications.',
    helpResources: [
      {
        id: 'res_mom_1_1',
        title: 'Pharmacy Storage & LASA Drug Labeling SOP',
        fileName: 'SOP_Lasa_Narcotic_Storage.md',
        fileType: 'Pharmacy Guidelines',
        description: 'Protocols for handling LASA (Look-Alike Sound-Alike) drugs and safe narcotic storage with dual locks.',
        contentMarkdown: `# SOP: Safe Medication Storage & LASA Management
1. **Narcotics & Psychotropics**: Must be locked in a double-walled steel cabinet with dual custodianship. Daily handovers must log exact tablet counts.
2. **LASA (Look-Alike Sound-Alike)**: Standard green-red labels. Must NOT be stored next to each other on the racks.
3. **Refrigerated Drugs (2-8°C)**: Daily morning and evening temperature tracking logbooks are mandatory.`
      }
    ]
  },
  {
    id: 'MOM_2',
    chapterId: 'MOM',
    code: 'MOM.2',
    question: 'Are prescriptions written in a standardized format, using generic names and clear abbreviations as per WHO?',
    description: 'Prescriptions must be legible, generic-name prioritized, and signed with date, time, and doctor registration number.',
    defaultActionItem: 'Conduct monthly prescription audit samples. Distribute a list of banned, high-risk abbreviations to all consultants.',
    helpResources: [
      {
        id: 'res_mom_2_1',
        title: 'Banned Abbreviations List & Safe Prescription Policy',
        fileName: 'Banned_Abbreviations_Circular.md',
        fileType: 'Circular Poster',
        description: 'Official warning sheet listing abbreviations that frequently lead to medical dosing errors.',
        contentMarkdown: `# Safe Prescription Circular: Banned Abbreviations
**DO NOT USE these abbreviations. Write full clinical terms.**

| Banned | Potential Error | Correct Standard |
| :--- | :--- | :--- |
| **U** | Read as '0' or '4' | Write **"Units"** |
| **IU** | Read as 'IV' or '10' | Write **"International Units"** |
| **QD** / **QOD**| Confused with each other | Write **"Daily"** / **"Every alternate day"** |
| **Trailing Zero (5.0)**| Read as '50%' if dot missed | Write **"5 mg"** |
| **Lack of Leading zero (.5)**| Read as '5' if dot missed | Write **"0.5 mg"** |`
      }
    ]
  },

  // 4. PRE
  {
    id: 'PRE_1',
    chapterId: 'PRE',
    code: 'PRE.1',
    question: 'Are Patient Rights and Responsibilities displayed and communicated using local languages?',
    description: 'Hospitals must visually educate patients on their rights regarding privacy, continuous care, billing estimates, and right to second opinion.',
    defaultActionItem: 'Create bilingual/trilingual display boards detailing Patient Rights & Responsibilities. Erect boards at main entrance, OPD cash counter, and triage reception.',
    helpResources: [
      {
        id: 'res_pre_1_1',
        title: 'Patient Rights & Responsibilities Text (English/Hindi)',
        fileName: 'Patient_Rights_Responsibilities_Poster.md',
        fileType: 'Banner Material',
        description: 'Complete wordings ready to send to printing houses for compliance boards.',
        contentMarkdown: `# Patient Rights & Responsibilities Poster Outline
## Patient Rights:
1. **Right to Respectful Care**: Free of discrimination, abuse, or neglect.
2. **Right to Confidentiality & Privacy**: During physical examination and treatment consultations.
3. **Right to Information**: Complete diagnostic briefing, expected cost breakdowns, and right to a independent second opinion.
4. **Right to Informed Consent**: Prior to surgeries, blood transfusion, or chemotherapy.

## Patient Responsibilities:
1. **Provide True History**: Medical history, medications, allergies, and contact details.
2. **Adhere to Treatment Protocols**: Respect hospital safety disciplines.`
      }
    ]
  },

  // 5. IPC
  {
    id: 'IPC_1',
    chapterId: 'IPC',
    code: 'IPC.1',
    question: 'Are Hand Hygiene compliance checks and hand sanitization stations installed at key care points?',
    description: 'Hospitals must promote the "5 Moments of Hand Hygiene" and ensure sanitization materials are available in all wards and ICUs.',
    defaultActionItem: 'Install wall-mounted alcohol hand rubs at every bedside in ICU and at least one rub per clinical cubicle in general wards. Conduct secret hand rub compliance audits.',
    helpResources: [
      {
        id: 'res_ipc_1_1',
        title: 'WHO 5 Moments of Hand Hygiene Guidelines',
        fileName: 'WHO_Hand_Hygiene_Moments.md',
        fileType: 'Clinical SOP',
        description: 'Guidance and training resource for nurses and doctors on hand sanitization steps.',
        contentMarkdown: `# WHO 5 Moments of Hand Hygiene
Ensure sanitization occurs before and after clinical touches:

1. **BEFORE** touching a patient.
2. **BEFORE** clean/aseptic procedures.
3. **AFTER** body fluid exposure risk.
4. **AFTER** touching a patient.
5. **AFTER** touching patient surroundings.`
      }
    ]
  },
  {
    id: 'IPC_2',
    chapterId: 'IPC',
    code: 'IPC.2',
    question: 'Is the clinical facility complying with Biomedical Waste Management (BMW) rules?',
    description: 'Color-coded bin stations (Red, Yellow, Blue, White) must exist with proper storage holding areas and designated waste disposal registers.',
    defaultActionItem: 'Equip all clinical rooms with the four colored bins. Place needle destroyers or white puncture-proof containers at nursing stations. Create a secure locked terminal area for holding bio-waste.',
    helpResources: [
      {
        id: 'res_ipc_2_1',
        title: 'BMW Color Segregation Poster & Logbook Sheet',
        fileName: 'Biomedical_Waste_Segregation.md',
        fileType: 'Segregation SOP',
        description: 'Color coding poster containing trash allocation protocols and monthly disposal log files.',
        contentMarkdown: `# Biomedical Waste Segregation Guide
Ensure garbage is sorted exactly at source:

- **YELLOW BAG**: Human anatomical tissue, bloody dressings, soiled cotton bandages, expired medications.
- **RED BAG**: Recyclable plastic wastes (catheters, IV bottles, syringes without needles, gloves).
- **BLUE CART**: Glass waste, ampoules, broken vials.
- **WHITE CANISTER (Puncture-Proof)**: Syringes with fixed needles, blades, scalpels.`
      }
    ]
  },

  // 6. PSQ
  {
    id: 'PSQ_1',
    chapterId: 'PSQ',
    code: 'PSQ.1',
    question: 'Are clinical and management quality indicators defined, measured, and reviewed periodically?',
    description: 'Hospitals must monitor quality markers (mortality, bed occupancy, medication errors, re-admissions) to detect trends and execute corrective actions.',
    defaultActionItem: 'Establish a Quality Steering Group. Document clinical indicators monthly using standard trackers.',
    helpResources: [
      {
        id: 'res_psq_1_1',
        title: 'Hospital Core Quality Indicators Logbook',
        fileName: 'Hospital_Quality_Indicators_SOP.md',
        fileType: 'Excel Blueprint',
        description: 'Standard formula definition metrics for hospital key performance indicators.',
        contentMarkdown: `# SOP: Hospital Quality Indicator Monitoring
The hospital Quality Officer shall register and track these 5 indicators monthly:

1. **Surgical Site Infection Rate (SSI)**: (No. of SSI / No. of surgeries) x 100
2. **Medication Error Incidence**: Count of documented prescription / dispensing errors.
3. **Emergency Wait Times**: Average minutes from admission to clinician review.
4. **Patient Satisfaction Score**: Monthly average from patient feedbacks.
5. **Needle Stick Injuries**: Incidence count among clinical employees.`
      }
    ]
  },

  // 7. ROM
  {
    id: 'ROM_1',
    chapterId: 'ROM',
    code: 'ROM.1',
    question: 'Are all required license registrations valid and legally active?',
    description: 'Hospitals must maintain active licenses (e.g. Clinical Establishments Act registry, PCB Bio-waste certificate, Pharmacy license, Fire NOC, AERB for X-Rays).',
    defaultActionItem: 'Construct a Master Licenses Registry showing dates of issue and expiry warnings (with alerts to start renewal 3 months prior).',
    helpResources: [
      {
        id: 'res_rom_1_1',
        title: 'Regulatory Audit Checklist & License Tracker',
        fileName: 'Regulatory_Compliance_Tracker.md',
        fileType: 'Regulatory Template',
        description: 'Excel table format for capturing tracking indices of all legal medical permissions.',
        contentMarkdown: `# Hospital Master Regulatory Compliance Sheet
*Keep digital photocopies under lock and key. Update this tracker quarterly.*

| S.No | License Required | Regulatory Authority | Issued Date | Expiry Date | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Clinical Establishment Act | Director of Health Services | DD/MM/YYYY | DD/MM/YYYY | Active/Expired |
| 2 | Fire NOC | Fire Department State | DD/MM/YYYY | DD/MM/YYYY | Active / Renewal Pending |
| 3 | BMW Pollution NOC | State Pollution Control Board| DD/MM/YYYY | DD/MM/YYYY | Active |
| 4 | Pharmacy License | State Drug Controller | DD/MM/YYYY | DD/MM/YYYY | Active |`
      }
    ]
  },

  // 8. FMS
  {
    id: 'FMS_1',
    chapterId: 'FMS',
    code: 'FMS.1',
    question: 'Are functional fire extinguishers, alarms, and emergency escape routes clear and tested periodically?',
    description: 'Fire detectors, hoses, and extinguishers must receive active certified servicing. Staff must participate in fire safety drills.',
    defaultActionItem: 'Sign an Annual Maintenance Contract (AMC) for fire equipment. Schedule bi-annual practical fire physical safety training drills.',
    helpResources: [
      {
        id: 'res_fms_1_1',
        title: 'Fire Safety Drill & Extinguisher Inspection SOP',
        fileName: 'Fire_Safety_Inspection_Protocol.md',
        fileType: 'Facility Guidelines',
        description: 'Fire marshal walk-around checks, mock evacuation scenarios, and PASS extinguisher guidelines.',
        contentMarkdown: `# Fire Mock Drill & Equipment Walkthrough Protocol
## 1. MONTHLY AUDITS:
- Confirm pressure gauge needles of all visual extinguishers sit strictly inside the "GREEN" zone.
- Escape pathways must not hold store clutter or broken furniture.

## 2. EMERGENCY RESPONSE TASK PRINCIPLE (R.A.C.E.):
- **R - Rescue**: Save patients in immediate hazard danger.
- **A - Alert**: Trigger alarms / announce code red.
- **C - Confine**: Close doors to seal smoke.
- **E - Extinguish**: Attempt PASS extinguish if safe.`
      }
    ]
  },

  // 9. HRM
  {
    id: 'HRM_1',
    chapterId: 'HRM',
    code: 'HRM.1',
    question: 'Are medical credentials (degrees, state registrations) of all clinicians and nurses checked and kept in personnel files?',
    description: 'All healthcare professionals must possess valid academic certificates and current registrations with respective professional state medical boards.',
    defaultActionItem: 'Perform credentialing background checks on doctors and nurses at joining. Maintain verified documents under personal personnel files.',
    helpResources: [
      {
        id: 'res_hrm_1_1',
        title: 'Personnel File Completeness & Credentialing SOP',
        fileName: 'Staff_Credentialing_File_Requirement.md',
        fileType: 'HR Forms',
        description: 'An audit checklist list to check the files of medical, nursing, and support personnel.',
        contentMarkdown: `# Personnel File Audit Checklist
Every personal file must hold the following authenticated documents:

- [ ] Job Application & Interview evaluation sheets
- [ ] Employee curriculum vitae
- [ ] Copy of educational qualification certificates (MBBS, MD, GNM, BSc Nursing)
- [ ] Valid Registration Certificate with State Medical Council / Nursing Council
- [ ] Primary source medical background verification log
- [ ] Signed Job Description & Code of Ethics`
      }
    ]
  },

  // 10. IMS
  {
    id: 'IMS_1',
    chapterId: 'IMS',
    code: 'IMS.1',
    question: 'Are Patient Medical Records stored securely, preventing unauthorized access or digital leaks?',
    description: 'Patients healthcare details must be private. Inpatient paper charts must be locked in a limited-access Medical Record Department (MRD). EMRs must use access logs.',
    defaultActionItem: 'Install physical lock entries on physical file shelves. Standardize a file request/return sign-out logbook.',
    helpResources: [
      {
        id: 'res_ims_1_1',
        title: 'Medical Record Retention & Authorization Policy',
        fileName: 'Medical_Record_Security_SOP.md',
        fileType: 'Records Protocol',
        description: 'Guidelines on file retrievals, tracking index, medical file privacy, and statutory record-retention years laws.',
        contentMarkdown: `# Medical Record Administration Policy (MRD)
- **Authorized Personnel Only**: Strictly prevent non-clinical staff or patient families from accessing files directly.
- **SOP for File Requests**: Anyone checking out a paper chart must complete a signed retrieve request slip. This must be replaced with a tracer card.
- **Retention Schedule standards**:
  - Outpatient cards: 3 years
  - Inpatient records: 5 years
  - Medico-legal cases (MLC): Must retain permanently until court case concludes.`
      }
    ]
  }
];

export const MOCK_EVALUATION_SESSIONS: EvaluationSession[] = [
  {
    id: 'session_demo_1',
    hospitalName: 'Care Multi-Speciality Hospital',
    contactName: 'Dr. Ramesh Sharma',
    contactNumber: '+91 98765 43210',
    emailId: 'contact@carehospital.com',
    city: 'New Delhi',
    startedAt: '2026-05-12T10:00:00Z',
    updatedAt: '2026-05-14T14:30:00Z',
    isCompleted: true,
    answers: {
      AAC_1: { criterionId: 'AAC_1', response: 'compliant', notes: 'Excellent pre-admission leaflets printed.' },
      AAC_2: { criterionId: 'AAC_2', response: 'partially_compliant', customActionItem: 'Ensure nursing assessment happens within exactly 15 minutes of admission.', priority: 'high', targetDate: '2026-07-20', status: 'in_progress', notes: 'Assessments are slow in late night OPD shifts.' },
      AAC_3: { criterionId: 'AAC_3', response: 'compliant' },
      COP_1: { criterionId: 'COP_1', response: 'compliant' },
      COP_2: { criterionId: 'COP_2', response: 'non_compliant', customActionItem: 'Replace dry batteries in 2 emergency defibrillation crash carts. Arrange resuscitation mock drill.', priority: 'high', targetDate: '2026-06-30', status: 'pending', notes: 'Auditor found defib dead on shift survey.' },
      COP_3: { criterionId: 'COP_3', response: 'compliant' },
      MOM_1: { criterionId: 'MOM_1', response: 'partially_compliant', customActionItem: 'Affix yellow/red sticker alerts to all LASA boxes in the IP pharmacy shelves.', priority: 'medium', targetDate: '2026-08-01', status: 'in_progress' },
      MOM_2: { criterionId: 'MOM_2', response: 'compliant' },
      PRE_1: { criterionId: 'PRE_1', response: 'compliant' },
      IPC_1: { criterionId: 'IPC_1', response: 'compliant' },
      IPC_2: { criterionId: 'IPC_2', response: 'compliant' },
      PSQ_1: { criterionId: 'PSQ_1', response: 'partially_compliant', customActionItem: 'Formulate monthly needle-stick survey sheets.', priority: 'low', targetDate: '2026-09-15', status: 'pending' },
      ROM_1: { criterionId: 'ROM_1', response: 'compliant' },
      FMS_1: { criterionId: 'FMS_1', response: 'compliant' },
      HRM_1: { criterionId: 'HRM_1', response: 'compliant' },
      IMS_1: { criterionId: 'IMS_1', response: 'compliant' }
    }
  },
  {
    id: 'session_demo_2',
    hospitalName: 'Apex Family Clinic & Nursing Home',
    contactName: 'Prof. Anjali Patel',
    contactNumber: '+91 99988 77766',
    emailId: 'info@apexfamilyclinic.in',
    city: 'Mumbai',
    startedAt: '2026-05-20T09:30:00Z',
    updatedAt: '2026-05-21T11:45:00Z',
    isCompleted: true,
    answers: {
      AAC_1: { criterionId: 'AAC_1', response: 'compliant' },
      AAC_2: { criterionId: 'AAC_2', response: 'compliant' },
      AAC_3: { criterionId: 'AAC_3', response: 'compliant' },
      COP_1: { criterionId: 'COP_1', response: 'compliant' },
      COP_2: { criterionId: 'COP_2', response: 'compliant' },
      COP_3: { criterionId: 'COP_3', response: 'not_applicable', notes: 'Facility does not perform blood transfusions.' },
      MOM_1: { criterionId: 'MOM_1', response: 'compliant' },
      MOM_2: { criterionId: 'MOM_2', response: 'compliant' },
      PRE_1: { criterionId: 'PRE_1', response: 'compliant' },
      IPC_1: { criterionId: 'IPC_1', response: 'compliant' },
      IPC_2: { criterionId: 'IPC_2', response: 'partially_compliant', customActionItem: 'Construct a closed concrete storage room near loading dock for BMW pending loader pick-up.', priority: 'medium', targetDate: '2026-07-15', status: 'in_progress', notes: 'Waste currently sits under open solar skies.' },
      PSQ_1: { criterionId: 'PSQ_1', response: 'non_compliant', customActionItem: 'Contract or appoint a certified QA auditor to construct quality charts.', priority: 'high', targetDate: '2026-07-01', status: 'pending' },
      ROM_1: { criterionId: 'ROM_1', response: 'compliant' },
      FMS_1: { criterionId: 'FMS_1', response: 'compliant' },
      HRM_1: { criterionId: 'HRM_1', response: 'compliant' },
      IMS_1: { criterionId: 'IMS_1', response: 'compliant' }
    }
  },
  {
    id: 'session_demo_3',
    hospitalName: 'Pragati Trauma & Maternity Unit',
    contactName: 'Sanjay Rawat',
    contactNumber: '+91 88877 66655',
    emailId: 'pragati.trauma@gmail.com',
    city: 'Jaipur',
    startedAt: '2026-06-02T13:10:00Z',
    updatedAt: '2026-06-03T17:00:00Z',
    isCompleted: true,
    answers: {
      AAC_1: { criterionId: 'AAC_1', response: 'partially_compliant', customActionItem: 'Sign formal MOU with nearby superspecialty for critical emergency transfers.', priority: 'high', targetDate: '2026-07-10', status: 'in_progress' },
      AAC_2: { criterionId: 'AAC_2', response: 'non_compliant', customActionItem: 'Train emergency nurses to execute and record initial clinical vital triage.', priority: 'high', targetDate: '2026-06-30', status: 'pending' },
      AAC_3: { criterionId: 'AAC_3', response: 'compliant' },
      COP_1: { criterionId: 'COP_1', response: 'partially_compliant', customActionItem: 'Distribute standard clinical guidelines book to juniors.' },
      COP_2: { criterionId: 'COP_2', response: 'compliant' },
      COP_3: { criterionId: 'COP_3', response: 'compliant' },
      MOM_1: { criterionId: 'MOM_1', response: 'non_compliant', customActionItem: 'Set up lock-keys for Schedule X medicine drawers.' },
      MOM_2: { criterionId: 'MOM_2', response: 'compliant' },
      PRE_1: { criterionId: 'PRE_1', response: 'partially_compliant', customActionItem: 'Display regional language Patient Rights boards.' },
      IPC_1: { criterionId: 'IPC_1', response: 'non_compliant', customActionItem: 'Procure hand sanitizer containers for active installation at OPD entries.' },
      IPC_2: { criterionId: 'IPC_2', response: 'compliant' },
      PSQ_1: { criterionId: 'PSQ_1', response: 'non_compliant', customActionItem: 'Initiate logging quarterly quality checklists.' },
      ROM_1: { criterionId: 'ROM_1', response: 'compliant' },
      FMS_1: { criterionId: 'FMS_1', response: 'partially_compliant', customActionItem: 'Refill expired fire cylinders on ground levels.' },
      HRM_1: { criterionId: 'HRM_1', response: 'compliant' },
      IMS_1: { criterionId: 'IMS_1', response: 'compliant' }
    }
  }
];

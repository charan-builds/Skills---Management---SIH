/**
 * Canonical Model Abstraction for Skilling Impact Intelligence Platform.
 * Enforces Single Source of Truth for:
 * 1. Canonical Programme Identifiers (Section 6)
 * 2. Canonical Outcome Definitions & Qualifying Placement Criteria (Section 7)
 */

export const CANONICAL_PROGRAMMES = {
  "CAN-PRG-CLOUD": {
    id: "CAN-PRG-CLOUD",
    canonical_code: "NSQF-L5-CLD-DEV",
    name: "Cloud Infrastructure & DevOps",
    sector: "Information Technology",
    nsqf_level: "Level 5",
    duration_weeks: 16,
    aliases: [
      "PRG-001",
      "PRG_CLOUD_DEVOPS",
      "SRC-SDI-MH-01",
      "Cloud Infrastructure & DevOps",
      "Cloud Computing & DevOps",
      "Cloud Infrastructure"
    ]
  },
  "CAN-PRG-FULLSTACK": {
    id: "CAN-PRG-FULLSTACK",
    canonical_code: "NSQF-L6-WEB-ENG",
    name: "Full Stack Web Engineering",
    sector: "Information Technology",
    nsqf_level: "Level 6",
    duration_weeks: 24,
    aliases: [
      "PRG-002",
      "REACT_NODE_FS",
      "SRC-MSDE-FS-02",
      "Full Stack Web Engineering",
      "Full Stack Web Development",
      "Full Stack Engineering"
    ]
  },
  "CAN-PRG-EV-AUTO": {
    id: "CAN-PRG-EV-AUTO",
    canonical_code: "NSQF-L4-EV-AUTO",
    name: "Automotive Precision & EV Systems",
    sector: "Manufacturing & Automotive",
    nsqf_level: "Level 4",
    duration_weeks: 20,
    aliases: [
      "PRG-003",
      "EV_AUTO_SYS",
      "SRC-AUTO-03",
      "Automotive Precision & EV Systems",
      "Electric Vehicle Assembly",
      "EV Automotive"
    ]
  },
  "CAN-PRG-HEALTHCARE": {
    id: "CAN-PRG-HEALTHCARE",
    canonical_code: "NSQF-L4-HC-CARE",
    name: "Patient Care & Healthcare Operations",
    sector: "Healthcare",
    nsqf_level: "Level 4",
    duration_weeks: 18,
    aliases: [
      "PRG-004",
      "HC_PATIENT_CARE",
      "SRC-HEALTH-04",
      "Patient Care & Healthcare Operations",
      "Patient Care Assistant",
      "Healthcare Operations"
    ]
  },
  "CAN-PRG-SOLAR": {
    id: "CAN-PRG-SOLAR",
    canonical_code: "NSQF-L4-SOL-REN",
    name: "Solar Energy & Renewable Installation",
    sector: "Green Energy",
    nsqf_level: "Level 4",
    duration_weeks: 14,
    aliases: [
      "PRG-005",
      "SOLAR_INSTALL",
      "SRC-GREEN-05",
      "Solar Energy & Renewable Installation",
      "Solar PV Technician",
      "Renewable Energy"
    ]
  }
};

/**
 * Normalizes any external or source programme ID or name into a canonical programme entity.
 */
export function getCanonicalProgramme(sourceIdOrName) {
  if (!sourceIdOrName) return CANONICAL_PROGRAMMES["CAN-PRG-CLOUD"];
  const searchStr = String(sourceIdOrName).trim().toLowerCase();

  for (const prog of Object.values(CANONICAL_PROGRAMMES)) {
    if (prog.id.toLowerCase() === searchStr || prog.name.toLowerCase() === searchStr) {
      return prog;
    }
    if (prog.aliases.some(alias => alias.toLowerCase() === searchStr)) {
      return prog;
    }
  }

  // Fallback if unmatched
  return {
    id: `CAN-${sourceIdOrName.toUpperCase()}`,
    canonical_code: "NSQF-GENERIC",
    name: sourceIdOrName,
    sector: "General Vocational",
    nsqf_level: "Level 4",
    duration_weeks: 16,
    aliases: [sourceIdOrName]
  };
}

/**
 * Canonical Outcome Definitions (Section 7)
 * Supported categories:
 * - Employed
 * - Self-Employed
 * - Apprentice
 * - Unemployed
 * - Studying Further
 */
export const CANONICAL_OUTCOMES = {
  EMPLOYED: {
    key: "EMPLOYED",
    label: "Employed",
    qualifies_as_placed: true,
    required_evidence: "Employer verification or verified corporate payroll record",
    description: "Gainful corporate, MSME, or contractual employment"
  },
  SELF_EMPLOYED: {
    key: "SELF_EMPLOYED",
    label: "Self-Employed",
    qualifies_as_placed: true,
    required_evidence: "Self-attested enterprise registration, commercial invoicing, or trade turnover",
    description: "Independent commercial enterprise or registered freelance trade"
  },
  APPRENTICESHIP: {
    key: "APPRENTICESHIP",
    label: "Apprentice",
    qualifies_as_placed: true,
    required_evidence: "Apprenticeship contract registration or stipend disbursement record",
    description: "Formal industrial apprenticeship training contract"
  },
  UNEMPLOYED: {
    key: "UNEMPLOYED",
    label: "Unemployed",
    qualifies_as_placed: false,
    required_evidence: "Candidate self-declaration or lack of active verified employment record",
    description: "Actively seeking placement or unavailable for employment"
  },
  STUDYING_FURTHER: {
    key: "STUDYING_FURTHER",
    label: "Studying Further",
    qualifies_as_placed: false,
    required_evidence: "Enrollment letter or student verification from higher educational institute",
    description: "Enrolled full-time in higher diploma, degree, or competitive exam preparation"
  }
};

/**
 * Normalizes any arbitrary outcome string to a canonical outcome key.
 */
export function normalizeOutcome(status) {
  if (!status) return "UNEMPLOYED";
  const s = String(status).toUpperCase().trim();
  if (s.includes("SELF")) return "SELF_EMPLOYED";
  if (s.includes("APPRENTICE")) return "APPRENTICESHIP";
  if (s.includes("STUDY") || s.includes("FURTHER") || s.includes("EDUCATION")) return "STUDYING_FURTHER";
  if (s.includes("EMPLOYED") || s.includes("PLACED") || s.includes("JOB")) return "EMPLOYED";
  return "UNEMPLOYED";
}

/**
 * Determines whether a candidate qualifies as 'Placed' under canonical statutory criteria.
 * Qualifies if Employed, Self-Employed, or Apprentice.
 */
export function isQualifyingPlacement(status, verificationStatus = null) {
  const norm = normalizeOutcome(status);
  const def = CANONICAL_OUTCOMES[norm];
  if (!def || !def.qualifies_as_placed) return false;

  // If status is EMPLOYED, rejection overrides placement
  if (norm === "EMPLOYED" && verificationStatus === "Rejected") {
    return false;
  }
  return true;
}

/**
 * Follow-up Lifecycle States (Section 15 & 17)
 */
export const FOLLOW_UP_STATES = {
  SCHEDULED: "Scheduled",
  DUE: "Due",
  UPCOMING: "Upcoming",
  COMPLETED: "Completed",
  MISSED: "Missed",
  NEEDS_ASSISTANCE: "Needs Assistance"
};

/**
 * Skill Evidence States (Section 22)
 */
export const SKILL_EVIDENCE_STATES = {
  NO_BENCHMARK: "NO_BENCHMARK",
  NO_EVIDENCE: "NO_EVIDENCE",
  INSUFFICIENT_SKILL_EVIDENCE: "INSUFFICIENT_SKILL_EVIDENCE",
  EVIDENCE_AVAILABLE: "EVIDENCE_AVAILABLE"
};

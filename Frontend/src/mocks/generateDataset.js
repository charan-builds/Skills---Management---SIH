/**
 * Deterministic Relational Dataset Generator for Skilling Impact Intelligence.
 * Generates an authoritative ~800 trainee relational dataset with realistic longitudinal variance.
 * Utilizes a seeded pseudo-random number generator (Mulberry32) for strict reproducibility.
 */

function mulberry32(seed) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42); // Deterministic seed

function pickOne(arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function addMonths(dateStr, months) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const totalMonths = (y * 12 + (m - 1)) + months;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = (totalMonths % 12) + 1;
  return `${newYear}-${String(newMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export const PROGRAMMES = [
  {
    id: "PRG-001",
    name: "Cloud Infrastructure & DevOps",
    sector: "Information Technology",
    duration_weeks: 16,
    target_proficiency: 85,
    modules: [
      { code: "MOD-101", name: "Linux & Networking", skill: "Linux Administration", target_score: 80 },
      { code: "MOD-102", name: "AWS & Cloud Architecture", skill: "Cloud Architecture", target_score: 85 },
      { code: "MOD-103", name: "Docker & Kubernetes", skill: "Containerization", target_score: 90 },
      { code: "MOD-104", name: "CI/CD Automation", skill: "Automation & CI/CD", target_score: 85 }
    ]
  },
  {
    id: "PRG-002",
    name: "Full Stack Web Engineering",
    sector: "Information Technology",
    duration_weeks: 24,
    target_proficiency: 90,
    modules: [
      { code: "MOD-201", name: "Modern React & State", skill: "Frontend Engineering", target_score: 90 },
      { code: "MOD-202", name: "Node.js & Microservices", skill: "Backend Systems", target_score: 85 },
      { code: "MOD-203", name: "Relational & NoSQL Databases", skill: "Database Design", target_score: 85 },
      { code: "MOD-204", name: "API Security & Cloud Deploy", skill: "Web Security", target_score: 80 }
    ]
  },
  {
    id: "PRG-003",
    name: "Automotive Precision & EV Systems",
    sector: "Manufacturing & Automotive",
    duration_weeks: 20,
    target_proficiency: 80,
    modules: [
      { code: "MOD-301", name: "EV Powertrain & Telemetry", skill: "EV Battery Tech", target_score: 85 },
      { code: "MOD-302", name: "Automotive ECU Diagnostics", skill: "ECU Diagnostics", target_score: 80 },
      { code: "MOD-303", name: "Precision Assembly & CNC", skill: "CNC Fabrication", target_score: 80 }
    ]
  },
  {
    id: "PRG-004",
    name: "Patient Care & Healthcare Operations",
    sector: "Healthcare",
    duration_weeks: 18,
    target_proficiency: 85,
    modules: [
      { code: "MOD-401", name: "Clinical Patient Care", skill: "Emergency Triage", target_score: 90 },
      { code: "MOD-402", name: "Diagnostic Equipment Ops", skill: "Diagnostics Equipment", target_score: 85 },
      { code: "MOD-403", name: "Electronic Health Records", skill: "EHR Management", target_score: 80 }
    ]
  },
  {
    id: "PRG-005",
    name: "Renewable Energy & Solar Grid",
    sector: "Green Energy",
    duration_weeks: 14,
    target_proficiency: 80,
    modules: [
      { code: "MOD-501", name: "Solar PV Design & Sizing", skill: "PV Array Engineering", target_score: 85 },
      { code: "MOD-502", name: "Inverter Maintenance & Grid", skill: "Inverter Maintenance", target_score: 80 },
      { code: "MOD-503", name: "Industrial Electrical Safety", skill: "Industrial Electrical Safety", target_score: 90 }
    ]
  }
];

export const PROVIDERS = [
  {
    id: "PRV-001",
    name: "Tech Mahindra Foundation",
    district: "Pune",
    centres: 4,
    programmes: ["PRG-001", "PRG-002"],
    placement_bias: 0.78,
    retention_bias: 0.76,
    wage_bias: 1.05
  },
  {
    id: "PRV-002",
    name: "TATA STRIVE",
    district: "Mumbai",
    centres: 6,
    programmes: ["PRG-001", "PRG-003"],
    placement_bias: 0.86,
    retention_bias: 0.83,
    wage_bias: 1.15
  },
  {
    id: "PRV-003",
    name: "Don Bosco Tech Society",
    district: "Nagpur",
    centres: 3,
    programmes: ["PRG-003", "PRG-004"],
    placement_bias: 0.67,
    retention_bias: 0.71,
    wage_bias: 0.92
  },
  {
    id: "PRV-004",
    name: "Apollo MedSkills Institute",
    district: "Nashik",
    centres: 3,
    programmes: ["PRG-004"],
    placement_bias: 0.82,
    retention_bias: 0.86,
    wage_bias: 1.02
  },
  {
    id: "PRV-005",
    name: "Schneider Electric Training Centre",
    district: "Thane",
    centres: 2,
    programmes: ["PRG-005"],
    placement_bias: 0.74,
    retention_bias: 0.75,
    wage_bias: 0.98
  }
];

export const DISTRICTS = [
  { id: "DIST-001", name: "Mumbai", tier: "Tier 1", state: "Maharashtra" },
  { id: "DIST-002", name: "Pune", tier: "Tier 1", state: "Maharashtra" },
  { id: "DIST-003", name: "Nagpur", tier: "Tier 2", state: "Maharashtra" },
  { id: "DIST-004", name: "Nashik", tier: "Tier 2", state: "Maharashtra" },
  { id: "DIST-005", name: "Thane", tier: "Tier 1", state: "Maharashtra" },
  { id: "DIST-006", name: "Guntur", tier: "Tier 2", state: "Andhra Pradesh" }
];

export const EMPLOYERS = [
  {
    id: "EMP-DEMO-001",
    name: "Tata Consultancy Services",
    code: "TCS-MH-01",
    sector: "Information Technology",
    location: "Mumbai",
    registration_gst: "27AAACT2727Q1ZB",
    representative: "Rohit Sharma",
    status: "Verified",
    registration_date: "2023-01-15",
    hr_system: "Workday"
  },
  {
    id: "EMP-002",
    name: "Infosys BPM",
    code: "INFY-PN-02",
    sector: "Information Technology",
    location: "Pune",
    registration_gst: "27AAACI1234F1ZR",
    representative: "Anjali Deshmukh",
    status: "Verified",
    registration_date: "2023-03-20",
    hr_system: "BambooHR"
  },
  {
    id: "EMP-003",
    name: "Mahindra & Mahindra Automotive",
    code: "M&M-PN-03",
    sector: "Manufacturing & Automotive",
    location: "Pune",
    registration_gst: "27AAACM5678L1ZY",
    representative: "Vikram Kulkarni",
    status: "Verified",
    registration_date: "2023-02-10",
    hr_system: "SAP SuccessFactors"
  },
  {
    id: "EMP-004",
    name: "Apollo Hospitals Enterprise",
    code: "APOLLO-NSK-04",
    sector: "Healthcare",
    location: "Nashik",
    registration_gst: "27AAACA9012K1ZT",
    representative: "Dr. Kavita Joshi",
    status: "Verified",
    registration_date: "2023-04-18",
    hr_system: "Oracle HCM"
  },
  {
    id: "EMP-005",
    name: "Reliance Clean Energy Ltd",
    code: "RCEL-NGP-05",
    sector: "Green Energy",
    location: "Nagpur",
    registration_gst: "27AAACR3456D1ZW",
    representative: "Suresh Nambiar",
    status: "Verified",
    registration_date: "2023-05-22",
    hr_system: "Darwinbox"
  },
  {
    id: "EMP-006",
    name: "Wipro Digital Solutions",
    code: "WIPRO-MUM-06",
    sector: "Information Technology",
    location: "Mumbai",
    registration_gst: "27AAACW7890M1ZX",
    representative: "Rajesh Iyer",
    status: "Verified",
    registration_date: "2023-06-12",
    hr_system: "Workday"
  },
  {
    id: "EMP-007",
    name: "Tata Motors EV Tech",
    code: "TM-EV-PN-07",
    sector: "Manufacturing & Automotive",
    location: "Pune",
    registration_gst: "27AAACT9876E1ZP",
    representative: "Sneha Bhosale",
    status: "Verified",
    registration_date: "2023-08-05",
    hr_system: "SAP SuccessFactors"
  },
  {
    id: "EMP-008",
    name: "SunPower Grid Solutions",
    code: "SUN-THN-08",
    sector: "Green Energy",
    location: "Thane",
    registration_gst: "27AAACS4321A1ZQ",
    representative: "Pradeep Rao",
    status: "Verified",
    registration_date: "2023-09-01",
    hr_system: "BambooHR"
  }
];

export const COHORTS = ["2024-Q1", "2023-Q4", "2023-Q3", "2023-Q2"];

const FIRST_NAMES_MALE = ["Aarav", "Rohan", "Aditya", "Vikram", "Rahul", "Kunal", "Amit", "Nikhil", "Pranav", "Sahil", "Gaurav", "Manish", "Deepak", "Akash", "Varun", "Abhishek", "Sachin", "Arjun", "Kiran", "Yash"];
const FIRST_NAMES_FEMALE = ["Priya", "Neha", "Sneha", "Anjali", "Pooja", "Ritu", "Swati", "Kavita", "Deepika", "Shreya", "Meera", "Tanvi", "Sunita", "Divya", "Pallavi", "Isha", "Shruti", "Ananya", "Aarti", "Simran"];
const LAST_NAMES = ["Sharma", "Patil", "Deshmukh", "Kulkarni", "Joshi", "Shinde", "Pawar", "More", "Bhosale", "Chavan", "Gaekwad", "Tambe", "Mane", "Kadam", "Yadav", "Verma", "Gupta", "Mehta", "Iyer", "Nair"];

const NON_PLACEMENT_REASONS = [
  "Lack of required skills",
  "No suitable jobs in district",
  "Location / Relocation constraints",
  "Salary offered below expectation",
  "Lack of experience",
  "Pursuing further education",
  "Other personal reasons"
];

const ATTRITION_REASONS = [
  "Better opportunity elsewhere",
  "Low initial compensation",
  "Skill expectation mismatch",
  "Relocation / Transport issues",
  "Working conditions",
  "Contract ended",
  "Personal reasons"
];

const SKILL_GAPS_BY_PROGRAMME = {
  "PRG-001": ["Kubernetes & Containerization", "Terraform & IaC", "CI/CD Automation", "Linux Kernel Tuning"],
  "PRG-002": ["Next.js SSR & Performance", "Microservice Architecture", "Database Query Optimization", "GraphQL Integration"],
  "PRG-003": ["High Voltage EV Safety", "CAN-bus Telemetry Diagnostics", "Battery Management Systems (BMS)", "CNC Calibration"],
  "PRG-004": ["Emergency Room Triage", "Specialized ICU Care", "Electronic Health Records (EHR)", "Dialysis Equipment Handling"],
  "PRG-005": ["Grid Inverter SCADA Synchronization", "Solar PV Micro-grid Simulation", "High Voltage Safety Protocols", "Three-Phase Power Quality"]
};

/**
 * Generate 800 relational trainees with deterministic longitudinal history.
 */
export function generateRelationalDataset(targetCount = 800) {
  const trainees = [];
  const verifications = [];
  let verIdCounter = 1;

  for (let i = 1; i <= targetCount; i++) {
    const id = `TR-${String(i).padStart(4, "0")}`;
    
    // Gender & Names
    const isFemale = rng() < 0.46;
    const gender = isFemale ? "Female" : (rng() < 0.96 ? "Male" : "Other");
    const firstName = isFemale ? pickOne(FIRST_NAMES_FEMALE) : pickOne(FIRST_NAMES_MALE);
    const lastName = pickOne(LAST_NAMES);
    const name = `${firstName} ${lastName}`;

    // Demographics
    const age = randInt(19, 32);
    const ageGroup = age <= 21 ? "18-21" : age <= 25 ? "22-25" : age <= 30 ? "26-30" : "31+";
    const categoryRoll = rng();
    const category = categoryRoll < 0.35 ? "General" : categoryRoll < 0.67 ? "OBC" : categoryRoll < 0.85 ? "SC" : "ST";
    
    // District
    const districtObj = pickOne(DISTRICTS);
    const district = districtObj.name;

    // Programme & Provider
    const programme = pickOne(PROGRAMMES);
    // Find provider associated with this programme or pick matching
    const candidateProviders = PROVIDERS.filter(p => p.programmes.includes(programme.id));
    const provider = candidateProviders.length > 0 ? pickOne(candidateProviders) : pickOne(PROVIDERS);

    // Cohort
    const cohort = pickOne(COHORTS);

    // Training completion & certification
    const droppedOut = rng() > (provider.placement_bias > 0.8 ? 0.94 : 0.88);
    const training_status = droppedOut ? "Dropped Out" : "Completed";
    const certified = !droppedOut && rng() < 0.92;
    const assessmentScore = certified ? randInt(65, 98) : randInt(40, 64);
    const certificate_id = certified ? `CERT-${cohort}-${String(i).padStart(5, "0")}` : null;

    // Trainee Outcome Determination based on provider bias
    let outcomeStatus = "UNEMPLOYED";
    let unempReason = null;
    let employment = null;
    let wageHistory = [];
    let retention = null;
    let attritionReason = null;
    let isRetained3M = false;
    let isRetained6M = false;
    let isRetained12M = false;

    if (!droppedOut) {
      const placementRoll = rng();
      const threshold = provider.placement_bias;

      if (placementRoll < threshold * 0.72) {
        outcomeStatus = "EMPLOYED";
      } else if (placementRoll < threshold * 0.85) {
        outcomeStatus = "SELF_EMPLOYED";
      } else if (placementRoll < threshold * 0.95) {
        outcomeStatus = "APPRENTICESHIP";
      } else if (rng() < 0.15) {
        outcomeStatus = "STUDYING_FURTHER";
      } else {
        outcomeStatus = "UNEMPLOYED";
        unempReason = pickOne(NON_PLACEMENT_REASONS);
      }
    } else {
      outcomeStatus = "UNEMPLOYED";
      unempReason = "Lack of required skills";
    }

    // Role, Wage & Longitudinal Data for Employed/Apprentice/Self-Employed
    if (outcomeStatus === "EMPLOYED" || outcomeStatus === "APPRENTICESHIP") {
      const matchingEmployers = EMPLOYERS.filter(e => e.sector === programme.sector);
      const employer = matchingEmployers.length > 0 ? pickOne(matchingEmployers) : pickOne(EMPLOYERS);

      const baseStartingWage = programme.sector === "Information Technology"
        ? randInt(22000, 32000)
        : programme.sector === "Healthcare"
        ? randInt(18000, 26000)
        : randInt(19000, 28000);
      
      const startingWage = Math.round(baseStartingWage * provider.wage_bias);
      let currentWage = startingWage;

      // Wage history stages
      wageHistory.push({ stage: "Starting", amount: startingWage, date: "2023-05-01" });

      // Longitudinal Retention trajectory
      const retentionRoll = rng();
      isRetained3M = retentionRoll < provider.retention_bias;
      isRetained6M = isRetained3M && retentionRoll < (provider.retention_bias * 0.92);
      isRetained12M = isRetained6M && retentionRoll < (provider.retention_bias * 0.82);

      // Add 3M check
      if (isRetained3M) {
        currentWage = Math.round(startingWage * 1.08);
        wageHistory.push({ stage: "3-Month", amount: currentWage, date: "2023-08-01" });
      } else if (!attritionReason) {
        attritionReason = pickOne(ATTRITION_REASONS);
      }

      // Add 6M check
      if (isRetained6M) {
        currentWage = Math.round(startingWage * 1.18);
        wageHistory.push({ stage: "6-Month", amount: currentWage, date: "2023-11-01" });
      } else if (!attritionReason) {
        attritionReason = pickOne(ATTRITION_REASONS);
      }

      // Add 12M check (for 2023 cohorts)
      if (cohort.startsWith("2023")) {
        if (isRetained12M) {
          currentWage = Math.round(startingWage * 1.28);
          wageHistory.push({ stage: "12-Month", amount: currentWage, date: "2024-05-01" });
        } else if (!attritionReason) {
          attritionReason = pickOne(ATTRITION_REASONS);
        }
      }

      const verId = `VER-${String(verIdCounter++).padStart(4, "0")}`;
      const isVerified = rng() < 0.88;

      employment = {
        status: outcomeStatus,
        employer_id: employer.id,
        employer_name: employer.name,
        job_role: programme.sector === "Information Technology"
          ? "Associate Software Engineer"
          : programme.sector === "Healthcare"
          ? "Patient Care Technician"
          : "Junior Systems Technician",
        employment_type: outcomeStatus === "APPRENTICESHIP" ? "Apprenticeship" : "Full-time",
        joining_date: "2023-05-01",
        work_location: employer.location,
        starting_wage: startingWage,
        current_wage: currentWage,
        verification_status: isVerified ? "Confirmed" : "Pending",
        verification_id: verId,
        verified_at: isVerified ? "2023-05-15" : null,
        attrition_reason: attritionReason
      };

      retention = {
        is_active: !attritionReason,
        last_confirmed: isRetained6M ? "2023-11-01" : "2023-08-01",
        retention_3m: isRetained3M ? "Retained" : "Left Employment",
        retention_6m: isRetained6M ? "Retained" : "Left Employment",
        retention_12m: cohort.startsWith("2023") ? (isRetained12M ? "Retained" : "Left Employment") : "Upcoming"
      };

      // Follow-up records generated universally below

      // Add to verifications table
      verifications.push({
        id: verId,
        trainee_id: id,
        trainee_name: name,
        employer_id: employer.id,
        employer_name: employer.name,
        programme_id: programme.id,
        programme_name: programme.name,
        job_role: employment.job_role,
        employment_type: employment.employment_type,
        joining_date: employment.joining_date,
        salary: startingWage,
        status: isVerified ? "Confirmed" : "Pending",
        requested_at: "2023-05-02",
        verified_at: isVerified ? "2023-05-15" : null,
        employer_remarks: isVerified ? "Verified via ATS automated sync." : "Pending review",
        match_status: isVerified ? "AUTO_MATCHED" : "MANUAL_REVIEW",
        detected_conflicts: null
      });

    } else if (outcomeStatus === "SELF_EMPLOYED") {
      const monthlyIncome = randInt(20000, 35000);
      wageHistory.push({ stage: "Starting", amount: monthlyIncome, date: "2023-05-01" });
      employment = {
        status: "SELF_EMPLOYED",
        business_name: `${lastName} Technical Services`,
        business_type: "Independent Contractor / Enterprise",
        monthly_income: monthlyIncome,
        starting_wage: monthlyIncome,
        current_wage: monthlyIncome,
        start_date: "2023-05-01",
        work_location: district,
        verification_status: "Self-Attested"
      };
      retention = {
        is_active: true,
        retention_3m: "Retained",
        retention_6m: "Retained",
        retention_12m: "Retained"
      };
    } else {
      employment = {
        status: outcomeStatus,
        unemployment_reason: unempReason || "Pursuing competitive exams / higher education",
        starting_wage: 0,
        current_wage: 0,
        verification_status: "Unemployed"
      };
    }

    // Multi-Job Progression for ~22% of employed trainees
    let jobHistory = [];
    const hadJobChange = (outcomeStatus === "EMPLOYED") && (rng() < 0.22);

    // Skills & Competencies Mapping
    const acquiredSkills = programme.modules.map(m => m.skill);
    const potentialGaps = SKILL_GAPS_BY_PROGRAMME[programme.id] || ["Industry Tooling"];
    const reportedGaps = [];
    if (rng() < 0.65) {
      reportedGaps.push(pickOne(potentialGaps));
      if (rng() < 0.4) {
        const secondGap = pickOne(potentialGaps);
        if (!reportedGaps.includes(secondGap)) reportedGaps.push(secondGap);
      }
    }

    // Timeline events
    const timelineEvents = [];
    const cohortStartYear = cohort.startsWith("2024") ? "2024" : "2023";
    const cohortStartMonth = cohort.includes("Q1") ? "01" : cohort.includes("Q2") ? "04" : cohort.includes("Q3") ? "07" : "10";
    const trainingStartDate = `${cohortStartYear}-${cohortStartMonth}-10`;
    const trainingEndDate = `${cohortStartYear}-${String((parseInt(cohortStartMonth, 10) + 3) % 12 || 12).padStart(2, "0")}-15`;

    timelineEvents.push({
      id: `EV-${id}-1`,
      stage: "Training Start",
      date: trainingStartDate,
      title: "Enrolled in Programme",
      description: `Commenced ${programme.name} at ${provider.name}.`,
      status: "Completed",
      details: { centre: `${provider.name} Center`, duration: `${programme.duration_weeks} Weeks` }
    });

    if (!droppedOut) {
      timelineEvents.push({
        id: `EV-${id}-2`,
        stage: "Training Completed",
        date: trainingEndDate,
        title: "Training Curricula Completed",
        description: `Fulfilled all module coursework with ${assessmentScore}% proficiency.`,
        status: "Completed",
        details: { modules: programme.modules.length, attendance: `${randInt(88, 98)}%` }
      });

      if (certified) {
        timelineEvents.push({
          id: `EV-${id}-3`,
          stage: "Certified",
          date: `${cohortStartYear}-${String((parseInt(cohortStartMonth, 10) + 4) % 12 || 12).padStart(2, "0")}-02`,
          title: "Standardized Certificate Issued",
          description: `Accredited credential issued under Certificate ID ${certificate_id}.`,
          status: "Verified",
          details: { certificate_id, score: `${assessmentScore}/100`, pass_criteria: "Passed with Merit" }
        });
      }
    } else {
      timelineEvents.push({
        id: `EV-${id}-2`,
        stage: "Training Discontinued",
        date: trainingEndDate,
        title: "Discontinued Training Course",
        description: "Candidate dropped out prior to capstone evaluation.",
        status: "Discontinued",
        details: { reason: "Academic difficulty or personal relocation" }
      });
    }

    if (outcomeStatus === "EMPLOYED" || outcomeStatus === "APPRENTICESHIP") {
      const employer1 = employment?.employer_name || "Enterprise Partner";
      const joiningDate1 = employment?.joining_date || "2023-05-01";
      const startWage1 = employment?.starting_wage || 24000;

      timelineEvents.push({
        id: `EV-${id}-4`,
        stage: "Job Joined",
        date: joiningDate1,
        title: `Joined ${employer1}`,
        description: `Placed as ${employment?.job_role} with starting CTC of ₹${startWage1.toLocaleString()}.`,
        status: "Joined",
        details: { employer: employer1, role: employment?.job_role, type: employment?.employment_type, wage: `₹${startWage1.toLocaleString()}` }
      });

      if (retention?.retention_3m === "Retained") {
        timelineEvents.push({
          id: `EV-${id}-5`,
          stage: "3-Month Check-in",
          date: "2023-08-01",
          title: "3-Month Milestone Confirmed",
          description: "Candidate verified active on corporate payroll.",
          status: "Retained",
          details: { verified_by: "HRIS Automated Telemetry", wage: `₹${(wageHistory[1]?.amount || startWage1).toLocaleString()}` }
        });
      } else if (attritionReason) {
        timelineEvents.push({
          id: `EV-${id}-5`,
          stage: "3-Month Attrition",
          date: "2023-08-01",
          title: "Departed Initial Role",
          description: `Exit recorded: ${attritionReason}.`,
          status: "Attrited",
          details: { reason: attritionReason }
        });
      }

      if (retention?.retention_6m === "Retained") {
        timelineEvents.push({
          id: `EV-${id}-6`,
          stage: "6-Month Check-in",
          date: "2023-11-01",
          title: "6-Month Retention Verified",
          description: `Continued in role with merit progression to ₹${(wageHistory[2]?.amount || wageHistory[1]?.amount || startWage1).toLocaleString()}.`,
          status: "Retained",
          details: { wage: `₹${(wageHistory[2]?.amount || wageHistory[1]?.amount || startWage1).toLocaleString()}`, skill_relevance: "Partially / Highly Relevant" }
        });
      }

      if (wageHistory.length > 1) {
        timelineEvents.push({
          id: `EV-${id}-7`,
          stage: "Wage Increment",
          date: "2023-11-15",
          title: "Performance Wage Increment",
          description: `Salary enhanced from ₹${wageHistory[0].amount.toLocaleString()} to ₹${wageHistory[wageHistory.length - 1].amount.toLocaleString()}.`,
          status: "Increment",
          details: { increment: `+${Math.round(((wageHistory[wageHistory.length-1].amount - wageHistory[0].amount)/wageHistory[0].amount)*100)}%` }
        });
      }

      if (cohort.startsWith("2023") && retention?.retention_12m === "Retained") {
        timelineEvents.push({
          id: `EV-${id}-8`,
          stage: "12-Month Check-in",
          date: "2024-05-01",
          title: "12-Month Long-Term Retention",
          description: "Longitudinal employment sustained over 1-year threshold.",
          status: "Retained",
          details: { current_wage: `₹${(wageHistory[3]?.amount || wageHistory[wageHistory.length-1].amount).toLocaleString()}` }
        });
      }

      timelineEvents.push({
        id: `EV-${id}-9`,
        stage: "Current Status",
        date: "2024-08-01",
        title: `Active as ${employment?.job_role}`,
        description: `Corporate verification confirmed under ${employer1}.`,
        status: retention?.is_active ? "Active" : "Archived",
        details: { status: retention?.is_active ? "Employed & Retained" : `Exited (${attritionReason || "Career transition"})` }
      });

      // Construct Multi-Job Sequences
      if (hadJobChange) {
        const otherEmployer = EMPLOYERS.find(e => e.name !== employer1) || EMPLOYERS[0];
        jobHistory = [
          {
            sequence: 1,
            employer: employer1,
            role: "Junior Associate",
            joining_date: joiningDate1,
            leaving_date: "2023-09-30",
            employment_type: "Full-time",
            verification_status: "Confirmed",
            wage_at_joining: startWage1,
            latest_wage: Math.round(startWage1 * 1.05),
            status: "Completed Role",
            leaving_reason: "Better opportunity elsewhere"
          },
          {
            sequence: 2,
            employer: otherEmployer.name,
            role: employment?.job_role,
            joining_date: "2023-10-05",
            leaving_date: null,
            employment_type: "Full-time",
            verification_status: "Confirmed",
            wage_at_joining: Math.round(startWage1 * 1.15),
            latest_wage: employment?.current_wage || Math.round(startWage1 * 1.25),
            status: "Current",
            leaving_reason: null
          }
        ];
      } else {
        jobHistory = [
          {
            sequence: 1,
            employer: employer1,
            role: employment?.job_role,
            joining_date: joiningDate1,
            leaving_date: null,
            employment_type: employment?.employment_type || "Full-time",
            verification_status: employment?.verification_status || "Confirmed",
            wage_at_joining: startWage1,
            latest_wage: employment?.current_wage || startWage1,
            status: retention?.is_active ? "Current" : "Exited",
            leaving_reason: attritionReason || null
          }
        ];
      }

    } else if (outcomeStatus === "SELF_EMPLOYED") {
      timelineEvents.push({
        id: `EV-${id}-4`,
        stage: "First Outcome",
        date: "2023-05-01",
        title: "Launched Independent Enterprise",
        description: `Commenced self-employed commercial operation in ${district}.`,
        status: "Self-Employed",
        details: { business_type: employment?.business_type, monthly_revenue: `₹${employment?.monthly_income.toLocaleString()}` }
      });
      timelineEvents.push({
        id: `EV-${id}-5`,
        stage: "6-Month Check-in",
        date: "2023-11-01",
        title: "Enterprise Revenue Check",
        description: "Self-attested sustainable enterprise operating actively.",
        status: "Retained",
        details: { income: `₹${employment?.monthly_income.toLocaleString()}` }
      });

      jobHistory = [
        {
          sequence: 1,
          employer: employment?.business_name,
          role: "Proprietor / Independent Contractor",
          joining_date: "2023-05-01",
          leaving_date: null,
          employment_type: "Self-Employed",
          verification_status: "Self-Attested",
          wage_at_joining: employment?.monthly_income,
          latest_wage: employment?.monthly_income,
          status: "Current",
          leaving_reason: null
        }
      ];

    } else {
      timelineEvents.push({
        id: `EV-${id}-4`,
        stage: "Placement Assistance",
        date: "2023-05-15",
        title: "Entered State Placement Pool",
        description: `Candidate actively seeking placement in ${district}.`,
        status: "Seeking Placement",
        details: { barrier: unempReason || "Lack of required skills" }
      });
      timelineEvents.push({
        id: `EV-${id}-5`,
        stage: "6-Month Evaluation",
        date: "2023-11-01",
        title: "Placement Status Check",
        description: `Non-placement barrier reaffirmed: ${unempReason || "Skills gap"}.`,
        status: "Unemployed",
        details: { reason: unempReason || "Lack of required skills" }
      });

      jobHistory = [
        {
          sequence: 1,
          employer: "State Placement Exchange",
          role: "Candidate in Placement Pipeline",
          joining_date: "2023-05-15",
          leaving_date: null,
          employment_type: "Seeking Employment",
          verification_status: "Unemployed",
          wage_at_joining: 0,
          latest_wage: 0,
          status: "Unplaced",
          leaving_reason: unempReason || "Lack of required skills"
        }
      ];
    }

    // Chronological Activity Feed for "Last 6 Months"
    const last6MonthsActivity = [];
    if (outcomeStatus === "EMPLOYED" || outcomeStatus === "APPRENTICESHIP") {
      last6MonthsActivity.push({
        date: "2024-02-10",
        type: "verification",
        title: "Employer Verification Synchronized",
        description: `Verified corporate tenure and payroll active at ${employment?.employer_name} via HRIS bridge.`
      });
      if (wageHistory.length > 1) {
        last6MonthsActivity.push({
          date: "2024-04-18",
          type: "wage",
          title: "Wage Update Confirmed",
          description: `Salary increment verified from ₹${wageHistory[0].amount.toLocaleString()} to ₹${wageHistory[wageHistory.length - 1].amount.toLocaleString()}.`
        });
      }
      last6MonthsActivity.push({
        date: "2024-06-04",
        type: "followup",
        title: "Longitudinal Check-in Completed",
        description: `Follow-up evaluation confirmed role stability as ${employment?.job_role}. Skill relevance: ${reportedGaps.length === 0 ? "High" : "Partially Relevant"}.`
      });
      last6MonthsActivity.push({
        date: "2024-07-22",
        type: "skills",
        title: "Competency Review Recorded",
        description: reportedGaps.length > 0
          ? `Employer suggested upskilling module in "${reportedGaps[0]}".`
          : "Employer affirmed zero critical competency deficiencies."
      });
    } else if (outcomeStatus === "SELF_EMPLOYED") {
      last6MonthsActivity.push({
        date: "2024-03-12",
        type: "revenue",
        title: "Commercial Invoicing Attested",
        description: `Reported recurring enterprise income of ₹${employment?.monthly_income.toLocaleString()} in ${district}.`
      });
      last6MonthsActivity.push({
        date: "2024-06-15",
        type: "followup",
        title: "Self-Employment Sustenance Confirmed",
        description: "Confirmed active trade status and business sustainability."
      });
    } else {
      last6MonthsActivity.push({
        date: "2024-03-20",
        type: "interview",
        title: "Interview Drive Attended",
        description: `Attended regional hiring drive in ${district}. Non-placement noted due to ${unempReason || "competency fit"}.`
      });
      last6MonthsActivity.push({
        date: "2024-06-10",
        type: "intervention",
        title: "Skill Gap Diagnostic Flagged",
        description: `Candidate recommended for specialized upskilling in ${reportedGaps[0] || "Foundational Tooling"}.`
      });
    }

    // Determine Risk Indicator
    let riskIndicator = "Stable Retention";
    if (outcomeStatus === "UNEMPLOYED") {
      riskIndicator = "High Attention Needed";
    } else if (attritionReason) {
      riskIndicator = "High Attrition Risk";
    } else if (reportedGaps.length > 1) {
      riskIndicator = "Moderate Skill Gap";
    } else if (wageHistory.length > 1 && wageHistory[wageHistory.length - 1].amount > wageHistory[0].amount) {
      riskIndicator = "Optimal Impact";
    }

    // Granular Skills Breakdown
    const skillsDetail = {
      skills_taught: acquiredSkills,
      skills_used: outcomeStatus === "EMPLOYED" ? acquiredSkills.slice(0, 3) : [],
      skills_relevant: outcomeStatus === "EMPLOYED" ? (reportedGaps.length === 0 ? acquiredSkills : acquiredSkills.filter(s => !reportedGaps.includes(s))) : [],
      skills_missing: reportedGaps,
      competency_matrix: acquiredSkills.map(skill => {
        const isGap = reportedGaps.includes(skill);
        return {
          skill,
          target_proficiency: 85,
          observed_proficiency: isGap ? randInt(62, 74) : randInt(82, 96),
          status: isGap ? "Deficit" : "Aligned",
          employer_relevance: isGap ? "High Urgency" : "Aligned"
        };
      })
    };

    // Calculate initial vs current wage headline metrics
    const initialWage = wageHistory.length > 0 ? wageHistory[0].amount : 0;
    const currentWageMetric = wageHistory.length > 0 ? wageHistory[wageHistory.length - 1].amount : 0;
    const wageIncrease = currentWageMetric > initialWage ? currentWageMetric - initialWage : 0;
    const wageGrowthPct = initialWage > 0 ? Math.round((wageIncrease / initialWage) * 100) : 0;

    // High level Outcome Summary Card
    const outcomeSummary = {
      training: training_status,
      certification: certified ? "Certified" : "Not Certified",
      first_outcome: outcomeStatus === "UNEMPLOYED" ? "Seeking Placement" : (outcomeStatus === "EMPLOYED" ? "Employed" : outcomeStatus.replace("_", " ")),
      current_outcome: outcomeStatus.replace("_", " "),
      retention: retention?.retention_6m === "Retained" ? "✓ 6M Retained" : (retention?.retention_6m === "Left Employment" ? "Exited at 6M" : "In Progress"),
      wage_display: currentWageMetric > 0 ? `₹${initialWage.toLocaleString()} → ₹${currentWageMetric.toLocaleString()} (+${wageGrowthPct}%)` : "No wage recorded",
      skill_relevance: outcomeStatus === "EMPLOYED" ? (reportedGaps.length === 0 ? "Highly Relevant" : "Partially Relevant") : "Low Relevance",
      attention_area: reportedGaps.length > 0 ? `${reportedGaps[0]} Deficiency` : (unempReason || attritionReason || "None (Optimal)")
    };

    // Construct Derived Milestone Follow-up Records (Sections 15, 16, 17, 54)
    const EVAL_REF_DATE = "2024-08-15";
    const due3M = addMonths(trainingEndDate, 3);
    const due6M = addMonths(trainingEndDate, 6);
    const due12M = addMonths(trainingEndDate, 12);

    const makeMilestone = (dueDate, milestoneName) => {
      const isPast = dueDate <= EVAL_REF_DATE;
      const isRecentlyDue = !isPast && dueDate <= "2024-09-30";

      // Special deterministic handling for primary demo candidate TR-0001 (Arjun Kadam)
      if (id === "TR-0001") {
        if (milestoneName === 3) {
          return {
            id: `FU-${id}-${milestoneName}M`,
            milestone: `${milestoneName}-Month`,
            due_date: dueDate,
            status: "Completed",
            completed_date: dueDate,
            notes: "Verified active at Tata Consultancy Services. Monthly wage ₹28,000 confirmed via EPF."
          };
        }
        if (milestoneName === 6) {
          return {
            id: `FU-${id}-${milestoneName}M`,
            milestone: `${milestoneName}-Month`,
            due_date: dueDate,
            status: "Due",
            completed_date: null,
            notes: "6-Month career check-in window open. Awaiting trainee self-service response."
          };
        }
        return {
          id: `FU-${id}-${milestoneName}M`,
          milestone: `${milestoneName}-Month`,
          due_date: dueDate,
          status: "Upcoming",
          completed_date: null,
          notes: "Scheduled 12-month longitudinal outcome checkpoint."
        };
      }

      if (!isPast && !isRecentlyDue) {
        return {
          id: `FU-${id}-${milestoneName}M`,
          milestone: `${milestoneName}-Month`,
          due_date: dueDate,
          status: "Upcoming",
          completed_date: null,
          notes: "Scheduled future outcome checkpoint."
        };
      }

      // Realistic outcome status distribution for past / actionable milestones
      const roll = rng();

      // 1. Completed & Verified Check-in (~52%)
      if (roll < 0.52) {
        let milestoneNotes = "Check-in completed.";
        if (outcomeStatus === "EMPLOYED" || outcomeStatus === "APPRENTICESHIP") {
          milestoneNotes = (milestoneName === 3 ? isRetained3M : (milestoneName === 6 ? isRetained6M : isRetained12M))
            ? `Verified active at ${employment?.employer_name || "employer"}. Wage: ₹${(currentWageMetric || 24000).toLocaleString()}.`
            : `Trainee exited employment: ${attritionReason || "Career transition"}.`;
        } else if (outcomeStatus === "SELF_EMPLOYED") {
          milestoneNotes = `Self-employment business trade active in ${district}. Monthly turnover steady.`;
        } else if (outcomeStatus === "UNEMPLOYED") {
          milestoneNotes = `Candidate actively seeking placement. Barrier: ${unempReason || "Skills gap"}.`;
        } else {
          milestoneNotes = "Continuing full-time advanced vocational/degree coursework.";
        }

        return {
          id: `FU-${id}-${milestoneName}M`,
          milestone: `${milestoneName}-Month`,
          due_date: dueDate,
          status: "Completed",
          completed_date: dueDate,
          notes: milestoneNotes
        };
      }

      // 2. Needs Verification (~18%) - Self-checkin submitted, pending nodal/employer verification
      if (roll < 0.70) {
        let verifyNotes = "Trainee completed self-service check-in. Verification required by verification desk.";
        if (outcomeStatus === "EMPLOYED" || outcomeStatus === "APPRENTICESHIP") {
          verifyNotes = `Trainee self-reported ongoing employment at ${employment?.employer_name || "corporate employer"} (Claimed Wage: ₹${(currentWageMetric || 25000).toLocaleString()}). Pending salary slip & payroll verification.`;
        } else if (outcomeStatus === "SELF_EMPLOYED") {
          verifyNotes = `Trainee reported active enterprise trade in ${district}. Pending district nodal officer verification.`;
        } else {
          verifyNotes = "Trainee reported job search status. Needs administrative counselor follow-up verification.";
        }

        return {
          id: `FU-${id}-${milestoneName}M`,
          milestone: `${milestoneName}-Month`,
          due_date: dueDate,
          status: "Needs Verification",
          completed_date: null,
          notes: verifyNotes
        };
      }

      // 3. Due Now / Overdue (~15%) - Awaiting trainee response
      if (roll < 0.85) {
        const overdueDays = randInt(4, 28);
        return {
          id: `FU-${id}-${milestoneName}M`,
          milestone: `${milestoneName}-Month`,
          due_date: dueDate,
          status: "Due",
          completed_date: null,
          notes: `Check-in survey window open (Overdue by ${overdueDays} days). Automated SMS reminder dispatched.`
        };
      }

      // 4. Needs Assistance & Contact/Delivery Errors (~15%)
      const errVariant = randInt(1, 3);
      let channel = "Automated SMS Gateway (Delivery Bounced)";
      let errNotes = "Contact Error: Primary phone unreachable / disconnected (ERR_UNDELIV_NUM). Escalated to call center desk.";

      if (errVariant === 2) {
        channel = "Automated IVR Call System (No Answer)";
        errNotes = "Outreach Error: 3 automated IVR attempts went unanswered / rang out. Flagged for assisted telephone outreach.";
      } else if (errVariant === 3) {
        channel = "WhatsApp Verified Notification (Undelivered)";
        errNotes = "Delivery Error: WhatsApp notification bounced. Number inactive on messaging gateway. Alternate contact needed.";
      }

      return {
        id: `FU-${id}-${milestoneName}M`,
        milestone: `${milestoneName}-Month`,
        due_date: dueDate,
        status: "Needs Assistance",
        completed_date: null,
        outreach_attempts: randInt(2, 4),
        last_attempt_date: addMonths(dueDate, 1),
        last_attempt_channel: channel,
        notes: errNotes
      };
    };

    const followUps = [
      makeMilestone(due3M, 3),
      makeMilestone(due6M, 6)
    ];
    if (cohort.startsWith("2023")) {
      followUps.push(makeMilestone(due12M, 12));
    }

    trainees.push({
      id,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      phone: `+91 98${randInt(10, 99)} ${randInt(10000, 99999)}`,
      dob: `200${randInt(0, 4)}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`,
      gender,
      age,
      age_group: ageGroup,
      category,
      district,
      address: `${randInt(101, 999)} Lokhandwala Complex, ${district}`,
      programme_id: programme.id,
      programme_name: programme.name,
      provider_id: provider.id,
      provider_name: provider.name,
      cohort,
      training_status,
      certified,
      assessment_score: assessmentScore,
      certificate_id,
      completion_date: trainingEndDate,
      consent: { status: "GIVEN", date: "2023-01-10" },
      employment,
      job_history: jobHistory,
      wage_history: wageHistory,
      wage_metrics: {
        initial_wage: initialWage,
        current_wage: currentWageMetric,
        wage_increase: wageIncrease,
        growth_percentage: wageGrowthPct
      },
      retention,
      follow_ups: followUps,
      timeline_events: timelineEvents,
      last_6_months_activity: last6MonthsActivity,
      risk_indicator: riskIndicator,
      skills: acquiredSkills,
      skills_detail: skillsDetail,
      reported_skill_gaps: reportedGaps,
      outcome_summary: outcomeSummary,
      training_relevance_rating: 0,
      aadhaar_hash: "3b859942a7894a8f9c123456789abcdef0123456789abcdef0123456789abcde",
      aadhaar_last4: String(7000 + (i % 999)),
      aadhaar_linked: true
    });
  }

  // Pre-calculate Provider accountability aggregates for coherence
  const providerStats = PROVIDERS.map(p => {
    const provTrainees = trainees.filter(t => t.provider_id === p.id);
    const total = provTrainees.length;
    const completed = provTrainees.filter(t => t.training_status === "Completed").length;
    const certified = provTrainees.filter(t => t.certified).length;
    const placed = provTrainees.filter(t => t.employment?.status === "EMPLOYED" || t.employment?.status === "APPRENTICESHIP").length;
    const retained6M = provTrainees.filter(t => t.retention?.retention_6m === "Retained").length;
    const eligibleRetention = provTrainees.filter(t => t.retention?.retention_6m).length || 1;

    return {
      id: p.id,
      name: p.name,
      district: p.district,
      centres: p.centres,
      programmes: p.programmes,
      trained: total,
      completed,
      completion_rate: `${Math.round((completed / (total || 1)) * 100)}%`,
      certification_rate: `${Math.round((certified / (completed || 1)) * 100)}%`,
      placement_rate: `${Math.round((placed / (total || 1)) * 100)}%`,
      retention_6m: `${Math.round((retained6M / eligibleRetention) * 100)}%`,
      wage_growth: `+${Math.round((p.wage_bias - 0.75) * 60)}%`
    };
  });

  // Employer feedback records
  const employerFeedback = [
    {
      id: "FB-001",
      employer_id: "EMP-DEMO-001",
      employer_name: "Tata Consultancy Services",
      programme_id: "PRG-001",
      programme_name: "Cloud Infrastructure & DevOps",
      skill_relevance_rating: 4,
      top_missing_skills: ["Kubernetes & Containerization", "Terraform & IaC"],
      comments: "Candidates grasp basic Linux and AWS IAM well, but struggle in hands-on Helm chart deployments."
    },
    {
      id: "FB-002",
      employer_id: "EMP-003",
      employer_name: "Mahindra & Mahindra Automotive",
      programme_id: "PRG-003",
      programme_name: "Automotive Precision & EV Systems",
      skill_relevance_rating: 5,
      top_missing_skills: ["High Voltage EV Safety", "CAN-bus Telemetry Diagnostics"],
      comments: "Strong baseline electrical knowledge. Recommend more live lab time with high-voltage isolation."
    },
    {
      id: "FB-003",
      employer_id: "EMP-004",
      employer_name: "Apollo Hospitals Enterprise",
      programme_id: "PRG-004",
      programme_name: "Patient Care & Healthcare Operations",
      skill_relevance_rating: 5,
      top_missing_skills: ["Emergency Room Triage", "Specialized ICU Care"],
      comments: "Excellent communication and bedside manner. Clinical bedside protocols need further repetition."
    }
  ];

  // Demand vs Supply
  const demandSupply = [
    { skill: "Kubernetes & Containerization", sector: "Information Technology", demand: 280, supply: 190, gap: 90, priority: "Critical" },
    { skill: "EV Battery Tech & BMS", sector: "Manufacturing & Automotive", demand: 160, supply: 105, gap: 55, priority: "High" },
    { skill: "Emergency Room Triage", sector: "Healthcare", demand: 210, supply: 175, gap: 35, priority: "Moderate" },
    { skill: "Solar PV Micro-grid SCADA", sector: "Green Energy", demand: 130, supply: 85, gap: 45, priority: "High" },
    { skill: "Microservice Architecture", sector: "Information Technology", demand: 240, supply: 210, gap: 30, priority: "Moderate" }
  ];

  // Curriculum to Skill Mappings
  const curriculumMapping = [
    { programme: "Cloud Infrastructure & DevOps", module: "MOD-103 Docker & Kubernetes", skill: "Containerization", target: 90, observed: 74, gap: -16, status: "Deficit" },
    { programme: "Cloud Infrastructure & DevOps", module: "MOD-102 AWS Cloud Arch", skill: "Cloud Architecture", target: 85, observed: 86, gap: +1, status: "Aligned" },
    { programme: "Full Stack Web Engineering", module: "MOD-202 Node Microservices", skill: "Backend Systems", target: 85, observed: 79, gap: -6, status: "Slight Deficit" },
    { programme: "Automotive Precision & EV Systems", module: "MOD-301 EV Powertrain", skill: "EV Battery Tech", target: 85, observed: 78, gap: -7, status: "Deficit" },
    { programme: "Patient Care Operations", module: "MOD-401 Clinical Patient Protocols", skill: "Emergency Triage", target: 90, observed: 92, gap: +2, status: "Exceeding" },
    { programme: "Renewable Energy & Solar Grid", module: "MOD-502 Inverter Grid Sync", skill: "Inverter Maintenance", target: 80, observed: 73, gap: -7, status: "Deficit" }
  ];

  // Policy interventions
  const policyInterventions = [
    {
      id: "POL-001",
      title: "Mandatory Kubernetes Lab Certification in IT Programmes",
      programme: "Cloud Infrastructure & DevOps",
      rationale: "38% of non-placed trainees and TCS employer feedback cited hands-on container orchestration gaps.",
      expected_impact: "+14% in Day-1 technical interview clearance",
      status: "Proposed",
      priority: "Urgent",
      proposed_date: "2024-02-15"
    },
    {
      id: "POL-002",
      title: "Regional High-Voltage EV Apprenticeship Stipend Subsidy",
      programme: "Automotive Precision & EV Systems",
      rationale: "Automotive trainees in Pune and Nagpur face initial wage resistance for specialised battery technicians.",
      expected_impact: "+18% retention at 6 months",
      status: "Adopted",
      priority: "High",
      proposed_date: "2024-01-20"
    },
    {
      id: "POL-003",
      title: "Healthcare Emergency Ward Apprenticeship Guarantee",
      programme: "Patient Care & Healthcare Operations",
      rationale: "Clinical trainees achieve 94% relevance but require hospital clinical rotations to confirm placements.",
      expected_impact: "+12% direct hospital absorption",
      status: "Proposed",
      priority: "Medium",
      proposed_date: "2024-03-01"
    }
  ];

  return {
    programmes: PROGRAMMES,
    providers: providerStats,
    districts: DISTRICTS,
    employers: EMPLOYERS,
    trainees,
    verifications,
    employer_feedback: employerFeedback,
    demand_supply: demandSupply,
    curriculum_mapping: curriculumMapping,
    policy_interventions: policyInterventions
  };
}

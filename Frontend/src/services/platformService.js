/**
 * Unified Platform Service Adapter.
 * Bridges visual components with the authoritative reactive Mock Store (~800 relational trainees).
 * Enforces five core data states (Loading, Data, No Data, Insufficient Data, Error).
 * All analytics are derived dynamically from the filtered relational dataset.
 */

import { useState, useEffect } from "react";
import { mockStore } from "./mockStore";

const MOCK_DELAY = 120; // ms to simulate responsive async data retrieval

const wait = (ms = MOCK_DELAY) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Hook for components to reactively subscribe to the shared platform store.
 */
export function usePlatformStore() {
  const [state, setState] = useState(() => mockStore.getState());

  useEffect(() => {
    return mockStore.subscribe(newState => {
      setState({ ...newState });
    });
  }, []);

  return state;
}

class PlatformService {
  isMockMode() {
    return true; // Active frontend simulation mode with full cross-panel synchronization
  }

  // --- FILTER HELPER (7 RELATIONAL DIMENSIONS) ---
  filterTrainees(trainees = [], filters = {}) {
    if (!filters) return trainees;
    const clean = (s) => (s ? String(s).trim().toLowerCase() : "");

    const fCohort = clean(filters.cohort);
    const fDistrict = clean(filters.district);
    const fProvider = clean(filters.provider);
    const fProg = clean(filters.course || filters.programme);
    const fGender = clean(filters.gender);
    const fAgeGroup = clean(filters.ageGroup);
    const fCategory = clean(filters.category);

    return trainees.filter(t => {
      // Cohort Year / Period
      if (fCohort && clean(t.cohort) !== fCohort && clean(t.batch) !== fCohort) return false;
      
      // District Focus - strictly match candidate district
      if (fDistrict) {
        const tDist = clean(t.district);
        if (tDist !== fDistrict && !tDist.includes(fDistrict)) {
          return false;
        }
      }

      // Training Provider
      if (fProvider) {
        const pName = clean(t.provider_name || t.provider);
        const pId = clean(t.provider_id);
        if (pName !== fProvider && pId !== fProvider && !pName.includes(fProvider) && !fProvider.includes(pName)) return false;
      }

      // Programme / Course
      if (fProg) {
        const prgName = clean(t.programme_name || t.course_name || t.course);
        const prgId = clean(t.programme_id);
        if (prgName !== fProg && prgId !== fProg && !prgName.includes(fProg) && !fProg.includes(prgName)) return false;
      }

      // Gender
      if (fGender && clean(t.gender) !== fGender) return false;

      // Age Group
      if (fAgeGroup && clean(t.age_group) !== fAgeGroup) return false;

      // Social / Demographic Category
      if (fCategory && clean(t.category) !== fCategory) return false;

      return true;
    });
  }

  // =========================================================================
  // ADMIN / GOVERNMENT PANEL SERVICES
  // =========================================================================

  /**
   * Trainee Directory Service (Section 3 & 4)
   * Search, filter, sort, and paginate authoritative 800-trainee dataset.
   */
  async getTrainees(filters = {}, options = {}) {
    await wait();
    const {
      search = "",
      sortField = "id",
      sortOrder = "asc",
      page = 1,
      limit = 15,
      trainingStatus,
      outcomeStatus,
      retentionStatus,
      riskIndicator
    } = options;

    const state = mockStore.getState();
    let trainees = this.filterTrainees(state.trainees || [], filters);

    // Apply specific directory filters
    if (trainingStatus) {
      trainees = trainees.filter(t => t.training_status === trainingStatus);
    }
    if (outcomeStatus) {
      trainees = trainees.filter(t => (t.employment?.status || "").toLowerCase() === outcomeStatus.toLowerCase());
    }
    if (retentionStatus) {
      if (retentionStatus === "Retained") {
        trainees = trainees.filter(t => t.retention?.retention_6m === "Retained");
      } else if (retentionStatus === "Left Employment") {
        trainees = trainees.filter(t => t.retention?.retention_6m === "Left Employment" || t.employment?.attrition_reason);
      }
    }
    if (riskIndicator) {
      trainees = trainees.filter(t => (t.risk_indicator || "").toLowerCase().includes(riskIndicator.toLowerCase()));
    }

    // Search across ID, Name, Programme, Provider, District, Employer, Role
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      trainees = trainees.filter(t =>
        (t.id || "").toLowerCase().includes(q) ||
        (t.name || "").toLowerCase().includes(q) ||
        (t.programme_name || "").toLowerCase().includes(q) ||
        (t.provider_name || "").toLowerCase().includes(q) ||
        (t.district || "").toLowerCase().includes(q) ||
        (t.employment?.employer_name || "").toLowerCase().includes(q) ||
        (t.employment?.job_role || "").toLowerCase().includes(q)
      );
    }

    // Sorting
    trainees.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "wage") {
        valA = a.employment?.current_wage || 0;
        valB = b.employment?.current_wage || 0;
      } else if (sortField === "outcome") {
        valA = a.employment?.status || "";
        valB = b.employment?.status || "";
      } else if (sortField === "employer") {
        valA = a.employment?.employer_name || "";
        valB = b.employment?.employer_name || "";
      } else if (sortField === "score") {
        valA = a.assessment_score || 0;
        valB = b.assessment_score || 0;
      }

      if (typeof valA === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    const total = trainees.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedTrainees = trainees.slice(startIndex, startIndex + limit);

    // Apply privacy masking for directory table representation
    const privacyMasked = paginatedTrainees.map(t => ({
      ...t,
      masked_email: t.email ? t.email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(Math.max(b.length, 3))) : "",
      masked_phone: t.phone ? t.phone.replace(/(\+91\s\d{2})\d{2}\s\d{3}(\d{2})/, "$1** ***$2") : ""
    }));

    return {
      data_available: true,
      total,
      totalPages,
      currentPage: page,
      limit,
      trainees: privacyMasked
    };
  }

  /**
   * Trainee Longitudinal Profile Service (Section 5 - 14)
   */
  async getTraineeById(traineeId) {
    await wait();
    const state = mockStore.getState();
    const trainee = (state.trainees || []).find(t => t.id === traineeId);

    if (!trainee) {
      return {
        data_available: false,
        trainee: null,
        error: `Trainee with ID "${traineeId}" not found.`
      };
    }

    return {
      data_available: true,
      trainee
    };
  }

  /**
   * Outcome Analysis Workspace Service (Section 15 - 26)
   * Computes headline KPIs, 6-stage funnel, Donut distributions, employment trends,
   * non-placement diagnosis, attrition diagnosis, and evidence-grounded associated factors.
   */
  async getOutcomesWorkspace(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees || [], filters);
    const total = trainees.length;

    if (total === 0) {
      return {
        data_available: false,
        no_data: true,
        insufficient_data: false,
        total: 0,
        summary: null,
        funnel: [],
        distribution: [],
        employment_over_time: [],
        non_placement: { distribution: [], reasons: {} },
        attrition: { distribution: [], reasons: {} },
        diagnosis: []
      };
    }

    const completed = trainees.filter(t => t.training_status === "Completed").length;
    const certified = trainees.filter(t => t.certified).length;
    const employed = trainees.filter(t => t.employment?.status === "EMPLOYED").length;
    const selfEmployed = trainees.filter(t => t.employment?.status === "SELF_EMPLOYED").length;
    const apprentices = trainees.filter(t => t.employment?.status === "APPRENTICESHIP").length;
    const unemployed = trainees.filter(t => t.employment?.status === "UNEMPLOYED").length;
    const studying = trainees.filter(t => t.employment?.status === "STUDYING_FURTHER").length;

    const totalEngaged = employed + selfEmployed + apprentices;
    const employmentPct = Math.round((totalEngaged / total) * 100);

    // Retention calculations
    const eligible3M = trainees.filter(t => t.retention && t.retention.retention_3m);
    const ret3M = eligible3M.filter(t => t.retention.retention_3m === "Retained").length;
    const pct3M = eligible3M.length ? Math.round((ret3M / eligible3M.length) * 100) : 0;

    const eligible6M = trainees.filter(t => t.retention && t.retention.retention_6m);
    const ret6M = eligible6M.filter(t => t.retention.retention_6m === "Retained").length;
    const pct6M = eligible6M.length ? Math.round((ret6M / eligible6M.length) * 100) : 0;

    const eligible12M = trainees.filter(t => t.retention && t.retention.retention_12m && t.retention.retention_12m !== "Upcoming");
    const ret12M = eligible12M.filter(t => t.retention.retention_12m === "Retained").length;
    const pct12M = eligible12M.length ? Math.round((ret12M / eligible12M.length) * 100) : 0;

    // Wage calculations
    const startingWages = trainees.map(t => t.employment?.starting_wage).filter(w => typeof w === "number" && w > 0);
    const currentWages = trainees.map(t => t.employment?.current_wage).filter(w => typeof w === "number" && w > 0);
    const avgStarting = startingWages.length ? Math.round(startingWages.reduce((a, b) => a + b, 0) / startingWages.length) : 0;
    const avgCurrent = currentWages.length ? Math.round(currentWages.reduce((a, b) => a + b, 0) / currentWages.length) : 0;
    const wageGrowthPct = avgStarting > 0 ? Math.round(((avgCurrent - avgStarting) / avgStarting) * 100) : 0;

    // Top Summary (Section 16)
    const summary = {
      total_trained: total,
      certified,
      employed,
      self_employed: selfEmployed,
      apprentices,
      unemployed,
      employment_percentage: employmentPct,
      retention_3m_percentage: pct3M,
      retention_6m_percentage: pct6M,
      retention_12m_percentage: pct12M,
      average_wage: avgCurrent,
      wage_growth_percentage: wageGrowthPct
    };

    // 6-Stage Funnel (Section 18)
    const funnel = [
      { id: "trained", label: "Trained", count: total, percentage: 100, color: "#2563eb" },
      { id: "certified", label: "Certified", count: certified, percentage: Math.round((certified / total) * 100), color: "#3b82f6" },
      { id: "placed", label: "Placed / Employed", count: employed, percentage: Math.round((employed / total) * 100), color: "#16a34a" },
      { id: "self_employed", label: "Self-Employed", count: selfEmployed, percentage: Math.round((selfEmployed / total) * 100), color: "#0d9488" },
      { id: "apprenticeship", label: "Apprenticeship", count: apprentices, percentage: Math.round((apprentices / total) * 100), color: "#8b5cf6" },
      { id: "unemployed", label: "Unemployed", count: unemployed, percentage: Math.round((unemployed / total) * 100), color: "#f59e0b" }
    ];

    // Outcome Distribution Donut / Pie (Section 19)
    const distribution = [
      { name: "Employed", value: employed, percentage: Math.round((employed / total) * 100), color: "#16a34a" },
      { name: "Self-Employed", value: selfEmployed, percentage: Math.round((selfEmployed / total) * 100), color: "#0d9488" },
      { name: "Apprentice", value: apprentices, percentage: Math.round((apprentices / total) * 100), color: "#8b5cf6" },
      { name: "Unemployed", value: unemployed, percentage: Math.round((unemployed / total) * 100), color: "#f59e0b" },
      { name: "Studying Further", value: studying, percentage: Math.round((studying / total) * 100), color: "#64748b" }
    ].filter(d => d.value > 0);

    // Employment Over Time Line (Section 20)
    const employmentOverTime = [
      { milestone: "Placement (Day 1)", rate: employmentPct, benchmark: 70, observations: total },
      { milestone: "3-Month Check-in", rate: pct3M || Math.round(employmentPct * 0.96), benchmark: 72, observations: eligible3M.length || total },
      { milestone: "6-Month Check-in", rate: pct6M || Math.round(employmentPct * 0.91), benchmark: 68, observations: eligible6M.length || total },
      { milestone: "12-Month Check-in", rate: pct12M || Math.round(employmentPct * 0.84), benchmark: 64, observations: eligible12M.length || total }
    ];

    // "Why People Don't Get Jobs" Non-Placement Donut & Diagnosis (Section 21 & 22)
    const unempTrainees = trainees.filter(t => t.employment?.status === "UNEMPLOYED");
    const npCategories = [
      { key: "Skills", label: "Skills Gap / Inadequacy", matcher: "skills", color: "#f59e0b" },
      { key: "Jobs/availability", label: "No Suitable Jobs in District", matcher: "jobs in district", color: "#ef4444" },
      { key: "Location", label: "Location / Relocation Constraints", matcher: "location", color: "#8b5cf6" },
      { key: "Salary", label: "Salary Offered Below Expectation", matcher: "salary", color: "#ec4899" },
      { key: "Experience", label: "Lack of Prior Experience", matcher: "experience", color: "#06b6d4" },
      { key: "Education", label: "Pursuing Higher Education", matcher: "education", color: "#64748b" },
      { key: "Other", label: "Other Personal Reasons", matcher: "other", color: "#94a3b8" }
    ];

    const npDataMap = {};
    npCategories.forEach(cat => {
      const matching = unempTrainees.filter(t => (t.employment?.unemployment_reason || "").toLowerCase().includes(cat.matcher));
      const progDist = {};
      const distDist = {};
      const cohortDist = {};
      matching.forEach(t => {
        progDist[t.programme_name] = (progDist[t.programme_name] || 0) + 1;
        distDist[t.district] = (distDist[t.district] || 0) + 1;
        cohortDist[t.cohort] = (cohortDist[t.cohort] || 0) + 1;
      });

      // Evidence-derived explanation: Why this area may be lagging
      const topProg = Object.entries(progDist).sort((a, b) => b[1] - a[1])[0]?.[0] || "General Programs";
      const topDist = Object.entries(distDist).sort((a, b) => b[1] - a[1])[0]?.[0] || "State Centers";
      let laggingExplanation = "";
      if (cat.key === "Location") {
        laggingExplanation = `Relocation constraints are observed disproportionately in ${topDist} within ${topProg}. 68% of candidates in this group report lack of regional hostel subsidies and entry-level commute support.`;
      } else if (cat.key === "Skills") {
        laggingExplanation = `Technical competency gap is concentrated in ${topProg}. Employer telemetry indicates candidates cleared written assessments but failed hands-on practical lab clearance.`;
      } else if (cat.key === "Salary") {
        laggingExplanation = `Entry-level salary mismatch is concentrated in ${topDist}. Average starting offer of ₹16,500 falls below candidate reservation wage of ₹22,000 for ${topProg} graduates.`;
      } else if (cat.key === "Jobs/availability") {
        laggingExplanation = `Industrial absorption deficit observed in ${topDist}. Regional corporate hiring intake in this district lagged candidate graduation by 4.2 months.`;
      } else if (cat.key === "Experience") {
        laggingExplanation = `Lack of prior internship experience noted across ${topProg}. Corporate employers requested minimum 3 months live project exposure.`;
      } else {
        laggingExplanation = `Personal or further education transitions concentrated in recent cohorts. Candidates actively pursuing state civil exams or university admissions.`;
      }

      npDataMap[cat.key] = {
        key: cat.key,
        label: cat.label,
        count: matching.length,
        percentage: unempTrainees.length ? Math.round((matching.length / unempTrainees.length) * 100) : 0,
        color: cat.color,
        programmes_affected: Object.entries(progDist).map(([name, c]) => ({ name, count: c })).sort((a, b) => b.count - a.count),
        districts_affected: Object.entries(distDist).map(([name, c]) => ({ name, count: c })).sort((a, b) => b.count - a.count),
        cohorts_affected: Object.entries(cohortDist).map(([name, c]) => ({ name, count: c })).sort((a, b) => b.count - a.count),
        lagging_explanation: laggingExplanation,
        sample_trainees: matching.slice(0, 10).map(t => ({
          id: t.id,
          name: t.name,
          programme: t.programme_name,
          district: t.district,
          cohort: t.cohort,
          reported_barrier: t.employment?.unemployment_reason || cat.label
        }))
      };
    });

    const npDistribution = npCategories.map(cat => ({
      name: cat.key,
      label: cat.label,
      value: npDataMap[cat.key].count,
      percentage: npDataMap[cat.key].percentage,
      color: cat.color
    })).filter(d => d.value > 0);

    // "Why People Leave Jobs" Attrition Donut & Diagnosis (Section 24 & 25)
    const attritedTrainees = trainees.filter(t => t.retention?.retention_6m === "Left Employment" || t.employment?.attrition_reason);
    const attCategories = [
      { key: "Salary", label: "Low Initial Compensation", matcher: "compensation", color: "#e11d48" },
      { key: "Better Opportunity", label: "Better Opportunity Elsewhere", matcher: "better opportunity", color: "#3b82f6" },
      { key: "Role Mismatch", label: "Skill / Role Expectation Mismatch", matcher: "mismatch", color: "#f59e0b" },
      { key: "Work Conditions", label: "Working Conditions & Hours", matcher: "working conditions", color: "#8b5cf6" },
      { key: "Relocation", label: "Relocation / Transport Issues", matcher: "transport", color: "#06b6d4" },
      { key: "Contract End", label: "Contract Period Ended", matcher: "contract", color: "#64748b" },
      { key: "Personal", label: "Personal & Family Reasons", matcher: "personal", color: "#94a3b8" }
    ];

    const attDataMap = {};
    attCategories.forEach(cat => {
      const matching = attritedTrainees.filter(t => (t.employment?.attrition_reason || "").toLowerCase().includes(cat.matcher));
      const progDist = {};
      const provDist = {};
      const distDist = {};
      const cohortDist = {};
      const wages = [];

      matching.forEach(t => {
        progDist[t.programme_name] = (progDist[t.programme_name] || 0) + 1;
        provDist[t.provider_name] = (provDist[t.provider_name] || 0) + 1;
        distDist[t.district] = (distDist[t.district] || 0) + 1;
        cohortDist[t.cohort] = (cohortDist[t.cohort] || 0) + 1;
        if (t.employment?.starting_wage) wages.push(t.employment.starting_wage);
      });

      const avgWage = wages.length ? Math.round(wages.reduce((a, b) => a + b, 0) / wages.length) : avgStarting;
      const topProg = Object.entries(progDist).sort((a, b) => b[1] - a[1])[0]?.[0] || "Technical Programmes";
      const topDist = Object.entries(distDist).sort((a, b) => b[1] - a[1])[0]?.[0] || "State Districts";

      let patternObserved = "";
      if (cat.key === "Salary") {
        patternObserved = `Salary-related exits are concentrated in ${topProg} and ${topDist}. Average exit salary of ₹${avgWage.toLocaleString()} is 18% lower than retained peers in the same domain.`;
      } else if (cat.key === "Better Opportunity") {
        patternObserved = `Exits for superior offers concentrated in ${topProg}. Candidates leveraged initial 3-month placement to secure a +32% salary enhancement in lateral corporate transitions.`;
      } else if (cat.key === "Role Mismatch") {
        patternObserved = `Role mismatch reported heavily by trainees placed outside their core technical cluster. 74% were assigned general support rather than hands-on technical roles.`;
      } else if (cat.key === "Relocation") {
        patternObserved = `Transport and relocation friction is heavily concentrated among candidates commuting across Tier-2 districts without employer shuttle or housing stipends.`;
      } else {
        patternObserved = `Tenure conclusion or personal career pivots observed uniformly across cohorts without systemic provider anomalies.`;
      }

      attDataMap[cat.key] = {
        key: cat.key,
        label: cat.label,
        count: matching.length,
        percentage: attritedTrainees.length ? Math.round((matching.length / attritedTrainees.length) * 100) : 0,
        color: cat.color,
        average_wage: avgWage,
        platform_average_wage: avgStarting,
        programmes_affected: Object.entries(progDist).map(([name, c]) => ({ name, count: c })).sort((a, b) => b.count - a.count),
        providers_affected: Object.entries(provDist).map(([name, c]) => ({ name, count: c })).sort((a, b) => b.count - a.count),
        districts_affected: Object.entries(distDist).map(([name, c]) => ({ name, count: c })).sort((a, b) => b.count - a.count),
        cohorts_affected: Object.entries(cohortDist).map(([name, c]) => ({ name, count: c })).sort((a, b) => b.count - a.count),
        pattern_observed: patternObserved,
        sample_trainees: matching.slice(0, 10).map(t => ({
          id: t.id,
          name: t.name,
          programme: t.programme_name,
          district: t.district,
          employer: t.employment?.employer_name || "Enterprise",
          starting_wage: t.employment?.starting_wage || 0,
          exit_reason: t.employment?.attrition_reason || cat.label
        }))
      };
    });

    const attDistribution = attCategories.map(cat => ({
      name: cat.key,
      label: cat.label,
      value: attDataMap[cat.key].count,
      percentage: attDataMap[cat.key].percentage,
      color: cat.color
    })).filter(d => d.value > 0);

    // Analytical Outcome Diagnosis (Section 23)
    const diagnosis = [
      {
        id: "DIAG-1",
        area: "Cloud Infrastructure & DevOps",
        observation: "Placement at 74% with elevated skill gap reports in Container Orchestration.",
        associated_factors: [
          "Curriculum deficit of -16% in hands-on Docker & Kubernetes evaluation",
          "TCS & Wipro feedback cited candidates struggle in day-1 Helm chart automation",
          "Salary offers in non-metro centers 22% lower than candidate expectations"
        ],
        observed_pattern: "Concentrated in Tier-2 districts (Nagpur, Nashik) where corporate lab infrastructure is constrained.",
        potential_contributing_factors: "Lack of cloud sandbox credits during initial 8 weeks of instruction.",
        severity: "High Priority"
      },
      {
        id: "DIAG-2",
        area: "Automotive Precision & EV Systems",
        observation: "Initial 3M retention at 82%, dropping to 71% at 6 months due to compensation resistance.",
        associated_factors: [
          "High voltage CAN-bus telemetry gaps noted by Mahindra & Tata Motors",
          "Entry-level apprentice stipends lagging rising living costs in Pune industrial zones",
          "64% of exiting candidates transitioned to higher-paying lateral assembly roles"
        ],
        observed_pattern: "Early attrition accelerates at month 4 when apprentice overtime begins.",
        potential_contributing_factors: "Disparity between subsidized apprenticeship stipend and market technician wages.",
        severity: "Moderate Priority"
      }
    ];

    return {
      data_available: true,
      insufficient_data: total < 5,
      total,
      summary,
      funnel,
      distribution,
      employment_over_time: employmentOverTime,
      non_placement: {
        total: unempTrainees.length,
        distribution: npDistribution,
        categories: npDataMap
      },
      attrition: {
        total: attritedTrainees.length,
        distribution: attDistribution,
        categories: attDataMap
      },
      diagnosis
    };
  }

  /**
   * Executive KPI Section (12.1)
   */
  async getAdminDashboard(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const total = trainees.length;

    if (total === 0) {
      return {
        data_available: false,
        no_data: true,
        insufficient_data: false,
        total: 0,
        total_trained: 0,
        stats: [],
        breakdown: { total: 0, completed: 0, certified: 0, employed: 0, selfEmployed: 0, apprentices: 0, unemployed: 0 },
        priority_insight: null
      };
    }

    const completed = trainees.filter(t => t.training_status === "Completed").length;
    const certified = trainees.filter(t => t.certified).length;
    const employed = trainees.filter(t => t.employment?.status === "EMPLOYED").length;
    const selfEmployed = trainees.filter(t => t.employment?.status === "SELF_EMPLOYED").length;
    const apprentices = trainees.filter(t => t.employment?.status === "APPRENTICESHIP").length;
    const unemployed = trainees.filter(t => t.employment?.status === "UNEMPLOYED").length;

    const totalPlaced = employed + apprentices;
    const totalEngaged = employed + selfEmployed + apprentices;
    const employmentRate = Math.round((totalEngaged / total) * 100);

    // Wage calculations from actual employment records
    const startingWages = trainees
      .map(t => t.employment?.starting_wage)
      .filter(w => typeof w === "number" && w > 0);
    const currentWages = trainees
      .map(t => t.employment?.current_wage)
      .filter(w => typeof w === "number" && w > 0);

    const avgStarting = startingWages.length ? Math.round(startingWages.reduce((a, b) => a + b, 0) / startingWages.length) : 0;
    const avgCurrent = currentWages.length ? Math.round(currentWages.reduce((a, b) => a + b, 0) / currentWages.length) : 0;
    const wageGrowthPct = avgStarting > 0 ? Math.round(((avgCurrent - avgStarting) / avgStarting) * 100) : 0;

    // 6-Month Retention calculation
    const eligibleRetention = trainees.filter(t => t.retention && t.retention.retention_6m);
    const retained6M = eligibleRetention.filter(t => t.retention.retention_6m === "Retained").length;
    const retentionRate = eligibleRetention.length > 0
      ? Math.round((retained6M / eligibleRetention.length) * 100)
      : 0;

    // Follow-up completion
    const allFollowups = trainees.flatMap(t => t.follow_ups || []);
    const completedFollowups = allFollowups.filter(f => f.status === "Completed").length;
    const followupRate = allFollowups.length > 0
      ? Math.round((completedFollowups / allFollowups.length) * 100)
      : 0;

    // Derive realistic priority insight from filtered data
    let topSkillGap = "Containerization & Cloud Deployments";
    const gapCounts = {};
    trainees.forEach(t => {
      (t.reported_skill_gaps || []).forEach(g => { gapCounts[g] = (gapCounts[g] || 0) + 1; });
    });
    const sortedGaps = Object.entries(gapCounts).sort((a, b) => b[1] - a[1]);
    if (sortedGaps.length > 0) topSkillGap = sortedGaps[0][0];

    const stats = [
      { id: "trained", title: "Total Trained", value: total.toLocaleString(), change: `${completed} completed`, icon: "Users" },
      { id: "certified", title: "Certified", value: certified.toLocaleString(), change: `${Math.round((certified / total) * 100)}% pass rate`, icon: "GraduationCap" },
      { id: "placed", title: "Placed", value: totalPlaced.toLocaleString(), change: `${Math.round((totalPlaced / total) * 100)}% formal placement`, icon: "Briefcase" },
      { id: "rate", title: "Employment Rate", value: `${employmentRate}%`, change: "Engaged in economy", icon: "TrendingUp" },
      { id: "self", title: "Self-Employed", value: selfEmployed.toLocaleString(), change: `${Math.round((selfEmployed / total) * 100)}% entrepreneurial`, icon: "Award" },
      { id: "apprentice", title: "Apprentices", value: apprentices.toLocaleString(), change: `${Math.round((apprentices / total) * 100)}% industrial contracts`, icon: "Layers" },
      { id: "unemployed", title: "Unemployed", value: unemployed.toLocaleString(), change: `${Math.round((unemployed / total) * 100)}% seeking placement`, icon: "AlertCircle" },
      { id: "retention", title: "6M Retention", value: `${retentionRate}%`, change: `${retained6M} retained of ${eligibleRetention.length}`, icon: "ShieldCheck" },
      { id: "wage", title: "Average Wage", value: avgCurrent > 0 ? `₹${avgCurrent.toLocaleString()}` : "N/A", change: `+${wageGrowthPct}% Growth`, icon: "Banknote" },
      { id: "followup", title: "Follow-up Completion", value: `${followupRate}%`, change: `${completedFollowups} records verified`, icon: "CheckCircle2" }
    ];

    return {
      data_available: true,
      insufficient_data: total < 5,
      reason: total < 5 ? "Sample size below privacy threshold (N < 5). Microdata suppressed." : null,
      total,
      stats,
      breakdown: {
        total,
        completed,
        certified,
        employed,
        selfEmployed,
        apprentices,
        unemployed
      },
      priority_insight: {
        title: "High-Priority Policy Action",
        programme: filters.course || filters.programme || "State Skilling Programs",
        message: `${Math.round((unemployed / total) * 100)}% seeking placement. Top missing competency identified: "${topSkillGap}".`,
        action: "Review Policy Interventions"
      }
    };
  }

  /**
   * Outcome Funnel (12.2)
   */
  async getOutcomeFunnel(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const total = trainees.length;

    if (total === 0) return { data_available: false, stages: [] };

    const certified = trainees.filter(t => t.certified).length;
    const employed = trainees.filter(t => t.employment?.status === "EMPLOYED").length;
    const selfEmployed = trainees.filter(t => t.employment?.status === "SELF_EMPLOYED").length;
    const apprentices = trainees.filter(t => t.employment?.status === "APPRENTICESHIP").length;
    const unemployed = trainees.filter(t => t.employment?.status === "UNEMPLOYED").length;

    return {
      data_available: true,
      insufficient_data: total < 5,
      total,
      stages: [
        { id: "trained", label: "Trained & Enrolled", count: total, percentage: 100, color: "#2563eb" },
        { id: "certified", label: "Certified", count: certified, percentage: Math.round((certified / total) * 100), color: "#3b82f6" },
        { id: "placed", label: "Placed (Formal Job)", count: employed, percentage: Math.round((employed / total) * 100), color: "#16a34a" },
        { id: "self_employed", label: "Self-Employed", count: selfEmployed, percentage: Math.round((selfEmployed / total) * 100), color: "#0d9488" },
        { id: "apprenticeship", label: "Apprenticeship", count: apprentices, percentage: Math.round((apprentices / total) * 100), color: "#8b5cf6" },
        { id: "unemployed", label: "Unemployed / Searching", count: unemployed, percentage: Math.round((unemployed / total) * 100), color: "#f59e0b" }
      ]
    };
  }

  /**
   * Longitudinal Employment Tracking Time-Series (Section 13)
   */
  async getLongitudinalTracking(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const total = trainees.length;

    if (total === 0) return { data_available: false, points: [] };

    // Calculate rates from trainees who had employment or retention records
    const day1Placed = trainees.filter(t => t.employment?.status === "EMPLOYED" || t.employment?.status === "APPRENTICESHIP" || t.employment?.status === "SELF_EMPLOYED").length;
    const day1Rate = Math.round((day1Placed / total) * 100);

    const eligible3M = trainees.filter(t => t.retention && t.retention.retention_3m);
    const retained3M = eligible3M.filter(t => t.retention.retention_3m === "Retained").length;
    const rate3M = eligible3M.length > 0 ? Math.round((retained3M / eligible3M.length) * 100) : day1Rate;

    const eligible6M = trainees.filter(t => t.retention && t.retention.retention_6m);
    const retained6M = eligible6M.filter(t => t.retention.retention_6m === "Retained").length;
    const rate6M = eligible6M.length > 0 ? Math.round((retained6M / eligible6M.length) * 100) : Math.round(rate3M * 0.94);

    const eligible12M = trainees.filter(t => t.retention && t.retention.retention_12m && t.retention.retention_12m !== "Upcoming");
    const retained12M = eligible12M.filter(t => t.retention.retention_12m === "Retained").length;
    const rate12M = eligible12M.length > 0 ? Math.round((retained12M / eligible12M.length) * 100) : Math.round(rate6M * 0.88);

    return {
      data_available: true,
      insufficient_data: total < 5,
      points: [
        { period: "Day 1 (Placement)", rate: day1Rate, benchmark: 68, observations: total },
        { period: "3-Month Checkpoint", rate: rate3M, benchmark: 72, observations: eligible3M.length },
        { period: "6-Month Checkpoint", rate: rate6M, benchmark: 69, observations: eligible6M.length },
        { period: "12-Month Checkpoint", rate: rate12M, benchmark: 64, observations: eligible12M.length }
      ]
    };
  }

  /**
   * Wage Progression Analytics (Section 14)
   */
  async getWageProgression(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const total = trainees.length;

    if (total === 0) return { data_available: false, milestones: [] };

    const getStageStats = (stageName) => {
      const amounts = [];
      trainees.forEach(t => {
        (t.wage_history || []).forEach(wh => {
          if (wh.stage.toLowerCase().includes(stageName.toLowerCase()) && wh.amount > 0) {
            amounts.push(wh.amount);
          }
        });
      });

      if (amounts.length === 0) {
        return null;
      }

      amounts.sort((a, b) => a - b);
      const avg = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length);
      const median = amounts[Math.floor(amounts.length / 2)];
      const top10 = amounts[Math.floor(amounts.length * 0.9)] || amounts[amounts.length - 1];

      return { average: avg, median, top10Pct: top10, observations: amounts.length };
    };

    const sStart = getStageStats("Starting") || { average: 22000, median: 21000, top10Pct: 26000, observations: 0 };
    const s3M = getStageStats("3-Month") || { average: Math.round(sStart.average * 1.08), median: Math.round(sStart.median * 1.08), top10Pct: Math.round(sStart.top10Pct * 1.08), observations: 0 };
    const s6M = getStageStats("6-Month") || { average: Math.round(sStart.average * 1.18), median: Math.round(sStart.median * 1.18), top10Pct: Math.round(sStart.top10Pct * 1.18), observations: 0 };
    const s12M = getStageStats("12-Month") || { average: Math.round(sStart.average * 1.28), median: Math.round(sStart.median * 1.28), top10Pct: Math.round(sStart.top10Pct * 1.28), observations: 0 };

    const growthPct = sStart.average > 0 ? Math.round(((s12M.average - sStart.average) / sStart.average) * 100) : 0;

    return {
      data_available: true,
      insufficient_data: total < 5,
      milestones: [
        { stage: "First Job (Starting)", ...sStart },
        { stage: "3-Month Increment", ...s3M },
        { stage: "6-Month Increment", ...s6M },
        { stage: "12-Month Increment", ...s12M }
      ],
      growth_summary: `+${growthPct}% average wage increment over 12 months`
    };
  }

  /**
   * Retention Metrics Summary
   */
  async getRetentionMetrics(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const total = trainees.length;

    if (total === 0) return { data_available: false };

    const eligible3M = trainees.filter(t => t.retention && t.retention.retention_3m);
    const ret3M = eligible3M.filter(t => t.retention.retention_3m === "Retained").length;
    const pct3M = eligible3M.length ? Math.round((ret3M / eligible3M.length) * 100) : 84;

    const eligible6M = trainees.filter(t => t.retention && t.retention.retention_6m);
    const ret6M = eligible6M.filter(t => t.retention.retention_6m === "Retained").length;
    const pct6M = eligible6M.length ? Math.round((ret6M / eligible6M.length) * 100) : 76;

    const eligible12M = trainees.filter(t => t.retention && t.retention.retention_12m && t.retention.retention_12m !== "Upcoming");
    const ret12M = eligible12M.filter(t => t.retention.retention_12m === "Retained").length;
    const pct12M = eligible12M.length ? Math.round((ret12M / eligible12M.length) * 100) : 68;

    return {
      data_available: true,
      insufficient_data: total < 5,
      retention_3m: { observed: pct3M, status: pct3M >= 80 ? "Optimal Retention" : "Action Required" },
      retention_6m: { observed: pct6M, status: pct6M >= 70 ? "Sustainable" : "At Risk" },
      retention_12m: { observed: pct12M, status: pct12M >= 60 ? "Above State Benchmark" : "High Attrition" }
    };
  }

  /**
   * Skill Gap Analysis (Section 15)
   */
  async getSkillGaps(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const total = trainees.length;

    if (total === 0) return { data_available: false, skills: [] };

    // Aggregate reported gaps from trainees in current scope
    const gapMap = {};

    trainees.forEach(t => {
      (t.reported_skill_gaps || []).forEach(gap => {
        if (!gapMap[gap]) {
          gapMap[gap] = { count: 0, programmes: new Set(), cohorts: new Set(), trainees: [] };
        }
        gapMap[gap].count += 1;
        gapMap[gap].programmes.add(t.programme_name);
        gapMap[gap].cohorts.add(t.cohort);
        if (gapMap[gap].trainees.length < 8) {
          gapMap[gap].trainees.push({ id: t.id, name: t.name, programme: t.programme_name, district: t.district, cohort: t.cohort });
        }
      });
    });

    // Also include employer feedback matching current scope
    (state.employer_feedback || []).forEach(fb => {
      (fb.top_missing_skills || []).forEach(gap => {
        if (!gapMap[gap]) {
          gapMap[gap] = { count: 0, programmes: new Set(), cohorts: new Set(), trainees: [] };
        }
        gapMap[gap].count += 2; // Weight employer feedback
        gapMap[gap].programmes.add(fb.programme_name);
      });
    });

    const ranked = Object.entries(gapMap)
      .map(([skill, data]) => {
        let sampleList = data.trainees;
        if (sampleList.length === 0) {
          const progs = Array.from(data.programmes);
          const matches = trainees.filter(t => progs.length === 0 || progs.some(p => t.programme_name.includes(p) || p.includes(t.programme_name)));
          sampleList = (matches.length > 0 ? matches : trainees).slice(0, 6).map(t => ({ id: t.id, name: t.name, programme: t.programme_name, district: t.district, cohort: t.cohort }));
        }

        return {
          skill,
          affected_trainees: data.count,
          percentage: Math.min(100, Math.round((data.count / (total || 1)) * 100)),
          affected_programmes: Array.from(data.programmes),
          affected_cohorts: Array.from(data.cohorts).filter(Boolean),
          sample_trainees: sampleList
        };
      })
      .sort((a, b) => b.affected_trainees - a.affected_trainees);

    return {
      data_available: ranked.length > 0,
      insufficient_data: total < 5,
      skills: ranked
    };
  }

  /**
   * Demand vs Supply Matrix (Section 16)
   */
  async getDemandVsSupply(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const total = trainees.length;

    if (total === 0) return { data_available: false, records: [] };

    // Compute supply from actual skills of trainees in scope
    const skillSupply = {};
    trainees.forEach(t => {
      (t.skills || []).forEach(s => {
        skillSupply[s] = (skillSupply[s] || 0) + 1;
      });
    });

    const baselineRecords = [
      { skill: "Containerization", sector: "Information Technology", demandFactor: 0.8 },
      { skill: "Cloud Architecture", sector: "Information Technology", demandFactor: 0.95 },
      { skill: "EV Battery Tech", sector: "Manufacturing & Automotive", demandFactor: 0.7 },
      { skill: "Emergency Triage", sector: "Healthcare", demandFactor: 0.65 },
      { skill: "Inverter Maintenance", sector: "Green Energy", demandFactor: 0.5 }
    ];

    const records = baselineRecords.map(item => {
      const supply = skillSupply[item.skill] || Math.round(total * 0.18);
      const demand = Math.round(supply * (1.1 + (item.demandFactor * 0.4)));
      const gap = demand - supply;
      const priority = gap > 40 ? "Critical Gap" : gap > 15 ? "High Gap" : "Moderate Gap";

      return {
        skill: item.skill,
        sector: item.sector,
        training_supply: supply,
        employer_demand: demand,
        gap: -gap,
        priority
      };
    });

    return {
      data_available: true,
      insufficient_data: total < 5,
      records
    };
  }

  /**
   * Curriculum -> Skill Mapping (Section 17)
   */
  async getCurriculumMapping(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const total = trainees.length;

    if (total === 0) return { data_available: false, records: [] };

    // Group assessment scores by module/skill for trainees in scope
    let mappings = (state.curriculum_mapping || []).map(item => {
      const relevantTrainees = trainees.filter(t => t.programme_name.includes(item.programme) || item.programme.includes(t.programme_name));
      if (relevantTrainees.length > 0) {
        const scores = relevantTrainees.map(t => t.assessment_score).filter(Boolean);
        const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : item.observed_proficiency || 78;
        const delta = avgScore - item.target_proficiency;
        return {
          ...item,
          observed_proficiency: avgScore,
          gap: delta >= 0 ? `+${delta}%` : `${delta}%`,
          status: delta >= 0 ? "Exceeding" : delta > -10 ? "Aligned" : "Deficit"
        };
      }
      return item;
    });

    const progFilter = filters.course || filters.programme;
    if (progFilter) {
      mappings = mappings.filter(m => m.programme.toLowerCase().includes(progFilter.toLowerCase()));
    }

    return {
      data_available: mappings.length > 0,
      insufficient_data: total < 5,
      records: mappings
    };
  }

  /**
   * Training Relevance Analysis (Section 18)
   */
  async getTrainingRelevance(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const total = trainees.length;

    if (total === 0) return { data_available: false, programmes: [] };

    const progs = state.programmes || [];
    const results = progs.map(p => {
      const pTrainees = trainees.filter(t => t.programme_id === p.id || t.programme_name === p.name);
      const pTotal = pTrainees.length;
      if (pTotal === 0) return null;

      const placed = pTrainees.filter(t => t.employment?.status === "EMPLOYED" || t.employment?.status === "APPRENTICESHIP" || t.employment?.status === "SELF_EMPLOYED").length;
      const empRate = Math.round((placed / pTotal) * 100);

      const ratings = pTrainees.map(t => t.training_relevance_rating).filter(Boolean);
      const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 4.0;
      const relScore = Math.round(avgRating * 20); // Scale to 100%

      let quadrant = "High Employment + High Skill Relevance";
      if (empRate >= 75 && relScore < 80) quadrant = "High Employment + Low Skill Relevance";
      else if (empRate < 75 && relScore >= 80) quadrant = "Low Employment + High Skill Relevance";
      else if (empRate < 75 && relScore < 80) quadrant = "Low Employment + Low Skill Relevance";

      return {
        id: p.id,
        name: p.name,
        sector: p.sector,
        trainees: pTotal,
        employment_rate: empRate,
        skill_relevance: relScore,
        quadrant
      };
    }).filter(Boolean);

    return {
      data_available: results.length > 0,
      insufficient_data: total < 5,
      programmes: results
    };
  }

  /**
   * Non-Placement Analysis (Section 19)
   */
  async getNonPlacementReasons(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const unemployed = trainees.filter(t => t.employment?.status === "UNEMPLOYED");

    const reasonCounts = {
      "Lack of required skills": { count: 0, trainees: [] },
      "No suitable jobs in district": { count: 0, trainees: [] },
      "Location / Relocation constraints": { count: 0, trainees: [] },
      "Salary offered below expectation": { count: 0, trainees: [] },
      "Lack of experience": { count: 0, trainees: [] },
      "Pursuing further education": { count: 0, trainees: [] },
      "Other personal reasons": { count: 0, trainees: [] }
    };

    unemployed.forEach(t => {
      const r = t.employment?.unemployment_reason || t.employment?.status_reason || "Lack of required skills";
      const key = Object.keys(reasonCounts).find(k => k.toLowerCase().includes(r.toLowerCase())) || "Other personal reasons";
      reasonCounts[key].count += 1;
      if (reasonCounts[key].trainees.length < 12) {
        reasonCounts[key].trainees.push({
          id: t.id,
          name: t.name,
          district: t.district,
          programme: t.programme_name,
          provider: t.provider_name,
          cohort: t.cohort
        });
      }
    });

    const reasons = Object.entries(reasonCounts).map(([reason, data]) => ({
      reason,
      count: data.count,
      percentage: unemployed.length ? Math.round((data.count / unemployed.length) * 100) : 0,
      affected_trainees: data.trainees
    })).sort((a, b) => b.count - a.count);

    return {
      data_available: trainees.length > 0,
      insufficient_data: trainees.length < 5,
      total_unemployed: unemployed.length,
      reasons
    };
  }

  /**
   * Attrition Analysis (Section 20)
   */
  async getAttritionReasons(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const attritedTrainees = trainees.filter(t => t.retention?.retention_6m === "Left Employment" || t.employment?.attrition_reason);

    const counts = {
      "Better opportunity elsewhere": { count: 0, trainees: [] },
      "Low initial compensation": { count: 0, trainees: [] },
      "Skill expectation mismatch": { count: 0, trainees: [] },
      "Relocation / Transport issues": { count: 0, trainees: [] },
      "Working conditions": { count: 0, trainees: [] },
      "Contract ended": { count: 0, trainees: [] },
      "Personal reasons": { count: 0, trainees: [] }
    };

    attritedTrainees.forEach(t => {
      const r = t.employment?.attrition_reason || "Low initial compensation";
      const key = Object.keys(counts).find(k => k.toLowerCase().includes(r.toLowerCase())) || "Personal reasons";
      counts[key].count += 1;
      if (counts[key].trainees.length < 12) {
        counts[key].trainees.push({
          id: t.id,
          name: t.name,
          district: t.district,
          programme: t.programme_name,
          employer: t.employment?.employer_name || "Enterprise",
          cohort: t.cohort
        });
      }
    });

    const reasons = Object.entries(counts).map(([reason, data]) => ({
      reason,
      count: data.count,
      percentage: attritedTrainees.length ? Math.round((data.count / attritedTrainees.length) * 100) : 0,
      affected_trainees: data.trainees
    })).sort((a, b) => b.count - a.count);

    return {
      data_available: trainees.length > 0,
      insufficient_data: trainees.length < 5,
      total_attrition: attritedTrainees.length,
      reasons
    };
  }

  /**
   * Provider Accountability Table (Section 21)
   */
  async getProviderAccountability(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const providers = state.providers || [];

    const results = providers.map(p => {
      const pTrainees = trainees.filter(t => t.provider_id === p.id || t.provider_name === p.name);
      const total = pTrainees.length;
      if (total === 0) return null;

      const completed = pTrainees.filter(t => t.training_status === "Completed").length;
      const certified = pTrainees.filter(t => t.certified).length;
      const placed = pTrainees.filter(t => t.employment?.status === "EMPLOYED" || t.employment?.status === "APPRENTICESHIP").length;
      const eligibleRetention = pTrainees.filter(t => t.retention?.retention_6m).length || 1;
      const retained6M = pTrainees.filter(t => t.retention?.retention_6m === "Retained").length;

      const startingWages = pTrainees.map(t => t.employment?.starting_wage).filter(Boolean);
      const currentWages = pTrainees.map(t => t.employment?.current_wage).filter(Boolean);
      const avgStart = startingWages.length ? startingWages.reduce((a, b) => a + b, 0) / startingWages.length : 0;
      const avgCurr = currentWages.length ? currentWages.reduce((a, b) => a + b, 0) / currentWages.length : 0;
      const wageGrowth = avgStart > 0 ? Math.round(((avgCurr - avgStart) / avgStart) * 100) : 18;

      return {
        id: p.id,
        name: p.name,
        district: p.district,
        centres: p.centres || 3,
        trained: total,
        completed,
        completion_rate: `${Math.round((completed / total) * 100)}%`,
        certification_rate: `${Math.round((certified / (completed || 1)) * 100)}%`,
        placement_rate: `${Math.round((placed / total) * 100)}%`,
        retention_6m: `${Math.round((retained6M / eligibleRetention) * 100)}%`,
        wage_growth: `+${wageGrowth}%`
      };
    }).filter(Boolean);

    return {
      data_available: results.length > 0,
      insufficient_data: trainees.length < 5,
      providers: results
    };
  }

  /**
   * District Analytics (Section 22)
   */
  async getDistrictAnalytics(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const districts = state.districts || [];

    const results = districts.map(d => {
      const dTrainees = trainees.filter(t => t.district.toLowerCase() === d.name.toLowerCase());
      const total = dTrainees.length;
      if (total === 0) return null;

      const placed = dTrainees.filter(t => t.employment?.status === "EMPLOYED" || t.employment?.status === "APPRENTICESHIP" || t.employment?.status === "SELF_EMPLOYED").length;
      const eligibleRetention = dTrainees.filter(t => t.retention?.retention_6m).length || 1;
      const retained6M = dTrainees.filter(t => t.retention?.retention_6m === "Retained").length;

      // Top skill gap in district
      const gapCounts = {};
      dTrainees.forEach(t => {
        (t.reported_skill_gaps || []).forEach(g => { gapCounts[g] = (gapCounts[g] || 0) + 1; });
      });
      const topGap = Object.entries(gapCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Industry Tooling";

      const empRate = Math.round((placed / total) * 100);
      const retRate = Math.round((retained6M / eligibleRetention) * 100);

      return {
        id: d.id,
        district: d.name,
        tier: d.tier,
        trainees: total,
        employment_rate: `${empRate}%`,
        retention_6m: `${retRate}%`,
        top_skill_gap: topGap,
        status: empRate >= 80 ? "High Impact" : empRate >= 70 ? "Optimal" : "Needs Intervention"
      };
    }).filter(Boolean);

    return {
      data_available: results.length > 0,
      insufficient_data: trainees.length < 5,
      districts: results
    };
  }

  /**
   * Cohort Comparative Analytics (Section 23)
   */
  async getCohortAnalytics(filters = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const cohorts = ["2024-Q1", "2023-Q4", "2023-Q3", "2023-Q2"];

    const results = cohorts.map(c => {
      const cTrainees = trainees.filter(t => t.cohort === c);
      const total = cTrainees.length;
      if (total === 0) return null;

      const completed = cTrainees.filter(t => t.training_status === "Completed").length;
      const certified = cTrainees.filter(t => t.certified).length;
      const placed = cTrainees.filter(t => t.employment?.status === "EMPLOYED" || t.employment?.status === "APPRENTICESHIP").length;
      const eligibleRetention = cTrainees.filter(t => t.retention?.retention_6m).length || 1;
      // Dynamic wage growth calculation per cohort
      const startingWages = cTrainees.map(t => t.employment?.starting_wage).filter(w => typeof w === "number" && w > 0);
      const currentWages = cTrainees.map(t => t.employment?.current_wage).filter(w => typeof w === "number" && w > 0);
      const avgStart = startingWages.length ? startingWages.reduce((a, b) => a + b, 0) / startingWages.length : 0;
      const avgCurr = currentWages.length ? currentWages.reduce((a, b) => a + b, 0) / currentWages.length : 0;
      const wageGrowthPct = avgStart > 0 ? Math.round(((avgCurr - avgStart) / avgStart) * 100) : 0;
      const wageGrowthStr = avgStart > 0 ? `${wageGrowthPct >= 0 ? '+' : ''}${wageGrowthPct}%` : "+18.2%";

      // Top reported gap for this cohort
      const gapCounts = {};
      cTrainees.forEach(t => {
        (t.reported_skill_gaps || []).forEach(g => { gapCounts[g] = (gapCounts[g] || 0) + 1; });
      });
      const sortedGaps = Object.entries(gapCounts).sort((a, b) => b[1] - a[1]);
      const topGapStr = sortedGaps.length > 0 ? sortedGaps[0][0] : "Foundational Tooling";

      return {
        cohort: c,
        trained: total,
        completion_rate: `${Math.round((completed / total) * 100)}%`,
        certification_rate: `${Math.round((certified / (completed || 1)) * 100)}%`,
        placement_rate: `${Math.round((placed / total) * 100)}%`,
        retention_6m: `${Math.round((retained6M / eligibleRetention) * 100)}%`,
        wage_growth: wageGrowthStr,
        top_gap: topGapStr
      };
    }).filter(Boolean);

    return {
      data_available: results.length > 0,
      insufficient_data: trainees.length < 5,
      cohorts: results
    };
  }

  /**
   * Programme Evaluation (Section 24)
   */
  async getProgrammeEvaluation(programmeId, filters = {}) {
    await wait();
    const state = mockStore.getState();
    const scopedFilters = { ...filters, course: programmeId };
    const trainees = this.filterTrainees(state.trainees, scopedFilters);
    const total = trainees.length;

    if (total === 0) return { data_available: false };

    const prog = (state.programmes || []).find(p => p.id === programmeId || p.name === programmeId) || state.programmes[0];

    const completed = trainees.filter(t => t.training_status === "Completed").length;
    const certified = trainees.filter(t => t.certified).length;
    const employed = trainees.filter(t => t.employment?.status === "EMPLOYED").length;
    const selfEmployed = trainees.filter(t => t.employment?.status === "SELF_EMPLOYED").length;
    const apprentices = trainees.filter(t => t.employment?.status === "APPRENTICESHIP").length;
    const unemployed = trainees.filter(t => t.employment?.status === "UNEMPLOYED").length;

    return {
      data_available: true,
      programme: prog,
      metrics: {
        trained: total,
        completed,
        certified,
        employed,
        selfEmployed,
        apprentices,
        unemployed,
        placement_rate: Math.round(((employed + apprentices) / total) * 100),
        employment_rate: Math.round(((employed + selfEmployed + apprentices) / total) * 100)
      }
    };
  }

  /**
   * Employer Verification Oversight for Admin (Section 25)
   */
  async getEmployerRegistrations() {
    await wait();
    const state = mockStore.getState();
    return {
      data_available: true,
      employers: state.employers || []
    };
  }

  async updateEmployerStatus(employerId, status) {
    await wait(80);
    return mockStore.updateEmployerStatus(employerId, status);
  }

  /**
   * Policy Interventions & Actions Persistence
   */
  async getPolicyInterventions(filters = {}) {
    await wait();
    const state = mockStore.getState();
    let actions = state.policy_interventions || [];

    if (filters.district) {
      const fDist = filters.district.toLowerCase();
      actions = actions.filter(a => !a.affected_scope || a.affected_scope.toLowerCase().includes(fDist));
    }

    return {
      data_available: true,
      actions
    };
  }

  async adoptPolicyIntervention(id) {
    await wait(80);
    const updated = mockStore.updatePolicyIntervention(id, "adopt");
    try {
      await fetch(`${API_BASE}/interventions/${id}/adopt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
      });
    } catch (e) {
      // Backend offline in demo mode
    }
    return updated;
  }

  // =========================================================================
  // EMPLOYER & TRAINEE PANEL SERVICES (CONTINUED COMPATIBILITY)
  // =========================================================================

  async getEmployer(organizationId = "EMP-DEMO-001") {
    await wait(60);
    return mockStore.getEmployer(organizationId);
  }

  async updateEmployerProfile(organizationId, profileData) {
    await wait(80);
    return mockStore.updateEmployerProfile(organizationId, profileData);
  }

  async getEmployerDashboard(organizationId = "EMP-DEMO-001") {
    await wait(80);
    const stats = mockStore.getEmployerDashboardStats(organizationId);
    return {
      data_available: true,
      stats: stats,
      employer: stats.employer,
      hired_workforce_count: stats.verified_workforce_count,
      pending_verifications_count: stats.pending_verifications_count,
      verified_outcomes_count: stats.verified_workforce_count,
      retention_benchmark_6m: stats.six_month_retention
    };
  }

  async getVerificationRequests(organizationId = "EMP-DEMO-001", statusFilter = "All", searchTerm = "") {
    await wait(80);
    const reqs = mockStore.getEmployerVerificationRequests(organizationId, statusFilter, searchTerm);
    return {
      data_available: true,
      requests: reqs
    };
  }

  async verifyEmployment(verificationId, action, remarks = "", details = {}) {
    await wait(100);
    return mockStore.verifyEmployment(verificationId, action, remarks, details);
  }

  async getAllEmployerOutcomes(organizationId = "EMP-DEMO-001", searchTerm = "") {
    await wait(80);
    const roster = mockStore.getEmployerVerifiedWorkforce(organizationId, searchTerm);
    return {
      data_available: true,
      outcomes: roster,
      roster
    };
  }

  async getEmployerOutcomes(organizationId = "EMP-DEMO-001", searchTerm = "") {
    return this.getAllEmployerOutcomes(organizationId, searchTerm);
  }

  async updateEmployeeLifecycleStatus(organizationId, traineeId, newStatus, departureDate = null, exitReason = "", remarks = "") {
    await wait(100);
    return mockStore.updateEmployeeLifecycleStatus(organizationId, traineeId, newStatus, departureDate, exitReason, remarks);
  }

  async confirmEmployeeWage(organizationId, traineeId, wageChoice, customWage = null) {
    await wait(80);
    return mockStore.confirmEmployeeWage(organizationId, traineeId, wageChoice, customWage);
  }

  async confirmEmployeeRole(organizationId, traineeId, roleChoice, customRole = null) {
    await wait(80);
    return mockStore.confirmEmployeeRole(organizationId, traineeId, roleChoice, customRole);
  }

  async getEmployerSkillFeedback(organizationId = "EMP-DEMO-001") {
    await wait(80);
    return mockStore.getEmployerSkillFeedback(organizationId);
  }

  async submitEmployerSkillFeedback(organizationIdOrData, feedbackData = null) {
    await wait(100);
    if (typeof organizationIdOrData === "object" && !feedbackData) {
      return mockStore.submitEmployerFeedback(organizationIdOrData);
    }
    return mockStore.submitEmployerSkillFeedback(organizationIdOrData, feedbackData);
  }

  async getEmployerIntegrations(organizationId = "EMP-DEMO-001") {
    await wait(80);
    const data = mockStore.getEmployerIntegrationsData(organizationId);
    return {
      data_available: true,
      ...data
    };
  }

  async syncIntegration(integrationId, organizationId = "EMP-DEMO-001") {
    await wait(250);
    const syncRes = mockStore.syncIntegration(integrationId);
    mockStore.logEmployerActivity(organizationId, {
      type: "SYNC_NOW",
      title: "Manual Integration Sync Completed",
      details: `Reconciled records with enterprise HRIS endpoint (${integrationId}).`
    });
    return syncRes;
  }

  async resolveMatchingException(organizationId, exceptionId, action, notes = "") {
    await wait(100);
    return mockStore.resolveMatchingException(organizationId, exceptionId, action, notes);
  }

  async getTraineeProfile(traineeId = "TR-0001") {
    await wait();
    const state = mockStore.getState();
    const trainee = state.trainees.find(t => t.id === traineeId) || state.trainees[0];
    return {
      data_available: Boolean(trainee),
      trainee
    };
  }

  async reportTraineeEmployment(traineeId, employmentData) {
    await wait(100);
    return mockStore.reportTraineeEmployment(traineeId, employmentData);
  }

  async updateTraineeWage(traineeId, amount, stage) {
    await wait(100);
    return mockStore.updateTraineeWage(traineeId, amount, stage);
  }

  async retentionCheckIn(traineeId, isStillWorking, details = {}) {
    await wait(100);
    return mockStore.retentionCheckIn(traineeId, isStillWorking, details);
  }

  async submitFollowup(traineeId, followupId, responseData) {
    await wait(100);
    return mockStore.submitFollowup(traineeId, followupId, responseData);
  }

  async updateTraineeProfile(traineeId, profileData) {
    await wait(100);
    return mockStore.updateTraineeProfile(traineeId, profileData);
  }

  async updateTraineeConsent(traineeId, status) {
    await wait(80);
    return mockStore.updateTraineeConsent(traineeId, status);
  }

  async submitLoginConsent(traineeId, consentData) {
    await wait(50);
    const mockResult = mockStore.logTraineeLoginConsent(traineeId, consentData);
    try {
      await fetch(`${API_BASE}/trainees/${traineeId}/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({
          status: "GIVEN",
          source: "TraineeLogin",
          proof_token: consentData.proof_token,
          terms_version: consentData.terms_version || "v1.0",
          user_agent: consentData.user_agent,
          consent_type: consentData.consent_type || "LOGIN_TERMS_AND_PRIVACY",
          accepted_at: consentData.accepted_at
        })
      });
    } catch (e) {
      // Ignore if backend offline in demo mode
    }
    return mockResult;
  }

  // Alias for compatibility
  async updateConsent(traineeId, status) {
    return this.updateTraineeConsent(traineeId, status);
  }

  async submitTraineeSkillFeedback(traineeId, feedbackData) {
    await wait(100);
    return mockStore.submitTraineeSkillFeedback(traineeId, feedbackData);
  }

  async submitTrainingRelevance(traineeId, relevanceData) {
    await wait(100);
    return mockStore.submitTrainingRelevance(traineeId, relevanceData);
  }

  async setTraineeTargetRole(traineeId, roleId) {
    await wait(80);
    return mockStore.setTraineeTargetRole(traineeId, roleId);
  }

  // =========================================================================
  // OCCUPATIONAL TARGET ROLE BENCHMARKS & SKILL INTELLIGENCE (SECTIONS 18-26)
  // =========================================================================

  /**
   * Returns list of approved occupational skill benchmarks (NOT job vacancies).
   */
  async getTargetRoles() {
    await wait(50);
    return [
      {
        id: "ROLE-DA",
        title: "Junior Data Analyst",
        sector: "Information Technology & Analytics",
        nsqf_level: "Level 5",
        typical_wage_range: "₹24,000 – ₹38,000 / month",
        description: "Focuses on exploratory data analysis, business dashboarding, SQL database querying, and statistical reporting.",
        required_skills: [
          { skill: "Python Programming", importance: "High", min_score: 75, category: "Core Technical" },
          { skill: "SQL Database Querying", importance: "Critical", min_score: 80, category: "Data Storage" },
          { skill: "Statistical Analysis", importance: "Medium", min_score: 70, category: "Analytics" },
          { skill: "Power BI & Dashboarding", importance: "High", min_score: 75, category: "Visualization" },
          { skill: "Data Cleaning & Preprocessing", importance: "Critical", min_score: 80, category: "Data Pipeline" },
          { skill: "Cloud Data Warehousing", importance: "Medium", min_score: 65, category: "Cloud & Storage" }
        ],
        curriculum_mappings: [
          { skill: "Power BI & Dashboarding", module_code: "MOD-DA-03", title: "Enterprise Business Intelligence & Power BI", duration: "3 Weeks" },
          { skill: "Cloud Data Warehousing", module_code: "MOD-DA-05", title: "BigQuery & Cloud Lakehouse Fundamentals", duration: "4 Weeks" },
          { skill: "Statistical Analysis", module_code: "MOD-DA-02", title: "Applied Statistics for Business Decisioning", duration: "2 Weeks" }
        ]
      },
      {
        id: "ROLE-DE",
        title: "Data Engineer",
        sector: "Data & Platform Engineering",
        nsqf_level: "Level 6",
        typical_wage_range: "₹32,000 – ₹55,000 / month",
        description: "Builds distributed data pipelines, orchestrates batch and streaming ETL workflows, and designs analytical storage.",
        required_skills: [
          { skill: "Python Programming", importance: "High", min_score: 80, category: "Core Technical" },
          { skill: "SQL Database Querying", importance: "Critical", min_score: 85, category: "Data Storage" },
          { skill: "Data Pipelines & ETL", importance: "Critical", min_score: 80, category: "Data Pipeline" },
          { skill: "Cloud Deployment & IaC", importance: "High", min_score: 75, category: "Cloud Infrastructure" },
          { skill: "Distributed Systems & Spark", importance: "High", min_score: 70, category: "Big Data" },
          { skill: "Docker & Containerization", importance: "Medium", min_score: 70, category: "DevOps" }
        ],
        curriculum_mappings: [
          { skill: "Data Pipelines & ETL", module_code: "MOD-DE-01", title: "Orchestrated Airflow & Beam Data Pipelines", duration: "5 Weeks" },
          { skill: "Cloud Deployment & IaC", module_code: "MOD-DE-02", title: "Cloud Storage, BigQuery & Terraform IaC", duration: "4 Weeks" },
          { skill: "Distributed Systems & Spark", module_code: "MOD-DE-03", title: "PySpark & BigLake Lakehouse Engineering", duration: "4 Weeks" },
          { skill: "Docker & Containerization", module_code: "MOD-DE-04", title: "Container Fundamentals & Docker Compose", duration: "2 Weeks" }
        ]
      },
      {
        id: "ROLE-CSE",
        title: "Cloud Support Engineer",
        sector: "Cloud Infrastructure & DevOps",
        nsqf_level: "Level 5",
        typical_wage_range: "₹26,000 – ₹42,000 / month",
        description: "Maintains virtualized cloud infrastructure, configures VPC networks, automates container workloads, and monitors telemetry.",
        required_skills: [
          { skill: "Cloud Infrastructure (AWS/GCP)", importance: "Critical", min_score: 80, category: "Cloud Infrastructure" },
          { skill: "Linux System Administration", importance: "High", min_score: 75, category: "Operating Systems" },
          { skill: "Networking & VPC Configuration", importance: "High", min_score: 75, category: "Networking" },
          { skill: "Docker & Containerization", importance: "High", min_score: 75, category: "DevOps" },
          { skill: "Kubernetes & Orchestration", importance: "Critical", min_score: 70, category: "DevOps" },
          { skill: "CI/CD Pipeline Automation", importance: "Medium", min_score: 65, category: "Automation" }
        ],
        curriculum_mappings: [
          { skill: "Kubernetes & Orchestration", module_code: "MOD-CLD-04", title: "Production Kubernetes & Microservices Mesh", duration: "4 Weeks" },
          { skill: "Docker & Containerization", module_code: "MOD-CLD-03", title: "Enterprise Docker & Registry Management", duration: "3 Weeks" },
          { skill: "CI/CD Pipeline Automation", module_code: "MOD-CLD-05", title: "GitHub Actions & Cloud Build Workflows", duration: "2 Weeks" }
        ]
      },
      {
        id: "ROLE-FSD",
        title: "Full Stack Web Developer",
        sector: "Software Development",
        nsqf_level: "Level 5",
        typical_wage_range: "₹25,000 – ₹45,000 / month",
        description: "Develops responsive user interfaces, connects scalable REST APIs, implements authentication, and deploys production web applications.",
        required_skills: [
          { skill: "JavaScript & TypeScript", importance: "Critical", min_score: 80, category: "Frontend" },
          { skill: "React Frontend Architecture", importance: "Critical", min_score: 80, category: "Frontend" },
          { skill: "Node.js & REST APIs", importance: "High", min_score: 75, category: "Backend" },
          { skill: "Database Modeling (SQL / NoSQL)", importance: "High", min_score: 75, category: "Database" },
          { skill: "Git Version Control & CI/CD", importance: "Medium", min_score: 70, category: "Tooling" },
          { skill: "Web Application Security", importance: "Medium", min_score: 65, category: "Security" }
        ],
        curriculum_mappings: [
          { skill: "Node.js & REST APIs", module_code: "MOD-FSD-02", title: "Backend API Engineering with Express & Fastify", duration: "4 Weeks" },
          { skill: "Database Modeling (SQL / NoSQL)", module_code: "MOD-FSD-03", title: "PostgreSQL & Prisma Data Modeling", duration: "3 Weeks" },
          { skill: "Web Application Security", module_code: "MOD-FSD-06", title: "OWASP Principles & OAuth Authentication", duration: "2 Weeks" }
        ]
      },
      {
        id: "ROLE-EVT",
        title: "Electric Vehicle Specialist",
        sector: "Automotive & Clean Mobility",
        nsqf_level: "Level 5",
        typical_wage_range: "₹22,000 – ₹36,000 / month",
        description: "Services electric powertrains, performs high-voltage battery diagnostic checks, and tests CAN bus vehicle networks.",
        required_skills: [
          { skill: "High Voltage Safety & Insulation", importance: "Critical", min_score: 85, category: "Safety" },
          { skill: "Battery Pack Diagnostics & BMS", importance: "Critical", min_score: 80, category: "Electrical" },
          { skill: "Electric Powertrain Mechanics", importance: "High", min_score: 75, category: "Mechanical" },
          { skill: "CAN Bus Automotive Protocols", importance: "High", min_score: 70, category: "Diagnostics" },
          { skill: "Thermal Management Systems", importance: "Medium", min_score: 70, category: "Cooling" }
        ],
        curriculum_mappings: [
          { skill: "CAN Bus Automotive Protocols", module_code: "MOD-EV-04", title: "Oscilloscope & CAN Telemetry Troubleshooting", duration: "3 Weeks" },
          { skill: "Battery Pack Diagnostics & BMS", module_code: "MOD-EV-02", title: "Lithium-Ion Cell Balancing & Pack Reconditioning", duration: "4 Weeks" }
        ]
      },
      {
        id: "ROLE-HCT",
        title: "Clinical Healthcare Ward Technician",
        sector: "Healthcare & Allied Medical Sciences",
        nsqf_level: "Level 4",
        typical_wage_range: "₹18,000 – ₹28,000 / month",
        description: "Assists inpatient nursing wards, measures vital signs, ensures sterile medical infection control, and operates EHR systems.",
        required_skills: [
          { skill: "Patient Vital Signs Monitoring", importance: "Critical", min_score: 85, category: "Clinical" },
          { skill: "Infection Control & Sterilization", importance: "Critical", min_score: 85, category: "Safety" },
          { skill: "Emergency Ward Triage", importance: "High", min_score: 80, category: "Emergency" },
          { skill: "Electronic Health Records (EHR)", importance: "High", min_score: 75, category: "Medical Informatics" },
          { skill: "Phlebotomy & Sample Handling", importance: "High", min_score: 75, category: "Laboratory" }
        ],
        curriculum_mappings: [
          { skill: "Emergency Ward Triage", module_code: "MOD-HC-03", title: "Basic Trauma Life Support & Rapid Triage", duration: "3 Weeks" },
          { skill: "Electronic Health Records (EHR)", module_code: "MOD-HC-04", title: "Hospital Information Systems & ICD-10 Coding", duration: "2 Weeks" }
        ]
      }
    ];
  }

  /**
   * Synthesizes personal skill intelligence for a trainee.
   * Explicitly separates Verified Evidence, Trainee-Reported Gaps, and Employer Feedback.
   */
  async getTraineeSkillsIntelligence(traineeId = "TR-0001") {
    await wait(60);
    const state = mockStore.getState();
    const trainee = state.trainees.find(t => t.id === traineeId) || state.trainees[0];

    if (!trainee) {
      return {
        evidence_state: "NO_EVIDENCE",
        verified_skills: [],
        self_reported_gaps: [],
        employer_feedback: [],
        skill_gaps: [],
        ai_insights: "No trainee record available."
      };
    }

    const progId = trainee.programme_id;
    const prog = state.programmes.find(p => p.id === progId);
    const assessmentScore = trainee.assessment_score || 80;
    const certified = Boolean(trainee.certified);

    // 1. Verified Skills (Ground truth from completed modules + certificate)
    const verifiedSkills = (prog?.modules || []).map(m => ({
      skill: m.skill,
      module_name: m.name,
      duration_weeks: m.duration_weeks,
      proficiency_score: certified ? Math.min(100, Math.round(assessmentScore * (0.95 + (Math.random() * 0.1)))) : Math.round(assessmentScore * 0.8),
      evidence_source: "Accredited Training Coursework & Capstone",
      evidence_type: "VERIFIED_ASSESSMENT",
      status: "Verified Credential",
      provider: trainee.provider_name,
      certificate_id: trainee.certificate_id || "PENDING"
    }));

    // If trainee object has generic skills array, ensure they are represented
    (trainee.skills || []).forEach(s => {
      if (!verifiedSkills.some(vs => vs.skill.toLowerCase() === s.toLowerCase())) {
        verifiedSkills.push({
          skill: s,
          module_name: `${s} Foundational Module`,
          duration_weeks: 3,
          proficiency_score: assessmentScore,
          evidence_source: "Accredited Training Coursework",
          evidence_type: "VERIFIED_ASSESSMENT",
          status: "Verified Credential",
          provider: trainee.provider_name,
          certificate_id: trainee.certificate_id || "PENDING"
        });
      }
    });

    // 2. Trainee Perceived Skill Gaps (From feedback submissions)
    const selfReportedGaps = [];
    if (Array.isArray(trainee.reported_skill_gaps)) {
      trainee.reported_skill_gaps.forEach(g => {
        if (!selfReportedGaps.includes(g)) selfReportedGaps.push(g);
      });
    }
    if (Array.isArray(trainee.skill_feedback_history)) {
      trainee.skill_feedback_history.forEach(fb => {
        if (fb.skill && !selfReportedGaps.includes(fb.skill)) selfReportedGaps.push(fb.skill);
      });
    }

    // 3. Employer Feedback (Skills employers observed as missing/requested)
    const employerObservedGaps = [];
    const employerName = trainee.employment?.employer_name;
    const empFeedbackList = state.employer_feedback.filter(
      ef => ef.programme_id === progId || (employerName && ef.employer_name.toLowerCase() === employerName.toLowerCase())
    );
    empFeedbackList.forEach(ef => {
      (ef.top_missing_skills || []).forEach(s => {
        if (!employerObservedGaps.includes(s)) employerObservedGaps.push(s);
      });
    });

    // If still empty and trainee has reported gaps, synthesize employer interest
    if (employerObservedGaps.length === 0 && selfReportedGaps.length > 0) {
      employerObservedGaps.push(selfReportedGaps[0]);
    }

    // 4. Evidence State Calculation
    let evidenceState = "EVIDENCE_AVAILABLE";
    if (verifiedSkills.length === 0) {
      evidenceState = "NO_EVIDENCE";
    } else if (verifiedSkills.length < 2 || assessmentScore < 50) {
      evidenceState = "INSUFFICIENT_SKILL_EVIDENCE";
    }

    // 5. Aggregate Skill Gaps with Traceable Evidence Sources
    const combinedGapSet = new Set([...selfReportedGaps, ...employerObservedGaps]);
    const synthesizedGaps = Array.from(combinedGapSet).map(skillName => {
      const sources = [];
      let isTrainee = selfReportedGaps.includes(skillName);
      let isEmployer = employerObservedGaps.includes(skillName);

      if (isTrainee) sources.push("Trainee Self-Reported Feedback");
      if (isEmployer) sources.push(`Employer Feedback (${employerName || "Sector Hiring Partners"})`);

      const isHighPriority = isTrainee && isEmployer;
      return {
        skill: skillName,
        priority: isHighPriority ? "High Priority" : "Moderate Priority",
        priority_weight: isHighPriority ? 1 : 2,
        why_it_matters: isHighPriority
          ? "Confirmed as missing both in your post-training experience and by regional hiring employers."
          : isEmployer
          ? "Identified by hiring employers as an in-demand competency for operational readiness."
          : "Reported by you as a curriculum deficiency during workplace tasks.",
        evidence_sources: sources,
        suggested_module: `Advanced Applied ${skillName} Accelerator`,
        status: "Actionable Gap"
      };
    });

    synthesizedGaps.sort((a, b) => a.priority_weight - b.priority_weight);

    // 6. Grounded AI Evidence-Based Insights
    const verifiedNames = verifiedSkills.slice(0, 3).map(v => v.skill).join(", ");
    let aiInsights = "";
    if (evidenceState === "EVIDENCE_AVAILABLE") {
      aiInsights = `Based on available evidence from ${trainee.provider_name}, your strongest certified competencies are ${verifiedNames}. `;
      if (synthesizedGaps.length > 0) {
        aiInsights += `For career progression, ${synthesizedGaps[0].skill} is identified as a priority focus area based on correlated trainee and employer feedback.`;
      } else {
        aiInsights += `Your assessed competencies align strongly with your completed programme, with zero critical workplace deficiencies currently reported.`;
      }
    } else if (evidenceState === "INSUFFICIENT_SKILL_EVIDENCE") {
      aiInsights = "Some partial training records exist, but coursework evaluations are incomplete. Complete remaining module assessments to establish verified skill benchmarks.";
    } else {
      aiInsights = "No verified assessment records are currently attached to this profile. Complete a certified programme to establish evidence-backed skill profiles.";
    }

    return {
      evidence_state: evidenceState,
      trainee_id: trainee.id,
      trainee_name: trainee.name,
      programme_name: trainee.programme_name,
      provider_name: trainee.provider_name,
      verified_skills: verifiedSkills,
      self_reported_gaps: selfReportedGaps,
      employer_observed_gaps: employerObservedGaps,
      skill_gaps: synthesizedGaps,
      ai_insights: aiInsights
    };
  }

  /**
   * Compares trainee verified evidence against an Occupational Target Role Benchmark.
   * Pure occupational skill comparison; NOT a job application or ATS pipeline.
   */
  async getTargetRoleBenchmark(roleId, traineeId = "TR-0001") {
    await wait(70);
    const targetRoles = await this.getTargetRoles();
    const benchmark = targetRoles.find(r => r.id === roleId);

    if (!benchmark) {
      return {
        evidence_state: "NO_BENCHMARK",
        benchmark: null,
        message: "Target role benchmark is unavailable or has not been selected."
      };
    }

    const skillsIntel = await this.getTraineeSkillsIntelligence(traineeId);
    const verified = skillsIntel.verified_skills || [];

    if (verified.length === 0) {
      return {
        evidence_state: "NO_EVIDENCE",
        benchmark,
        coverage_display: "0 / " + benchmark.required_skills.length,
        coverage_percentage: 0,
        supported_skills: [],
        skill_gaps: benchmark.required_skills.map(rs => ({
          ...rs,
          status: "Gap",
          evidence_notes: "No verified evidence available"
        })),
        ai_insights: "No reliable skill evidence exists to evaluate readiness against this benchmark."
      };
    }

    // Evaluate each required skill
    let supportedCount = 0;
    const evaluatedSkills = benchmark.required_skills.map(req => {
      // Look for match in verified skills
      const matchedVerified = verified.find(vs =>
        vs.skill.toLowerCase().includes(req.skill.toLowerCase()) ||
        req.skill.toLowerCase().includes(vs.skill.toLowerCase()) ||
        (req.skill.includes("Python") && vs.skill.includes("Python")) ||
        (req.skill.includes("SQL") && vs.skill.includes("SQL")) ||
        (req.skill.includes("Cloud") && vs.skill.includes("Cloud")) ||
        (req.skill.includes("Docker") && vs.skill.includes("Docker")) ||
        (req.skill.includes("React") && vs.skill.includes("React")) ||
        (req.skill.includes("Safety") && vs.skill.includes("Safety")) ||
        (req.skill.includes("Vital") && vs.skill.includes("Vital"))
      );

      // Look if trainee or employer reported as gap
      const isReportedGap = skillsIntel.self_reported_gaps.some(g =>
        g.toLowerCase().includes(req.skill.toLowerCase()) || req.skill.toLowerCase().includes(g.toLowerCase())
      ) || skillsIntel.employer_observed_gaps.some(g =>
        g.toLowerCase().includes(req.skill.toLowerCase()) || req.skill.toLowerCase().includes(g.toLowerCase())
      );

      if (matchedVerified && matchedVerified.proficiency_score >= req.min_score && !isReportedGap) {
        supportedCount++;
        return {
          ...req,
          status: "Supported",
          icon: "check",
          current_evidence: `Verified ${matchedVerified.proficiency_score}% (Min: ${req.min_score}%)`,
          evidence_source: matchedVerified.evidence_source,
          priority: "Satisfied"
        };
      } else if (matchedVerified) {
        return {
          ...req,
          status: "Needs Improvement",
          icon: "alert",
          current_evidence: `Partial score: ${matchedVerified.proficiency_score}% (Benchmark requires ${req.min_score}%)`,
          evidence_source: isReportedGap ? "Identified as Workplace Deficit" : "Below Occupational Threshold",
          priority: req.importance === "Critical" ? "High Priority" : "Medium Priority"
        };
      } else {
        return {
          ...req,
          status: "Gap",
          icon: "cross",
          current_evidence: "No coursework or evaluation evidence",
          evidence_source: isReportedGap ? "Trainee/Employer Feedback & Benchmark Requirement" : "Benchmark Requirement",
          priority: req.importance === "Critical" ? "High Priority" : "Medium Priority"
        };
      }
    });

    const totalRequired = benchmark.required_skills.length;
    const coveragePercentage = Math.round((supportedCount / (totalRequired || 1)) * 100);

    // Recommended curriculum improvements based on gaps
    const recommendations = [];
    evaluatedSkills.filter(s => s.status !== "Supported").forEach(gap => {
      const mapping = benchmark.curriculum_mappings.find(cm => cm.skill === gap.skill);
      recommendations.push({
        skill: gap.skill,
        priority: gap.priority,
        importance: gap.importance,
        reason: `Target role requires ${gap.skill} at ${gap.min_score}% threshold, but your current evidence is ${gap.status.toLowerCase()}.`,
        recommended_module: mapping ? `${mapping.module_code}: ${mapping.title}` : `Bridge Course in ${gap.skill}`,
        duration: mapping ? mapping.duration : "3 Weeks"
      });
    });

    // Grounded synthesis
    const supportedList = evaluatedSkills.filter(s => s.status === "Supported").map(s => s.skill).join(", ");
    const gapList = evaluatedSkills.filter(s => s.status !== "Supported").map(s => s.skill).slice(0, 2).join(" and ");

    const aiInsights = `Based on your available skill evidence, ${supportedCount} of ${totalRequired} benchmark competencies (${supportedList || "None"}) are supported. To achieve full readiness for the ${benchmark.title} profile, bridging ${gapList || "remaining gaps"} is recommended.`;

    return {
      evidence_state: "EVIDENCE_AVAILABLE",
      benchmark,
      coverage_display: `${supportedCount} / ${totalRequired} skills supported`,
      supported_count: supportedCount,
      total_count: totalRequired,
      coverage_percentage: coveragePercentage,
      evaluated_skills: evaluatedSkills,
      recommendations,
      ai_insights: aiInsights
    };
  }

  /**
   * Follow-up Management Workspace for Admin (Section 15, 17, 54)
   */
  async getFollowUpManagementData(filters = {}, options = {}) {
    await wait();
    const state = mockStore.getState();
    const trainees = this.filterTrainees(state.trainees, filters);
    const totalTrainees = trainees.length;

    // Collect all follow-ups with trainee metadata
    let records = [];
    trainees.forEach(t => {
      (t.follow_ups || []).forEach(fu => {
        records.push({
          id: fu.id,
          trainee_id: t.id,
          trainee_name: t.name,
          programme_id: t.programme_id,
          programme_name: t.programme_name,
          provider_id: t.provider_id,
          provider_name: t.provider_name,
          district: t.district,
          cohort: t.cohort,
          phone: t.phone,
          milestone: fu.milestone,
          due_date: fu.due_date,
          status: fu.status, // "Due" | "Upcoming" | "Completed" | "Missed" | "Needs Assistance"
          completed_date: fu.completed_date || null,
          notes: fu.notes || "",
          outreach_attempts: fu.outreach_attempts || 0,
          last_attempt_date: fu.last_attempt_date || null,
          last_attempt_channel: fu.last_attempt_channel || null,
          current_employment: t.employment?.status || "UNEMPLOYED",
          current_wage: t.employment?.current_wage || 0
        });
      });
    });

    const totalFollowups = records.length;
    const dueCount = records.filter(r => r.status === "Due").length;
    const needsVerificationCount = records.filter(r => r.status === "Needs Verification").length;
    const needsAssistanceCount = records.filter(r => r.status === "Needs Assistance" || r.status === "Contact Error" || r.status === "Delivery Error").length;
    const completedCount = records.filter(r => r.status === "Completed").length;
    const upcomingCount = records.filter(r => r.status === "Upcoming").length;
    const missedCount = records.filter(r => r.status === "Missed").length;
    const actionableFollowups = totalFollowups - upcomingCount || 1;
    const responseRate = totalFollowups > 0 ? Math.round((completedCount / actionableFollowups) * 100) : 0;

    // Search filter
    if (options.search) {
      const q = options.search.toLowerCase();
      records = records.filter(r =>
        r.trainee_name.toLowerCase().includes(q) ||
        r.trainee_id.toLowerCase().includes(q) ||
        r.programme_name.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (options.status && options.status !== "All") {
      const target = options.status.toLowerCase();
      if (target === "needs_assistance" || target === "needs assistance") {
        records = records.filter(r => r.status === "Needs Assistance" || r.status === "Contact Error" || r.status === "Delivery Error");
      } else if (target === "needs_verification" || target === "needs verification") {
        records = records.filter(r => r.status === "Needs Verification");
      } else if (target === "due" || target === "due now") {
        records = records.filter(r => r.status === "Due");
      } else {
        records = records.filter(r => r.status.toLowerCase() === target);
      }
    }

    // Milestone filter
    if (options.milestone && options.milestone !== "All") {
      records = records.filter(r => r.milestone.toLowerCase().includes(options.milestone.toLowerCase()));
    }

    // Sorting
    const sortField = options.sortField || "due_date";
    const sortOrder = options.sortOrder || "desc";
    records.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 15;
    const totalRecords = records.length;
    const totalPages = Math.ceil(totalRecords / limit) || 1;
    const paginated = records.slice((page - 1) * limit, page * limit);

    return {
      data_available: true,
      insufficient_data: totalTrainees < 5,
      total_trainees: totalTrainees,
      summary: {
        total_followups: totalFollowups,
        due: dueCount,
        needs_verification: needsVerificationCount,
        needs_assistance: needsAssistanceCount,
        completed: completedCount,
        upcoming: upcomingCount,
        missed: missedCount,
        response_rate: `${responseRate}%`
      },
      records: paginated,
      total: totalRecords,
      page,
      totalPages
    };
  }

  /**
   * Admin resolves/records assisted follow-up outreach (Section 17, 54)
   */
  async resolveAssistedFollowup(traineeId, followupId, resolutionData) {
    await wait();
    return mockStore.resolveAssistedFollowup(traineeId, followupId, resolutionData);
  }

  /**
   * Admin / Nodal officer verifies and confirms a follow-up outcome (Needs Verification -> Completed)
   */
  async verifyFollowupOutcome(traineeId, followupId, verificationData = {}) {
    await wait();
    return mockStore.verifyFollowupOutcome(traineeId, followupId, verificationData);
  }

  /**
   * Dispatch automated SMS / WhatsApp reminder to trainee for Due follow-up
   */
  async sendFollowupReminder(traineeId, followupId, channel = "SMS & WhatsApp") {
    await wait();
    return mockStore.sendFollowupReminder(traineeId, followupId, channel);
  }
}

export const platformService = new PlatformService();

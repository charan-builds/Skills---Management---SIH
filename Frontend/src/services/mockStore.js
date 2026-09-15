/**
 * Centralized Reactive Mock Store for Skilling Impact Intelligence.
 * Synchronizes state across Admin, Employer, and Trainee panels via localStorage and pub/sub.
 */

import {
  INITIAL_PROGRAMMES,
  INITIAL_EMPLOYERS,
  INITIAL_PROVIDERS,
  INITIAL_DISTRICTS,
  INITIAL_COHORTS,
  INITIAL_TRAINEES,
  INITIAL_VERIFICATIONS,
  INITIAL_POLICY_INTERVENTIONS,
  INITIAL_DEMAND_SUPPLY,
  INITIAL_CURRICULUM_MAPPING,
  INITIAL_INTEGRATIONS,
  INITIAL_EMPLOYER_FEEDBACK
} from "../mocks/initialData";

const STORAGE_KEY = "sii_mock_store_v3";

class MockStore {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
    if (typeof window !== "undefined") {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        }
      } catch (e) {
        // ignore quota
      }
    }
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not load from localStorage, initializing fresh mock store", e);
    }

    return {
      programmes: INITIAL_PROGRAMMES,
      employers: INITIAL_EMPLOYERS,
      providers: INITIAL_PROVIDERS,
      districts: INITIAL_DISTRICTS,
      cohorts: INITIAL_COHORTS,
      trainees: INITIAL_TRAINEES,
      verifications: INITIAL_VERIFICATIONS,
      policy_interventions: INITIAL_POLICY_INTERVENTIONS,
      demand_supply: INITIAL_DEMAND_SUPPLY,
      curriculum_mapping: INITIAL_CURRICULUM_MAPPING,
      integrations: INITIAL_INTEGRATIONS,
      employer_feedback: INITIAL_EMPLOYER_FEEDBACK,
      last_updated: new Date().toISOString()
    };
  }

  save() {
    this.state.last_updated = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to persist mock state to localStorage", e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error("Error in mock store listener", err);
      }
    }
  }

  getState() {
    return this.state;
  }

  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadState();
    this.notify();
  }

  // --- ACTIONS ---

  /**
   * Trainee reports employment or updates employment status.
   * Immediately updates Trainee record and creates/updates Employer Verification queue and Admin metrics.
   */
  reportTraineeEmployment(traineeId, data) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (!trainee) return null;

    const prevEmployment = trainee.employment || {};
    const status = data.status || "EMPLOYED";

    if (status === "EMPLOYED" || status === "APPRENTICESHIP") {
      // Check if verification request already exists for this trainee (e.g. resubmission after correction)
      const existingVer = this.state.verifications.find(
        v => v.trainee_id === trainee.id || (prevEmployment.verification_id && v.id === prevEmployment.verification_id)
      );
      const verificationId = existingVer ? existingVer.id : `VER-${Date.now().toString().slice(-6)}`;
      const employerName = data.employer_name || "Tata Consultancy Services";
      const employer = this.state.employers.find(e => e.name.toLowerCase() === employerName.toLowerCase()) || this.state.employers[0];

      trainee.employment = {
        ...prevEmployment,
        status: status,
        employer_id: employer.id,
        employer_name: employer.name,
        job_role: data.job_role || "Associate Engineer",
        employment_type: data.employment_type || (status === "APPRENTICESHIP" ? "Apprenticeship" : "Full-time"),
        joining_date: data.joining_date || new Date().toISOString().split("T")[0],
        work_location: data.work_location || trainee.district,
        starting_wage: Number(data.starting_wage) || Number(data.salary) || 22000,
        current_wage: Number(data.current_wage) || Number(data.starting_wage) || 22000,
        verification_status: "Pending verification",
        verification_id: verificationId,
        verified_at: null,
        employer_remarks: data.remarks || null,
        status_reason: data.status_reason || data.comments || "",
        comments: data.comments || data.status_reason || ""
      };

      if (existingVer) {
        existingVer.employer_id = employer.id;
        existingVer.employer_name = employer.name;
        existingVer.job_role = trainee.employment.job_role;
        existingVer.employment_type = trainee.employment.employment_type;
        existingVer.joining_date = trainee.employment.joining_date;
        existingVer.salary = trainee.employment.starting_wage;
        existingVer.status = "Pending";
        existingVer.requested_at = new Date().toISOString().split("T")[0];
        existingVer.employer_remarks = data.remarks || "Resubmitted by candidate with requested corrections.";
      } else {
        // Add to verification queue for employer
        this.state.verifications.unshift({
          id: verificationId,
          trainee_id: trainee.id,
          trainee_name: trainee.name,
          employer_id: employer.id,
          employer_name: employer.name,
          programme_id: trainee.programme_id,
          programme_name: trainee.programme_name,
          job_role: trainee.employment.job_role,
          employment_type: trainee.employment.employment_type,
          joining_date: trainee.employment.joining_date,
          salary: trainee.employment.starting_wage,
          status: "Pending",
          requested_at: new Date().toISOString().split("T")[0],
          verified_at: null,
          employer_remarks: "New employment verification request pending review.",
          match_status: "PENDING_MANUAL",
          detected_conflicts: null
        });
      }

      // Update wage history
      if (!trainee.wage_history) trainee.wage_history = [];
      trainee.wage_history.push({
        stage: "Starting",
        amount: trainee.employment.starting_wage,
        date: trainee.employment.joining_date
      });

      // Update retention tracking
      trainee.retention = {
        is_active: true,
        last_confirmed: trainee.employment.joining_date,
        retention_3m: "Upcoming",
        retention_6m: "Upcoming",
        retention_12m: "Upcoming"
      };

    } else if (status === "SELF_EMPLOYED") {
      trainee.employment = {
        status: "SELF_EMPLOYED",
        business_name: data.business_name || "Enterprise Services",
        business_type: data.business_type || "Commercial / Freelance",
        start_date: data.start_date || new Date().toISOString().split("T")[0],
        work_location: data.work_location || trainee.district,
        monthly_income: Number(data.monthly_income) || 25000,
        starting_wage: Number(data.monthly_income) || 25000,
        current_wage: Number(data.monthly_income) || 25000,
        verification_status: "Self-Reported",
        verification_id: `VER-SELF-${Date.now().toString().slice(-4)}`,
        verified_at: new Date().toISOString().split("T")[0],
        status_reason: data.status_reason || data.comments || "",
        comments: data.comments || data.status_reason || ""
      };
      if (!trainee.wage_history) trainee.wage_history = [];
      trainee.wage_history.push({
        stage: "Starting",
        amount: trainee.employment.monthly_income,
        date: trainee.employment.start_date
      });
      trainee.retention = {
        is_active: true,
        last_confirmed: trainee.employment.start_date,
        retention_3m: "Upcoming",
        retention_6m: "Upcoming",
        retention_12m: "Upcoming"
      };

    } else if (status === "UNEMPLOYED") {
      trainee.employment = {
        status: "UNEMPLOYED",
        unemployment_reason: data.unemployment_reason || data.status_reason || "Lack of required skills",
        status_reason: data.status_reason || data.unemployment_reason || data.comments || "",
        comments: data.comments || data.status_reason || "Seeking relevant openings",
        verification_status: "Not Applicable",
        verification_id: null,
        starting_wage: 0,
        current_wage: 0
      };
      trainee.retention = {
        is_active: false,
        retention_3m: "Not Applicable",
        retention_6m: "Not Applicable",
        retention_12m: "Not Applicable"
      };
    } else if (status === "STUDYING_FURTHER") {
      trainee.employment = {
        status: "STUDYING_FURTHER",
        institution_name: data.institution_name || "Higher Technical Institute",
        course_name: data.course_name || "Advanced Specialization",
        verification_status: "Self-Reported",
        verification_id: null,
        starting_wage: 0,
        current_wage: 0,
        status_reason: data.status_reason || data.comments || "",
        comments: data.comments || data.status_reason || ""
      };
      trainee.retention = {
        is_active: false,
        retention_3m: "Not Applicable",
        retention_6m: "Not Applicable",
        retention_12m: "Not Applicable"
      };
    }

    trainee.outcome_reason = data.status_reason || data.unemployment_reason || data.comments || "";
    trainee.outcome = status;

    this.save();
    return trainee;
  }

  /**
   * Employer performs verification action on a pending request.
   */
  verifyEmploymentRequest(verificationIdOrTraineeId, actionStatus, remarks, details = {}) {
    return this.verifyEmployment(verificationIdOrTraineeId, actionStatus, remarks, details);
  }

  verifyEmployment(verificationIdOrTraineeId, actionStatus, remarks, details = {}) {
    const ver = this.state.verifications.find(
      v => v.id === verificationIdOrTraineeId || v.trainee_id === verificationIdOrTraineeId
    );

    const normalizedStatus = (actionStatus === "Employed" || actionStatus === "Confirmed")
      ? "Confirmed"
      : (actionStatus === "Rejected Claim" || actionStatus === "Rejected")
      ? "Rejected"
      : "Correction Requested";

    if (ver) {
      ver.status = normalizedStatus;
      ver.verified_at = new Date().toISOString().split("T")[0];
      ver.employer_remarks = remarks || ver.employer_remarks;
      if (details.job_role) ver.job_role = details.job_role;
      if (details.salary) ver.salary = Number(details.salary);
      if (details.wage_confirmation) ver.wage_confirmation = details.wage_confirmation;
      if (details.role_confirmed !== undefined) ver.role_confirmed = details.role_confirmed;
    }

    // Synchronize to trainee record
    const traineeId = ver ? ver.trainee_id : verificationIdOrTraineeId;
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (trainee && trainee.employment) {
      if (normalizedStatus === "Confirmed") {
        trainee.employment.verification_status = "Verified";
        trainee.employment.verified_at = new Date().toISOString().split("T")[0];
        if (details.job_role) trainee.employment.job_role = details.job_role;
        if (details.salary) trainee.employment.current_wage = Number(details.salary);
        if (details.wage_confirmation) trainee.employment.wage_confirmation = details.wage_confirmation;

        // Add timeline event to trainee
        if (!trainee.timeline_events) trainee.timeline_events = [];
        trainee.timeline_events.push({
          id: `EV-${Date.now().toString().slice(-4)}`,
          title: "Employer Verified Employment",
          date: new Date().toISOString().split("T")[0],
          type: "verification",
          notes: `Verified by ${ver?.employer_name || trainee.employment.employer_name}. Role: ${trainee.employment.job_role}`
        });
      } else if (normalizedStatus === "Rejected") {
        trainee.employment.verification_status = "Rejected";
        trainee.employment.status = "UNEMPLOYED";
        if (remarks) trainee.employment.employer_remarks = remarks;
      } else if (normalizedStatus === "Correction Requested") {
        trainee.employment.verification_status = "Correction Requested";
        if (remarks) trainee.employment.employer_remarks = remarks;
      }
    }

    // Log to employer activity
    this.logEmployerActivity(ver?.employer_id || "EMP-DEMO-001", {
      type: normalizedStatus === "Confirmed" ? "CLAIM_CONFIRMED" : normalizedStatus === "Rejected" ? "CLAIM_REJECTED" : "CORRECTION_REQUESTED",
      title: normalizedStatus === "Confirmed" ? "Employment Claim Confirmed" : normalizedStatus === "Rejected" ? "Claim Rejected" : "Correction Requested",
      trainee_id: traineeId,
      trainee_name: ver?.trainee_name || trainee?.name || "Candidate",
      details: remarks || `Status marked as ${normalizedStatus}`
    });

    this.save();
    return { verification: ver, trainee };
  }

  /**
   * Log chronological employer activity
   */
  logEmployerActivity(employerId, activity) {
    if (!this.state.employer_activities) this.state.employer_activities = [];
    this.state.employer_activities.unshift({
      id: `ACT-${Date.now().toString().slice(-5)}`,
      employer_id: employerId,
      timestamp: new Date().toISOString(),
      ...activity
    });
  }

  /**
   * Trainee updates wage.
   */
  updateTraineeWage(traineeId, amount, stage = "Wage Progression") {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (!trainee || !trainee.employment) return null;

    const numAmount = Number(amount);
    trainee.employment.current_wage = numAmount;
    if (!trainee.wage_history) trainee.wage_history = [];

    trainee.wage_history.push({
      stage: stage,
      amount: numAmount,
      date: new Date().toISOString().split("T")[0]
    });

    this.save();
    return trainee;
  }

  /**
   * Trainee retention check-in.
   */
  retentionCheckIn(traineeId, stillWorking, details = {}) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (!trainee) return null;

    if (stillWorking) {
      if (!trainee.retention) trainee.retention = { is_active: true };
      trainee.retention.is_active = true;
      trainee.retention.last_confirmed = new Date().toISOString().split("T")[0];
      trainee.retention.retention_6m = "Retained";
    } else {
      if (details.changed_job) {
        // Trainee moved to a new employer
        this.reportTraineeEmployment(traineeId, {
          status: "EMPLOYED",
          employer_name: details.new_employer || "New Enterprise Corp",
          job_role: details.new_role || "Associate",
          starting_wage: details.new_wage || trainee.employment?.current_wage || 25000,
          joining_date: details.joining_date || new Date().toISOString().split("T")[0]
        });
        return trainee;
      } else {
        // Trainee resigned / left employment
        if (trainee.employment) {
          trainee.employment.status = "UNEMPLOYED";
          trainee.employment.attrition_reason = details.attrition_reason || "Low salary";
          trainee.employment.comments = details.comments || "Left previous employment";
          trainee.employment.verification_status = "Resigned";
        }
        if (trainee.retention) {
          trainee.retention.is_active = false;
          trainee.retention.retention_6m = "Left Employment";
        }
      }
    }

    this.save();
    return trainee;
  }

  /**
   * Submit Trainee Follow-up questionnaire (Section 15, 18)
   */
  submitFollowup(traineeId, followupId, response) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (!trainee) return null;

    const fu = (trainee.follow_ups || []).find(f => f.id === followupId);
    if (fu) {
      fu.status = "Completed";
      fu.completed_date = new Date().toISOString().split("T")[0];
      fu.notes = response.notes || "Check-in completed by trainee.";
    }

    // Low-burden conditional handling (Section 18)
    if (response.is_working === false || response.still_working === false) {
      if (trainee.employment) {
        trainee.employment.status = "UNEMPLOYED";
        trainee.employment.attrition_reason = response.attrition_reason || "Low salary / compensation";
        trainee.employment.comments = response.notes || "Reported during milestone follow-up";
        trainee.employment.verification_status = "Resigned";
      }
      if (trainee.retention) {
        trainee.retention.is_active = false;
        trainee.retention.retention_6m = "Left Employment";
      }
      if (!trainee.timeline_events) trainee.timeline_events = [];
      trainee.timeline_events.push({
        id: `EV-${Date.now().toString().slice(-4)}`,
        stage: `${fu?.milestone || "Follow-up"} Check-in`,
        date: new Date().toISOString().split("T")[0],
        title: "Trainee Reported Exit from Employment",
        description: `Reason: ${response.attrition_reason || "Reported in check-in"}`,
        status: "Attrited"
      });
    } else {
      if (response.changed_job && response.new_employer) {
        this.reportTraineeEmployment(traineeId, {
          status: "EMPLOYED",
          employer_name: response.new_employer,
          job_role: response.new_role || "Associate",
          starting_wage: Number(response.current_wage) || 25000,
          current_wage: Number(response.current_wage) || 25000,
          joining_date: response.new_joining_date || new Date().toISOString().split("T")[0]
        });
      } else if (response.current_wage) {
        this.updateTraineeWage(traineeId, response.current_wage, `${fu?.milestone || "Periodic"} Check-in`);
      }
    }

    if (response.training_relevance) {
      this.submitTrainingRelevance(traineeId, {
        relevant: response.training_relevance,
        missing_skills: response.reported_skill_gaps || [],
        comments: response.notes || ""
      });
    }

    if (response.reported_skill_gaps && response.reported_skill_gaps.length > 0) {
      if (!trainee.reported_skill_gaps) trainee.reported_skill_gaps = [];
      response.reported_skill_gaps.forEach(g => {
        if (g && !trainee.reported_skill_gaps.includes(g)) trainee.reported_skill_gaps.push(g);
      });
    }

    this.save();
    return trainee;
  }

  /**
   * Admin resolves/records assisted follow-up outreach or captures verified outcome (Section 17, 54).
   */
  resolveAssistedFollowup(traineeId, followupId, resolutionData) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (!trainee) return null;

    const fu = (trainee.follow_ups || []).find(f => f.id === followupId);
    if (fu) {
      fu.outreach_attempts = (fu.outreach_attempts || 0) + 1;
      fu.last_attempt_date = new Date().toISOString().split("T")[0];
      fu.last_attempt_channel = resolutionData.channel || "Government Call Center (Assisted)";

      if (resolutionData.outcome_captured) {
        fu.status = "Completed";
        fu.completed_date = new Date().toISOString().split("T")[0];
        fu.notes = resolutionData.notes || `Assisted follow-up: outcome verified via ${fu.last_attempt_channel}.`;

        // Update trainee outcome state
        if (resolutionData.is_employed) {
          if (resolutionData.current_wage) {
            this.updateTraineeWage(traineeId, resolutionData.current_wage, "Assisted Verification");
          }
          if (trainee.retention) {
            trainee.retention.is_active = true;
            trainee.retention.last_confirmed = new Date().toISOString().split("T")[0];
            trainee.retention.retention_6m = "Retained";
          }
        } else {
          if (trainee.employment) {
            trainee.employment.status = "UNEMPLOYED";
            trainee.employment.attrition_reason = resolutionData.attrition_reason || "Lack of placement opportunities";
          }
          if (trainee.retention) {
            trainee.retention.is_active = false;
            trainee.retention.retention_6m = "Left Employment";
          }
        }
      } else {
        fu.notes = resolutionData.notes || `Attempted outreach via ${fu.last_attempt_channel}. Callback scheduled.`;
      }
    }

    this.save();
    return { trainee, followup: fu };
  }

  /**
   * Admin / Nodal officer verifies and confirms a follow-up outcome (Needs Verification -> Completed).
   */
  verifyFollowupOutcome(traineeId, followupId, verificationData = {}) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (!trainee) return null;

    const fu = (trainee.follow_ups || []).find(f => f.id === followupId);
    if (fu) {
      fu.status = "Completed";
      fu.completed_date = new Date().toISOString().split("T")[0];
      fu.notes = verificationData.notes || `Milestone outcome verified by ${verificationData.verified_by || "State Nodal Verification Desk"}. Verified active and in compliance.`;

      if (trainee.employment && trainee.employment.verification_status === "Pending Employer Confirmation") {
        trainee.employment.verification_status = "Confirmed";
      }

      if (!trainee.timeline_events) trainee.timeline_events = [];
      trainee.timeline_events.push({
        id: `EV-${Date.now().toString().slice(-4)}`,
        stage: `${fu.milestone} Check-in`,
        date: new Date().toISOString().split("T")[0],
        title: "Follow-Up Outcome Verified",
        description: fu.notes,
        status: "Verified"
      });
    }

    this.save();
    return { trainee, followup: fu };
  }

  /**
   * Dispatches an omnichannel reminder notification for a Due follow-up milestone.
   */
  sendFollowupReminder(traineeId, followupId, channel = "SMS & WhatsApp") {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (!trainee) return null;

    const fu = (trainee.follow_ups || []).find(f => f.id === followupId);
    if (fu) {
      fu.outreach_attempts = (fu.outreach_attempts || 0) + 1;
      fu.last_attempt_date = new Date().toISOString().split("T")[0];
      fu.last_attempt_channel = channel;
      fu.notes = `Automated milestone reminder dispatched via ${channel} on ${fu.last_attempt_date}.`;
    }

    this.save();
    return { trainee, followup: fu };
  }

  /**
   * Employer submits feedback on skill gaps & curriculum relevance.
   */
  submitEmployerFeedback(data) {
    const newFeedback = {
      id: `FB-${Date.now().toString().slice(-4)}`,
      employer_id: data.employer_id || "EMP-DEMO-001",
      employer_name: data.employer_name || "Tata Consultancy Services",
      programme_id: data.programme_id || "PRG-001",
      programme_name: data.programme_name || "Cloud Infrastructure & DevOps",
      skill_relevance_rating: Number(data.skill_relevance_rating) || 4,
      top_missing_skills: data.top_missing_skills || ["Cloud Security & Compliance"],
      comments: data.comments || "Feedback submitted via Employer Portal.",
      submitted_at: new Date().toISOString().split("T")[0]
    };

    this.state.employer_feedback.unshift(newFeedback);
    this.save();
    return newFeedback;
  }

  /**
   * Admin adopts or dismisses a policy intervention.
   */
  updatePolicyIntervention(interventionId, action) {
    const policy = this.state.policy_interventions.find(p => p.id === interventionId);
    if (policy) {
      policy.status = action === "adopt" ? "Adopted" : action === "dismiss" ? "Dismissed" : "Identified";
      if (action === "adopt") {
        policy.adopted_at = new Date().toISOString().split("T")[0];
      }
      this.save();
    }
    return policy;
  }

  /**
   * Employer Integration synchronization action.
   */
  syncIntegration(integrationId) {
    const integration = this.state.integrations.find(i => i.id === integrationId);
    if (integration) {
      integration.last_sync = "Just now";
      integration.status = "Connected";
      integration.records_received = (integration.records_received || 0) + 4;
      integration.automatically_verified = (integration.automatically_verified || 0) + 3;
      integration.exceptions_detected = (integration.exceptions_detected || 0) + 1;
      this.save();
    }
    return integration;
  }

  /**
   * Admin approves or rejects employer registration.
   */
  updateEmployerStatus(employerId, newStatus) {
    const emp = this.state.employers.find(e => e.id === employerId);
    if (emp) {
      emp.status = newStatus;
      this.save();
    }
    return emp;
  }

  /**
   * Trainee profile information update.
   */
  updateTraineeProfile(traineeId, profileData) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (trainee) {
      Object.assign(trainee, profileData);
      this.save();
    }
    return trainee;
  }

  /**
   * Trainee consent status update.
   */
  updateTraineeConsent(traineeId, status) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (trainee) {
      trainee.consent = {
        status: status,
        date: new Date().toISOString().split("T")[0]
      };
      this.save();
    }
    return trainee;
  }

  /**
   * Trainee reports a perceived skill gap from training.
   * Stored as separate TRAINEE-PERCEIVED feedback; never overwrites verified assessment evidence.
   */
  submitTraineeSkillFeedback(traineeId, feedbackData) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (!trainee) return null;

    if (!trainee.skill_feedback_history) trainee.skill_feedback_history = [];
    const record = {
      id: `SFB-${Date.now().toString().slice(-4)}`,
      programme_id: feedbackData.programme_id || trainee.programme_id,
      programme_name: feedbackData.programme_name || trainee.programme_name,
      skill: feedbackData.skill,
      gap_type: feedbackData.gap_type || "Missing in Training",
      comments: feedbackData.comments || "",
      timestamp: new Date().toISOString(),
      status: "Included in Skill Intelligence"
    };

    trainee.skill_feedback_history.unshift(record);

    if (!trainee.reported_skill_gaps) trainee.reported_skill_gaps = [];
    if (feedbackData.skill && !trainee.reported_skill_gaps.includes(feedbackData.skill)) {
      trainee.reported_skill_gaps.push(feedbackData.skill);
    }

    this.save();
    return record;
  }

  /**
   * Trainee submits training relevance evaluation ("Was your training relevant?").
   */
  submitTrainingRelevance(traineeId, relevanceData) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (!trainee) return null;

    const numRating = Number(relevanceData.rating) || (
      relevanceData.relevant === "Yes" || String(relevanceData.relevant).includes("Fully") ? 5 :
      relevanceData.relevant === "Partially" || String(relevanceData.relevant).includes("Moderately") ? 3 :
      relevanceData.relevant === "No" || String(relevanceData.relevant).includes("Not") ? 1 : 4
    );

    trainee.training_relevance_rating = numRating;
    trainee.training_relevance_feedback = {
      rating: numRating,
      relevant: relevanceData.relevant || (numRating >= 4 ? "Fully Relevant" : numRating === 3 ? "Moderately Relevant" : "Not Relevant"),
      missing_skills: relevanceData.missing_skills || [],
      comments: relevanceData.comments || "",
      submitted_at: new Date().toISOString().split("T")[0]
    };

    if (Array.isArray(relevanceData.missing_skills)) {
      if (!trainee.reported_skill_gaps) trainee.reported_skill_gaps = [];
      relevanceData.missing_skills.forEach(s => {
        if (s && !trainee.reported_skill_gaps.includes(s)) {
          trainee.reported_skill_gaps.push(s);
        }
      });
    }

    this.save();
    return trainee.training_relevance_feedback;
  }

  /**
   * Trainee selects an occupational target role benchmark.
   */
  setTraineeTargetRole(traineeId, roleId) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (trainee) {
      trainee.selected_target_role = roleId;
      this.save();
    }
    return trainee;
  }

  // =========================================================================
  // ORGANISATION / EMPLOYER PORTAL METHODS (SECTIONS 1–54)
  // =========================================================================

  /**
   * Retrieve authoritative employer profile
   */
  getEmployer(employerId = "EMP-DEMO-001") {
    let emp = this.state.employers.find(e => e.id === employerId);
    if (!emp) {
      // Sensible fallback for demo mode
      emp = {
        id: employerId,
        name: employerId === "EMP-002" ? "Infosys BPM" : employerId === "EMP-003" ? "Mahindra & Mahindra Automotive" : employerId === "EMP-004" ? "Apollo Hospitals Enterprise" : employerId === "EMP-005" ? "Reliance Clean Energy Ltd" : employerId === "EMP-009" ? "New Horizon Logistics Ltd" : "Tata Consultancy Services",
        code: `${employerId}-MH-01`,
        sector: employerId === "EMP-003" ? "Manufacturing & Automotive" : employerId === "EMP-004" ? "Healthcare" : employerId === "EMP-005" ? "Green Energy" : "Information Technology",
        location: "Mumbai",
        registration_gst: "27AAACT2727Q1ZB",
        representative: "Rohit Sharma",
        email: "hr.verification@tcs.com",
        phone: "+91 22 6778 9999",
        status: employerId === "EMP-009" ? "Pending" : "Verified",
        registration_date: "2023-01-15",
        hr_system: "Workday Enterprise HCM",
        verified_at: employerId === "EMP-009" ? null : "2023-01-20"
      };
      this.state.employers.push(emp);
      this.save();
    }
    return emp;
  }

  /**
   * Update employer profile. Status is strictly read-only for employer (Section 3 & 5).
   */
  updateEmployerProfile(employerId, profileData) {
    const emp = this.getEmployer(employerId);
    if (emp) {
      if (profileData.name) emp.name = profileData.name;
      if (profileData.registration_gst) emp.registration_gst = profileData.registration_gst;
      if (profileData.sector) emp.sector = profileData.sector;
      if (profileData.location) emp.location = profileData.location;
      if (profileData.representative) emp.representative = profileData.representative;
      if (profileData.email) emp.email = profileData.email;
      if (profileData.phone) emp.phone = profileData.phone;
      if (profileData.hr_system) emp.hr_system = profileData.hr_system;
      this.save();
    }
    return emp;
  }

  /**
   * Multi-tenant dashboard metrics for employer (Sections 6, 7, 37–40)
   */
  getEmployerDashboardStats(employerId = "EMP-DEMO-001") {
    const emp = this.getEmployer(employerId);
    const verifications = this.state.verifications.filter(v => v.employer_id === employerId);
    
    // Trainees associated with this employer
    const employees = this.state.trainees.filter(t => t.employment && (t.employment.employer_id === employerId || t.employment.employer_name === emp.name));
    
    const pendingVerifications = verifications.filter(v => v.status === "Pending");
    const confirmedVerifications = verifications.filter(v => v.status === "Confirmed");
    const rejectedVerifications = verifications.filter(v => v.status === "Rejected" || v.status === "Rejected Claim");
    const correctionRequests = verifications.filter(v => v.status === "Correction Requested");
    const apprenticeships = verifications.filter(v => v.employment_type === "Apprenticeship" || v.status === "Apprenticeship");

    // Workforce status breakdown
    const activeEmployed = employees.filter(e => e.employment.status === "EMPLOYED" && e.employment.verification_status === "Verified").length;
    const resigned = employees.filter(e => e.employment.verification_status === "Resigned" || e.retention?.retention_6m === "Left Employment").length;
    const terminated = employees.filter(e => e.employment.verification_status === "Terminated").length;
    const contractCompleted = employees.filter(e => e.employment.verification_status === "Contract Completed").length;

    // Employer feedback count
    const feedbackList = (this.state.employer_feedback || []).filter(f => f.employer_id === employerId);

    // Activity feed from mock state
    const activities = (this.state.employer_activities || [])
      .filter(a => a.employer_id === employerId)
      .slice(0, 10);

    // If no activities yet, seed initial coherent activity events
    if (activities.length === 0) {
      activities.push(
        { id: "ACT-01", type: "SYNC_COMPLETED", title: "HRIS Employment Data Sync", details: "Workday batch sync reconciled 42 employee records.", timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
        { id: "ACT-02", type: "CLAIM_CONFIRMED", title: "Employment Claim Confirmed", details: "Confirmed Cloud Systems Associate for candidate TR-0001.", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
        { id: "ACT-03", type: "WAGE_CONFIRMED", title: "Wage Information Confirmed", details: "Salary verified at ₹28,500/mo.", timestamp: new Date(Date.now() - 1000 * 60 * 340).toISOString() },
        { id: "ACT-04", type: "FEEDBACK_SUBMITTED", title: "Curriculum Skill Feedback Submitted", details: "Reported missing Kubernetes containerization skills.", timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString() }
      );
    }

    // Ranked skill gaps from employer feedback
    const skillCounts = {};
    feedbackList.forEach(f => {
      (f.top_missing_skills || []).forEach(s => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    });
    if (Object.keys(skillCounts).length === 0) {
      skillCounts["Kubernetes & Container Orchestration"] = 4;
      skillCounts["Terraform & Cloud IaC"] = 3;
      skillCounts["Microservices Architecture"] = 2;
      skillCounts["CI/CD Pipeline Automation"] = 2;
    }

    const rankedSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count);

    return {
      employer: emp,
      total_employees: employees.length || 42,
      verified_workforce_count: confirmedVerifications.length || 38,
      pending_verifications_count: pendingVerifications.length,
      rejected_claims_count: rejectedVerifications.length,
      correction_requests_count: correctionRequests.length,
      apprenticeship_count: apprenticeships.length || 4,
      skill_feedback_count: feedbackList.length || 3,
      six_month_retention: "84.6%",
      wage_confirmation_rate: "91.2%",
      workforce_breakdown: {
        employed: activeEmployed || 36,
        resigned: resigned || 4,
        terminated: terminated || 1,
        contract_completed: contractCompleted || 1
      },
      verification_activity: {
        pending: pendingVerifications.length,
        confirmed: confirmedVerifications.length || 38,
        rejected: rejectedVerifications.length || 2,
        correction: correctionRequests.length || 1
      },
      skills_we_need: rankedSkills,
      recent_activity: activities
    };
  }

  /**
   * Retrieve verification requests for employer (Sections 8–13)
   */
  getEmployerVerificationRequests(employerId = "EMP-DEMO-001", statusFilter = "All", searchTerm = "") {
    const isTcs = employerId === "EMP-DEMO-001" || employerId === "EMP-001";
    let list = this.state.verifications.filter(v => 
      v.employer_id === employerId || (isTcs && (v.employer_id === "EMP-DEMO-001" || v.employer_id === "EMP-001"))
    );

    // If empty for this employer in initial mock, seed coherent requests
    if (list.length === 0) {
      const candidates = this.state.trainees.slice(0, 6);
      list = candidates.map((c, idx) => ({
        id: `VER-${employerId}-${idx + 1}`,
        trainee_id: c.id,
        trainee_name: c.name,
        employer_id: employerId,
        employer_name: this.getEmployer(employerId).name,
        job_role: c.employment?.job_role || "Associate Engineer",
        employment_type: idx === 3 ? "Apprenticeship" : "Full-time",
        joining_date: c.employment?.joining_date || "2023-05-01",
        salary: c.employment?.starting_wage || 26000,
        status: idx === 0 ? "Pending" : idx === 1 ? "Pending" : idx === 2 ? "Correction Requested" : idx === 4 ? "Rejected" : "Confirmed",
        requested_at: "2023-05-02",
        verified_at: idx === 5 ? "2023-05-15" : null,
        employer_remarks: idx === 2 ? "Joining date is incorrect." : idx === 4 ? "Candidate never worked here." : null
      }));
      this.state.verifications.push(...list);
      this.save();
    }

    if (statusFilter && statusFilter !== "All") {
      list = list.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(r =>
        (r.trainee_name || "").toLowerCase().includes(term) ||
        (r.job_role || "").toLowerCase().includes(term) ||
        (r.trainee_id || "").toLowerCase().includes(term)
      );
    }

    return list;
  }

  /**
   * Retrieve verified workforce roster for employer (Sections 14–19)
   */
  getEmployerVerifiedWorkforce(employerId = "EMP-DEMO-001", searchTerm = "") {
    const emp = this.getEmployer(employerId);
    
    // Find trainees with confirmed employment at this employer
    let roster = this.state.trainees
      .filter(t => t.employment && (t.employment.employer_id === employerId || t.employment.employer_name === emp.name))
      .map(t => ({
        trainee_id: t.id,
        trainee_name: t.name,
        programme_name: t.programme_name,
        job_role: t.employment.job_role || "Associate",
        confirmed_role: t.employment.confirmed_role || t.employment.job_role || "Associate",
        joining_date: t.employment.joining_date || "2023-05-01",
        employment_status: t.employment.status === "UNEMPLOYED" ? "Resigned" : (t.employment.verification_status === "Resigned" ? "Resigned" : "Currently Employed"),
        verification_status: t.employment.verification_status || "Verified",
        wage: t.employment.current_wage || 28000,
        wage_confirmation: t.employment.wage_confirmation || "Confirmed",
        role_confirmation: t.employment.role_confirmation || "Confirmed",
        last_updated: t.employment.verified_at || "2023-06-01",
        apprenticeship_details: t.employment.employment_type === "Apprenticeship" ? {
          trade: t.employment.job_role,
          stipend: t.employment.current_wage || 15000,
          duration_months: 12
        } : null
      }));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      roster = roster.filter(e =>
        (e.trainee_name || "").toLowerCase().includes(term) ||
        (e.job_role || "").toLowerCase().includes(term) ||
        (e.trainee_id || "").toLowerCase().includes(term)
      );
    }

    return roster;
  }

  /**
   * Update ongoing employment lifecycle status (Sections 16–17)
   */
  updateEmployeeLifecycleStatus(employerId, traineeId, newStatus, departureDate, exitReason, remarks) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (!trainee) return null;

    if (!trainee.employment) trainee.employment = {};
    
    const prevStatus = trainee.employment.status;
    trainee.employment.verification_status = newStatus;

    if (newStatus === "Currently Employed") {
      trainee.employment.status = "EMPLOYED";
      if (!trainee.retention) trainee.retention = {};
      trainee.retention.is_active = true;
      trainee.retention.retention_6m = "Retained";
    } else {
      // Resigned, Terminated, or Contract Completed
      trainee.employment.status = "UNEMPLOYED";
      trainee.employment.attrition_date = departureDate || new Date().toISOString().split("T")[0];
      trainee.employment.attrition_reason = exitReason || `Employer reported: ${newStatus}`;
      trainee.employment.employer_remarks = remarks || `Employee status updated to ${newStatus}`;
      
      if (!trainee.retention) trainee.retention = {};
      trainee.retention.is_active = false;
      trainee.retention.retention_6m = "Left Employment";

      // Append to employment timeline if present
      if (!trainee.timeline_events) trainee.timeline_events = [];
      trainee.timeline_events.push({
        id: `EV-${Date.now().toString().slice(-4)}`,
        title: `Employment Lifecycle Update: ${newStatus}`,
        date: departureDate || new Date().toISOString().split("T")[0],
        type: "attrition",
        notes: `Employer marked status as ${newStatus}. Reason: ${trainee.employment.attrition_reason}`
      });
    }

    this.logEmployerActivity(employerId, {
      type: "STATUS_UPDATED",
      title: `Employee Status Updated: ${newStatus}`,
      trainee_id: traineeId,
      trainee_name: trainee.name,
      details: remarks || `Status changed from ${prevStatus} to ${newStatus}`
    });

    this.save();
    return trainee;
  }

  /**
   * Confirm trainee wage (Section 18)
   */
  confirmEmployeeWage(employerId, traineeId, wageChoice, customWage) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (!trainee || !trainee.employment) return null;

    trainee.employment.wage_confirmation = wageChoice; // "Confirmed" | "Different" | "Cannot Disclose"
    if (wageChoice === "Different" && customWage) {
      trainee.employment.current_wage = Number(customWage);
    }

    this.logEmployerActivity(employerId, {
      type: "WAGE_CONFIRMED",
      title: `Wage Information Response: ${wageChoice}`,
      trainee_id: traineeId,
      trainee_name: trainee.name,
      details: wageChoice === "Cannot Disclose" ? "Wage withheld under corporate disclosure policy." : `Confirmed value: ₹${trainee.employment.current_wage}`
    });

    this.save();
    return trainee.employment;
  }

  /**
   * Confirm trainee role (Section 19)
   */
  confirmEmployeeRole(employerId, traineeId, roleChoice, customRole) {
    const trainee = this.state.trainees.find(t => t.id === traineeId);
    if (!trainee || !trainee.employment) return null;

    trainee.employment.role_confirmation = roleChoice; // "Confirmed" | "Not Confirmed"
    if (roleChoice === "Not Confirmed" && customRole) {
      trainee.employment.confirmed_role = customRole;
    } else {
      trainee.employment.confirmed_role = trainee.employment.job_role;
    }

    this.logEmployerActivity(employerId, {
      type: "ROLE_CONFIRMED",
      title: `Job Role Response: ${roleChoice}`,
      trainee_id: traineeId,
      trainee_name: trainee.name,
      details: `Role confirmed as: ${trainee.employment.confirmed_role}`
    });

    this.save();
    return trainee.employment;
  }

  /**
   * Retrieve employer skill feedback & intelligence (Sections 21–24)
   */
  getEmployerSkillFeedback(employerId = "EMP-DEMO-001") {
    const list = (this.state.employer_feedback || []).filter(f => f.employer_id === employerId);
    
    // Aggregated intelligence
    const gapMap = {};
    list.forEach(f => {
      (f.top_missing_skills || []).forEach(skill => {
        if (!gapMap[skill]) {
          gapMap[skill] = {
            skill,
            count: 0,
            roles_affected: ["Cloud Associate", "DevOps Engineer", "Systems Analyst"],
            programmes: [f.programme_name || "Cloud Infrastructure"]
          };
        }
        gapMap[skill].count += 1;
      });
    });

    return {
      feedback_history: list,
      skills_we_need: Object.values(gapMap).sort((a, b) => b.count - a.count)
    };
  }

  /**
   * Submit employer skill-gap feedback (Section 21)
   */
  submitEmployerSkillFeedback(employerId, feedbackData) {
    const emp = this.getEmployer(employerId);
    const item = {
      id: `EFB-${Date.now().toString().slice(-4)}`,
      employer_id: employerId,
      employer_name: emp.name,
      programme_id: feedbackData.programme_id || "PRG-001",
      programme_name: feedbackData.programme_name || "Cloud Infrastructure & DevOps",
      skill: feedbackData.skill,
      top_missing_skills: [feedbackData.skill],
      role_context: feedbackData.role_context || "DevOps & Cloud Associate",
      skill_relevance_rating: Number(feedbackData.relevance_rating) || 4,
      comments: feedbackData.comments || "Feedback submitted via Employer Portal.",
      status: "Included in Central Skill Intelligence",
      submitted_at: new Date().toISOString().split("T")[0]
    };

    if (!this.state.employer_feedback) this.state.employer_feedback = [];
    this.state.employer_feedback.unshift(item);

    this.logEmployerActivity(employerId, {
      type: "FEEDBACK_SUBMITTED",
      title: "Employer Skill Gap Feedback Logged",
      details: `Reported missing competency: ${feedbackData.skill}`
    });

    this.save();
    return item;
  }

  /**
   * HR/ATS Integration & Matching Engine (Sections 25–36)
   */
  getEmployerIntegrationsData(employerId = "EMP-DEMO-001") {
    const emp = this.getEmployer(employerId);
    const systems = (this.state.integrations || []).map(sys => ({
      ...sys,
      employer_id: employerId
    }));

    // Deterministic matching engine simulation
    const matchingRecords = [
      {
        id: "MATCH-001",
        trainee_id: "TR-0001",
        name: "Arjun Kadam",
        claimed_employer: emp.name,
        system_employer: emp.name,
        claimed_role: "Cloud Systems Associate",
        system_role: "Cloud Systems Associate",
        claimed_joining: "2023-05-01",
        system_joining: "2023-05-01",
        status: "MATCH",
        fields_matched: { id: true, employer: true, name: true, status: true, joining_date: true },
        auto_verified: true
      },
      {
        id: "MATCH-002",
        trainee_id: "TR-0002",
        name: "Sneha Patil",
        claimed_employer: emp.name,
        system_employer: emp.name,
        claimed_role: "Junior DevOps Engineer",
        system_role: "Junior DevOps Engineer",
        claimed_joining: "2023-05-10",
        system_joining: "2023-05-18",
        status: "MISMATCH",
        discrepancy_field: "Joining Date",
        claimed_value: "10-May-2023",
        system_value: "18-May-2023",
        fields_matched: { id: true, employer: true, name: true, status: true, joining_date: false },
        auto_verified: false,
        requires_manual_review: true
      },
      {
        id: "MATCH-003",
        trainee_id: "TR-0003",
        name: "Rohan Deshmukh",
        claimed_employer: emp.name,
        system_employer: emp.name,
        claimed_role: "Systems Support Analyst",
        system_role: "Technical Support Associate",
        claimed_joining: "2023-06-01",
        system_joining: "2023-06-01",
        status: "MISMATCH",
        discrepancy_field: "Job Title",
        claimed_value: "Systems Support Analyst",
        system_value: "Technical Support Associate",
        fields_matched: { id: true, employer: true, name: true, status: true, joining_date: true },
        auto_verified: false,
        requires_manual_review: true
      },
      {
        id: "MATCH-004",
        trainee_id: "TR-0004",
        name: "Anjali Joshi",
        claimed_employer: emp.name,
        system_employer: emp.name,
        claimed_role: "Cloud Operations Trainee",
        system_role: "Cloud Operations Trainee",
        claimed_joining: "2023-06-15",
        system_joining: "2023-06-15",
        status: "MATCH",
        fields_matched: { id: true, employer: true, name: true, status: true, joining_date: true },
        auto_verified: true
      }
    ];

    const totalRecords = matchingRecords.length;
    const autoVerifiedCount = matchingRecords.filter(m => m.status === "MATCH").length;
    const manualReviewCount = matchingRecords.filter(m => m.status === "MISMATCH").length;
    const autoVerificationRate = totalRecords > 0 ? Math.round((autoVerifiedCount / totalRecords) * 100) : 0;

    return {
      connected_systems: systems,
      summary: {
        connected_systems_count: systems.length,
        total_records_received: 48,
        automatically_verified: 42,
        manual_review_required: 6,
        auto_verification_rate: "87.5%",
        last_sync: "12 minutes ago"
      },
      matching_records: matchingRecords,
      exceptions: matchingRecords.filter(m => m.status === "MISMATCH"),
      activity_log: [
        { id: "LOG-01", timestamp: "10:45 AM", operation: "Automated ATS Batch Reconcile", records: 48, status: "Completed", issues: 2 },
        { id: "LOG-02", timestamp: "08:30 AM", operation: "Workday Webhook Handshake", records: 12, status: "Completed", issues: 0 },
        { id: "LOG-03", timestamp: "Yesterday", operation: "Payroll Attestation Check", records: 24, status: "Completed with Exceptions", issues: 3 }
      ]
    };
  }

  /**
   * Resolve matching exception (Section 31)
   */
  resolveMatchingException(employerId, exceptionId, action, notes) {
    // Action can be: "confirm", "reject", "request_correction"
    this.logEmployerActivity(employerId, {
      type: "EXCEPTION_RESOLVED",
      title: `Verification Discrepancy Resolved: ${action.toUpperCase()}`,
      details: notes || `Exception ${exceptionId} resolved as ${action}`
    });

    this.save();
    return { success: true, exceptionId, action };
  }
}

export const mockStore = new MockStore();

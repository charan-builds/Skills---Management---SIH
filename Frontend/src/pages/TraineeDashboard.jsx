import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck, Briefcase, Calendar, TrendingUp, Award,
  ArrowRight, CheckCircle2, Clock, AlertTriangle, UserCheck,
  Zap, Target, Milestone, MessageSquare, Bell, ChevronRight,
  PieChart, FileText, Check, AlertCircle, XCircle
} from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function TraineeDashboard() {
  const navigate = useNavigate();
  const storeState = usePlatformStore();
  const [traineeId, setTraineeId] = useState(
    () => localStorage.getItem("traineeId") || "TR-0001"
  );
  const [trainee, setTrainee] = useState(null);
  const [skillsIntel, setSkillsIntel] = useState(null);
  const [roleBenchmark, setRoleBenchmark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTraineeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getTraineeProfile(traineeId);
      if (res.data_available && res.trainee) {
        setTrainee(res.trainee);

        // Load skills intelligence
        const intel = await platformService.getTraineeSkillsIntelligence(traineeId);
        setSkillsIntel(intel);

        // Load target role benchmark
        const targetRole = res.trainee.selected_target_role || "ROLE-DA";
        const bench = await platformService.getTargetRoleBenchmark(targetRole, traineeId);
        setRoleBenchmark(bench);
      } else {
        setTrainee(null);
      }
    } catch (err) {
      console.error("Failed to load trainee profile", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraineeData();
  }, [traineeId, storeState.last_updated]);

  const handleConsentAction = async (status) => {
    try {
      await platformService.updateTraineeConsent(traineeId, status);
      loadTraineeData();
    } catch (err) {
      console.error("Failed to update consent", err);
      alert("Error saving consent: " + err.message);
    }
  };

  const consentStatus = trainee?.consent?.status || "GIVEN";
  const isConsentPending = consentStatus === "PENDING";
  const isConsentDeclined = consentStatus === "DECLINED";

  // Section 6: Initial Consent Overlay if Pending
  if (isConsentPending) {
    return (
      <div style={{ maxWidth: "680px", margin: "3rem auto", padding: "2.5rem", background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)" }}>
        <div style={{ width: "54px", height: "54px", background: "#eff6ff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
          <ShieldCheck size={28} color="#2563eb" />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0" }}>
          Outcome Tracking Consent & Citizen Privacy
        </h2>
        <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 1.5rem 0" }}>
          Welcome, <strong>{trainee?.name || "Trainee"}</strong>. We use your outcome information to understand what happens after training and improve national training programmes.
        </p>

        <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "1.5rem", fontSize: "0.85rem", color: "#334155", lineHeight: 1.6 }}>
          <strong style={{ display: "block", marginBottom: "0.5rem", color: "#0f172a" }}>Consent Notice:</strong>
          • Periodic outcome follow-ups are conducted at 3, 6, and 12-month intervals.<br />
          • We verify vocational placement, retention, and wage progression to measure training efficacy.<br />
          • Participation requires your consent. You may change or revoke your preference at any time in Privacy &amp; Consent.<br />
          • Basic profile information and credentials are retained even if follow-up consent is declined.
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => handleConsentAction("DECLINED")}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "white",
              color: "#475569",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Continue Without Follow-Ups / Decline
          </button>
          <button
            onClick={() => handleConsentAction("GIVEN")}
            style={{
              flex: 2,
              padding: "0.75rem",
              borderRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            I Agree &amp; Authorize Follow-Ups
          </button>
        </div>
      </div>
    );
  }

  const emp = trainee?.employment || {};
  const followups = trainee?.follow_ups || [];
  const nextFollowup = followups.find(f => f.status === "Due" || f.status === "Upcoming") || followups[0];
  const timelineEvents = trainee?.timeline_events || [];

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Welcome, {trainee?.name || "Trainee"}
            </h1>
            {isConsentDeclined ? (
              <span style={{ background: "#fee2e2", color: "#b91c1c", fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                <XCircle size={13} /> Follow-Up Consent Declined
              </span>
            ) : (
              <span style={{ background: "#dcfce7", color: "#166534", fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={13} /> Follow-Up Consent Active
              </span>
            )}
          </div>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
            Candidate ID: <strong>{trainee?.id}</strong> | Programme: <strong>{trainee?.programme_name}</strong> | Provider: {trainee?.provider_name}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => navigate("/trainee/profile")}
            style={{
              padding: "0.5rem 1rem",
              background: "white",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#334155",
              cursor: "pointer"
            }}
          >
            Edit Profile
          </button>
          <button
            onClick={() => navigate("/trainee/consent")}
            style={{
              padding: "0.5rem 1rem",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#334155",
              cursor: "pointer"
            }}
          >
            Privacy &amp; Consent
          </button>
        </div>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={trainee}
        onRetry={loadTraineeData}
        isDataAvailable={(d) => Boolean(d)}
        isEmptyDetails="No trainee record found."
      >
        {/* ========================================================================= */}
        {/* 1. MY CURRENT STATUS (Section 5) */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              My Current Status
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Authoritative Personal Situation
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {/* Training & Certification */}
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Training & Certification</span>
                <Award size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
                {trainee?.training_status || "Completed"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 700, marginBottom: "0.75rem" }}>
                {trainee?.certified ? "✓ Certified Credential Issued" : "Pending Certification"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "0.5rem" }}>
                <span>Score: {trainee?.assessment_score || 88}%</span>
                <button
                  onClick={() => navigate("/trainee/training")}
                  style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
                >
                  View <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Employment Status */}
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Employment Status</span>
                <Briefcase size={18} color="#2563eb" />
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
                {emp.status ? emp.status.replace("_", " ") : "Unemployed"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#475569", marginBottom: "0.75rem" }}>
                {emp.job_role ? `${emp.job_role} at ${emp.employer_name || "Enterprise"}` : (emp.unemployment_reason || "Seeking Placement")}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", borderTop: "1px solid #f1f5f9", paddingTop: "0.5rem" }}>
                <span style={{ color: emp.verification_status === "Verified" ? "#15803d" : "#b45309", fontWeight: 700 }}>
                  {emp.verification_status || "Self-Attested"}
                </span>
                <button
                  onClick={() => navigate("/trainee/employment")}
                  style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
                >
                  Update <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Compensation & Retention */}
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Compensation & Retention</span>
                <TrendingUp size={18} color="#7c3aed" />
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
                {typeof emp.current_wage === "number" && emp.current_wage > 0
                  ? `₹${emp.current_wage.toLocaleString()} / mo`
                  : (emp.current_wage === 0 ? "₹0 (Unemployed)" : "No wage data available")}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#15803d", fontWeight: 600, marginBottom: "0.75rem" }}>
                {trainee?.retention?.retention_6m === "Retained" ? "✓ 6-Month Retained" : (trainee?.retention?.retention_6m || "In Progress")}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "0.5rem" }}>
                <span>Growth: +{trainee?.wage_metrics?.growth_percentage || 0}%</span>
                <button
                  onClick={() => navigate("/trainee/outcomes")}
                  style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
                >
                  Details <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Follow-Up Milestone */}
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Follow-up Check-In</span>
                <Calendar size={18} color="#16a34a" />
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
                {nextFollowup ? nextFollowup.milestone : "Completed"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.75rem" }}>
                Status: <strong>{nextFollowup?.status || "Up to date"}</strong> ({nextFollowup?.due_date || "N/A"})
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "0.5rem" }}>
                <span>{isConsentDeclined ? "Restricted (Opted out)" : "Active"}</span>
                <button
                  onClick={() => navigate("/trainee/follow-ups")}
                  style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
                >
                  Open <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MY SKILL STATUS (Section 5) */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              My Skill Status & Readiness
            </h2>
            <button
              onClick={() => navigate("/trainee/skills")}
              style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "3px" }}
            >
              Full Skills Portfolio <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Strong Evidence Skills</span>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: "0.3rem 0" }}>
                {skillsIntel?.verified_skills?.length || 0} Accredited Skills
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                {(skillsIntel?.verified_skills || []).slice(0, 3).map(s => s.skill).join(", ") || "Foundational Coursework"}
              </p>
            </div>

            <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#b91c1c", textTransform: "uppercase" }}>Top Priority Skill Gap</span>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#b91c1c", margin: "0.3rem 0" }}>
                {skillsIntel?.skill_gaps?.[0]?.skill || "No Critical Gaps"}
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                {skillsIntel?.skill_gaps?.[0]?.why_it_matters || "Assessed competencies meet baseline hiring benchmarks."}
              </p>
            </div>

            <div style={{ background: "#eff6ff", borderRadius: "12px", border: "1px solid #bfdbfe", padding: "1.25rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>Target Role Readiness</span>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1e3a8a", margin: "0.3rem 0" }}>
                {roleBenchmark?.coverage_display || "Target Role Benchmark"}
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#2563eb" }}>
                Benchmark: <strong>{roleBenchmark?.benchmark?.title || "Junior Data Analyst"}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MY RECENT PROGRESS TIMELINE (Section 5) */}
        {/* ========================================================================= */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.2rem 0" }}>
                My Recent Progress Timeline
              </h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                Chronological sequence from training enrollment to current employment status.
              </p>
            </div>
            <button
              onClick={() => navigate("/trainee/employment-journey")}
              style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
            >
              Interactive Journey <ArrowRight size={15} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {timelineEvents.slice(0, 5).map((evt, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>{evt.title}</strong>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{evt.date}</span>
                  </div>
                  <p style={{ margin: "0.15rem 0 0 0", fontSize: "0.8rem", color: "#475569" }}>{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. IMPORTANT ACTIONS (Section 5) */}
        {/* ========================================================================= */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem 0" }}>
            Important Actions
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            <div
              onClick={() => navigate("/trainee/follow-ups")}
              style={{ padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", transition: "all 0.15s ease" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <Bell size={18} color="#2563eb" />
                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>1. Complete Follow-Up</strong>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                Answer periodic milestone check-in questions to record employment stability.
              </p>
            </div>

            <div
              onClick={() => navigate("/trainee/employment")}
              style={{ padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", transition: "all 0.15s ease" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <Briefcase size={18} color="#16a34a" />
                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>2. Update Employment</strong>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                Report new job placement, self-employment venture, or reason for unemployment.
              </p>
            </div>

            <div
              onClick={() => navigate("/trainee/outcomes")}
              style={{ padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", transition: "all 0.15s ease" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <TrendingUp size={18} color="#7c3aed" />
                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>3. Update Wage</strong>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                Log salary increments or promotion compensation to update your wage trajectory.
              </p>
            </div>

            <div
              onClick={() => navigate("/trainee/skills")}
              style={{ padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", transition: "all 0.15s ease" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <Zap size={18} color="#ea580c" />
                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>4. Review Skill Gaps</strong>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                Inspect verified competencies vs self-reported and employer-observed deficits.
              </p>
            </div>

            <div
              onClick={() => navigate("/trainee/skill-goals")}
              style={{ padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", transition: "all 0.15s ease" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <Target size={18} color="#0284c7" />
                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>5. Review Skill Goals</strong>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                Select an occupational benchmark and view required bridge upskilling modules.
              </p>
            </div>

            <div
              onClick={() => navigate("/trainee/feedback")}
              style={{ padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", transition: "all 0.15s ease" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <MessageSquare size={18} color="#0d9488" />
                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>6. Give Training Feedback</strong>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                Rate curriculum relevance and report missing skills observed in hiring rounds.
              </p>
            </div>
          </div>
        </div>

      </DataStateWrapper>
    </div>
  );
}

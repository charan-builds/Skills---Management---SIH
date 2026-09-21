import { useState, useEffect } from "react";
import { 
  Zap, CheckCircle2, AlertTriangle, HelpCircle, Award, 
  Building2, MessageSquare, ArrowRight, BookOpen, ShieldCheck, Sparkles 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function TraineeSkills() {
  const navigate = useNavigate();
  const store = usePlatformStore();
  const traineeId = localStorage.getItem("traineeId") || "TR-0001";

  const [skillsData, setSkillsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all"); // 'all' | 'verified' | 'reported' | 'employer'

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await platformService.getTraineeSkillsIntelligence(traineeId);
      setSkillsData(data);
    } catch (err) {
      console.error("Failed to load skills intelligence", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [traineeId, store.last_updated]);

  const verified = skillsData?.verified_skills || [];
  const selfReported = skillsData?.self_reported_gaps || [];
  const employerObserved = skillsData?.employer_observed_gaps || [];
  const gaps = skillsData?.skill_gaps || [];
  const evidenceState = skillsData?.evidence_state || "EVIDENCE_AVAILABLE";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Zap size={20} color="#2563eb" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              PERSONAL SKILL INTELLIGENCE & EVIDENCE
            </span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
            My Skills & Evidence Portfolio
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
            Transparent assessment of verified competencies, workplace feedback, and grounded skill improvement recommendations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => navigate("/trainee/skill-goals")}
            style={{
              padding: "0.6rem 1.25rem",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            Target Role Benchmarks <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={skillsData}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d && d.evidence_state)}
        isEmptyDetails="No skill evidence records found."
      >
        {/* Evidence State Diagnostic Banner (Section 45) */}
        {evidenceState === "NO_EVIDENCE" && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <AlertTriangle size={22} color="#b91c1c" />
            <div>
              <strong style={{ color: "#991b1b", display: "block" }}>No Reliable Skill Evidence Exists (NO_EVIDENCE)</strong>
              <span style={{ fontSize: "0.85rem", color: "#7f1d1d" }}>
                No completed coursework, certified evaluations, or verified workplace competencies are recorded for this profile.
              </span>
            </div>
          </div>
        )}

        {evidenceState === "INSUFFICIENT_SKILL_EVIDENCE" && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <HelpCircle size={22} color="#b45309" />
            <div>
              <strong style={{ color: "#92400e", display: "block" }}>Insufficient Skill Evidence (INSUFFICIENT_SKILL_EVIDENCE)</strong>
              <span style={{ fontSize: "0.85rem", color: "#78350f" }}>
                Some partial coursework records exist, but capstone assessments are pending. Skill scoring is withheld until formal certification.
              </span>
            </div>
          </div>
        )}

        {/* AI Evidence Synthesis Banner (Section 26) */}
        <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)", borderRadius: "14px", border: "1px solid #bfdbfe", padding: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <Sparkles size={18} color="#2563eb" />
            <strong style={{ fontSize: "0.95rem", color: "#1e3a8a", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Skill & Outcome Evidence Insights
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "#1e293b", lineHeight: 1.6 }}>
            {skillsData?.ai_insights}
          </p>
        </div>

        {/* Evidence Source Overview Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Verified Skills</span>
              <Award size={18} color="#16a34a" />
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>
              {verified.length}
            </div>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              Evidence: Coursework & Capstone
            </p>
          </div>

          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>Self-Reported Gaps</span>
              <MessageSquare size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>
              {selfReported.length}
            </div>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              Evidence: Trainee Follow-Up Feedback
            </p>
          </div>

          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9333ea", textTransform: "uppercase" }}>Employer Observed</span>
              <Building2 size={18} color="#9333ea" />
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>
              {employerObserved.length}
            </div>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              Evidence: Industry Partner Feedback
            </p>
          </div>

          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ea580c", textTransform: "uppercase" }}>Actionable Gaps</span>
              <AlertTriangle size={18} color="#ea580c" />
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>
              {gaps.length}
            </div>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              Prioritized by evidence convergence
            </p>
          </div>
        </div>

        {/* SECTION A: VERIFIED CURRENT SKILLS (Section 19) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.2rem 0" }}>
                1. My Verified Skills (Evidence-Backed)
              </h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                Competencies formally accredited through completed modules at {skillsData?.provider_name}.
              </p>
            </div>
            <span style={{ background: "#dcfce7", color: "#166534", fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={14} /> Certified Credentials
            </span>
          </div>

          {verified.length === 0 ? (
            <p style={{ color: "#94a3b8", fontStyle: "italic", margin: 0 }}>No verified skills found for this profile.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
              {verified.map((v, i) => (
                <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", background: "#f8fafc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <strong style={{ fontSize: "1rem", color: "#0f172a" }}>{v.skill}</strong>
                    <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>
                      {v.proficiency_score}% Evaluated
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.75rem" }}>
                    Module: {v.module_name} ({v.duration_weeks} Wks)
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "#475569", borderTop: "1px solid #e2e8f0", paddingTop: "0.5rem" }}>
                    <span>Source: {v.evidence_source}</span>
                    <span style={{ color: "#15803d", fontWeight: 700 }}>✓ Accredited</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION B: SKILLS I SHOULD IMPROVE / SKILL GAP ANALYSIS (Section 20) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.2rem 0" }}>
              2. Skills I Should Improve (Synthesized Gaps)
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              Priority gaps correlated between trainee workplace experiences, employer feedback, and occupational demand.
            </p>
          </div>

          {gaps.length === 0 ? (
            <div style={{ padding: "1.5rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", color: "#166534", fontSize: "0.9rem" }}>
              ✓ No skill gaps identified from available evidence. Your verified competencies satisfy operational expectations.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {gaps.map((gap, idx) => (
                <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", background: "#ffffff", borderLeft: gap.priority.includes("High") ? "4px solid #ef4444" : "4px solid #f59e0b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.05rem", color: "#0f172a" }}>
                        {gap.skill}
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>
                        {gap.why_it_matters}
                      </p>
                    </div>

                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "12px",
                      background: gap.priority.includes("High") ? "#fee2e2" : "#fef3c7",
                      color: gap.priority.includes("High") ? "#b91c1c" : "#b45309"
                    }}>
                      {gap.priority}
                    </span>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      <strong>Evidence Sources:</strong> {gap.evidence_sources.join(" • ")}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 600 }}>
                      Suggested: {gap.suggested_module}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION C: FEEDBACK CONTRIBUTION WORKFLOW */}
        <div style={{ background: "#f8fafc", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", color: "#0f172a" }}>
              Notice a missing skill in your day-to-day job?
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              Submit skill gap feedback. Your submissions feed the intelligence engine without overwriting your certified evidence.
            </p>
          </div>
          <button
            onClick={() => navigate("/trainee/feedback")}
            style={{
              padding: "0.6rem 1.25rem",
              background: "white",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#0f172a",
              cursor: "pointer"
            }}
          >
            Report Missing Skill →
          </button>
        </div>

      </DataStateWrapper>
    </div>
  );
}

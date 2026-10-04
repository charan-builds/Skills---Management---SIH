import { useState, useEffect } from "react";
import { 
  Zap, CheckCircle2, AlertTriangle, HelpCircle, Award, 
  Building2, MessageSquare, ArrowRight, BookOpen, ShieldCheck, Sparkles 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import { useLanguage } from "../context/LanguageContext";

export default function TraineeSkills() {
  const { t } = useLanguage();
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
              {t("trainee_skills.badge", "PERSONAL SKILL INTELLIGENCE & EVIDENCE")}
            </span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
            {t("trainee_skills.title", "My Skills & Evidence Portfolio")}
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
            {t("trainee_skills.subtitle", "Transparent assessment of verified competencies, workplace feedback, and grounded skill improvement recommendations.")}
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
            {t("trainee_skills.btn_target_role_benchmarks", "Target Role Benchmarks")} <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={skillsData}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d && d.evidence_state)}
        isEmptyDetails={t("trainee_skills.empty_evidence", "No skill evidence records found.")}
      >
        {/* Evidence State Diagnostic Banner (Section 45) */}
        {evidenceState === "NO_EVIDENCE" && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <AlertTriangle size={22} color="#b91c1c" />
            <div>
              <strong style={{ color: "#991b1b", display: "block" }}>{t("trainee_skills.no_evidence_title", "No Reliable Skill Evidence Exists (NO_EVIDENCE)")}</strong>
              <span style={{ fontSize: "0.85rem", color: "#7f1d1d" }}>
                {t("trainee_skills.no_evidence_desc", "No completed coursework, certified evaluations, or verified workplace competencies are recorded for this profile.")}
              </span>
            </div>
          </div>
        )}

        {evidenceState === "INSUFFICIENT_SKILL_EVIDENCE" && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "12px", padding: "1.25rem", marginBottom: "1.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <HelpCircle size={22} color="#b45309" />
            <div>
              <strong style={{ color: "#92400e", display: "block" }}>{t("trainee_skills.insufficient_evidence_title", "Insufficient Skill Evidence (INSUFFICIENT_SKILL_EVIDENCE)")}</strong>
              <span style={{ fontSize: "0.85rem", color: "#78350f" }}>
                {t("trainee_skills.insufficient_evidence_desc", "Some partial coursework records exist, but capstone assessments are pending. Skill scoring is withheld until formal certification.")}
              </span>
            </div>
          </div>
        )}

        {/* AI Evidence Synthesis Banner (Section 26) */}
        <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)", borderRadius: "14px", border: "1px solid #bfdbfe", padding: "1.5rem", marginBottom: "2rem" }}>
          <p style={{ margin: 0, fontSize: "0.95rem", color: "#1e293b", lineHeight: 1.6 }}>
            {skillsData?.verified_skills?.length > 0 ? (
              <>
                {t("Based on available evidence from", "Based on available evidence from")} <strong>{skillsData.provider_name}</strong>, {t("your strongest certified competencies are", "your strongest certified competencies are")} <strong>{skillsData.verified_skills.slice(0, 3).map(v => t(v.skill, v.skill)).join(", ")}</strong>.{" "}
                {skillsData.skill_gaps?.length > 0 ? (
                  <>
                    {t("For career progression,", "For career progression,")} <strong>{t(skillsData.skill_gaps[0].skill, skillsData.skill_gaps[0].skill)}</strong> {t("is identified as a priority focus area based on correlated trainee and employer feedback.", "is identified as a priority focus area based on correlated trainee and employer feedback.")}
                  </>
                ) : (
                  t("Your assessed competencies align strongly with your completed programme, with zero critical workplace deficiencies currently reported.", "Your assessed competencies align strongly with your completed programme, with zero critical workplace deficiencies currently reported.")
                )}
              </>
            ) : (
              t(skillsData?.ai_insights, skillsData?.ai_insights)
            )}
          </p>
        </div>

        {/* Evidence Source Overview Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>{t("trainee_skills.kpi_verified_skills", "Verified Skills")}</span>
              <Award size={18} color="#16a34a" />
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>
              {verified.length}
            </div>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              {t("trainee_skills.evidence_coursework", "Evidence: Coursework & Capstone")}
            </p>
          </div>

          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>{t("trainee_skills.kpi_self_reported", "Self-Reported Gaps")}</span>
              <MessageSquare size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>
              {selfReported.length}
            </div>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              {t("trainee_skills.evidence_followup", "Evidence: Trainee Follow-Up Feedback")}
            </p>
          </div>

          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9333ea", textTransform: "uppercase" }}>{t("trainee_skills.kpi_employer_observed", "Employer Observed")}</span>
              <Building2 size={18} color="#9333ea" />
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>
              {employerObserved.length}
            </div>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              {t("trainee_skills.evidence_employer", "Evidence: Industry Partner Feedback")}
            </p>
          </div>

          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#ea580c", textTransform: "uppercase" }}>{t("trainee_skills.kpi_actionable_gaps", "Actionable Gaps")}</span>
              <AlertTriangle size={18} color="#ea580c" />
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a" }}>
              {gaps.length}
            </div>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              {t("trainee_skills.prioritized_convergence", "Prioritized by evidence convergence")}
            </p>
          </div>
        </div>

        {/* SECTION A: VERIFIED CURRENT SKILLS (Section 19) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.2rem 0" }}>
                {t("trainee_skills.section_verified_title", "1. My Verified Skills (Evidence-Backed)")}
              </h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                {t("trainee_skills.section_verified_desc", "Competencies formally accredited through completed modules at {{providerName}}.", { providerName: skillsData?.provider_name || "Training Center" })}
              </p>
            </div>
            <span style={{ background: "#dcfce7", color: "#166534", fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={14} /> {t("trainee_skills.certified_credentials", "Certified Credentials")}
            </span>
          </div>

          {verified.length === 0 ? (
            <p style={{ color: "#94a3b8", fontStyle: "italic", margin: 0 }}>{t("trainee_skills.no_verified_skills", "No verified skills found for this profile.")}</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
              {verified.map((v, i) => (
                <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", background: "#f8fafc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <strong style={{ fontSize: "1rem", color: "#0f172a" }}>{t(v.skill, v.skill)}</strong>
                    <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", borderRadius: "6px" }}>
                      {v.proficiency_score}% {t("Evaluated", "Evaluated")}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.75rem" }}>
                    {t("Module:", "Module:")} {t(v.module_name, v.module_name)} ({v.duration_weeks} {t("Wks", "Wks")})
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "#475569", borderTop: "1px solid #e2e8f0", paddingTop: "0.5rem" }}>
                    <span>{t("Source:", "Source:")} {t(v.evidence_source, v.evidence_source)}</span>
                    <span style={{ color: "#15803d", fontWeight: 700 }}>{t("✓ Accredited", "✓ Accredited")}</span>
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
              {t("trainee_skills.section_gaps_title", "2. Skills I Should Improve (Synthesized Gaps)")}
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              {t("trainee_skills.section_gaps_desc", "Priority gaps correlated between trainee workplace experiences, employer feedback, and occupational demand.")}
            </p>
          </div>

          {gaps.length === 0 ? (
            <div style={{ padding: "1.5rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", color: "#166534", fontSize: "0.9rem" }}>
              {t("trainee_skills.no_gaps_identified", "✓ No skill gaps identified from available evidence. Your verified competencies satisfy operational expectations.")}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {gaps.map((gap, idx) => (
                <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", background: "#ffffff", borderLeft: gap.priority?.includes("High") ? "4px solid #ef4444" : "4px solid #f59e0b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.05rem", color: "#0f172a" }}>
                        {t(gap.skill, gap.skill)}
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>
                        {t(gap.why_it_matters, gap.why_it_matters)}
                      </p>
                    </div>

                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: "12px",
                      background: gap.priority?.includes("High") ? "#fee2e2" : "#fef3c7",
                      color: gap.priority?.includes("High") ? "#b91c1c" : "#b45309"
                    }}>
                      {t(gap.priority, gap.priority)}
                    </span>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      <strong>{t("trainee_skills.evidence_sources_label", "Evidence Sources:")}</strong> {gap.evidence_sources?.map(s => t(s, s)).join(" • ")}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 600 }}>
                      {t("Suggested Bridge Module:", "Suggested Bridge Module:")} {t(gap.suggested_module, gap.suggested_module)}
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
              {t("trainee_skills.cta_notice_title", "Notice a missing skill in your day-to-day job?")}
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              {t("trainee_skills.cta_notice_desc", "Submit skill gap feedback. Your submissions feed the intelligence engine without overwriting your certified evidence.")}
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
            {t("trainee_skills.btn_report_missing_skill", "Report Missing Skill →")}
          </button>
        </div>

      </DataStateWrapper>
    </div>
  );
}

import { useState, useEffect } from "react";
import { 
  Target, CheckCircle2, AlertTriangle, XCircle, BookOpen, 
  ArrowRight, Compass, Award, Sparkles, Layers, ShieldCheck, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import { useLanguage } from "../context/LanguageContext";

export default function SkillGoals() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const store = usePlatformStore();
  const traineeId = localStorage.getItem("traineeId") || "TR-0001";

  const [targetRoles, setTargetRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("ROLE-DA");
  const [benchmarkAnalysis, setBenchmarkAnalysis] = useState(null);
  const [traineeProfile, setTraineeProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);

  // Load target roles catalog and trainee data
  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const roles = await platformService.getTargetRoles();
        setTargetRoles(roles);

        const profRes = await platformService.getTraineeProfile(traineeId);
        setTraineeProfile(profRes.trainee);

        // Pre-select role if trainee already selected one, or default to first
        const savedRole = profRes.trainee?.selected_target_role || (roles[0]?.id || "ROLE-DA");
        setSelectedRoleId(savedRole);

        const analysis = await platformService.getTargetRoleBenchmark(savedRole, traineeId);
        setBenchmarkAnalysis(analysis);
      } catch (err) {
        console.error("Failed to load target role benchmarks", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [traineeId, store.last_updated]);

  // When selected target role changes
  const handleRoleChange = async (newRoleId) => {
    setSelectedRoleId(newRoleId);
    setEvaluating(true);
    try {
      await platformService.setTraineeTargetRole(traineeId, newRoleId);
      const analysis = await platformService.getTargetRoleBenchmark(newRoleId, traineeId);
      setBenchmarkAnalysis(analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const benchmark = benchmarkAnalysis?.benchmark;
  const evaluatedSkills = benchmarkAnalysis?.evaluated_skills || [];
  const recommendations = benchmarkAnalysis?.recommendations || [];
  const evidenceState = benchmarkAnalysis?.evidence_state || "EVIDENCE_AVAILABLE";

  const currentRole = traineeProfile?.employment?.job_role || "Graduate Trainee";
  const currentEmployer = traineeProfile?.employment?.employer_name || "Self / Seeking";

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <Target size={20} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {t("skill_goals.badge", "OCCUPATIONAL BENCHMARK ENGINE")}
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          {t("skill_goals.title", "Target Role Skill Goals & Planning")}
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          {t("skill_goals.subtitle", "Select an occupational benchmark to evaluate required competencies, identify skill differences, and view actionable upskilling modules. (Pure skill intelligence — not a recruitment system).")}
        </p>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={benchmarkAnalysis}
        onRetry={() => handleRoleChange(selectedRoleId)}
        isDataAvailable={(d) => Boolean(d && d.benchmark)}
        isEmptyDetails={t("skill_goals.empty_benchmark", "Target role benchmark unavailable.")}
      >
        {/* Role Selector & Quick Summary */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
            <div style={{ flex: 1, minWidth: "280px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                {t("skill_goals.select_role_label", "Select Occupational Target Role Benchmark:")}
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={evaluating}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  cursor: "pointer"
                }}
              >
                {targetRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title} — ({role.sector}, {role.nsqf_level})
                  </option>
                ))}
              </select>
            </div>

            {benchmark && (
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", background: "#f8fafc", padding: "0.75rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{t("skill_goals.benchmark_coverage_label", "BENCHMARK COVERAGE")}</span>
                  <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#2563eb" }}>
                    {benchmarkAnalysis.coverage_display}
                  </div>
                </div>
                <div style={{ width: "1px", height: "36px", background: "#cbd5e1" }} />
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{t("skill_goals.typical_wage_band_label", "TYPICAL WAGE BAND")}</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>
                    {benchmark.typical_wage_range}
                  </div>
                </div>
              </div>
            )}
          </div>

          {benchmark && (
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>
              <strong>{t("skill_goals.occupational_focus_label", "Occupational Focus:")}</strong> {benchmark.description}
            </p>
          )}
        </div>

        {/* Career Progression View: Current Role -> Target Role (Section 34 & 35) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem 0" }}>
            {t("skill_goals.career_progression_title", "Career Transition Pathway & Progression")}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", alignItems: "center" }}>
            {/* Current State */}
            <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{t("skill_goals.current_starting_point", "Current Starting Point")}</span>
              <h4 style={{ margin: "0.3rem 0 0.2rem 0", fontSize: "1.1rem", color: "#0f172a" }}>
                {currentRole}
              </h4>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                {currentEmployer} • {traineeProfile?.programme_name}
              </p>
              <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#15803d", fontWeight: 600 }}>
                ✓ {benchmarkAnalysis?.supported_count || 0} {t("skill_goals.supported_competencies_suffix", "Supported Competencies")}
              </div>
            </div>

            {/* Transition Arrow */}
            <div style={{ textAlign: "center", padding: "0.5rem" }}>
              <div style={{ width: "42px", height: "42px", background: "#eff6ff", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#2563eb", marginBottom: "0.3rem" }}>
                <ArrowRight size={20} />
              </div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb" }}>
                {t("skill_goals.bridging_gaps_prefix", "BRIDGING")} {(benchmarkAnalysis?.total_count || 0) - (benchmarkAnalysis?.supported_count || 0)} {t("skill_goals.bridging_gaps_suffix", "SKILL GAPS")}
              </div>
            </div>

            {/* Target Role */}
            <div style={{ background: "#eff6ff", padding: "1.25rem", borderRadius: "10px", border: "1px solid #bfdbfe" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase" }}>{t("skill_goals.target_benchmark_label", "Target Benchmark")}</span>
              <h4 style={{ margin: "0.3rem 0 0.2rem 0", fontSize: "1.1rem", color: "#1e3a8a" }}>
                {benchmark?.title}
              </h4>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#3b82f6" }}>
                {benchmark?.sector} • {benchmark?.nsqf_level}
              </p>
              <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#1e40af", fontWeight: 700 }}>
                {t("skill_goals.readiness_label", "Readiness:")} {benchmarkAnalysis?.coverage_percentage}% {t("skill_goals.supported_suffix", "Supported")}
              </div>
            </div>
          </div>
        </div>

        {/* AI Grounded Synthesis Banner (Section 26 & 46) */}
        <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)", borderRadius: "12px", border: "1px solid #bbf7d0", padding: "1.25rem 1.5rem", marginBottom: "2rem" }}>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#1f2937", lineHeight: 1.6 }}>
            {benchmarkAnalysis?.ai_insights}
          </p>
        </div>

        {/* Skill Comparison Matrix (Section 24) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.2rem 0" }}>
              {t("skill_goals.matrix_title", "Occupational Skill Requirements & Evidence Comparison")}
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              {t("skill_goals.matrix_desc", "Comparing required occupational skills against your verified coursework and workplace assessments.")}
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>{t("skill_goals.col_required_skill", "Required Skill")}</th>
                  <th style={{ padding: "0.75rem 1rem" }}>{t("skill_goals.col_importance", "Importance")}</th>
                  <th style={{ padding: "0.75rem 1rem" }}>{t("skill_goals.col_benchmark_threshold", "Benchmark Threshold")}</th>
                  <th style={{ padding: "0.75rem 1rem" }}>{t("skill_goals.col_current_evidence", "Your Current Evidence")}</th>
                  <th style={{ padding: "0.75rem 1rem" }}>{t("skill_goals.col_match_status", "Match Status")}</th>
                  <th style={{ padding: "0.75rem 1rem" }}>{t("skill_goals.col_action_priority", "Action Priority")}</th>
                </tr>
              </thead>
              <tbody>
                {evaluatedSkills.map((sk, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.9rem 1rem", fontWeight: 700, color: "#0f172a" }}>
                      {sk.skill}
                      <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", fontWeight: 400 }}>
                        {sk.category}
                      </span>
                    </td>

                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: sk.importance === "Critical" ? "#fee2e2" : sk.importance === "High" ? "#fef3c7" : "#eff6ff",
                        color: sk.importance === "Critical" ? "#b91c1c" : sk.importance === "High" ? "#b45309" : "#1d4ed8"
                      }}>
                        {sk.importance}
                      </span>
                    </td>

                    <td style={{ padding: "0.9rem 1rem", color: "#334155" }}>
                      {t("skill_goals.min_proficiency", "Min")} {sk.min_score}% {t("skill_goals.proficiency_suffix", "Proficiency")}
                    </td>

                    <td style={{ padding: "0.9rem 1rem", color: "#475569" }}>
                      <div>{sk.current_evidence}</div>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{sk.evidence_source}</span>
                    </td>

                    <td style={{ padding: "0.9rem 1rem" }}>
                      {sk.status === "Supported" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#15803d", fontWeight: 700 }}>
                          <CheckCircle2 size={16} /> {t("skill_goals.status_supported", "Supported")}
                        </span>
                      ) : sk.status === "Needs Improvement" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#b45309", fontWeight: 700 }}>
                          <AlertTriangle size={16} /> {t("skill_goals.status_needs_improvement", "Needs Improvement")}
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#b91c1c", fontWeight: 700 }}>
                          <XCircle size={16} /> {t("skill_goals.status_missing_gap", "Missing Gap")}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: sk.priority === "Satisfied" ? "#16a34a" : sk.priority?.includes("High") ? "#dc2626" : "#d97706"
                      }}>
                        {sk.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommended Skill Improvements (Section 25 & 36) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
          <div style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.2rem 0" }}>
              {t("skill_goals.recommendations_title", "Recommended Upskilling Modules & Bridge Units")}
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              {t("skill_goals.recommendations_desc", "Actionable training modules mapped directly to identified benchmark deficits.")}
            </p>
          </div>

          {recommendations.length === 0 ? (
            <div style={{ padding: "1.5rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", color: "#166534" }}>
              {t("skill_goals.all_competencies_satisfied", "✓ You have satisfied all required competencies for this target role benchmark!")}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
              {recommendations.map((rec, i) => (
                <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", background: "#f8fafc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <strong style={{ fontSize: "1rem", color: "#0f172a" }}>{rec.skill}</strong>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: rec.priority?.includes("High") ? "#fee2e2" : "#fef3c7",
                      color: rec.priority?.includes("High") ? "#b91c1c" : "#b45309"
                    }}>
                      {rec.priority}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.8rem", color: "#475569", lineHeight: 1.5 }}>
                    {rec.reason}
                  </p>

                  <div style={{ background: "white", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{t("skill_goals.curriculum_bridge_label", "Curriculum Bridge Module:")}</div>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#2563eb", marginTop: "0.2rem" }}>
                      {rec.recommended_module}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.3rem" }}>
                      {t("skill_goals.duration_label", "Duration:")} {rec.duration} • {t("skill_goals.nsqf_aligned", "NSQF Aligned")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </DataStateWrapper>
    </div>
  );
}

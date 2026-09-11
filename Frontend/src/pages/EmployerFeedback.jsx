import { useState, useEffect } from "react";
import { 
  MessageSquare, Star, CheckCircle2, Send, Award, Target, 
  Building2, Layers, ArrowRight, ShieldCheck, Clock, AlertCircle, Sparkles,
  TrendingUp, BookOpen, UserCheck
} from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { mockStore } from "../services/mockStore";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function EmployerFeedback() {
  const store = usePlatformStore();
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";
  const organizationName = localStorage.getItem("organizationName") || "Tata Consultancy Services";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [skillsWeNeed, setSkillsWeNeed] = useState([]);

  // Form state
  const [programmeId, setProgrammeId] = useState("PRG-001");
  const [skillInput, setSkillInput] = useState("Kubernetes & Container Orchestration");
  const [roleContext, setRoleContext] = useState("Cloud Systems Associate");
  const [relevanceRating, setRelevanceRating] = useState(4);
  const [comments, setComments] = useState("");

  const commonSkillTags = [
    "Kubernetes & Container Orchestration",
    "Terraform & Cloud IaC",
    "Microservice Architecture",
    "CI/CD Pipeline Automation",
    "Database Query Optimization & Indexing",
    "High Voltage EV Safety Protocols",
    "CAN-bus Telemetry Diagnostics",
    "Emergency Room Clinical Triage",
    "Electronic Health Records (EHR)",
    "Three-Phase Solar Grid Synchronization"
  ];

  const PROGRAMMES = [
    { id: "PRG-001", name: "Cloud Infrastructure & DevOps" },
    { id: "PRG-002", name: "Full Stack Web Engineering" },
    { id: "PRG-003", name: "Automotive Precision & EV Systems" },
    { id: "PRG-004", name: "Patient Care & Healthcare Operations" },
    { id: "PRG-005", name: "Renewable Energy & Solar Grid" }
  ];

  const loadFeedbackData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getEmployerSkillFeedback(organizationId);
      setFeedbackHistory(res.feedback_history || []);
      setSkillsWeNeed(res.skills_we_need || []);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbackData();
  }, [organizationId, store.last_updated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skillInput.trim()) {
      alert("Please specify the missing or required skill.");
      return;
    }

    setSubmitting(true);
    try {
      const selectedProg = PROGRAMMES.find(p => p.id === programmeId);
      await platformService.submitEmployerSkillFeedback(organizationId, {
        programme_id: programmeId,
        programme_name: selectedProg?.name || "Vocational Programme",
        skill: skillInput.trim(),
        role_context: roleContext,
        relevance_rating: relevanceRating,
        comments: comments.trim() || `Employer feedback logged for ${skillInput}.`
      });

      setToastMessage(`Feedback for "${skillInput}" logged successfully to Central Skill Intelligence.`);
      setComments("");
      loadFeedbackData();
      setTimeout(() => setToastMessage(""), 5000);
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <MessageSquare size={20} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            ENTERPRISE SKILL INTELLIGENCE & CURRICULUM FEEDBACK (SECTIONS 21–24)
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.4rem 0" }}>
          Skills We Need & Curriculum Advisory
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Report missing or emerging workplace competencies directly to accredited vocational training bodies.
        </p>
      </div>

      {toastMessage && (
        <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "1rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Section 24: Central Multi-Source Evidence Fusion Banner */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)", borderRadius: "14px", padding: "1.75rem", color: "white", marginBottom: "2rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
          <Sparkles size={20} color="#60a5fa" />
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
            How Employer Feedback Informs National Skill Intelligence
          </h3>
        </div>
        <p style={{ margin: "0 0 1.25rem 0", color: "#bfdbfe", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: "980px" }}>
          When <strong>{organizationName}</strong> identifies a workplace skill shortage, it is stored as an independent evidence source. It correlates with trainee reflections and occupational benchmarks to produce high-confidence policy recommendations without altering certified candidate credentials.
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "1rem", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#93c5fd", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.3rem" }}>
              <Building2 size={15} /> 1. Employer Voice
            </div>
            <div style={{ fontSize: "0.85rem", color: "#f8fafc" }}>
              On-the-job competency deficits &amp; hiring barriers reported by firms.
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "1rem", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#93c5fd", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.3rem" }}>
              <UserCheck size={15} /> 2. Trainee Voice
            </div>
            <div style={{ fontSize: "0.85rem", color: "#f8fafc" }}>
              Graduates reflect on curriculum gaps during workplace onboarding.
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "1rem", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#93c5fd", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.3rem" }}>
              <Award size={15} /> 3. Verified Syllabus
            </div>
            <div style={{ fontSize: "0.85rem", color: "#f8fafc" }}>
              Accredited NSQF module grades and practical assessment scores.
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "1rem", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#86efac", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.3rem" }}>
              <Target size={15} /> 4. Policy Reform
            </div>
            <div style={{ fontSize: "0.85rem", color: "#f8fafc" }}>
              State Skilling Authority updates curriculum standards and funding.
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }}>
        {/* Left Column: Report Missing Skill Form (Section 21) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0" }}>
            Report Missing or Difficult Workplace Skill
          </h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0 0 1.5rem 0" }}>
            Specify the technical or domain skill your organisation finds deficient in recent skilling graduates.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Programme Linkage */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                Vocational Training Programme:
              </label>
              <select
                value={programmeId}
                onChange={(e) => setProgrammeId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  background: "#f8fafc",
                  color: "#0f172a"
                }}
              >
                {PROGRAMMES.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                ))}
              </select>
            </div>

            {/* Role Context */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                Job Role Context:
              </label>
              <input
                type="text"
                value={roleContext}
                onChange={(e) => setRoleContext(e.target.value)}
                placeholder="e.g. Cloud Systems Associate, EV Maintenance Technician"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  color: "#0f172a"
                }}
              />
            </div>

            {/* Missing Skill Selection */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                Missing Competency / Skill Gap:
              </label>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g. Kubernetes & Container Orchestration"
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  marginBottom: "0.5rem"
                }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {commonSkillTags.slice(0, 5).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSkillInput(tag)}
                    style={{
                      background: skillInput === tag ? "#eff6ff" : "#f1f5f9",
                      border: `1px solid ${skillInput === tag ? "#3b82f6" : "#cbd5e1"}`,
                      color: skillInput === tag ? "#1d4ed8" : "#475569",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Overall Curriculum Relevance */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                Overall Curriculum Relevance (1 to 5):
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRelevanceRating(star)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
                  >
                    <Star
                      size={24}
                      fill={star <= relevanceRating ? "#f59e0b" : "none"}
                      color={star <= relevanceRating ? "#f59e0b" : "#cbd5e1"}
                    />
                  </button>
                ))}
                <span style={{ fontSize: "0.85rem", color: "#64748b", marginLeft: "0.5rem" }}>
                  {relevanceRating === 5 ? "Highly Relevant" : relevanceRating === 4 ? "Substantially Relevant" : relevanceRating === 3 ? "Moderately Relevant" : "Needs Significant Update"}
                </span>
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                Workplace Observations &amp; Details:
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Explain the specific gap observed during production or onboarding tasks..."
                style={{
                  width: "100%",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  color: "#0f172a"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxShadow: "0 1px 2px rgba(37, 99, 235, 0.2)"
              }}
            >
              <Send size={16} />
              {submitting ? "Logging Feedback..." : "Submit to Central Skill Intelligence"}
            </button>
          </form>
        </div>

        {/* Right Column: "Skills We Need" Employer Intelligence (Section 23) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <TrendingUp size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                  Skills We Need (Internal Roster Gaps)
                </h3>
              </div>
              <span style={{ fontSize: "0.75rem", background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                {skillsWeNeed.length} Gaps Tracked
              </span>
            </div>
            <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.85rem", color: "#64748b" }}>
              Aggregated skill shortages reported across your organization's verified candidate cohort.
            </p>

            <DataStateWrapper
              isLoading={loading}
              error={error}
              data={skillsWeNeed}
              onRetry={loadFeedbackData}
              isDataAvailable={(d) => Array.isArray(d) && d.length > 0}
              isEmptyDetails="No skill shortages reported by your organization yet."
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {skillsWeNeed.map((gap, idx) => (
                  <div key={gap.skill} style={{ padding: "1rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.35rem" }}>
                      <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                        {gap.skill}
                      </strong>
                      <span style={{ background: idx === 0 ? "#fee2e2" : "#fef3c7", color: idx === 0 ? "#b91c1c" : "#b45309", fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", borderRadius: "12px" }}>
                        {gap.count} Report{gap.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#475569", display: "flex", gap: "0.75rem" }}>
                      <span><strong>Context:</strong> {gap.roles_affected ? gap.roles_affected[0] : "All Roles"}</span>
                      <span>•</span>
                      <span><strong>Course:</strong> {gap.programmes ? gap.programmes[0] : "Cloud & Tech"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DataStateWrapper>
          </div>

          {/* Privacy and Proof Disclaimer Card */}
          <div style={{ background: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0", padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <ShieldCheck size={18} color="#15803d" />
              <strong style={{ fontSize: "0.85rem", color: "#166534" }}>
                Data Integrity &amp; Provenance Separation (Section 21)
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#166534", lineHeight: 1.5 }}>
              Your feedback is catalogued as <code>EMPLOYER_FEEDBACK</code>. It does not overwrite candidate academic grades, ensuring candidate transcripts remain objective while providing actionable feedback for syllabus enhancements.
            </p>
          </div>
        </div>
      </div>

      {/* Section 22: Feedback History Table */}
      <div style={{ marginTop: "2.5rem", background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <h3 style={{ margin: "0 0 0.4rem 0", fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
          Previously Submitted Skill Feedback Log
        </h3>
        <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.85rem", color: "#64748b" }}>
          Historical record of curricular feedback submitted by your organisation to the state skilling portal.
        </p>

        <DataStateWrapper
          isLoading={loading}
          error={error}
          data={feedbackHistory}
          onRetry={loadFeedbackData}
          isDataAvailable={(d) => Array.isArray(d) && d.length > 0}
          isEmptyDetails="No feedback records found."
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "0.75rem 1rem" }}>Reported Skill</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Target Programme</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Relevance</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Submitted On</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Comments</th>
                  <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {feedbackHistory.map(f => (
                  <tr key={f.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#0f172a" }}>
                      {f.skill || (f.top_missing_skills && f.top_missing_skills[0]) || "Domain Competency"}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "#475569" }}>
                      {f.programme_name || "Cloud Infrastructure"}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{ color: "#d97706", fontWeight: 700 }}>
                        {f.skill_relevance_rating || 4} / 5 ★
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "#64748b" }}>
                      {f.submitted_at || "2023-05-20"}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "#334155", maxWidth: "280px" }}>
                      {f.comments || "Feedback submitted."}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        <CheckCircle2 size={12} /> Included in Skill Intelligence
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataStateWrapper>
      </div>
    </div>
  );
}

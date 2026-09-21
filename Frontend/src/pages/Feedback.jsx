import { useState, useEffect } from "react";
import { 
  MessageSquare, Star, CheckCircle2, Send, Award, Target, 
  Building2, Layers, ArrowRight, ShieldCheck, Clock, AlertCircle, Sparkles 
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function Feedback() {
  const location = useLocation();
  const isEmployer = location.pathname.includes("/employer") || localStorage.getItem("userRole") === "employer";
  const store = usePlatformStore();
  const traineeId = localStorage.getItem("traineeId") || "TR-0001";

  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(!isEmployer);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Employer state
  const [programmeId, setProgrammeId] = useState("PRG-001");
  const [relevanceRating, setRelevanceRating] = useState(0);
  const [selectedGaps, setSelectedGaps] = useState(["Kubernetes & Orchestration"]);
  const [newGapInput, setNewGapInput] = useState("");
  const [employerComments, setEmployerComments] = useState("");

  // Trainee state (Sections 27, 37)
  const [traineeRelevanceRating, setTraineeRelevanceRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [traineeRelevance, setTraineeRelevance] = useState("Not Selected");
  const [missingSkillName, setMissingSkillName] = useState("Cloud Deployment & Kubernetes");
  const [gapType, setGapType] = useState("Missing from curriculum");
  const [traineeComments, setTraineeComments] = useState("");

  const relevanceInterpretations = {
    0: "Not Selected",
    1: "Not Relevant",
    2: "Slightly Relevant",
    3: "Moderately Relevant",
    4: "Highly Relevant",
    5: "Fully Relevant"
  };

  const commonSkillTags = [
    "Docker & Containerization",
    "Kubernetes & Orchestration",
    "Terraform & IaC",
    "Cloud Deployment & AWS/GCP",
    "Microservice Architecture",
    "CI/CD Automation",
    "Database Indexing & Optimization",
    "CAN Bus Automotive Protocols",
    "High Voltage EV Safety",
    "Emergency Room Triage"
  ];

  const loadTrainee = async () => {
    if (isEmployer) return;
    setLoading(true);
    try {
      const res = await platformService.getTraineeProfile(traineeId);
      setTrainee(res.trainee);
      // Always start with 0 stars (Not Selected) by default for new input
      setTraineeRelevanceRating(0);
      setTraineeRelevance("Not Selected");
      const savedFeedback = res.trainee?.training_relevance_feedback;
      if (savedFeedback?.comments) setTraineeComments(savedFeedback.comments);
      if (savedFeedback?.missing_skills?.[0]) setMissingSkillName(savedFeedback.missing_skills[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainee();
  }, [traineeId, store.last_updated]);

  const handleToggleGap = (tag) => {
    if (selectedGaps.includes(tag)) {
      setSelectedGaps(selectedGaps.filter(g => g !== tag));
    } else {
      setSelectedGaps([...selectedGaps, tag]);
    }
  };

  const handleAddCustomGap = (e) => {
    e.preventDefault();
    if (newGapInput.trim() && !selectedGaps.includes(newGapInput.trim())) {
      setSelectedGaps([...selectedGaps, newGapInput.trim()]);
      setNewGapInput("");
    }
  };

  // Employer feedback submission
  const handleSubmitEmployerFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const prog = store.programmes.find(p => p.id === programmeId);
      await platformService.submitEmployerFeedback({
        employer_id: localStorage.getItem("organizationId") || "EMP-DEMO-001",
        employer_name: localStorage.getItem("organizationName") || "Tata Consultancy Services",
        programme_id: programmeId,
        programme_name: prog?.name || "Technical Skilling Programme",
        skill_relevance_rating: relevanceRating,
        top_missing_skills: selectedGaps,
        comments: employerComments
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  // Trainee feedback submission (Sections 27, 29, 37)
  const handleSubmitTraineeFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Submit Training Relevance Feedback
      await platformService.submitTrainingRelevance(traineeId, {
        rating: traineeRelevanceRating,
        relevant: relevanceInterpretations[traineeRelevanceRating] || traineeRelevance,
        missing_skills: missingSkillName ? [missingSkillName] : [],
        comments: traineeComments
      });

      // 2. Submit Trainee-Perceived Skill Gap
      if (missingSkillName) {
        await platformService.submitTraineeSkillFeedback(traineeId, {
          programme_id: trainee?.programme_id,
          programme_name: trainee?.programme_name,
          skill: missingSkillName,
          gap_type: gapType,
          comments: traineeComments
        });
      }

      setSubmitted(true);
      loadTrainee();
    } catch (err) {
      console.error(err);
      alert("Failed to submit trainee feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  const recentFeedbackList = trainee?.skill_feedback_history || [];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <MessageSquare size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {isEmployer ? "EMPLOYER FEEDBACK & CURRICULUM INPUT" : "TRAINEE SKILL RELEVANCE & FEEDBACK INTELLIGENCE"}
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          {isEmployer ? "Employer Competency & Curriculum Feedback" : "My Training Relevance & Skill Feedback"}
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          {isEmployer
            ? "Your feedback directly influences state curriculum revisions and identifies emerging industry skill requirements."
            : "Report training relevance and missing workplace skills. Your reports feed Skill Intelligence as trainee-perceived evidence without overwriting verified credentials."}
        </p>
      </div>

      {submitted ? (
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "3rem", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#dcfce7", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto" }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
            Feedback Successfully Recorded & Synthesized
          </h2>
          <p style={{ color: "#475569", maxWidth: "560px", margin: "0 auto 1.5rem auto", lineHeight: 1.6, fontSize: "0.95rem" }}>
            Your feedback has been stored as a <strong>Trainee-Perceived Skill Gap</strong> and integrated into the Skill Intelligence Engine. It now correlates with employer demand to prioritize upskilling recommendations.
          </p>

          <div style={{ display: "inline-flex", gap: "0.75rem", background: "#f8fafc", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "2rem", fontSize: "0.85rem", color: "#2563eb", fontWeight: 700 }}>
            Status: Included in Skill Intelligence ✓
          </div>

          <div>
            <button
              onClick={() => {
                setSubmitted(false);
                setTraineeComments("");
              }}
              style={{ padding: "0.75rem 1.75rem", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
            >
              Submit Another Skill Observation
            </button>
          </div>
        </div>
      ) : isEmployer ? (
        /* EMPLOYER FEEDBACK FORM */
        <form onSubmit={handleSubmitEmployerFeedback} style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "2rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
              Target Skilling Programme
            </label>
            <select
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
            >
              {store.programmes.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sector})</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
              Curriculum Relevance Rating (1 to 5 Stars)
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRelevanceRating(star)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    color: star <= relevanceRating ? "#f59e0b" : "#cbd5e1"
                  }}
                >
                  <Star size={28} fill={star <= relevanceRating ? "#f59e0b" : "none"} />
                </button>
              ))}
              <span style={{ fontSize: "0.9rem", color: "#64748b", marginLeft: "0.5rem", fontWeight: 600 }}>
                {relevanceRating === 5 ? "Extremely Relevant" : relevanceRating === 4 ? "Well Aligned" : relevanceRating === 3 ? "Moderately Aligned" : "Significant Gaps"}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
              Key Competency Deficits Observed During Onboarding
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
              {commonSkillTags.map((tag) => {
                const isSelected = selectedGaps.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleToggleGap(tag)}
                    style={{
                      padding: "0.4rem 0.85rem",
                      borderRadius: "20px",
                      border: isSelected ? "1px solid #2563eb" : "1px solid #cbd5e1",
                      background: isSelected ? "#eff6ff" : "white",
                      color: isSelected ? "#1d4ed8" : "#475569",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    {isSelected ? "✓ " : "+ "}{tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
              Detailed Feedback & Recommendations for Training Providers
            </label>
            <textarea
              value={employerComments}
              onChange={(e) => setEmployerComments(e.target.value)}
              rows={4}
              placeholder="e.g. Candidates demonstrated solid Linux fundamentals, but had difficulties with real-time Kubernetes cluster monitoring."
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "0.8rem 2rem", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Send size={18} />
              {submitting ? "Submitting..." : "Submit Employer Feedback"}
            </button>
          </div>
        </form>
      ) : (
        /* TRAINEE FEEDBACK FORM (Sections 27, 29, 37) */
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Section 29: Visual Evidence Synthesis Architecture Callout */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Layers size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>
                How Your Feedback Feeds Skill Intelligence
              </h3>
            </div>
            <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.85rem", color: "#64748b" }}>
              We synthesize three independent evidence sources to determine upskilling priorities without altering your verified credentials.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#2563eb" }}>STEP 1: TRAINEE</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginTop: "0.2rem" }}>Reports Missing Skill</div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>e.g. &ldquo;Missing Kubernetes&rdquo;</span>
              </div>

              <div style={{ textAlign: "center", borderLeft: "1px dashed #cbd5e1", paddingLeft: "0.5rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9333ea" }}>STEP 2: EMPLOYER</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginTop: "0.2rem" }}>Observes Deficit</div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>e.g. &ldquo;Kubernetes needed&rdquo;</span>
              </div>

              <div style={{ textAlign: "center", borderLeft: "1px dashed #cbd5e1", paddingLeft: "0.5rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#f59e0b" }}>STEP 3: BENCHMARK</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginTop: "0.2rem" }}>Target Role Confirms</div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Required for Cloud Engineer</span>
              </div>

              <div style={{ textAlign: "center", borderLeft: "1px dashed #cbd5e1", paddingLeft: "0.5rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#16a34a" }}>RESULT: INTELLIGENCE</div>
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#15803d", marginTop: "0.2rem" }}>High-Priority Gap</div>
                <span style={{ fontSize: "0.75rem", color: "#166534" }}>Recommends Module</span>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <form onSubmit={handleSubmitTraineeFeedback} style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "2rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1.25rem 0" }}>
              Submit Training Relevance &amp; Skill Observations
            </h3>

            {/* Question 1: Was Training Relevant? (Section 37) - 5-Star Relevance Rating */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>
                1. Was your training programme relevant to your actual workplace tasks?
              </label>
              <div style={{ background: "#f8fafc", padding: "1.25rem 1.5rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const currentVal = hoverRating || traineeRelevanceRating;
                    const isFilled = currentVal > 0 && star <= currentVal;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setTraineeRelevanceRating(star);
                          setTraineeRelevance(relevanceInterpretations[star]);
                        }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "transform 0.15s ease, color 0.15s ease",
                          transform: isFilled ? "scale(1.18)" : "scale(1)"
                        }}
                        title={`${star} Star${star > 1 ? "s" : ""} — ${relevanceInterpretations[star]}`}
                      >
                        <Star
                          size={32}
                          fill={isFilled ? "#f59e0b" : "none"}
                          color={isFilled ? "#f59e0b" : "#cbd5e1"}
                          strokeWidth={isFilled ? 2 : 1.5}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Descriptive label below stars */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                  {(hoverRating || traineeRelevanceRating) > 0 && (
                    <span style={{ fontSize: "1.05rem" }}>
                      {"⭐".repeat(hoverRating || traineeRelevanceRating)}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color:
                        (hoverRating || traineeRelevanceRating) >= 4
                          ? "#15803d"
                          : (hoverRating || traineeRelevanceRating) === 3
                          ? "#b45309"
                          : (hoverRating || traineeRelevanceRating) > 0
                          ? "#b91c1c"
                          : "#64748b"
                    }}
                  >
                    — {relevanceInterpretations[hoverRating || traineeRelevanceRating] || "Not Selected"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      marginLeft: "0.25rem",
                      background: "#ffffff",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontWeight: 600
                    }}
                  >
                    Numerical Score: {hoverRating || traineeRelevanceRating} / 5
                  </span>
                </div>
              </div>
            </div>

            {/* Question 2: What was missing? (Section 27) */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                2. Which technical skill did you feel was missing or needed deeper coverage?
              </label>
              <input
                type="text"
                value={missingSkillName}
                onChange={(e) => setMissingSkillName(e.target.value)}
                placeholder="e.g. Kubernetes, Terraform, Power BI, Advanced Phlebotomy"
                required
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.95rem", fontWeight: 600 }}
              />
              <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem", display: "block" }}>
                Quick suggestions: Cloud Deployment • Production Docker • Advanced SQL • Microservices • CAN Protocols
              </span>
            </div>

            {/* Question 3: Gap Category */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                3. Nature of this Skill Gap:
              </label>
              <select
                value={gapType}
                onChange={(e) => setGapType(e.target.value)}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
              >
                <option value="Missing from curriculum">Missing entirely from coursework syllabus</option>
                <option value="Outdated tooling">Curriculum taught older tooling version</option>
                <option value="Insufficient hands-on lab time">Theory covered, but lacked practical production labs</option>
                <option value="Advanced topic needed in workplace">Required for senior/specialist workplace tasks</option>
              </select>
            </div>

            {/* Question 4: Comments */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
                4. Detailed Observations / Interview Experience:
              </label>
              <textarea
                value={traineeComments}
                onChange={(e) => setTraineeComments(e.target.value)}
                rows={3}
                placeholder="e.g. In technical interviews and onboarding, hiring managers specifically looked for experience deploying containers to cloud clusters."
                style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Stored as Trainee-Perceived Skill Gap • Never overwrites verified assessment records.
              </span>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: "0.75rem 2rem", background: "#2563eb", color: "white", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Send size={18} />
                {submitting ? "Synthesizing..." : "Submit Skill Observation"}
              </button>
            </div>
          </form>

          {/* Section 30: Trainee Feedback Status Tracker */}
          {recentFeedbackList.length > 0 && (
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem 0" }}>
                My Submitted Feedback &amp; Processing Status
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recentFeedbackList.map((fb, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{fb.skill}</strong>
                      <span style={{ fontSize: "0.8rem", color: "#64748b", display: "block" }}>
                        Category: {fb.gap_type} • Recorded on {fb.timestamp?.split("T")[0] || "Recent"}
                      </span>
                    </div>

                    <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 }}>
                      ✓ {fb.status || "Included in Skill Intelligence"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

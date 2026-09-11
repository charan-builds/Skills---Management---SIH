import { useState, useEffect } from "react";
import { Bell, CheckCircle2, Clock, Calendar, AlertCircle, PhoneCall, Send, ChevronRight, User, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function FollowUps() {
  const location = useLocation();
  const isAdmin = location.pathname.includes("/admin") || localStorage.getItem("userRole") === "admin";
  const store = usePlatformStore();
  const traineeId = localStorage.getItem("traineeId") || "TR-0001";

  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCheckin, setActiveCheckin] = useState(null); // Selected follow-up milestone to complete
  const [toastMessage, setToastMessage] = useState("");

  // Check-in Questionnaire Form (Section 18 Conditional)
  const [isWorking, setIsWorking] = useState(true);
  const [sameEmployer, setSameEmployer] = useState(true);
  const [newEmployerName, setNewEmployerName] = useState("");
  const [newJobRole, setNewJobRole] = useState("");
  const [checkinWage, setCheckinWage] = useState("");
  const [trainingRelevance, setTrainingRelevance] = useState("Yes");
  const [checkinGaps, setCheckinGaps] = useState("");
  const [attritionReason, setAttritionReason] = useState("Low salary / compensation");
  const [seekingPlacement, setSeekingPlacement] = useState(true);
  const [checkinNotes, setCheckinNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await platformService.getTraineeProfile(traineeId);
      setTrainee(res.trainee);
      const isEmp = res.trainee?.employment?.status === "EMPLOYED" || res.trainee?.employment?.status === "APPRENTICESHIP";
      setIsWorking(isEmp);
      if (res.trainee?.employment?.current_wage) {
        setCheckinWage(res.trainee.employment.current_wage.toString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [traineeId, store.last_updated]);

  const handleCompleteFollowup = async (e) => {
    e.preventDefault();
    if (!activeCheckin) return;
    setSubmitting(true);
    try {
      await platformService.submitFollowup(traineeId, activeCheckin.id, {
        is_working: isWorking,
        still_working: isWorking,
        changed_job: isWorking && !sameEmployer,
        new_employer: isWorking && !sameEmployer ? newEmployerName : undefined,
        new_role: isWorking && !sameEmployer ? newJobRole : undefined,
        current_wage: isWorking ? (Number(checkinWage) || undefined) : 0,
        attrition_reason: !isWorking ? attritionReason : undefined,
        training_relevance: isWorking ? trainingRelevance : undefined,
        reported_skill_gaps: checkinGaps ? [checkinGaps] : [],
        notes: checkinNotes || (isWorking ? `Milestone confirmed with wage: ₹${checkinWage}` : `Candidate reported exit: ${attritionReason}`)
      });
      setToastMessage(`${activeCheckin.milestone} Check-in successfully recorded!`);
      setActiveCheckin(null);
      setTimeout(() => setToastMessage(""), 4000);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error recording follow-up.");
    } finally {
      setSubmitting(false);
    }
  };

  const followups = trainee?.follow_ups || [];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <Bell size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            ASSISTED FOLLOW-UP & RETENTION VERIFICATION (FEATURES 5, 6, 7, 21, C10)
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          {isAdmin ? "State Assisted Follow-up Oversight (Feature 21)" : "Periodic Outcome Follow-ups (C10)"}
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          {isAdmin
            ? "Track automated omnichannel outreach, call-center verification, and 3M/6M/12M response completion across districts."
            : "Mandatory milestone check-ins ensuring continuous support, wage tracking, and state career assistance."}
        </p>
      </div>

      {toastMessage && (
        <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={18} />
          <strong>{toastMessage}</strong>
        </div>
      )}

      {isAdmin ? (
        /* ADMIN ASSISTED FOLLOW-UP OVERVIEW (Feature 21) */
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ background: "white", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Total Cohort Trainees</span>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
                {store.trainees.length}
              </div>
            </div>
            <div style={{ background: "white", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Follow-ups Due Today</span>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#b45309", marginTop: "0.2rem" }}>
                2 Pending
              </div>
            </div>
            <div style={{ background: "white", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Overall Response Rate</span>
              <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "#16a34a", marginTop: "0.2rem" }}>
                86.4%
              </div>
            </div>
          </div>

          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a" }}>
                Active Assisted Follow-up Queue (Omnichannel Outreach Engine)
              </h3>
            </div>
            <div style={{ padding: "1.5rem" }}>
              {store.trainees.map((t) => (
                <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderBottom: "1px solid #f1f5f9" }}>
                  <div>
                    <strong style={{ color: "#0f172a", display: "block" }}>{t.name} ({t.id})</strong>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {t.programme_name} • District: {t.district} • Contact: {t.phone}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 700 }}>
                      Follow-ups Active
                    </span>
                    <button
                      onClick={() => alert(`Triggering assisted SMS & WhatsApp outreach notification to ${t.name} (${t.phone})...`)}
                      style={{ padding: "0.4rem 0.8rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
                    >
                      <PhoneCall size={13} /> Trigger Outreach
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* TRAINEE MILESTONE CARDS & CHECK-IN (SECTIONS 16, 17, C10) */
        <DataStateWrapper
          isLoading={loading}
          data={trainee}
          onRetry={loadData}
          isDataAvailable={(d) => Boolean(d)}
          isEmptyDetails="No follow-up milestones configured."
        >
          {/* Consent Gating Banner (Section 7) */}
          {trainee?.consent?.status === "DECLINED" && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertCircle size={20} color="#b91c1c" />
                <div>
                  <strong style={{ color: "#991b1b", fontSize: "0.9rem" }}>Follow-up Participation is Restricted</strong>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#7f1d1d" }}>
                    You have declined outcome tracking consent. Periodic check-in questionnaires are disabled until consent is granted.
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = "/trainee/consent"}
                style={{ padding: "0.5rem 1rem", background: "#b91c1c", color: "white", border: "none", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
              >
                Manage Consent in Privacy Settings →
              </button>
            </div>
          )}

          {/* Milestone Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
            {followups.map((fu) => {
              const isDue = fu.status === "Due";
              const isCompleted = fu.status === "Completed";
              const isUpcoming = fu.status === "Upcoming";
              const isDeclined = trainee?.consent?.status === "DECLINED";

              return (
                <div
                  key={fu.id}
                  style={{
                    background: isDue ? "#fffbeb" : "white",
                    borderRadius: "12px",
                    border: isDue ? "2px solid #f59e0b" : "1px solid #e2e8f0",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: isDue ? "0 4px 12px rgba(245,158,11,0.1)" : "none"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                        Milestone
                      </span>
                      <span
                        style={{
                          background: isCompleted ? "#dcfce7" : isDue ? "#fef3c7" : "#f1f5f9",
                          color: isCompleted ? "#15803d" : isDue ? "#b45309" : "#64748b",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 700
                        }}
                      >
                        {fu.status}
                      </span>
                    </div>

                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", color: "#0f172a" }}>
                      {fu.milestone} Check-in
                    </h3>

                    <div style={{ fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                      <Calendar size={14} /> Due Date: {fu.due_date}
                    </div>

                    {fu.notes && (
                      <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.8rem", color: "#475569", background: "#f8fafc", padding: "0.5rem", borderRadius: "6px" }}>
                        {fu.notes}
                      </p>
                    )}
                  </div>

                  <div style={{ marginTop: "1.25rem", borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem" }}>
                    {isCompleted ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#16a34a", fontSize: "0.85rem", fontWeight: 700 }}>
                        <CheckCircle2 size={16} /> Completed on {fu.completed_date}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (isDeclined) {
                            alert("Cannot complete follow-up: consent is currently declined. Please enable consent in Privacy & Consent.");
                            return;
                          }
                          setActiveCheckin(fu);
                        }}
                        disabled={isDeclined}
                        style={{
                          width: "100%",
                          padding: "0.6rem",
                          background: isDeclined ? "#cbd5e1" : (isDue ? "#2563eb" : "#f1f5f9"),
                          color: isDeclined ? "#64748b" : (isDue ? "white" : "#475569"),
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          cursor: isDeclined ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.4rem"
                        }}
                      >
                        <span>{isDeclined ? "Restricted (Consent Declined)" : (isDue ? "Complete Check-in Now" : "Pre-fill Check-in")}</span>
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Outcome Check-in Modal/Drawer (Section 17) */}
          {activeCheckin && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1rem"
            }}>
              <div style={{ background: "white", borderRadius: "14px", maxWidth: "560px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "2rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a" }}>
                      {activeCheckin.milestone} Outcome Check-in
                    </h3>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Outcome-focused career & wage progression assessment</span>
                  </div>
                  <button onClick={() => setActiveCheckin(null)} style={{ background: "none", border: "none", fontSize: "1.2rem", color: "#64748b", cursor: "pointer" }}>✕</button>
                </div>

                <form onSubmit={handleCompleteFollowup}>
                  {/* Step 1: Are you currently working? (Section 18) */}
                  <div style={{ marginBottom: "1.25rem", background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
                      1. Are you currently working?
                    </label>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", color: isWorking ? "#2563eb" : "#475569" }}>
                        <input
                          type="radio"
                          name="isWorking"
                          checked={isWorking}
                          onChange={() => setIsWorking(true)}
                        />
                        Yes, currently working
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", color: !isWorking ? "#b91c1c" : "#475569" }}>
                        <input
                          type="radio"
                          name="isWorking"
                          checked={!isWorking}
                          onChange={() => setIsWorking(false)}
                        />
                        No, not working
                      </label>
                    </div>
                  </div>

                  {/* BRANCH A: IF YES (CURRENTLY WORKING) */}
                  {isWorking && (
                    <>
                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                          Are you with the same employer ({trainee?.employment?.employer_name || "previous employer"})?
                        </label>
                        <select
                          value={sameEmployer ? "yes" : "no"}
                          onChange={(e) => setSameEmployer(e.target.value === "yes")}
                          style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                        >
                          <option value="yes">Yes — Still with {trainee?.employment?.employer_name || "same employer"}</option>
                          <option value="no">No — Changed job to a new employer</option>
                        </select>
                      </div>

                      {!sameEmployer && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem", background: "#f1f5f9", padding: "0.75rem", borderRadius: "6px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                              New Employer Name
                            </label>
                            <input
                              type="text"
                              value={newEmployerName}
                              onChange={(e) => setNewEmployerName(e.target.value)}
                              placeholder="e.g. Wipro Technologies"
                              required={!sameEmployer}
                              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                              New Job Role
                            </label>
                            <input
                              type="text"
                              value={newJobRole}
                              onChange={(e) => setNewJobRole(e.target.value)}
                              placeholder="e.g. Cloud Consultant"
                              required={!sameEmployer}
                              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                            />
                          </div>
                        </div>
                      )}

                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                          Current Monthly Gross Wage (₹)
                        </label>
                        <input
                          type="number"
                          value={checkinWage}
                          onChange={(e) => setCheckinWage(e.target.value)}
                          placeholder="e.g. 26000"
                          required={isWorking}
                          style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                        />
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                          Are the skills from your training useful in your current work?
                        </label>
                        <select
                          value={trainingRelevance}
                          onChange={(e) => setTrainingRelevance(e.target.value)}
                          style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                        >
                          <option value="Yes">Yes — Core skills directly applied daily</option>
                          <option value="Partially">Partially — Some modules useful, others missing</option>
                          <option value="No">No — Job role requires completely different skills</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: "1.25rem" }}>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                          Which skills were missing from your training? (Optional)
                        </label>
                        <input
                          type="text"
                          value={checkinGaps}
                          onChange={(e) => setCheckinGaps(e.target.value)}
                          placeholder="e.g. Docker / Kubernetes / Cloud Lab hands-on"
                          style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                        />
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Feeds curriculum alignment analytics.</span>
                      </div>
                    </>
                  )}

                  {/* BRANCH B: IF NO (NOT WORKING) */}
                  {!isWorking && (
                    <>
                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                          What is the primary reason you are currently not working?
                        </label>
                        <select
                          value={attritionReason}
                          onChange={(e) => setAttritionReason(e.target.value)}
                          style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                        >
                          <option value="Low salary / inadequate compensation">Low salary / inadequate compensation</option>
                          <option value="Relocation / location mismatch">Relocation / location mismatch</option>
                          <option value="Lack of required skills / failed technical assessment">Lack of required skills / failed technical assessment</option>
                          <option value="Family / personal reasons">Family / personal reasons</option>
                          <option value="Company downsized / contract completed">Company downsized / contract completed</option>
                          <option value="Enrolled in higher studies / competitive exams">Enrolled in higher studies / competitive exams</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                          Are you actively seeking placement assistance?
                        </label>
                        <select
                          value={seekingPlacement ? "yes" : "no"}
                          onChange={(e) => setSeekingPlacement(e.target.value === "yes")}
                          style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                        >
                          <option value="yes">Yes — Connect me to state employment drives</option>
                          <option value="no">No — Not actively seeking at this time</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: "1.25rem" }}>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                          Additional notes or support needed:
                        </label>
                        <textarea
                          value={checkinNotes}
                          onChange={(e) => setCheckinNotes(e.target.value)}
                          rows={2}
                          placeholder="Tell us what assistance would help you transition back to employment..."
                          style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                        />
                      </div>
                    </>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
                    <button
                      type="button"
                      onClick={() => setActiveCheckin(null)}
                      style={{ padding: "0.6rem 1.25rem", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{ padding: "0.6rem 1.5rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
                    >
                      {submitting ? "Submitting..." : "Submit Follow-Up Response"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </DataStateWrapper>
      )}
    </div>
  );
}

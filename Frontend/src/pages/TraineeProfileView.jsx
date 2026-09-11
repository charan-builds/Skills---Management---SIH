import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, CheckCircle2, AlertTriangle, Briefcase, GraduationCap,
  Building2, MapPin, Calendar, Banknote, TrendingUp, Target, Award,
  Clock, ArrowRight, UserCheck, AlertCircle, FileText, ChevronRight
} from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function TraineeProfileView() {
  const { traineeId } = useParams();
  const navigate = useNavigate();
  const store = usePlatformStore();

  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadTrainee = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getTraineeById(traineeId);
      if (res.data_available && res.trainee) {
        setTrainee(res.trainee);
        if (res.trainee.timeline_events && res.trainee.timeline_events.length > 0) {
          setSelectedEvent(res.trainee.timeline_events[res.trainee.timeline_events.length - 1]);
        }
      } else {
        throw new Error(`Candidate with ID "${traineeId}" not found in longitudinal registry.`);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainee();
  }, [traineeId, store.last_updated]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "4rem" }}>
      {/* Back Button */}
      <button
        id="back-to-trainees-btn"
        onClick={() => navigate("/admin/trainees")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "white",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          padding: "0.45rem 0.9rem",
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "#334155",
          cursor: "pointer",
          marginBottom: "1.25rem"
        }}
      >
        <ArrowLeft size={16} /> Back to Trainee Directory
      </button>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={trainee}
        onRetry={loadTrainee}
        isDataAvailable={(d) => Boolean(d)}
        isEmptyDetails={`No profile found for ID: ${traineeId}`}
      >
        {trainee && (
          <>
            {/* Header Summary (Section 6) */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.25rem" }}>
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                  <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "12px",
                    background: trainee.gender === "Female" ? "#fce7f3" : "#eff6ff",
                    color: trainee.gender === "Female" ? "#be185d" : "#1d4ed8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: 800
                  }}>
                    {trainee.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.25rem" }}>
                      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        {trainee.name}
                      </h1>
                      <span style={{ fontFamily: "monospace", fontSize: "0.85rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", color: "#475569", fontWeight: 700 }}>
                        {trainee.id}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.85rem", color: "#64748b", alignItems: "center" }}>
                      <span><strong>Programme:</strong> {trainee.programme_name}</span>
                      <span>•</span>
                      <span><strong>Provider:</strong> {trainee.provider_name}</span>
                      <span>•</span>
                      <span><strong>District:</strong> {trainee.district}</span>
                      <span>•</span>
                      <span><strong>Cohort:</strong> {trainee.cohort}</span>
                    </div>

                    {/* Status Badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
                      {/* Training status */}
                      <span style={{
                        background: trainee.training_status === "Completed" ? "#dcfce7" : "#fee2e2",
                        color: trainee.training_status === "Completed" ? "#15803d" : "#b91c1c",
                        padding: "3px 9px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}>
                        {trainee.training_status === "Completed" ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        TRAINING: {trainee.training_status.toUpperCase()}
                      </span>

                      {/* Certification status */}
                      <span style={{
                        background: trainee.certified ? "#eff6ff" : "#f1f5f9",
                        color: trainee.certified ? "#1d4ed8" : "#64748b",
                        padding: "3px 9px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}>
                        <Award size={12} />
                        {trainee.certified ? "CERTIFIED" : "NOT CERTIFIED"}
                      </span>

                      {/* Outcome badge */}
                      <span style={{
                        background: trainee.employment?.status === "EMPLOYED" ? "#dcfce7" : (trainee.employment?.status === "SELF_EMPLOYED" ? "#ccfbf1" : "#fef3c7"),
                        color: trainee.employment?.status === "EMPLOYED" ? "#15803d" : (trainee.employment?.status === "SELF_EMPLOYED" ? "#0f766e" : "#b45309"),
                        padding: "3px 9px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}>
                        <Briefcase size={12} />
                        OUTCOME: {trainee.employment?.status?.replace("_", " ") || "UNEMPLOYED"}
                      </span>

                      {/* Verification status */}
                      <span style={{
                        background: trainee.employment?.verification_status === "Confirmed" ? "#e0e7ff" : "#f1f5f9",
                        color: trainee.employment?.verification_status === "Confirmed" ? "#4338ca" : "#64748b",
                        padding: "3px 9px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}>
                        <Shield size={12} />
                        VERIFICATION: {(trainee.employment?.verification_status || "PENDING").toUpperCase()}
                      </span>

                      {/* Retention badge */}
                      {trainee.retention?.retention_6m && (
                        <span style={{
                          background: trainee.retention.retention_6m === "Retained" ? "#f0fdf4" : "#fff1f2",
                          color: trainee.retention.retention_6m === "Retained" ? "#166534" : "#9f1239",
                          padding: "3px 9px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          border: "1px solid #cbd5e1"
                        }}>
                          6M CHECKPOINT: {trainee.retention.retention_6m.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Privacy Safe Demographics */}
                <div style={{ background: "#f8fafc", padding: "0.85rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.8rem", color: "#475569" }}>
                  <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.3rem" }}>Identity & Privacy Level</div>
                  <div>Masked Email: <span style={{ fontFamily: "monospace" }}>{trainee.masked_email || trainee.email}</span></div>
                  <div>Masked Phone: <span style={{ fontFamily: "monospace" }}>{trainee.masked_phone || trainee.phone}</span></div>
                  <div>Demographics: {trainee.gender} • {trainee.category} • Age {trainee.age}</div>
                  <div>District: {trainee.district} (State Protected Registry)</div>
                </div>
              </div>
            </div>

            {/* Trainee Outcome Summary Matrix (Section 14) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Training Course</span>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: trainee.training_status === "Completed" ? "#15803d" : "#b91c1c", marginTop: "0.2rem" }}>
                  {trainee.training_status === "Completed" ? "✓ Completed" : "✗ Dropped Out"}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Score: {trainee.assessment_score}%</span>
              </div>

              <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Certification</span>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: trainee.certified ? "#1d4ed8" : "#64748b", marginTop: "0.2rem" }}>
                  {trainee.certified ? "✓ Certified" : "Uncertified"}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>ID: {trainee.certificate_id || "None"}</span>
              </div>

              <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>First Outcome</span>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
                  {trainee.outcome_summary?.first_outcome || "Employed"}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Placement Checkpoint</span>
              </div>

              <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Current Outcome</span>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
                  {trainee.outcome_summary?.current_outcome || "Employed"}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 600 }}>Verified Active</span>
              </div>

              <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>6M Retention</span>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: trainee.retention?.retention_6m === "Retained" ? "#15803d" : "#b91c1c", marginTop: "0.2rem" }}>
                  {trainee.retention?.retention_6m === "Retained" ? "✓ 6M Retained" : "Left Employment"}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Telemetry Confirmed</span>
              </div>

              <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Wage Progression</span>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
                  {trainee.wage_metrics?.current_wage > 0 ? `₹${trainee.wage_metrics.initial_wage.toLocaleString()} → ₹${trainee.wage_metrics.current_wage.toLocaleString()}` : "No wage recorded"}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 700 }}>
                  {trainee.wage_metrics?.growth_percentage > 0 ? `+${trainee.wage_metrics.growth_percentage}% Increment` : "Baseline"}
                </span>
              </div>

              <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Skill Relevance</span>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2563eb", marginTop: "0.2rem" }}>
                  {trainee.outcome_summary?.skill_relevance || "Partially Relevant"}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Rating: {trainee.training_relevance_rating}/5</span>
              </div>

              <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Attention Area</span>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: trainee.outcome_summary?.attention_area?.includes("Deficiency") ? "#b45309" : "#334155", marginTop: "0.2rem" }}>
                  {trainee.outcome_summary?.attention_area || "None (Optimal)"}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Diagnostic Flag</span>
              </div>
            </div>

            {/* Visual Longitudinal Timeline (Section 7) */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Clock size={18} color="#2563eb" /> Longitudinal Journey Timeline
                  </h3>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Click any milestone event along the candidate's journey to inspect chronological telemetry and records.
                  </p>
                </div>
                <span style={{ fontSize: "0.75rem", background: "#eff6ff", color: "#1d4ed8", padding: "4px 9px", borderRadius: "6px", fontWeight: 700 }}>
                  Interactive Timeline
                </span>
              </div>

              {/* Timeline Sequence Nodes */}
              <div style={{ display: "flex", overflowX: "auto", paddingBottom: "1rem", gap: "0.75rem", alignItems: "stretch" }}>
                {(trainee.timeline_events || []).map((ev, idx) => {
                  const isSelected = selectedEvent?.id === ev.id;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      style={{
                        minWidth: "170px",
                        flex: "1 1 0",
                        background: isSelected ? "#eff6ff" : "#f8fafc",
                        border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        borderRadius: "10px",
                        padding: "1rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: isSelected ? "#2563eb" : "#64748b", textTransform: "uppercase" }}>
                            Stage {idx + 1}
                          </span>
                          <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{ev.date}</span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#0f172a", marginBottom: "0.25rem" }}>
                          {ev.stage}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#475569", lineHeight: 1.3 }}>
                          {ev.title}
                        </div>
                      </div>

                      <div style={{ marginTop: "0.75rem" }}>
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: ev.status === "Completed" || ev.status === "Retained" || ev.status === "Verified" ? "#dcfce7" : (ev.status === "Attrited" || ev.status === "Discontinued" ? "#fee2e2" : "#f1f5f9"),
                          color: ev.status === "Completed" || ev.status === "Retained" || ev.status === "Verified" ? "#15803d" : (ev.status === "Attrited" || ev.status === "Discontinued" ? "#b91c1c" : "#475569")
                        }}>
                          {ev.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Event Details Card */}
              {selectedEvent && (
                <div style={{ marginTop: "1rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #cbd5e1", padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                        EVENT DETAILS • {selectedEvent.stage} ({selectedEvent.date})
                      </span>
                      <h4 style={{ margin: "0.2rem 0 0 0", fontSize: "1.1rem", color: "#0f172a" }}>
                        {selectedEvent.title}
                      </h4>
                    </div>
                    <span style={{ fontSize: "0.8rem", background: "#e2e8f0", padding: "3px 8px", borderRadius: "6px", fontWeight: 700, color: "#334155" }}>
                      Status: {selectedEvent.status}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.85rem", color: "#475569" }}>
                    {selectedEvent.description}
                  </p>

                  {selectedEvent.details && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", background: "white", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.8rem" }}>
                      {Object.entries(selectedEvent.details).map(([k, v]) => (
                        <div key={k}>
                          <span style={{ color: "#64748b", textTransform: "capitalize" }}>{k.replace("_", " ")}: </span>
                          <strong style={{ color: "#0f172a" }}>{v}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Grid 1: Last 6 Months & Multi-Job Employment History (Section 8 & 9) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
              {/* Last 6 Months Activity Stream (Section 8) */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Calendar size={18} color="#2563eb" /> Last 6 Months Activity
                    </h3>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                      Chronological log of recent verification events and telemetry updates.
                    </p>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Recent Activity</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {(trainee.last_6_months_activity || []).map((act, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", paddingBottom: "0.75rem", borderBottom: idx < trainee.last_6_months_activity.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <div style={{
                        minWidth: "65px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#2563eb",
                        fontFamily: "monospace",
                        marginTop: "2px"
                      }}>
                        {act.date}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>
                          {act.title}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "2px" }}>
                          {act.description}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!trainee.last_6_months_activity || trainee.last_6_months_activity.length === 0) && (
                    <div style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center", padding: "1rem" }}>
                      No activity recorded in the last 6 months.
                    </div>
                  )}
                </div>
              </div>

              {/* Employment History / Career Sequence (Section 9) */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Briefcase size={18} color="#16a34a" /> Employment History & Career Progression
                    </h3>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                      Sequential employment history, promotions, and role transitions.
                    </p>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700 }}>
                    {trainee.job_history?.length || 1} Role{(trainee.job_history?.length || 1) > 1 ? "s" : ""} Recorded
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {(trainee.job_history || []).map((job) => (
                    <div key={job.sequence} style={{ background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span style={{ background: "#e2e8f0", color: "#334155", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 800 }}>
                              JOB {job.sequence}
                            </span>
                            <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{job.employer}</strong>
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "2px" }}>
                            Role: <strong>{job.role}</strong> • {job.employment_type}
                          </div>
                        </div>

                        <span style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: "4px",
                          background: job.status === "Current" ? "#dcfce7" : "#f1f5f9",
                          color: job.status === "Current" ? "#15803d" : "#475569"
                        }}>
                          {job.status}
                        </span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", fontSize: "0.75rem", marginTop: "0.6rem", borderTop: "1px solid #e2e8f0", paddingTop: "0.6rem" }}>
                        <div>
                          <span style={{ color: "#64748b" }}>Tenure: </span>
                          <span style={{ fontWeight: 600 }}>{job.joining_date} → {job.leaving_date || "Present"}</span>
                        </div>
                        <div>
                          <span style={{ color: "#64748b" }}>Wage: </span>
                          <span style={{ fontWeight: 700, color: "#16a34a" }}>
                            {job.latest_wage > 0 ? `₹${job.wage_at_joining.toLocaleString()} → ₹${job.latest_wage.toLocaleString()}` : "N/A"}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: "#64748b" }}>Verification: </span>
                          <span style={{ fontWeight: 600, color: "#2563eb" }}>{job.verification_status}</span>
                        </div>
                      </div>

                      {job.leaving_reason && (
                        <div style={{ marginTop: "0.4rem", fontSize: "0.75rem", color: "#b91c1c", background: "#fef2f2", padding: "4px 8px", borderRadius: "4px" }}>
                          <strong>Exit Reason:</strong> {job.leaving_reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid 2: Income Progression Chart & Retention/Follow-ups (Section 10 & 11 & 12) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
              {/* Income / Wage Progression (Section 10) */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Banknote size={18} color="#16a34a" /> Income & Wage Trajectory
                    </h3>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                      Longitudinal compensation progression across milestone checkpoints.
                    </p>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700 }}>
                    {trainee.wage_metrics?.growth_percentage > 0 ? `+${trainee.wage_metrics.growth_percentage}% Total Growth` : "Base CTC"}
                  </span>
                </div>

                {/* Headline Wage Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ background: "#f8fafc", padding: "0.6rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Initial Wage</span>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a" }}>
                      {trainee.wage_metrics?.initial_wage > 0 ? `₹${trainee.wage_metrics.initial_wage.toLocaleString()}` : "N/A"}
                    </div>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "0.6rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Current Wage</span>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#16a34a" }}>
                      {trainee.wage_metrics?.current_wage > 0 ? `₹${trainee.wage_metrics.current_wage.toLocaleString()}` : "N/A"}
                    </div>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "0.6rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Abs. Increase</span>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#2563eb" }}>
                      {trainee.wage_metrics?.wage_increase > 0 ? `+₹${trainee.wage_metrics.wage_increase.toLocaleString()}` : "₹0"}
                    </div>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "0.6rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Growth %</span>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#16a34a" }}>
                      {trainee.wage_metrics?.growth_percentage > 0 ? `+${trainee.wage_metrics.growth_percentage}%` : "0%"}
                    </div>
                  </div>
                </div>

                {/* Line Chart */}
                {trainee.wage_history && trainee.wage_history.length > 0 ? (
                  <div style={{ height: "200px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trainee.wage_history} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v/1000}k`} />
                        <Tooltip
                          formatter={(v) => [`₹${v.toLocaleString()}`, "Monthly Salary"]}
                          contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#16a34a"
                          strokeWidth={2.5}
                          dot={{ r: 5, fill: "#16a34a" }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem", background: "#f8fafc", borderRadius: "8px" }}>
                    No wage data available (Candidate is unplaced or pursuing competitive education).
                  </div>
                )}
              </div>

              {/* Follow-up & Retention History (Section 11 & 12) */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <UserCheck size={18} color="#2563eb" /> Follow-Up & Retention Verification
                    </h3>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                      3M, 6M, and 12M verification records, job stability, and comments.
                    </p>
                  </div>
                  <span style={{ fontSize: "0.75rem", background: "#f0fdf4", color: "#166534", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                    Government Oversight
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {(trainee.follow_ups || []).map((fu) => (
                    <div key={fu.id} style={{ background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "0.85rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                        <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>{fu.milestone} Evaluation</strong>
                        <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Due: {fu.due_date} • Completed: {fu.completed_date}</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#334155", marginTop: "2px" }}>
                        Status: <span style={{ color: "#16a34a", fontWeight: 700 }}>{fu.status}</span> • Notes: {fu.notes}
                      </div>
                    </div>
                  ))}

                  {/* Retention Exit Reason Breakdown if Left */}
                  {trainee.retention?.retention_6m === "Left Employment" && (
                    <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", padding: "0.85rem", marginTop: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#9f1239", fontWeight: 700, fontSize: "0.8rem" }}>
                        <AlertTriangle size={14} /> Attrition / Departure Diagnosis
                      </div>
                      <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#881337" }}>
                        Candidate departed initial corporate placement. Recorded driver: <strong>{trainee.employment?.attrition_reason || "Low initial compensation"}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills & Competency Matrix (Section 13) */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Target size={18} color="#2563eb" /> Skills & Competency Evaluation
                  </h3>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Taught skills vs proficiency observed vs employer relevance and reported skill gaps.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                    {trainee.reported_skill_gaps?.length || 0} Reported Deficit{(trainee.reported_skill_gaps?.length || 0) > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Skills Classification Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                {/* Taught */}
                <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>Skills Taught</span>
                  <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.2rem", fontSize: "0.8rem", color: "#1e293b" }}>
                    {(trainee.skills_detail?.skills_taught || trainee.skills || []).map(s => (
                      <li key={s} style={{ marginBottom: "0.25rem" }}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Used */}
                <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#16a34a", textTransform: "uppercase" }}>Skills Used in Job</span>
                  <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.2rem", fontSize: "0.8rem", color: "#1e293b" }}>
                    {(trainee.skills_detail?.skills_used || []).length > 0 ? (
                      trainee.skills_detail.skills_used.map(s => (
                        <li key={s} style={{ marginBottom: "0.25rem" }}>{s}</li>
                      ))
                    ) : (
                      <li style={{ color: "#94a3b8" }}>N/A (Unplaced)</li>
                    )}
                  </ul>
                </div>

                {/* Relevant */}
                <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>Skills Relevant</span>
                  <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.2rem", fontSize: "0.8rem", color: "#1e293b" }}>
                    {(trainee.skills_detail?.skills_relevant || []).length > 0 ? (
                      trainee.skills_detail.skills_relevant.map(s => (
                        <li key={s} style={{ marginBottom: "0.25rem" }}>{s}</li>
                      ))
                    ) : (
                      <li style={{ color: "#94a3b8" }}>Zero full match</li>
                    )}
                  </ul>
                </div>

                {/* Gaps */}
                <div style={{ background: "#fffbeb", padding: "1rem", borderRadius: "8px", border: "1px solid #fde68a" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#b45309", textTransform: "uppercase" }}>Missing Competencies</span>
                  <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.2rem", fontSize: "0.8rem", color: "#92400e" }}>
                    {(trainee.reported_skill_gaps || []).length > 0 ? (
                      trainee.reported_skill_gaps.map(g => (
                        <li key={g} style={{ marginBottom: "0.25rem" }}><strong>{g}</strong></li>
                      ))
                    ) : (
                      <li style={{ color: "#16a34a" }}>No skill gaps reported</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Detailed Competency Assessment Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #cbd5e1" }}>
                      <th style={{ padding: "0.6rem 1rem", fontWeight: 700 }}>Curriculum Competency</th>
                      <th style={{ padding: "0.6rem 1rem", fontWeight: 700 }}>Target Proficiency</th>
                      <th style={{ padding: "0.6rem 1rem", fontWeight: 700 }}>Observed Score</th>
                      <th style={{ padding: "0.6rem 1rem", fontWeight: 700 }}>Status</th>
                      <th style={{ padding: "0.6rem 1rem", fontWeight: 700 }}>Employer Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(trainee.skills_detail?.competency_matrix || []).map((cm) => (
                      <tr key={cm.skill} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "0.65rem 1rem", fontWeight: 600, color: "#0f172a" }}>{cm.skill}</td>
                        <td style={{ padding: "0.65rem 1rem", color: "#64748b" }}>{cm.target_proficiency}%</td>
                        <td style={{ padding: "0.65rem 1rem", fontWeight: 700, color: cm.status === "Deficit" ? "#b91c1c" : "#15803d" }}>
                          {cm.observed_proficiency}%
                        </td>
                        <td style={{ padding: "0.65rem 1rem" }}>
                          <span style={{
                            padding: "2px 7px",
                            borderRadius: "4px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            background: cm.status === "Deficit" ? "#fee2e2" : "#dcfce7",
                            color: cm.status === "Deficit" ? "#b91c1c" : "#15803d"
                          }}>
                            {cm.status}
                          </span>
                        </td>
                        <td style={{ padding: "0.65rem 1rem", color: cm.employer_relevance.includes("Urgency") ? "#b45309" : "#475569", fontWeight: 600 }}>
                          {cm.employer_relevance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </DataStateWrapper>
    </div>
  );
}

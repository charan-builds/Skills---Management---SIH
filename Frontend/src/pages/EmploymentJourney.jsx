import { useState, useEffect } from "react";
import { 
  Milestone, Calendar, Building2, Briefcase, TrendingUp, 
  CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck, 
  ChevronRight, Info, FileText 
} from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function EmploymentJourney() {
  const store = usePlatformStore();
  const traineeId = localStorage.getItem("traineeId") || "TR-0001";

  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await platformService.getTraineeProfile(traineeId);
      setTrainee(res.trainee);
      // Select latest event by default
      if (res.trainee?.timeline_events && res.trainee.timeline_events.length > 0) {
        setSelectedEvent(res.trainee.timeline_events[res.trainee.timeline_events.length - 1]);
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

  const timelineEvents = trainee?.timeline_events || [];
  const last6Months = trainee?.last_6_months_activity || [];
  const jobHistory = trainee?.job_history || [];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <Milestone size={20} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            LONGITUDINAL CAREER TRACKING
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          My Employment Journey
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Complete chronological trajectory from skilling enrollment to workplace milestones, employer confirmations, and wage progression.
        </p>
      </div>

      <DataStateWrapper
        isLoading={loading}
        data={trainee}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d && d.timeline_events)}
        isEmptyDetails="No employment journey timeline recorded."
      >
        {/* SECTION 1: PROMINENT LAST 6 MONTHS ACTIVITY FEED (Section 13) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.2rem 0" }}>
                Last 6 Months Activity Log
              </h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                Real-time chronological events, verifications, increments, and follow-ups recorded in the outcome database.
              </p>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "20px" }}>
              Active Outcome Telemetry
            </span>
          </div>

          {last6Months.length === 0 ? (
            <p style={{ color: "#94a3b8", fontStyle: "italic", margin: 0 }}>No recent activity within the past 6 months.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
              {last6Months.map((act, idx) => (
                <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
                      {act.date}
                    </span>
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: act.type === "wage" ? "#dcfce7" : act.type === "verification" ? "#eff6ff" : "#fef3c7",
                      color: act.type === "wage" ? "#15803d" : act.type === "verification" ? "#1d4ed8" : "#b45309"
                    }}>
                      {act.type}
                    </span>
                  </div>
                  <strong style={{ fontSize: "0.9rem", color: "#0f172a", display: "block", marginBottom: "0.25rem" }}>
                    {act.title}
                  </strong>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569", lineHeight: 1.4 }}>
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: COMPLETE INTERACTIVE LONGITUDINAL TIMELINE (Section 12) */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2rem", marginBottom: "2rem", alignItems: "flex-start" }}>
          
          {/* Left: Interactive Timeline Spine */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0" }}>
              Longitudinal Career Journey
            </h3>
            <p style={{ margin: "0 0 1.5rem 0", fontSize: "0.85rem", color: "#64748b" }}>
              Click any milestone event to inspect verifiable employment coordinates and telemetry.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative" }}>
              {timelineEvents.map((evt, i) => {
                const isSelected = selectedEvent?.id === evt.id;
                return (
                  <div
                    key={evt.id || i}
                    onClick={() => setSelectedEvent(evt)}
                    style={{
                      display: "flex",
                      gap: "1rem",
                      padding: "1rem",
                      borderRadius: "10px",
                      border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                      background: isSelected ? "#eff6ff" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: isSelected ? "#2563eb" : "#f1f5f9",
                        color: isSelected ? "white" : "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.85rem",
                        fontWeight: 700
                      }}>
                        {i + 1}
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.2rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                          {evt.stage}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {evt.date}
                        </span>
                      </div>

                      <strong style={{ fontSize: "0.95rem", color: "#0f172a", display: "block", marginBottom: "0.2rem" }}>
                        {evt.title}
                      </strong>

                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569", lineHeight: 1.4 }}>
                        {evt.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                      <ChevronRight size={18} color={isSelected ? "#2563eb" : "#cbd5e1"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Milestone Dossier Inspector */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", position: "sticky", top: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <FileText size={18} color="#2563eb" />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                Milestone Event Inspector
              </span>
            </div>

            {selectedEvent ? (
              <div>
                <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.3rem", color: "#0f172a" }}>
                  {selectedEvent.title}
                </h4>
                <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
                  Date of Event: <strong>{selectedEvent.date}</strong> | Stage: <strong>{selectedEvent.stage}</strong>
                </div>

                <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1.25rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Summary Description</span>
                  <p style={{ margin: "0.3rem 0 0 0", fontSize: "0.85rem", color: "#334155", lineHeight: 1.5 }}>
                    {selectedEvent.description}
                  </p>
                </div>

                <h5 style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#0f172a", textTransform: "uppercase" }}>
                  Verified Event Telemetry:
                </h5>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {selectedEvent.details && Object.entries(selectedEvent.details).map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "0.8rem" }}>
                      <span style={{ color: "#64748b", textTransform: "capitalize" }}>{k.replace("_", " ")}:</span>
                      <strong style={{ color: "#0f172a" }}>{String(v)}</strong>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "1.25rem", padding: "0.75rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#166534" }}>
                  <ShieldCheck size={16} /> Verified outcome event linked to trainee ID {trainee.id}
                </div>
              </div>
            ) : (
              <p style={{ color: "#94a3b8" }}>Select an event on the left to view details.</p>
            )}
          </div>

        </div>

        {/* SECTION 3: MULTI-JOB PROGRESSION CARDS (Section 39) */}
        {jobHistory.length > 0 && (
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0" }}>
              Employment History & Roles
            </h3>
            <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.85rem", color: "#64748b" }}>
              Sequential job roles recorded during post-training tracking.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
              {jobHistory.map((job, idx) => (
                <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", background: job.status === "Current" ? "#f0fdf4" : "#f8fafc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>ROLE #{job.sequence}</span>
                      <h4 style={{ margin: "0.2rem 0", fontSize: "1rem", color: "#0f172a" }}>{job.role}</h4>
                      <strong style={{ color: "#2563eb", fontSize: "0.85rem" }}>{job.employer}</strong>
                    </div>

                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: job.status === "Current" ? "#dcfce7" : "#e2e8f0",
                      color: job.status === "Current" ? "#15803d" : "#475569"
                    }}>
                      {job.status}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "0.75rem", lineHeight: 1.6 }}>
                    <div>Tenure: <strong>{job.joining_date}</strong> {job.leaving_date ? `to ${job.leaving_date}` : "(Present)"}</div>
                    <div>Compensation: <strong>₹{Number(job.latest_wage).toLocaleString()} / month</strong></div>
                    {job.leaving_reason && (
                      <div style={{ color: "#b91c1c", marginTop: "0.25rem" }}>
                        Reason for departure: {job.leaving_reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </DataStateWrapper>
    </div>
  );
}

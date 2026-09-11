import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  BriefcaseBusiness,
  GraduationCap,
  CheckCircle2,
  Clock3,
  MapPin,
  Mail,
  Phone,
  Award,
  Building2,
} from "lucide-react";



function TraineeProfile() {
  const navigate = useNavigate();
  const { traineeId } = useParams();

  const [trainee, setTrainee] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);

    fetchAuth(`${API_BASE}/api/trainees/${traineeId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data || !data.id) throw new Error("Invalid record returned");
        setTrainee(data);
        setTimeline(Array.isArray(data.outcomes_timeline) ? data.outcomes_timeline : []);

        return fetchAuth(`${API_BASE}/api/trainees/${traineeId}/follow-ups`)
          .then((fuRes) => (fuRes && fuRes.ok ? fuRes.json() : []))
          .then((fuData) => {
            setFollowups(Array.isArray(fuData) ? fuData : []);
            setLoading(false);
          })
          .catch(() => { setFollowups([]); setLoading(false); });
      })
      .catch((err) => {
        console.error("Error loading trainee profile:", err);
        setFetchError(err.message);
        setTrainee(null);
        setLoading(false);
      });
  }, [traineeId]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header" style={{ textAlign: "center", padding: "3rem" }}>
          <Clock3 size={32} style={{ color: "#2563eb", marginBottom: "1rem" }} />
          <h2>Loading Trainee Profile...</h2>
          <p style={{ color: "#64748b" }}>Retrieving longitudinal records for {traineeId}</p>
        </div>
      </div>
    );
  }

  if (!trainee || !trainee.id) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <button className="back-button" onClick={() => navigate("/trainees")}>
            ← Back to Trainees
          </button>
          <p className="page-label">TRAINEE PROFILE</p>
          <h1 style={{ color: "#dc2626" }}>Trainee Record Not Found</h1>
          <p className="page-description">
            No active record was found for ID: <strong>{traineeId}</strong>.
            {fetchError && <span style={{ display: "block", color: "#64748b" }}>Detail: {fetchError}</span>}
          </p>
        </div>
      </div>
    );
  }

  const skillsList = Array.isArray(trainee.skills)
    ? trainee.skills.map(s => (typeof s === 'string' ? s : (s.name || s.skill_name || '')))
    : [];

  const certsList = Array.isArray(trainee.certifications) ? trainee.certifications : [];

  const latestEmployment = Array.isArray(trainee.employment_history) && trainee.employment_history.length > 0
    ? trainee.employment_history[trainee.employment_history.length - 1]
    : null;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <button className="back-button" onClick={() => navigate("/trainees")}>
            ← Back to Trainees
          </button>
          <p className="page-label">TRAINEE PROFILE & OUTCOMES AUDIT</p>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0 }}>{trainee.name}</h1>
            <span style={{
              background: trainee.outcome === "Employed" || trainee.status === "Placed" ? "#dcfce7" : "#eff6ff",
              color: trainee.outcome === "Employed" || trainee.status === "Placed" ? "#15803d" : "#1d4ed8",
              padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700
            }}>
              {trainee.outcome === "Employed" ? "Employed / Placed" : (trainee.status || "Certified")}
            </span>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem", color: "#64748b", fontSize: "0.875rem", flexWrap: "wrap" }}>
            {trainee.district && <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><MapPin size={14} /> {trainee.district}</span>}
            {trainee.email && <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><Mail size={14} /> {trainee.email}</span>}
            {trainee.phone && <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><Phone size={14} /> {trainee.phone}</span>}
          </div>
        </div>
      </div>

      {/* Basic Information Cards */}
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-icon"><User size={21} /></div>
          <div>
            <span>Trainee ID</span>
            <strong>{trainee.id}</strong>
          </div>
        </div>
        <div className="profile-card">
          <div className="profile-card-icon"><GraduationCap size={21} /></div>
          <div>
            <span>Programme</span>
            <strong>{trainee.course_name || trainee.programme || "Skilling Programme"}</strong>
          </div>
        </div>
        <div className="profile-card">
          <div className="profile-card-icon"><BriefcaseBusiness size={21} /></div>
          <div>
            <span>Current Outcome</span>
            <strong>{trainee.outcome || trainee.status || "In Training"}</strong>
          </div>
        </div>
      </div>

      {/* Skills & Certifications */}
      <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <p className="page-label" style={{ margin: 0 }}>COMPETENCIES</p>
            <h3 style={{ margin: "0.25rem 0 0 0", fontSize: "1.1rem" }}>Verified Skills & Certifications</h3>
          </div>
          {trainee.attendance != null && (
            <span style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}>
              Attendance: <strong style={{ color: trainee.attendance >= 75 ? "#16a34a" : "#dc2626" }}>{trainee.attendance}%</strong>
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {skillsList.length > 0 ? skillsList.map((skill, idx) => (
            <span key={idx} style={{ background: "#f1f5f9", color: "#1e293b", padding: "6px 12px", borderRadius: "6px", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <CheckCircle2 size={12} style={{ color: "#16a34a" }} /> {skill}
            </span>
          )) : (
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>No skills recorded yet.</p>
          )}
        </div>

        {certsList.length > 0 && (
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
            <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.88rem", color: "#475569", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Award size={15} style={{ color: "#2563eb" }} /> Issued Certifications
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {certsList.map((c, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.85rem" }}>
                  <div>
                    <strong style={{ color: "#0f172a" }}>{c.name}</strong>
                    <span style={{ display: "block", color: "#64748b", fontSize: "0.75rem" }}>{c.issuing_body || "Skill Mission Authority"}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.75rem" }}>{c.status || "Verified"}</span>
                    <span style={{ display: "block", color: "#94a3b8", fontSize: "0.75rem" }}>{c.date || c.issue_date || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Employment Record */}
      {latestEmployment && (
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "12px", border: "1px solid #bbf7d0", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Building2 size={20} style={{ color: "#16a34a" }} />
            <div>
              <p className="page-label" style={{ margin: 0 }}>ACTIVE PLACEMENT RECORD</p>
              <h3 style={{ margin: "0.25rem 0 0 0", fontSize: "1.1rem" }}>Verified Employment</h3>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", background: "#f0fdf4", padding: "1rem", borderRadius: "8px" }}>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>Employer</span>
              <strong style={{ color: "#0f172a" }}>{latestEmployment.employer_name || latestEmployment.employer || "Private Sector Partner"}</strong>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>Role</span>
              <strong style={{ color: "#0f172a" }}>{latestEmployment.role || "Specialist"}</strong>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>Salary</span>
              <strong style={{ color: "#16a34a" }}>
                {latestEmployment.salary
                  ? (Number(latestEmployment.salary) > 100000
                    ? `₹${(Number(latestEmployment.salary) / 100000).toFixed(1)} LPA`
                    : `₹${Number(latestEmployment.salary).toLocaleString()}/mo`)
                  : "Competitive"}
              </strong>
            </div>
            <div>
              <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b" }}>Verification</span>
              <span style={{ display: "inline-block", marginTop: "2px", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700 }}>
                {latestEmployment.verification_state || "EMPLOYER_VERIFIED"}
              </span>
            </div>
          </div>
          {latestEmployment.employer_remarks && (
            <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#475569", fontStyle: "italic" }}>"{latestEmployment.employer_remarks}"</p>
          )}
        </div>
      )}

      {/* Follow-Ups */}
      <div className="profile-section">
        <div className="profile-section-header">
          <div>
            <p className="page-label">FOLLOW-UPS</p>
            <h2>Escalation & Tracking</h2>
          </div>
        </div>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Status</th>
                <th>Triggered At</th>
                <th>Next Due</th>
                <th>Resolved At</th>
              </tr>
            </thead>
            <tbody>
              {followups.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                    No follow-ups recorded for this trainee.
                  </td>
                </tr>
              ) : (
                followups.map((fu) => (
                  <tr key={fu.id || fu.triggered_at}>
                    <td><strong>{fu.current_stage || fu.stage || "DAY_0"}</strong></td>
                    <td>
                      <span className={`status-badge ${fu.status === "RESOLVED" ? "success" : fu.status === "UNRESOLVED" ? "error" : "warning"}`}>
                        {fu.status}
                      </span>
                    </td>
                    <td>{fu.triggered_at ? new Date(fu.triggered_at).toLocaleDateString() : "-"}</td>
                    <td>{fu.next_due_at ? new Date(fu.next_due_at).toLocaleDateString() : "-"}</td>
                    <td>{fu.resolved_at ? new Date(fu.resolved_at).toLocaleDateString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Longitudinal Timeline */}
      <div className="profile-section">
        <div className="profile-section-header">
          <div>
            <p className="page-label">LONGITUDINAL TIMELINE</p>
            <h2>Training → Employment Journey</h2>
          </div>
          <span className="status-badge success">
            <CheckCircle2 size={13} />
            {timeline.length} Milestone{timeline.length !== 1 ? "s" : ""} Recorded
          </span>
        </div>
        <div className="profile-timeline">
          {timeline.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
              No longitudinal checkpoints recorded yet.
            </div>
          ) : (
            timeline.map((item, index) => (
              <div className="timeline-item" key={item.checkpoint + index}>
                <div className="timeline-marker">
                  {index === timeline.length - 1
                    ? <CheckCircle2 size={17} />
                    : <Clock3 size={17} />}
                </div>
                <div className="timeline-content">
                  <div className="timeline-top">
                    <strong>{item.checkpoint}</strong>
                    <span>
                      {item.date
                        ? new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
                        : "Recent"}
                    </span>
                  </div>
                  <span className="timeline-status">{item.status || "Recorded"}</span>
                  <p>{item.description || "Milestone completed."}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TraineeProfile;

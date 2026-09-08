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
} from "lucide-react";



function TraineeProfile() {
  const navigate = useNavigate();
  const { traineeId } = useParams();

  const [trainee, setTrainee] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuth(`${API_BASE}/api/trainees/${traineeId}`)
      .then((res) => res.json())
      .then((data) => {
        setTrainee(data);
        setTimeline(data.outcomes_timeline || []);
        return fetchAuth(`${API_BASE}/api/trainees/${traineeId}/follow-ups`);
      })
      .then((res) => res.json())
      .then((fuData) => {
        setFollowups(fuData || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [traineeId]);

  if (loading) {
    return <div className="dashboard"><div className="dashboard-header"><h1>Loading...</h1></div></div>;
  }

  if (!trainee) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <button
            className="back-button"
            onClick={() => navigate("/trainees")}
          >
            ← Back to Trainees
          </button>

          <p className="page-label">TRAINEE PROFILE</p>

          <h1>Trainee not found</h1>

          <p className="page-description">
            No trainee exists for ID: {traineeId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <button
            className="back-button"
            onClick={() => navigate("/trainees")}
          >
            ← Back to Trainees
          </button>

          <p className="page-label">TRAINEE PROFILE</p>

          <h1>{trainee.name}</h1>

          <p className="page-description">
            Longitudinal training and employment outcome profile.
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-icon">
            <User size={21} />
          </div>

          <div>
            <span>Trainee ID</span>
            <strong>{trainee.id}</strong>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-icon">
            <GraduationCap size={21} />
          </div>

          <div>
            <span>Programme</span>
            <strong>{trainee.course_name}</strong>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-icon">
            <BriefcaseBusiness size={21} />
          </div>

          <div>
            <span>Current Outcome</span>
            <strong>{trainee.outcome}</strong>
          </div>
        </div>
      </div>

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
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                    No follow-ups recorded.
                  </td>
                </tr>
              ) : (
                followups.map((fu) => (
                  <tr key={fu.id}>
                    <td><strong>{fu.current_stage}</strong></td>
                    <td>
                      <span className={`status-badge ${fu.status === "RESOLVED" ? "success" : fu.status === "UNRESOLVED" ? "error" : "warning"}`}>
                        {fu.status}
                      </span>
                    </td>
                    <td>{new Date(fu.triggered_at).toLocaleDateString()}</td>
                    <td>{fu.next_due_at ? new Date(fu.next_due_at).toLocaleDateString() : "-"}</td>
                    <td>{fu.resolved_at ? new Date(fu.resolved_at).toLocaleDateString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline */}
      <div className="profile-section">
        <div className="profile-section-header">
          <div>
            <p className="page-label">LONGITUDINAL TIMELINE</p>

            <h2>Training → Employment</h2>
          </div>

          <span className="status-badge success">
            <CheckCircle2 size={13} />
            Outcome Recorded
          </span>
        </div>

        <div className="profile-timeline">
          {timeline.map((item, index) => (
            <div
              className="timeline-item"
              key={item.checkpoint}
            >
              <div className="timeline-marker">
                {index === timeline.length - 1 ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <Clock3 size={17} />
                )}
              </div>

              <div className="timeline-content">
                <div className="timeline-top">
                  <strong>{item.checkpoint}</strong>

                  <span>
                    {new Date(item.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>

                <span className="timeline-status">
                  {item.status}
                </span>

                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TraineeProfile;

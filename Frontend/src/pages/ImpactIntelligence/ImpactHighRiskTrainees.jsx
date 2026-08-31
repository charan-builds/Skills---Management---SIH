import React from "react";
import { AlertOctagon } from "lucide-react";
import { Link } from "react-router-dom";

export default function ImpactHighRiskTrainees({ traineesData }) {
  if (!traineesData || traineesData.length === 0) return null;

  // Filter trainees that have no employment history and have a low assessment average (or just unemployed)
  const highRisk = traineesData.filter(t => {
    const isEmployed = t.employment_history && t.employment_history.length > 0;
    // For demo purposes, we define high-risk as not employed and having some data
    return !isEmployed;
  }).slice(0, 4);

  if (highRisk.length === 0) {
    return (
      <div className="impact-card">
        <h2><AlertOctagon size={20} /> High-Risk Trainees</h2>
        <p style={{color: "#64748b"}}>No high-risk trainees identified.</p>
      </div>
    );
  }

  return (
    <div className="impact-card">
      <h2><AlertOctagon size={20} /> High-Risk Trainees</h2>
      
      <div className="risk-list">
        {highRisk.map(t => (
          <div key={t.id} className="risk-row">
            <div className="risk-info">
              <strong>{t.name || t.id}</strong>
              <span>Unemployed post-programme</span>
            </div>
            <Link to={`/trainees/${t.id}`} className="status-badge critical" style={{textDecoration: "none"}}>
              View Profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

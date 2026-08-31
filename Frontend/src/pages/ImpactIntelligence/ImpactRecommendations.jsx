import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function ImpactRecommendations({ decisionEngineData }) {
  let recommendations = [];
  
  if (decisionEngineData && decisionEngineData.recommendations) {
    recommendations = decisionEngineData.recommendations.slice(0, 3);
  }

  return (
    <div className="impact-card">
      <h2><CheckCircle2 size={20} /> Recommended Actions</h2>
      
      {recommendations.length === 0 ? (
        <p style={{color: "#64748b"}}>No urgent recommendations at this time.</p>
      ) : (
        <div className="rec-list">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="rec-item">
              <h4>{rec.title}</h4>
              <p>{rec.description}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{marginTop: "1.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem"}}>
        <p style={{fontSize: "0.875rem", color: "#475569", marginBottom: "0.75rem"}}>
          Simulate the impact of these recommendations on future employment rates and salaries.
        </p>
        <Link to="/interventions" className="rec-cta">
          Test an Intervention <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

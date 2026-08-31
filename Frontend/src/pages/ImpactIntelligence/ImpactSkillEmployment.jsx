import React from "react";
import { Target } from "lucide-react";

export default function ImpactSkillEmployment({ skillGapsData }) {
  // API returns {status, data: {skill_gaps: [...], meta: {...}}}
  const rawData = skillGapsData?.data || skillGapsData;
  const gaps = rawData?.skill_gaps || [];

  if (!gaps || gaps.length === 0) {
    return (
      <div className="impact-card">
        <h2><Target size={20} /> Skill → Employment Impact</h2>
        <p style={{color: "#64748b"}}>No skill gap data available to derive employment impact.</p>
      </div>
    );
  }

  // Sort by deficiency rate or employer complaint frequency
  const sortedGaps = [...gaps].sort((a, b) => {
    const aScore = (a.evidence?.deficiency_rate || 0) + (a.evidence?.employer_complaint_frequency || 0) * 0.1;
    const bScore = (b.evidence?.deficiency_rate || 0) + (b.evidence?.employer_complaint_frequency || 0) * 0.1;
    return bScore - aScore;
  }).slice(0, 5);

  return (
    <div className="impact-card">
      <h2><Target size={20} /> Skill → Employment Impact</h2>
      <p style={{color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem"}}>
        Most significant skill deficiencies preventing employment (top 5).
      </p>

      <div className="skill-list">
        {sortedGaps.map((g, idx) => {
          const pct = Math.min(100, Math.max(0, Math.round((g.evidence?.deficiency_rate || 0) * 100)));
          return (
            <div key={idx} className="skill-row">
              <strong style={{width: "120px"}}>{g.skill}</strong>
              <div className="skill-bar-container">
                <div className="skill-bar" style={{width: `${pct}%`, background: pct > 50 ? "#ef4444" : "#f59e0b"}}></div>
              </div>
              <span style={{width: "60px", textAlign: "right"}}>{pct}% gap</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

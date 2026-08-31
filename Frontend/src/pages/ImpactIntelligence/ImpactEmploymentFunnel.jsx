import React from "react";
import { ArrowRight, Filter } from "lucide-react";

export default function ImpactEmploymentFunnel({ traineesData, dashboardData }) {
  if (!traineesData || traineesData.length === 0) return null;

  const total = traineesData.length;
  // Calculate funnel stages derived from real data
  const assessed = traineesData.filter(t => t.skills && t.skills.length > 0).length;
  
  // Job Match & Employment
  let employed = 0;
  traineesData.forEach(t => {
    if (t.employment_history && t.employment_history.length > 0) {
      employed++;
    }
  });

  const funnelStages = [
    { label: "Enrolled", value: total },
    { label: "Assessed", value: assessed },
    { label: "Employed", value: employed }
  ];

  return (
    <div className="impact-card">
      <h2><Filter size={20} /> Employment Funnel</h2>
      
      <div className="funnel-container">
        {funnelStages.map((stage, idx) => (
          <React.Fragment key={stage.label}>
            <div className="funnel-stage">
              <span className="funnel-value">{stage.value}</span>
              <span className="funnel-label">{stage.label}</span>
            </div>
            {idx < funnelStages.length - 1 && (
              <ArrowRight className="funnel-arrow" size={24} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

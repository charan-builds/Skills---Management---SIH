import { Activity } from "lucide-react";

export default function ImpactOutcomeDiagnosis({ decisionEngineData }) {
  if (!decisionEngineData || !decisionEngineData.metadata) {
    return (
      <div className="impact-card">
        <h2><Activity size={20} /> Outcome Diagnosis</h2>
        <p style={{color: "#64748b"}}>AI Engine diagnosis currently unavailable.</p>
      </div>
    );
  }

  // AI Decision Engine data has recommendations, we extract diagnosis from recommendations
  // or we just render the metadata context
  const metadata = decisionEngineData.metadata;

  return (
    <div className="impact-card">
      <h2><Activity size={20} /> Outcome Diagnosis</h2>
      
      {metadata.insufficient_data ? (
        <p style={{color: "#ef4444", fontSize: "0.875rem"}}>
          Insufficient historical outcome data to run deep AI diagnosis. Wait for more longitudinal data.
        </p>
      ) : (
        <div style={{marginTop: "1rem"}}>
          <div className="diagnosis-item">
            <strong>System Health</strong>
            <span>Active monitoring via AI Intelligence.</span>
          </div>
          <div className="diagnosis-item">
            <strong>Evidence Captured</strong>
            <span>Analyzed {metadata.skill_gaps_analyzed || 0} skill gap signals and {metadata.retention_risks_analyzed || 0} retention risk patterns.</span>
          </div>
        </div>
      )}
    </div>
  );
}

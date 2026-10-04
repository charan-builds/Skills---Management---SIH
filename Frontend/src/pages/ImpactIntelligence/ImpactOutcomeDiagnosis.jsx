import { Activity } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function ImpactOutcomeDiagnosis({ decisionEngineData }) {
  const { t } = useLanguage();
  if (!decisionEngineData || !decisionEngineData.metadata) {
    return (
      <div className="impact-card">
        <h2><Activity size={20} /> {t("outcomes.programme_eval_diagnosis", "Outcome Diagnosis")}</h2>
        <p style={{color: "#64748b"}}>{t("AI Engine diagnosis currently unavailable.")}</p>
      </div>
    );
  }

  // AI Decision Engine data has recommendations, we extract diagnosis from recommendations
  // or we just render the metadata context
  const metadata = decisionEngineData.metadata;

  return (
    <div className="impact-card">
      <h2><Activity size={20} /> {t("outcomes.programme_eval_diagnosis", "Outcome Diagnosis")}</h2>
      
      {metadata.insufficient_data ? (
        <p style={{color: "#ef4444", fontSize: "0.875rem"}}>
          {t("Insufficient historical outcome data to run deep AI diagnosis. Wait for more longitudinal data.")}
        </p>
      ) : (
        <div style={{marginTop: "1rem"}}>
          <div className="diagnosis-item">
            <strong>{t("System Health", "System Health")}</strong>
            <span>{t("Active monitoring via AI Intelligence.", "Active monitoring via AI Intelligence.")}</span>
          </div>
          <div className="diagnosis-item">
            <strong>{t("Evidence Captured", "Evidence Captured")}</strong>
            <span>{t("Analyzed", "Analyzed")} {metadata.skill_gaps_analyzed || 0} {t("skill gap signals and", "skill gap signals and")} {metadata.retention_risks_analyzed || 0} {t("retention risk patterns.", "retention risk patterns.")}</span>
          </div>
        </div>
      )}
    </div>
  );
}

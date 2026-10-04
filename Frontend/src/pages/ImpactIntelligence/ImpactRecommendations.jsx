import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function ImpactRecommendations({ decisionEngineData }) {
  const { t } = useLanguage();
  let recommendations = [];
  
  if (decisionEngineData && decisionEngineData.recommendations) {
    recommendations = decisionEngineData.recommendations.slice(0, 3);
  }

  return (
    <div className="impact-card">
      <h2><CheckCircle2 size={20} /> {t("Recommended Actions", "Recommended Actions")}</h2>
      
      {recommendations.length === 0 ? (
        <p style={{color: "#64748b"}}>{t("No urgent recommendations at this time.")}</p>
      ) : (
        <div className="rec-list">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="rec-item">
              <h4>{t(rec.title, rec.title)}</h4>
              <p>{t(rec.description, rec.description)}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{marginTop: "1.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem"}}>
        <p style={{fontSize: "0.875rem", color: "#475569", marginBottom: "0.75rem"}}>
          {t("Simulate the impact of these recommendations on future employment rates and salaries.")}
        </p>
        <Link to="/interventions" className="rec-cta">
          {t("Test an Intervention", "Test an Intervention")} <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

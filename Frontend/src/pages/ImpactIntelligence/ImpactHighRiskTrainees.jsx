import { AlertOctagon } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function ImpactHighRiskTrainees({ traineesData }) {
  const { t } = useLanguage();
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
        <h2><AlertOctagon size={20} /> {t("High-Risk Trainees", "High-Risk Trainees")}</h2>
        <p style={{color: "#64748b"}}>{t("No high-risk trainees identified.")}</p>
      </div>
    );
  }

  return (
    <div className="impact-card">
      <h2><AlertOctagon size={20} /> {t("High-Risk Trainees", "High-Risk Trainees")}</h2>
      
      <div className="risk-list">
        {highRisk.map(trainee => (
          <div key={trainee.id} className="risk-row">
            <div className="risk-info">
              <strong>{trainee.name || trainee.id}</strong>
              <span>{t("Unemployed post-programme", "Unemployed post-programme")}</span>
            </div>
            <Link to={`/admin/trainees/${trainee.id}`} className="status-badge critical" style={{textDecoration: "none"}}>
              {t("common.view_details", "View Profile")}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

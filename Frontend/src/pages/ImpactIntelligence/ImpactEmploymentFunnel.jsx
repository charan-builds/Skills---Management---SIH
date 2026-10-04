import React from "react";
import { ArrowRight, Filter } from "lucide-react";
import CountUp from "../../components/common/CountUp";
import { useLanguage } from "../../context/LanguageContext";

export default function ImpactEmploymentFunnel({ traineesData }) {
  const { t } = useLanguage();
  if (!traineesData || traineesData.length === 0) return null;

  const total = traineesData.length;
  // Calculate funnel stages derived from real data
  const assessed = traineesData.filter(t => t.skills && t.skills.length > 0).length;
  
  // Benchmark Match & Employment
  let employed = 0;
  traineesData.forEach(t => {
    if (t.employment_history && t.employment_history.length > 0) {
      employed++;
    }
  });

  const funnelStages = [
    { label: t("admin_dashboard.enrolled", "Enrolled"), value: total },
    { label: t("admin_dashboard.assessed", "Assessed"), value: assessed },
    { label: t("admin_dashboard.employed", "Employed"), value: employed }
  ];

  return (
    <div className="impact-card">
      <h2><Filter size={20} /> {t("admin_dashboard.longitudinal_funnel", "Employment Funnel")}</h2>
      
      <div className="funnel-container">
        {funnelStages.map((stage, idx) => (
          <React.Fragment key={stage.label}>
            <div className="funnel-stage">
              <span className="funnel-value"><CountUp value={stage.value} /></span>
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

import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Target,
  Clock3,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import { useLanguage } from "../context/LanguageContext";

function InterventionImpact() {
  const { t } = useLanguage();
  const [impactData, setImpactData] = useState({
    interventionName: null,
    skillMatchBefore: null,
    skillMatchAfter: null,
    skillMatchChange: null,
    retentionBefore: null,
    retentionAfter: null,
    retentionChange: null,
    wageGrowthBefore: null,
    wageGrowthAfter: null,
    wageGrowthChange: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImpact = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuth(`${API_BASE}/api/interventions`);
      if (!res.ok) {
        throw new Error("Failed to load impact data");
      }
      const data = await res.json();
      const item = Array.isArray(data) && data.length > 0 ? data[0] : (data && !Array.isArray(data) ? data : null);
      if (item) {
        const before = item.impact?.before;
        const after = item.impact?.after;
        if (before && after) {
          const formatVal = (v) => v === null ? v : v;
          const calcChange = (b, a) => {
            if (b === null || a === null) return null;
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            if (isNaN(numA) || isNaN(numB)) return "N/A";
            const diff = numA - numB;
            const suffix = a.toString().includes("%") ? "%" : "";
            return diff > 0 ? `+${diff}${suffix}` : `${diff}${suffix}`;
          };
          setImpactData({
            interventionName: item.title || null,
            skillMatchBefore: formatVal(before.skill_match),
            skillMatchAfter: formatVal(after.skill_match),
            skillMatchChange: calcChange(before.skill_match, after.skill_match),
            retentionBefore: formatVal(before.retention_12m),
            retentionAfter: formatVal(after.retention_12m),
            retentionChange: calcChange(before.retention_12m, after.retention_12m),
            wageGrowthBefore: formatVal(before.wage_growth),
            wageGrowthAfter: formatVal(after.wage_growth),
            wageGrowthChange: calcChange(before.wage_growth, after.wage_growth),
          });
        } else {
          // Keep defaults if no before/after
        }
      }
    } catch (err) {
      console.error("Error fetching impact data", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpact();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <p className="page-label">{t("intervention_impact.badge", "INTERVENTION IMPACT")}</p>
          <h1>{t("intervention_impact.page_title", "Intervention Impact")}</h1>
          <p className="page-description">
            {t("intervention_impact.page_subtitle", "Compare outcomes before and after the intervention.")}
          </p>
        </div>
      </div>

      <div className="impact-card" style={{ position: 'relative', minHeight: '400px' }}>
        <DataStateWrapper
          isLoading={loading}
          error={error}
          data={impactData}
          onRetry={fetchImpact}
          isDataAvailable={(d) => d && d.interventionName !== null}
          isEmptyDetails={t("intervention_impact.empty_impact", "No intervention impact data found.")}
        >
          <div className="impact-header">
            <div>
              <p className="page-label">{t("interventions.col_intervention", "INTERVENTION")}</p>
              <h2>{impactData.interventionName || "Unknown Intervention"}</h2>
            </div>

            {impactData.skillMatchChange !== null && (
              <div className="impact-success">
                <CheckCircle2 size={18} />
                {t("intervention_impact.evidence_available", "Evidence available")}
              </div>
            )}
          </div>

          <div className="impact-table">
            <div className="impact-row impact-heading">
              <span>{t("intervention_impact.col_outcome", "Outcome")}</span>
              <span>{t("intervention_impact.col_before", "Before")}</span>
              <span>{t("intervention_impact.col_after", "After")}</span>
              <span>{t("intervention_impact.col_change", "Change")}</span>
            </div>

            <div className="impact-row">
              <div className="impact-outcome">
                <Target size={19} />
                <strong>{t("intervention_impact.metric_skill_match", "Skill Match")}</strong>
              </div>

              <span>{impactData.skillMatchBefore || t("intervention_impact.insufficient_data", "Insufficient Data")}</span>
              <strong className="after-value">{impactData.skillMatchAfter || "No Data"}</strong>
              <span className="improvement">{impactData.skillMatchChange || "N/A"}</span>
            </div>

            <div className="impact-row">
              <div className="impact-outcome">
                <Clock3 size={19} />
                <strong>{t("intervention_impact.metric_retention_12m", "12M Retention")}</strong>
              </div>

              <span>{impactData.retentionBefore || t("intervention_impact.insufficient_data", "Insufficient Data")}</span>
              <strong className="after-value">{impactData.retentionAfter || "No Data"}</strong>
              <span className="improvement">{impactData.retentionChange || "N/A"}</span>
            </div>

            <div className="impact-row">
              <div className="impact-outcome">
                <IndianRupee size={19} />
                <strong>{t("intervention_impact.metric_wage_growth", "Wage Growth")}</strong>
              </div>

              <span>{impactData.wageGrowthBefore || t("intervention_impact.insufficient_data", "Insufficient Data")}</span>
              <strong className="after-value">{impactData.wageGrowthAfter || "No Data"}</strong>
              <span className="improvement">{impactData.wageGrowthChange || "N/A"}</span>
            </div>
          </div>

          <div className="impact-summary">
            <TrendingUp size={20} />

            <div>
              <strong>{t("intervention_impact.observed_change_title", "Observed Change")}</strong>
              <p>
                {impactData.skillMatchChange !== null 
                  ? t("intervention_impact.observed_change_desc", "Changes were observed in outcomes following the intervention date.")
                  : "Awaiting sufficient longitudinal outcome data to observe change."}
              </p>
            </div>
          </div>
        </DataStateWrapper>
      </div>
    </div>
  );
}

export default InterventionImpact;

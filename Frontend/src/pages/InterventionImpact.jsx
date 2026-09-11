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



function InterventionImpact() {
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

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await fetchAuth(`${API_BASE}/api/interventions`);
        if (res.ok) {
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
            }
          }
        }
      } catch (error) {
        console.error("Error fetching impact data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImpact();
  }, []);


  if (loading) {
    return <div className="dashboard"><div>Loading...</div></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <p className="page-label">INTERVENTION IMPACT</p>
          <h1>Intervention Impact</h1>
          <p className="page-description">
            Compare outcomes before and after the intervention.
          </p>
        </div>
      </div>

      <div className="impact-card">
        <div className="impact-header">
          <div>
            <p className="page-label">INTERVENTION</p>
            <h2>{impactData.interventionName || "Unknown Intervention"}</h2>
          </div>

          {impactData.skillMatchChange !== null && (
            <div className="impact-success">
              <CheckCircle2 size={18} />
              Evidence available
            </div>
          )}
        </div>

        <div className="impact-table">
          <div className="impact-row impact-heading">
            <span>Outcome</span>
            <span>Before</span>
            <span>After</span>
            <span>Change</span>
          </div>

          <div className="impact-row">
            <div className="impact-outcome">
              <Target size={19} />
              <strong>Skill Match</strong>
            </div>

            <span>{impactData.skillMatchBefore || "Insufficient Data"}</span>
            <strong className="after-value">{impactData.skillMatchAfter || "No Data"}</strong>
            <span className="improvement">{impactData.skillMatchChange || "N/A"}</span>
          </div>

          <div className="impact-row">
            <div className="impact-outcome">
              <Clock3 size={19} />
              <strong>12M Retention</strong>
            </div>

            <span>{impactData.retentionBefore || "Insufficient Data"}</span>
            <strong className="after-value">{impactData.retentionAfter || "No Data"}</strong>
            <span className="improvement">{impactData.retentionChange || "N/A"}</span>
          </div>

          <div className="impact-row">
            <div className="impact-outcome">
              <IndianRupee size={19} />
              <strong>Wage Growth</strong>
            </div>

            <span>{impactData.wageGrowthBefore || "Insufficient Data"}</span>
            <strong className="after-value">{impactData.wageGrowthAfter || "No Data"}</strong>
            <span className="improvement">{impactData.wageGrowthChange || "N/A"}</span>
          </div>
        </div>

        <div className="impact-summary">
          <TrendingUp size={20} />

          <div>
            <strong>Observed Change</strong>
            <p>
              {impactData.skillMatchChange !== null 
                ? "Changes were observed in outcomes following the intervention date."
                : "Awaiting sufficient longitudinal outcome data to observe change."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterventionImpact;

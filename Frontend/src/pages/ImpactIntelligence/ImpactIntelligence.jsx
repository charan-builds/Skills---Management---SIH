import { API_BASE } from '../../utils/config';
import { useState, useEffect } from "react";
import { fetchAuth } from "../../utils/authFetch";
import { AlertCircle, Filter } from "lucide-react";
import "./ImpactIntelligence.css";

// Sub-components
import ImpactExecutiveSummary from "./ImpactExecutiveSummary";
import ImpactProgrammeComparison from "./ImpactProgrammeComparison";
import ImpactSkillEmployment from "./ImpactSkillEmployment";
import ImpactOutcomeDiagnosis from "./ImpactOutcomeDiagnosis";
import ImpactEmploymentFunnel from "./ImpactEmploymentFunnel";
import ImpactHighRiskTrainees from "./ImpactHighRiskTrainees";
import ImpactRecommendations from "./ImpactRecommendations";
import AIDecisionCenter from "../../components/AIDecisionCenter";
import SkillGapDashboard from "../../components/SkillGapDashboard";



export default function ImpactIntelligence() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [programmesData, setProgrammesData] = useState([]);
  const [traineesData, setTraineesData] = useState([]);
  const [skillGapsData, setSkillGapsData] = useState([]);
  const [decisionEngineData, setDecisionEngineData] = useState(null);

  // Filters
  const [programmeFilter, setProgrammeFilter] = useState("All Programmes");
  const [districtFilter, setDistrictFilter] = useState("All Districts");

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setError(null);
      try {
        const [
          dashboardRes,
          programmesRes,
          traineesRes,
          skillGapsRes,
          decisionEngineRes
        ] = await Promise.all([
          fetchAuth(`${API_BASE}/api/analytics/dashboard`),
          fetchAuth(`${API_BASE}/api/programmes`),
          fetchAuth(`${API_BASE}/api/trainees`),
          fetchAuth(`${API_BASE}/api/ai/skill-gaps/summary`),
          fetchAuth(`${API_BASE}/api/ai/decision-engine/summary`)
        ]);

        const dashboard = dashboardRes.ok ? await dashboardRes.json() : {};
        const programmes = programmesRes.ok ? await programmesRes.json() : [];
        const trainees = traineesRes.ok ? await traineesRes.json() : [];
        const skillGaps = skillGapsRes.ok ? await skillGapsRes.json() : [];
        const decisionEngine = decisionEngineRes.ok ? await decisionEngineRes.json() : { data: null };

        setDashboardData(dashboard);
        setProgrammesData(programmes);
        setTraineesData(trainees);
        setSkillGapsData(skillGaps);
        setDecisionEngineData(decisionEngine.data || decisionEngine); // depending on backend wrap

      } catch (err) {
        console.error(err);
        setError("Failed to load Impact Intelligence. Please check your connection and authentication.");
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="impact-loading">
        <div className="spinner"></div>
        <p>Gathering intelligence streams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="impact-error">
        <AlertCircle size={32} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="impact-intelligence-container">
      <div className="impact-header">
        <div>
          <h1>Impact Intelligence</h1>
          <p>Investigate outcomes, analyze root causes, and simulate data-driven interventions.</p>
        </div>
        
        <div className="impact-filters">
          <Filter size={18} />
          <select value={programmeFilter} onChange={(e) => setProgrammeFilter(e.target.value)}>
            <option value="All Programmes">All Programmes</option>
            {programmesData.map(p => (
              <option key={p.id} value={p.id}>{p.name || p.id}</option>
            ))}
          </select>
          <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="All Districts">All Districts</option>
          </select>
        </div>
      </div>

      <div className="data-quality-banner">
        <span><strong>Records:</strong> {traineesData.length} Trainees, {programmesData.length} Programmes</span>
        <span className="dq-warning">Data derived from available assessments and employer feedback.</span>
      </div>

      {/* A. EXECUTIVE IMPACT SUMMARY */}
      <ImpactExecutiveSummary dashboardData={dashboardData} />

      <div className="impact-grid">
        <div className="impact-col-main">
          {/* C. SKILL -> EMPLOYMENT IMPACT */}
          <ImpactSkillEmployment skillGapsData={skillGapsData} />
          
          {/* E. EMPLOYMENT FUNNEL */}
          <ImpactEmploymentFunnel traineesData={traineesData} dashboardData={dashboardData} />

          {/* B. PROGRAMME IMPACT COMPARISON */}
          <ImpactProgrammeComparison programmesData={programmesData} />
        </div>

        <div className="impact-col-side">
          {/* 3. RECOMMENDATIONS & AI CONNECTION */}
          <ImpactRecommendations decisionEngineData={decisionEngineData} />

          {/* D. OUTCOME DIAGNOSIS */}
          <ImpactOutcomeDiagnosis decisionEngineData={decisionEngineData} />

          {/* F. HIGH-RISK TRAINEES */}
          <ImpactHighRiskTrainees traineesData={traineesData} />
        </div>
      </div>
      
      <div className="impact-intelligence-ai-modules" style={{ marginTop: '2rem' }}>
         <h2 style={{ marginBottom: '1rem' }}>AI Decision Intelligence</h2>
         <AIDecisionCenter />
         
         <h2 style={{ margin: '2rem 0 1rem' }}>Skill Gap Intelligence</h2>
         <SkillGapDashboard />
      </div>
    </div>
  );
}

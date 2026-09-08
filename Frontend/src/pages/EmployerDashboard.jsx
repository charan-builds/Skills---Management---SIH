import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useState, useEffect } from "react";
import {
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  BrainCircuit
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmployerNav from "./Employer/EmployerNav";

export default function EmployerDashboard() {
  const [data, setData] = useState({ dashboard: null, candidates: [], jobs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const organizationName = localStorage.getItem("organizationName") || "TechFlow Solutions";
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";
  const navigate = useNavigate();

  useEffect(() => {
    const readResponse = async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || "Unable to load employer dashboard data.");
      return body;
    };

    setError("");
    Promise.all([
      fetchAuth(`${API_BASE}/api/employers/${organizationId}/dashboard`).then(readResponse),
      fetchAuth(`${API_BASE}/api/employers/${organizationId}/active-vacancies`).then(readResponse)
    ]).then(([dashData, jobsData]) => {
      setData({
        dashboard: dashData,
        candidates: [],
        jobs: jobsData || []
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError(err.message || "Unable to load employer dashboard data.");
      setLoading(false);
    });
  }, [organizationId]);

  const { dashboard, candidates, jobs } = data;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '3rem', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
        <p style={{ color: '#64748b' }}>Loading Employer Intelligence Dashboard...</p>
      </div>
    );
  }


  const skillIntel = dashboard?.skill_intelligence || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmployerNav />

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        {error && (
          <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Sparkles size={18} color="#2563eb" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                RECRUITMENT & WORKFORCE INTELLIGENCE
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              Welcome, {organizationName}
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
              Identify verified skilled talent, evaluate AI match explanations, and track employment outcomes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>

            <button
              onClick={() => navigate("/employer/verify-outcomes")}
              style={{ padding: '0.65rem 1.25rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}
            >
              <CheckCircle2 size={16} /> Verify Outcomes
            </button>
          </div>
        </div>



        {/* WORKFORCE SKILL INTELLIGENCE SECTION */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <BrainCircuit size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Workforce Skill Intelligence</h3>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Real-time demand vs candidate supply analysis across enterprise vacancies.</p>
            </div>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
              AI Intelligence Feed
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            
            {/* Skill Demand vs Supply Table */}
            <div>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Skill Demand & Supply Matrix</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Skill</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Hiring Demand</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Candidate Supply</th>
                    <th style={{ padding: '0.6rem 0.5rem' }}>Talent Gap</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {skillIntel.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: '#0f172a' }}>{row.skill}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ background: row.demand === 'Very High' ? '#fee2e2' : (row.demand === 'High' ? '#eff6ff' : '#f8fafc'), color: row.demand === 'Very High' ? '#b91c1c' : (row.demand === 'High' ? '#1d4ed8' : '#475569'), padding: '2px 6px', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem' }}>
                          {row.demand}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#334155' }}>{row.supply} Candidates</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: row.gap === 'High' ? '#dc2626' : (row.gap === 'Moderate' ? '#b45309' : '#16a34a'), fontWeight: 600 }}>{row.gap}</td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: row.coverage >= 100 ? '#16a34a' : '#ea580c' }}>
                        {row.coverage}%
                      </td>
                    </tr>
                  ))}
                  {skillIntel.length === 0 && (
                    <tr><td colSpan="5" style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>No active vacancy skill data is available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Actionable AI Insights */}
            <div>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Actionable Insights & Recommendations</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#1e40af', display: 'block', marginBottom: '0.25rem' }}>Training Partnership Recommendation</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                    {dashboard?.ai_insights?.training_recommendation || "No training recommendation is available from recorded vacancy data."}
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#15803d', display: 'block', marginBottom: '0.25rem' }}>AI Hiring Trend</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                    {dashboard?.ai_insights?.ai_hiring_insight || "No hiring trend is available from recorded data."}
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#b45309', display: 'block', marginBottom: '0.25rem' }}>Skill Gap Mitigation</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                    {dashboard?.ai_insights?.skill_gap_alert || "No skill-gap alert is available from recorded data."}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* RECRUITMENT OUTCOME & EMPLOYMENT VERIFICATION CARDS (2-COLUMN) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Recruitment Outcome */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>RECRUITMENT OUTCOMES</span>
              <h3 style={{ margin: '0.2rem 0 0.5rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                {dashboard?.recruitment_outcome?.hired ?? 0} Recorded Placements
              </h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
                This summary is calculated from outcomes recorded for your organization.
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                <span>Retention: <strong style={{ color: '#16a34a' }}>{dashboard?.recruitment_outcome?.retention ?? "Not recorded"}</strong></span>
              </div>
            </div>
          </div>

          {/* Employment Verification Action Card */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>EMPLOYMENT VERIFICATION</span>
              <h3 style={{ margin: '0.2rem 0 0.35rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                Verify Trainee Outcomes & Retention
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', maxWidth: '380px' }}>
                Confirm employment status, salary benchmarks, and 3M/6M/12M retention checkpoints.
              </p>
            </div>

            <button
              onClick={() => navigate("/employer/verify-outcomes")}
              style={{ padding: '0.75rem 1.35rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}
            >
              Verify Outcomes <ArrowRight size={16} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

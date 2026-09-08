import {
  Target,
  AlertCircle,
  TrendingUp,
  Award,
  Lightbulb,
  UserCog
} from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE } from "../../utils/config";
import { fetchAuth } from "../../utils/authFetch";

export default function TraineeOverview({
  portalData,
  onNavigateTab,
  onStartAssessment
}) {
  const [outcomeHistory, setOutcomeHistory] = useState([]);

  useEffect(() => {
    if (portalData?.profile?.id) {
      fetchAuth(`${API_BASE}/api/trainees/${portalData.profile.id}/outcome-history`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setOutcomeHistory(data);
        })
        .catch(console.error);
    }
  }, [portalData]);

  if (!portalData) return null;

  const isProduction = portalData.mode === "production";
  const readiness = portalData.readiness || {};
  const targetMetrics = portalData.target_role_metrics || {};
  const normalisePercent = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : null;
  };
  const percentLabel = (value) => {
    const score = normalisePercent(value);
    return score === null ? "Not scored" : `${score}%`;
  };
  const overallScore = normalisePercent(readiness.overall);

  return (
    <div style={{ maxWidth: '1280px' }}>
      
      {/* SECTION 1: Career Readiness (Left) + 4 Structured Metric Cards (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Career Readiness Main Card */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Career Readiness</h3>
              </div>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a' }}>
                {percentLabel(readiness.overall)}
              </span>
            </div>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {overallScore === null
                ? "A readiness score will appear when verified assessment evidence is available."
                : "This score is calculated from the recorded profile and role-matching evidence."}
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#334155' }}>
                <span>Technical Skills</span>
                <strong>{percentLabel(readiness.technical_skills)}</strong>
              </div>
              <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${normalisePercent(readiness.technical_skills) ?? 0}%`, height: '100%', background: '#2563eb' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#334155' }}>
                <span>Job Readiness</span>
                <strong>{percentLabel(readiness.job_readiness)}</strong>
              </div>
              <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${normalisePercent(readiness.job_readiness) ?? 0}%`, height: '100%', background: '#f59e0b' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#334155' }}>
                <span>Experience</span>
                <strong>{percentLabel(readiness.experience)}</strong>
              </div>
              <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${normalisePercent(readiness.experience) ?? 0}%`, height: '100%', background: '#3b82f6' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#334155' }}>
                <span>Certification</span>
                <strong>{percentLabel(readiness.certification)}</strong>
              </div>
              <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${normalisePercent(readiness.certification) ?? 0}%`, height: '100%', background: '#16a34a' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Four Distinct Overview Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          
          {/* 1. Target Role Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', marginBottom: '0.5rem' }}>
              <Target size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Role</span>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{targetMetrics.role || "Not recorded"}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#16a34a' }}>Match: {percentLabel(targetMetrics.match)}</p>
            </div>
          </div>

          {/* 2. Top Skill Gap Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Skill Gap</span>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{targetMetrics.critical_skill_gap || "No gap assessment available"}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>Recorded gap evidence</p>
            </div>
          </div>



          {/* 4. Next Milestone Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', marginBottom: '0.5rem' }}>
              <TrendingUp size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next Milestone</span>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{targetMetrics.next_milestone || "No next milestone recorded"}</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600 }}>Based on recorded data</p>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 2: Quick Action Navigation Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>

        <button
          onClick={() => onStartAssessment("Communication Assessment")}
          style={{ flex: 1, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        >
          <Award size={17} color="#8b5cf6" /> Take Assessment
        </button>
        <button
          onClick={() => onNavigateTab('profile')}
          style={{ flex: 1, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        >
          <UserCog size={17} color="#475569" /> Update Profile
        </button>
      </div>

      {/* SECTION 3: Outcome History */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem 0' }}>
          Employment Outcome History
        </h3>
        {outcomeHistory.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No outcome history recorded.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {outcomeHistory.map((outcome, idx) => (
              <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong style={{ color: '#0f172a' }}>{outcome.status}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(outcome.timestamp).toLocaleDateString()}</span>
                </div>
                {outcome.employer && <div style={{ fontSize: '0.9rem', color: '#475569' }}>Employer: {outcome.employer}</div>}
                {outcome.role && <div style={{ fontSize: '0.9rem', color: '#475569' }}>Role: {outcome.role}</div>}
                <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.5rem', fontWeight: 600 }}>{outcome.verification_state}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: AI Career Analysis & Insights Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', borderRadius: '14px', padding: '1.75rem 2rem', color: 'white', marginBottom: '2.5rem', boxShadow: '0 4px 12px rgba(30,58,138,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Lightbulb size={22} color="#fbbf24" />
          <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.5px' }}>CAREER INSIGHTS</h4>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto', fontWeight: 500 }}>{isProduction ? "Recorded data" : "Demo scenario data"}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {portalData.ai_insights?.map((insight, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.95rem', lineHeight: 1.4, opacity: 0.95 }}>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>•</span>
              <span>{insight}</span>
            </div>
          ))}
          {!portalData.ai_insights?.length && (
            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.4, opacity: 0.95 }}>No career insights are available from the recorded profile yet.</p>
          )}
        </div>


      </div>



    </div>
  );
}

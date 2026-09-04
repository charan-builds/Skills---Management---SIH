import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { API_BASE } from "../utils/config";
import { fetchAuth } from "../utils/authFetch";
import { adminIntelligenceData } from "../utils/adminData";

export default function ProgrammeProfile() {
  const navigate = useNavigate();
  const { programmeId: id } = useParams();
  const [programme, setProgramme] = useState(
    adminIntelligenceData.programmes.find((p) => p.id === id)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgramme() {
      try {
        const res = await fetchAuth(`${API_BASE}/api/programmes/${id}`);
        if (res.ok) {
          const liveData = await res.json();
          setProgramme(prev => {
            if (prev) {
              return {
                ...prev,
                name: liveData.name,
                provider: liveData.provider,
                enrolled: liveData.trainees,
                employment_rate: parseInt(liveData.employment) || 0,
                retention_12m: parseInt(liveData.retention) || 0,
                status: liveData.status
              };
            }
            // If it's a new programme not in static data
            return {
              id: liveData.id,
              name: liveData.name,
              provider: liveData.provider,
              district: "Various",
              enrolled: liveData.trainees,
              completion_rate: 0,
              certification_rate: 0,
              avg_assessment_score: 0,
              avg_skill_gain: "+0%",
              job_readiness_rate: 0,
              employment_rate: parseInt(liveData.employment) || 0,
              retention_12m: parseInt(liveData.retention) || 0,
              demand_level: "Medium",
              health_status: "Fair",
              top_skills: [],
              missing_skills: [],
              hiring_employers: 0,
              avg_starting_salary: "TBD"
            };
          });
        }
      } catch (error) {
        console.error("Failed to load programme:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProgramme();
  }, [id]);

  if (loading && !programme) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Programme Details...</div>;
  }

  const prog = programme || adminIntelligenceData.programmes[0];

  return (
    <div className="dashboard" style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Back Button */}
      <button
        onClick={() => navigate("/programmes")}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          padding: '0.5rem 1rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#334155',
          cursor: 'pointer',
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Programmes
      </button>

      {/* Header */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                {prog.id}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                {prog.provider} • {prog.district}
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              {prog.name}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
              Complete curriculum lifecycle and longitudinal employment impact assessment.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ background: prog.health_status === 'Excellent' ? '#dcfce7' : '#eff6ff', color: prog.health_status === 'Excellent' ? '#15803d' : '#1d4ed8', padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800 }}>
              ● Health: {prog.health_status}
            </span>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Enrolled</span>
            <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{prog.enrolled} Trainees</h4>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Completion</span>
            <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>{prog.completion_rate}%</h4>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Employment</span>
            <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>{prog.employment_rate}%</h4>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Avg Starting Salary</span>
            <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.4rem', fontWeight: 800, color: '#7c3aed' }}>{prog.avg_starting_salary}</h4>
          </div>
        </div>
      </div>

      {/* COMPLETE IMPACT CHAIN SECTION (Training -> Skills -> Assessments -> Certification -> Employment -> Retention) */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
          Longitudinal Programme Impact Chain
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', position: 'relative' }}>
          
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderTop: '4px solid #2563eb' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>STAGE 1: CURRICULUM</span>
            <h4 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{prog.enrolled} Enrolled</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>480 Hours core theory & laboratory work</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderTop: '4px solid #3b82f6' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6' }}>STAGE 2: SKILLS GAIN</span>
            <h4 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{prog.avg_skill_gain} Velocity</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>4 verified competencies mastered</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderTop: '4px solid #f59e0b' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>STAGE 3: BENCHMARK</span>
            <h4 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{prog.avg_assessment_score}% Avg Score</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Practical coding & system tests</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderTop: '4px solid #16a34a' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>STAGE 4: CERTIFIED</span>
            <h4 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{prog.certification_rate}% Pass Rate</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>State skilling credential issued</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderTop: '4px solid #15803d' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>STAGE 5: EMPLOYED</span>
            <h4 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{prog.employment_rate}% Placed</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Across {prog.hiring_employers} partner companies</p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderTop: '4px solid #7c3aed' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed' }}>STAGE 6: RETENTION</span>
            <h4 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{prog.retention_12m}% at 12M</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Longitudinal employment confirmed</p>
          </div>

        </div>
      </div>

      {/* 2-COLUMN SECTION: SKILL MAPPING & AI RECOMMENDATION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Skills Taught vs Gaps */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
            Curriculum Skill Mapping
          </h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              ✓ Mastered Core Competencies
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {prog.top_skills.map((s, i) => (
                <span key={i} style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              △ Identified Employer Skill Gaps
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {prog.missing_skills.map((s, i) => (
                <span key={i} style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                  △ {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Programme Optimization Recommendation */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={18} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>AI Diagnostic & Next Steps</h3>
          </div>

          <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #2563eb', marginBottom: '1rem', fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.45 }}>
            <strong>Strategic Recommendation:</strong> Integrate 20 hours of hands-on {prog.missing_skills.join(" and ")} lab simulations to boost employer match alignment from {prog.job_readiness_rate}% to 88%+.
          </div>

          <button
            onClick={() => navigate("/interventions")}
            style={{
              width: '100%',
              padding: '0.65rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            Launch What-If Intervention Simulator <ArrowRight size={14} />
          </button>
        </div>

      </div>

    </div>
  );
}

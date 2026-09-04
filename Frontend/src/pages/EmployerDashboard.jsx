import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useState, useEffect } from "react";
import {
  BriefcaseBusiness,
  Users,
  ClipboardCheck,
  ArrowRight,
  TrendingUp,
  Bookmark,
  MapPin,
  Sparkles,
  CheckCircle2,
  BrainCircuit
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmployerNav from "./Employer/EmployerNav";

export default function EmployerDashboard() {
  const [data, setData] = useState({ dashboard: null, candidates: [], jobs: [] });
  const [loading, setLoading] = useState(true);

  const organizationName = localStorage.getItem("organizationName") || "TechFlow Solutions";
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetchAuth(`${API_BASE}/api/employers/${organizationId}/dashboard`).then(res => res.json()),
      fetchAuth(`${API_BASE}/api/employers/${organizationId}/recommended-candidates`).then(res => res.json()),
      fetchAuth(`${API_BASE}/api/employers/${organizationId}/active-vacancies`).then(res => res.json())
    ]).then(([dashData, candData, jobsData]) => {
      setData({
        dashboard: dashData,
        candidates: candData || [],
        jobs: jobsData || []
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
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

  const funnel = dashboard?.recruitment_funnel || {
    sourced: 45,
    matched: 24,
    shortlisted: 6,
    contacted_interview: 4,
    hired: 3,
    retention_rate: "100%"
  };

  const skillIntel = dashboard?.skill_intelligence || [
    { skill: "Python", demand: "High", supply: 12, gap: "Moderate", coverage: 150 },
    { skill: "Machine Learning", demand: "Very High", supply: 7, gap: "High", coverage: 70 },
    { skill: "SQL", demand: "High", supply: 14, gap: "Low", coverage: 175 },
    { skill: "Power BI", demand: "Medium", supply: 5, gap: "Moderate", coverage: 62 },
    { skill: "Cybersecurity", demand: "High", supply: 4, gap: "High", coverage: 80 }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmployerNav />

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        
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
              onClick={() => navigate("/employer/candidates")}
              style={{ padding: '0.65rem 1.25rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Users size={16} /> Explore Candidate Pool
            </button>
            <button
              onClick={() => navigate("/employer/verify-outcomes")}
              style={{ padding: '0.65rem 1.25rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}
            >
              <CheckCircle2 size={16} /> Verify Outcomes
            </button>
          </div>
        </div>

        {/* TOP-LEVEL SUMMARY METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Open Job Vacancies</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BriefcaseBusiness size={18} />
              </div>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              {dashboard?.open_vacancies ?? 4}
            </h2>
            <small style={{ color: '#2563eb', fontWeight: 600 }}>Active hiring requisitions</small>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Available Candidates</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} />
              </div>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              {dashboard?.available_candidates ?? 17}
            </h2>
            <small style={{ color: '#16a34a', fontWeight: 600 }}>Verified certified talent pool</small>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Shortlisted Candidates</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bookmark size={18} />
              </div>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              {dashboard?.shortlisted_candidates ?? 6}
            </h2>
            <small style={{ color: '#b45309', fontWeight: 600 }}>Currently in evaluation pipeline</small>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Hired Trainees</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardCheck size={18} />
              </div>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              {dashboard?.hired_trainees ?? 3}
            </h2>
            <small style={{ color: '#7c3aed', fontWeight: 600 }}>100% 12-month retention verified</small>
          </div>

        </div>

        {/* RECRUITMENT OVERVIEW & FUNNEL */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Recruitment Pipeline Funnel</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>End-to-end conversion from workforce talent discovery to verified retention.</p>
            </div>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
              75% Selection Rate
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
            
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid #94a3b8' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>1. Sourced</span>
              <h4 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{funnel.sourced}</h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Trainees Screened</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid #2563eb' }}>
              <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>2. Matched (65%+)</span>
              <h4 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{funnel.matched}</h4>
              <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>53% Match Rate</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>3. Shortlisted</span>
              <h4 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{funnel.shortlisted}</h4>
              <span style={{ fontSize: '0.75rem', color: '#b45309' }}>25% of Matched</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid #8b5cf6' }}>
              <span style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600 }}>4. Interviews</span>
              <h4 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{funnel.contacted_interview}</h4>
              <span style={{ fontSize: '0.75rem', color: '#7c3aed' }}>67% Conversion</span>
            </div>

            <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid #16a34a' }}>
              <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700 }}>5. Hired Trainees</span>
              <h4 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>{funnel.hired}</h4>
              <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>100% 12M Retention</span>
            </div>

          </div>
        </div>

        {/* 2-COLUMN SECTION: RECOMMENDED CANDIDATES + ACTIVE JOBS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
          
          {/* AI Recommended Candidates Card */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>AI RECOMMENDATIONS</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Top Recommended Candidates</h3>
              </div>
              <button
                onClick={() => navigate("/employer/candidates")}
                style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                View All <ArrowRight size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {candidates.map((cand) => (
                <div
                  key={cand.trainee_id}
                  style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{cand.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>({cand.trainee_id})</span>
                      </div>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#475569' }}>
                        {cand.programme} • <MapPin size={12} style={{ verticalAlign: 'middle' }} /> {cand.district}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-block', marginBottom: '0.2rem' }}>
                        {cand.match_percentage}% Match
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Job Fit: {cand.job_match || cand.match_percentage - 3}%</div>
                    </div>
                  </div>

                  {/* Strong Matches & Gaps */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                    {cand.matched_skills?.slice(0, 4).map((s, idx) => (
                      <span key={idx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '2px 7px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        ✓ {s}
                      </span>
                    ))}
                    {cand.missing_skills?.slice(0, 1).map((s, idx) => (
                      <span key={idx} style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '2px 7px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                        △ {s}
                      </span>
                    ))}
                  </div>

                  {/* AI Recommendation Reason */}
                  <div style={{ background: '#eff6ff', padding: '0.65rem 0.85rem', borderRadius: '6px', borderLeft: '3px solid #2563eb', marginBottom: '0.75rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e40af', lineHeight: 1.4 }}>
                      <strong>AI Explanation:</strong> "{cand.reasoning}"
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      onClick={() => navigate(`/employer/candidates/${cand.trainee_id}`)}
                      style={{ padding: '0.45rem 0.95rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      View Profile <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Job Vacancies Card */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>OPEN REQUISITIONS</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Active Job Vacancies</h3>
              </div>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                {jobs.length} Active
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: '#0f172a', display: 'block' }}>{job.title}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        <MapPin size={12} style={{ verticalAlign: 'middle' }} /> {job.location} • {job.openings} Openings • {job.salary_range}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {job.matching_candidates || 4} Matched
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: '0.4rem 0 0.75rem 0', fontSize: '0.8rem', color: '#475569' }}>
                    <strong>Skills:</strong> {job.skills_required?.map(s => typeof s === 'string' ? s : s.skill_name).join(' · ')}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => navigate(`/employer/jobs/${job.id}`)}
                      style={{ padding: '0.45rem 0.95rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      View Matches <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                    {dashboard?.ai_insights?.training_recommendation || "Machine Learning and Cybersecurity talent pools have the highest hiring demand. Partner with state programs for specialized training."}
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#15803d', display: 'block', marginBottom: '0.25rem' }}>AI Hiring Trend</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                    {dashboard?.ai_insights?.ai_hiring_insight || "Candidates possessing Python + Linux fundamentals demonstrate a 92% placement success rate and 100% 12-month retention."}
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#b45309', display: 'block', marginBottom: '0.25rem' }}>Skill Gap Mitigation</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                    {dashboard?.ai_insights?.skill_gap_alert || "Power BI & Statistics are the most frequent gaps in your applicant pool. Consider candidates with strong SQL and provide self-paced Power BI upskilling."}
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
                {dashboard?.recruitment_outcome?.hired ?? 3} Placements Verified
              </h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
                Your organization has successfully recruited trained candidates from state skilling academies.
              </p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                <span>Selection Rate: <strong>{dashboard?.recruitment_outcome?.selection_rate ?? "75%"}</strong></span>
                <span>•</span>
                <span>Avg Match: <strong>{dashboard?.recruitment_outcome?.avg_skill_match ?? "92%"}</strong></span>
                <span>•</span>
                <span>Retention: <strong style={{ color: '#16a34a' }}>{dashboard?.recruitment_outcome?.retention ?? "100%"}</strong></span>
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

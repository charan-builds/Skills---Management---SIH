import { useState } from "react";
import {
  Target,
  AlertCircle,
  FileText,
  TrendingUp,
  Award,
  Lightbulb,
  BriefcaseBusiness,
  GraduationCap,
  UserCog,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Building,
  DollarSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TraineeOverview({
  portalData,
  onNavigateTab,
  onOpenJobDetails,
  onApplyJob,
  onStartAssessment
}) {
  const navigate = useNavigate();

  if (!portalData) return null;

  const readiness = portalData.readiness || { overall: 95, technical_skills: 86, job_readiness: 78, experience: 74, certification: 100 };
  const targetMetrics = portalData.target_role_metrics || {
    role: "Cybersecurity Analyst",
    match: 92,
    critical_skill_gap: "Communication",
    active_applications: 3,
    shortlisted_applications: 2,
    next_milestone: "Complete Communication assessment (+8% potential)"
  };

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
                {readiness.overall}%
              </span>
            </div>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>
              <strong>Strong foundation</strong> — 2 skills away from maximizing readiness for your next target role.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#334155' }}>
                <span>Technical Skills</span>
                <strong>{readiness.technical_skills}%</strong>
              </div>
              <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${readiness.technical_skills}%`, height: '100%', background: '#2563eb' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#334155' }}>
                <span>Job Readiness</span>
                <strong>{readiness.job_readiness}%</strong>
              </div>
              <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${readiness.job_readiness}%`, height: '100%', background: '#f59e0b' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#334155' }}>
                <span>Experience</span>
                <strong>{readiness.experience}%</strong>
              </div>
              <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${readiness.experience}%`, height: '100%', background: '#3b82f6' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem', color: '#334155' }}>
                <span>Certification</span>
                <strong>{readiness.certification}%</strong>
              </div>
              <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${readiness.certification}%`, height: '100%', background: '#16a34a' }}></div>
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
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{targetMetrics.role}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#16a34a' }}>Match: {targetMetrics.match}%</p>
            </div>
          </div>

          {/* 2. Top Skill Gap Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', marginBottom: '0.5rem' }}>
              <AlertCircle size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Skill Gap</span>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{targetMetrics.critical_skill_gap}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>High Priority Gap</p>
            </div>
          </div>

          {/* 3. Application Summary Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', marginBottom: '0.5rem' }}>
              <FileText size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applications</span>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{targetMetrics.active_applications} Active</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>{targetMetrics.shortlisted_applications} Shortlisted</p>
            </div>
          </div>

          {/* 4. Next Milestone Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', marginBottom: '0.5rem' }}>
              <TrendingUp size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next Milestone</span>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Take Assessment</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600 }}>+8% readiness potential</p>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 2: Quick Action Navigation Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
        <button
          onClick={() => onNavigateTab('jobs')}
          style={{ flex: 1, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        >
          <BriefcaseBusiness size={17} color="#2563eb" /> Explore Jobs
        </button>
        <button
          onClick={() => onNavigateTab('skills')}
          style={{ flex: 1, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        >
          <GraduationCap size={17} color="#f59e0b" /> Improve Skills
        </button>
        <button
          onClick={() => onNavigateTab('applications')}
          style={{ flex: 1, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        >
          <FileText size={17} color="#16a34a" /> My Applications
        </button>
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

      {/* SECTION 3: AI Career Analysis & Insights Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', borderRadius: '14px', padding: '1.75rem 2rem', color: 'white', marginBottom: '2.5rem', boxShadow: '0 4px 12px rgba(30,58,138,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Lightbulb size={22} color="#fbbf24" />
          <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.5px' }}>AI CAREER ANALYSIS & INSIGHTS</h4>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto', fontWeight: 500 }}>Demo Career Intelligence</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {portalData.ai_insights?.map((insight, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.95rem', lineHeight: 1.4, opacity: 0.95 }}>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>•</span>
              <span>{insight}</span>
            </div>
          ))}
        </div>

        {/* Recommended Next Steps Grid */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#93c5fd', margin: '0 0 0.75rem 0' }}>Recommended Next Steps</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {portalData.recommended_next_steps?.map((step, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{step.step}</span>
                  <strong style={{ fontSize: '0.95rem' }}>{step.title}</strong>
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', opacity: 0.85 }}>{step.why}</p>
                <button
                  onClick={() => {
                    if (step.action_route?.includes('skills')) onNavigateTab('skills');
                    else if (step.action_route?.includes('jobs')) onNavigateTab('jobs');
                    else onStartAssessment("Communication Assessment");
                  }}
                  style={{ background: 'white', color: '#1e3a8a', border: 'none', borderRadius: '6px', padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {step.action} &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Top Opportunities Preview (Linked to Explore Jobs) */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.2rem 0', color: '#0f172a' }}>Top Recommended Opportunities</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>High-affinity jobs matching your certified skills & training.</p>
          </div>
          <button
            onClick={() => onNavigateTab('jobs')}
            style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            View All Jobs &rarr;
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {portalData.recommended_jobs?.map((match, idx) => (
            <div key={idx} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{match.job.role}</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building size={13} /> {match.job.company} • <MapPin size={12} /> {match.job.location}
                    </p>
                  </div>
                  <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                    {match.match_percentage}% Match
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#475569' }}>
                  <span>{match.job.salary_range}</span>
                  <span>•</span>
                  <span>{match.job.work_mode || "Hybrid"}</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  {match.matched_skills.slice(0, 3).map((s, i) => (
                    <span key={i} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.75rem', fontWeight: 600, padding: '2px 7px', borderRadius: '4px' }}>
                      ✓ {s}
                    </span>
                  ))}
                  {match.missing_skills.length > 0 && (
                    <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.75rem', fontWeight: 600, padding: '2px 7px', borderRadius: '4px' }}>
                      △ {match.missing_skills[0]}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button
                  onClick={() => onOpenJobDetails(match)}
                  style={{ flex: 1, padding: '0.55rem', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  View Details
                </button>
                <button
                  onClick={() => onApplyJob(match.job, match.match_percentage)}
                  style={{ flex: 1, padding: '0.55rem', background: '#2563eb', border: 'none', color: '#ffffff', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

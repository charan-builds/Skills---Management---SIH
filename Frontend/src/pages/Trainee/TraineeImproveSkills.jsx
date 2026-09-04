import { useState, useEffect } from "react";
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';
import {
  Target,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Play
} from "lucide-react";
import { useParams } from "react-router-dom";

export default function TraineeImproveSkills({ onSkillUpdated }) {
  const { traineeId: paramTraineeId } = useParams();
  const traineeId = paramTraineeId || localStorage.getItem("traineeId") || "T102";

  const [skillsData, setSkillsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Interactive Assessment Modal State
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [activeAssessmentName, setActiveAssessmentName] = useState("Communication Assessment");
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [assessmentSubmitted, setAssessmentSubmitted] = useState(false);
  const [assessmentScore, setAssessmentScore] = useState(null);

  // Interactive Learning Player Modal State
  const [activeCourseModal, setActiveCourseModal] = useState(null);

  const fetchSkillsData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/skills-growth`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unable to load your skill-growth plan.");
      setSkillsData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load your skill-growth plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillsData();
  }, [traineeId]);

  const handleStartAssessment = (name) => {
    setActiveAssessmentName(name);
    setAssessmentAnswers({});
    setAssessmentSubmitted(false);
    setAssessmentScore(null);
    setShowAssessmentModal(true);
  };

  const handleAssessmentSubmit = async () => {
    const correctAnswers = { q1: "a", q2: "a", q3: "a" };
    const answerKeys = Object.keys(correctAnswers);
    if (!answerKeys.every((key) => assessmentAnswers[key])) {
      setError("Answer all assessment questions before submitting.");
      return;
    }
    const correctCount = answerKeys.filter((key) => assessmentAnswers[key] === correctAnswers[key]).length;
    const score = Math.round((correctCount / answerKeys.length) * 100);
    setError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/assessment/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_name: activeAssessmentName,
          score: score
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unable to submit the assessment.");
      setAssessmentScore(score);
      setAssessmentSubmitted(true);
      fetchSkillsData();
      if (onSkillUpdated) onSkillUpdated();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to submit the assessment.");
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading Skill Growth Plan...</div>;
  }

  if (!skillsData) return <div role="alert" style={{ padding: '1rem', color: '#b91c1c' }}>{error || "No skill-growth data is available."}</div>;

  const plan = skillsData.skill_growth_plan || {
    current_readiness: null,
    target_role: "Not recorded",
    target_readiness: null,
    skills_remaining: 0,
    estimated_effort: "Not available"
  };

  return (
    <div style={{ maxWidth: '1280px' }}>
      {error && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>{error}</div>}
      
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Sparkles size={18} color="#2563eb" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Skill Growth & Learning Plan</h2>
        </div>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
          Targeted micro-learning, assessments, and skill-gap remediation for <strong>{plan.target_role}</strong>.
        </p>
      </div>

      {/* TOP: Skill Growth Plan Summary Banner */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Your Skill Growth Plan</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Current Readiness</span>
            <h4 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>{plan.current_readiness ?? "Not scored"}{plan.current_readiness == null ? "" : "%"}</h4>
            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>{plan.current_readiness == null ? "Assessment evidence required" : "Recorded readiness score"}</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Target Role Readiness</span>
            <h4 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#2563eb' }}>{plan.target_readiness ?? "Not scored"}{plan.target_readiness == null ? "" : "%"}</h4>
            <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>Target: {plan.target_role}</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Skills Remaining</span>
            <h4 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>{plan.skills_remaining} Gaps</h4>
            <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>Based on recorded vacancy requirements</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Estimated Effort</span>
            <h4 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#8b5cf6' }}>{plan.estimated_effort}</h4>
            <span style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600 }}>Self-paced micro-modules</span>
          </div>

        </div>
      </div>

      {/* SKILL GAP ANALYSIS TABLE / VISUAL CHART */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Skill Gap Analysis</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Comparative assessment of your current proficiency vs employer requirements for {plan.target_role}.</p>
          </div>
          <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: '0.8rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px' }}>
            {skillsData.skill_gaps?.length || 0} Recorded Competencies
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Skill / Competency</th>
                <th style={{ padding: '0.75rem 1rem', width: '220px' }}>Current Proficiency</th>
                <th style={{ padding: '0.75rem 1rem' }}>Target</th>
                <th style={{ padding: '0.75rem 1rem' }}>Gap</th>
                <th style={{ padding: '0.75rem 1rem' }}>Priority</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {skillsData.skill_gaps?.map((row, idx) => {
                const hasCurrentScore = Number.isFinite(Number(row.current));
                const hasTargetScore = Number.isFinite(Number(row.target));
                let badgeBg = '#f1f5f9';
                let badgeColor = '#475569';
                if (row.priority === 'Strong') {
                  badgeBg = '#dcfce7';
                  badgeColor = '#15803d';
                } else if (row.priority === 'High') {
                  badgeBg = '#fef3c7';
                  badgeColor = '#b45309';
                } else if (row.priority === 'Critical') {
                  badgeBg = '#fee2e2';
                  badgeColor = '#b91c1c';
                }

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>
                      {row.skill}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${hasCurrentScore ? row.current : 0}%`, height: '100%', background: !hasCurrentScore ? '#94a3b8' : (row.current >= 80 ? '#16a34a' : (row.current >= 60 ? '#f59e0b' : '#ef4444')) }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', minWidth: '35px' }}>{hasCurrentScore ? `${row.current}%` : "Not assessed"}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>
                      {hasTargetScore ? `${row.target}%` : "Not recorded"}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: row.gap === 0 ? '#16a34a' : '#b45309' }}>
                      {Number.isFinite(Number(row.gap)) ? (row.gap === 0 ? "0% (Met)" : `${row.gap}%`) : "Not assessed"}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: badgeBg, color: badgeColor, padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {row.priority}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {Number.isFinite(Number(row.gap)) && row.gap > 0 ? (
                        <button
                          onClick={() => {
                            if (row.skill.includes('Communication')) handleStartAssessment("Communication Assessment");
                            else setActiveCourseModal(row.skill);
                          }}
                          style={{ padding: '0.4rem 0.85rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Remediate Gap
                        </button>
                      ) : (
                        <span style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                          <CheckCircle2 size={15} /> Recorded
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!skillsData.skill_gaps?.length && (
                <tr><td colSpan="6" style={{ padding: '1rem', color: '#64748b' }}>No active vacancy requirements are available for a skill-gap comparison.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI RECOMMENDATIONS SECTION */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
          AI-Recommended Learning Pathways
        </h3>
        <p style={{ color: '#64748b', margin: '0 0 1.25rem 0', fontSize: '0.9rem' }}>
          Derived from the skill requirements of your highest-match jobs.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {skillsData.ai_recommendations?.map((rec, idx) => (
            <div key={idx} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>{rec.skill}</span>
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{rec.impact}</span>
                </div>
                
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{rec.title}</h4>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>{rec.why}</p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} /> {rec.duration}</span>
                  <span>•</span>
                  <span>{rec.difficulty}</span>
                  <span>•</span>
                  <span>{rec.provider}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (rec.type === 'assessment') handleStartAssessment("Communication Assessment");
                  else setActiveCourseModal(rec.title);
                }}
                style={{ width: '100%', padding: '0.65rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                {rec.type === 'assessment' ? <Award size={15} /> : <Play size={15} />}
                {rec.type === 'assessment' ? "Take Assessment" : "Start Learning Module"}
              </button>
            </div>
          ))}
          {!skillsData.ai_recommendations?.length && <p style={{ color: '#64748b', margin: 0 }}>No learning recommendation is available from recorded data.</p>}
        </div>
      </div>

      {/* COURSE CATALOG & CAREER ASSESSMENTS (2-COLUMN) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Course Catalog */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Recommended Courses</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Industry-aligned modules</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {skillsData.course_catalog?.map((course, idx) => (
              <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{course.title}</strong>
                    {course.recommended && (
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>AI Pick</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    {course.provider} • {course.duration} • {course.level}
                  </p>
                </div>

                <button
                  onClick={() => setActiveCourseModal(course.title)}
                  style={{ padding: '0.45rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
                >
                  {course.progress > 0 ? "Continue" : "Start"}
                </button>
              </div>
            ))}
            {!skillsData.course_catalog?.length && <p style={{ color: '#64748b', margin: 0 }}>No course provider is configured for this plan.</p>}
          </div>
        </div>

        {/* Career Assessments */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Benchmark Assessments</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Recorded scores</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(skillsData.assessments || {}).map(([name, item], idx) => (
              <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>{name}</strong>
                  <span style={{ fontSize: '0.8rem', color: item.completed ? '#16a34a' : '#64748b' }}>
                    {item.completed ? `Score: ${item.score}% (Completed)` : item.impact}
                  </span>
                </div>

                {item.completed ? (
                  <button
                    onClick={() => handleStartAssessment(name)}
                    style={{ padding: '0.45rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                  >
                    Retake Test
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartAssessment(name)}
                    style={{ padding: '0.45rem 0.85rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Take Test
                  </button>
                )}
              </div>
            ))}
            {Object.keys(skillsData.assessments || {}).length === 0 && <p style={{ color: '#64748b', margin: 0 }}>No assessment result is recorded.</p>}
          </div>
        </div>

      </div>

      {/* VISUAL SKILL ROADMAP */}
      {skillsData.mode !== "production" && <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Career Progression Roadmap</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem 0' }}>
          
          <div style={{ textAlign: 'center', flex: 1, minWidth: '120px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem auto' }}><CheckCircle2 size={20}/></div>
            <strong style={{ fontSize: '0.85rem', display: 'block', color: '#0f172a' }}>Current State</strong>
            <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>95% Base Readiness</span>
          </div>
          <ArrowRight size={18} color="#cbd5e1" />

          <div style={{ textAlign: 'center', flex: 1, minWidth: '120px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem auto' }}><BookOpen size={20}/></div>
            <strong style={{ fontSize: '0.85rem', display: 'block', color: '#0f172a' }}>Close SIEM Gap</strong>
            <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>6 Hours Module</span>
          </div>
          <ArrowRight size={18} color="#cbd5e1" />

          <div style={{ textAlign: 'center', flex: 1, minWidth: '120px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem auto' }}><Award size={20}/></div>
            <strong style={{ fontSize: '0.85rem', display: 'block', color: '#0f172a' }}>Assessment</strong>
            <span style={{ fontSize: '0.75rem', color: '#b45309' }}>Communication</span>
          </div>
          <ArrowRight size={18} color="#cbd5e1" />

          <div style={{ textAlign: 'center', flex: 1, minWidth: '120px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem auto' }}><TrendingUp size={20}/></div>
            <strong style={{ fontSize: '0.85rem', display: 'block', color: '#0f172a' }}>Target Match</strong>
            <span style={{ fontSize: '0.75rem', color: '#7c3aed' }}>98% Target</span>
          </div>
          <ArrowRight size={18} color="#cbd5e1" />

          <div style={{ textAlign: 'center', flex: 1, minWidth: '120px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem auto' }}><Target size={20}/></div>
            <strong style={{ fontSize: '0.85rem', display: 'block', color: '#0f172a' }}>Interview & Offer</strong>
            <span style={{ fontSize: '0.75rem', color: '#15803d' }}>Cybersecurity Analyst</span>
          </div>

        </div>
      </div>}

      {/* ===================== INTERACTIVE ASSESSMENT MODAL ===================== */}
      {showAssessmentModal && skillsData.mode !== "production" && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>VERIFICATION ASSESSMENT</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>{activeAssessmentName}</h3>
              </div>
              <button onClick={() => setShowAssessmentModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ padding: '2rem' }}>
              {!assessmentSubmitted ? (
                <>
                  <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '0.95rem' }}>
                    Complete this 3-question evaluation to benchmark and verify your incident communication capabilities.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block', marginBottom: '0.5rem' }}>
                        1. How should a critical security vulnerability be communicated to cross-functional stakeholders?
                      </strong>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#334155' }}>
                        <input type="radio" name="q1" onChange={() => setAssessmentAnswers({ ...assessmentAnswers, q1: 'a' })} />
                        Provide clear risk impact, remediation timeline, and non-technical summary.
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
                        <input type="radio" name="q1" onChange={() => setAssessmentAnswers({ ...assessmentAnswers, q1: 'b' })} />
                        Send raw vulnerability scanner logs without context.
                      </label>
                    </div>

                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block', marginBottom: '0.5rem' }}>
                        2. During an active incident triage, what is the primary objective of a shift handover log?
                      </strong>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#334155' }}>
                        <input type="radio" name="q2" onChange={() => setAssessmentAnswers({ ...assessmentAnswers, q2: 'a' })} />
                        Ensure continuous situational awareness, open action items, and pending IOCs.
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
                        <input type="radio" name="q2" onChange={() => setAssessmentAnswers({ ...assessmentAnswers, q2: 'b' })} />
                        Document total team hours worked only.
                      </label>
                    </div>

                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block', marginBottom: '0.5rem' }}>
                        3. What is the standard protocol when communicating an escalating data compromise to legal counsel?
                      </strong>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#334155' }}>
                        <input type="radio" name="q3" onChange={() => setAssessmentAnswers({ ...assessmentAnswers, q3: 'a' })} />
                        Provide objective, verified timelines under attorney-client privilege protocols.
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
                        <input type="radio" name="q3" onChange={() => setAssessmentAnswers({ ...assessmentAnswers, q3: 'b' })} />
                        Post immediate speculation on public status portals.
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setShowAssessmentModal(false)}
                      style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssessmentSubmit}
                      style={{ padding: '0.75rem 2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
                    >
                      Submit Assessment
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Assessment Completed!</h3>
                  <p style={{ margin: '0 0 1.5rem 0', fontSize: '1.15rem', color: '#16a34a', fontWeight: 800 }}>
                    Score: {assessmentScore}% — Recorded Demo Result
                  </p>
                  <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '2rem' }}>
                    The result has been recorded in the demo profile for <strong>Communication</strong>.
                  </p>
                  <button
                    onClick={() => setShowAssessmentModal(false)}
                    style={{ padding: '0.75rem 2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ===================== DEMO COURSE PLAYER MODAL ===================== */}
      {activeCourseModal && skillsData.mode !== "production" && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '650px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>MICRO-LEARNING MODULE</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>{activeCourseModal}</h3>
              </div>
              <button onClick={() => setActiveCourseModal(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ background: '#0f172a', borderRadius: '10px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Play size={44} color="#38bdf8" />
              <span style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 600 }}>Interactive Video & Lab Terminal</span>
            </div>

            <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              In this module, you will analyze real-world SIEM query strings, build custom alert correlation rules, and practice incident severity scoring.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setActiveCourseModal(null)} style={{ padding: '0.7rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Close Module
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  GraduationCap,
  MapPin,
  Target,
  BriefcaseBusiness,
  CheckCircle2,
  Award,
  Bookmark,
  Mail,
  FileText,
  Sparkles,
  BarChart2,
  X,
  Building,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import EmployerNav from "./Employer/EmployerNav";

export default function EmployerCandidateProfile() {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  const [shortlisted, setShortlisted] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showSkillAnalysisModal, setShowSkillAnalysisModal] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactMessage, setContactMessage] = useState("Hello, we reviewed your profile on the Skilling Intelligence Portal and would like to invite you for an initial technical interview.");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAuth(`${API_BASE}/api/employers/${organizationId}/candidates/${candidateId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Candidate not found");
        return res.json();
      })
      .then((data) => {
        setCandidate(data);
        setShortlisted(Boolean(data.is_shortlisted));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [candidateId, organizationId]);

  const handleToggleShortlist = async () => {
    if (!candidate?.recommended_job_id) {
      setActionError("No active vacancy is available to shortlist this candidate against.");
      return;
    }
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/shortlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainee_id: candidateId, job_id: candidate.recommended_job_id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unable to update shortlist.");
      setShortlisted(data.shortlisted);
    } catch (err) {
      console.error(err);
      setActionError(err.message || "Unable to update shortlist.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendContact = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainee_id: candidateId, message: contactMessage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unable to record the contact request.");
      setContactSuccess(true);
      setTimeout(() => {
        setContactSuccess(false);
        setShowContactModal(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setActionError(err.message || "Unable to record the contact request.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <EmployerNav />
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading candidate profile...
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <EmployerNav />
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Candidate not found. <button onClick={() => navigate("/employer/candidates")} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Return to Candidate Pool</button>
        </div>
      </div>
    );
  }

  const parsedMatch = Number(candidate.match);
  const matchVal = Number.isFinite(parsedMatch) ? parsedMatch : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmployerNav />

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        {actionError && (
          <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            {actionError}
          </div>
        )}
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/employer/candidates")}
          style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} /> Back to Candidate Pool
        </button>

        {/* Profile Header Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
              {candidate.initials || "?"}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{candidate.name}</h1>
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>
                  {candidate.trainingStatus || "Training status not recorded"}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                {candidate.traineeId} • {candidate.programme} • <MapPin size={13} style={{ verticalAlign: 'middle' }} /> {candidate.location}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowResumeModal(true)}
              style={{ padding: '0.6rem 1rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileText size={15} /> View Resume
            </button>

            <button
              onClick={() => setShowSkillAnalysisModal(true)}
              style={{ padding: '0.6rem 1rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <BarChart2 size={15} /> Skill Analysis
            </button>

            <button
              onClick={handleToggleShortlist}
              disabled={actionLoading || !candidate.recommended_job_id}
              style={{ padding: '0.6rem 1.15rem', background: shortlisted ? '#fef3c7' : '#ffffff', border: shortlisted ? '1px solid #fde68a' : '1px solid #cbd5e1', color: shortlisted ? '#b45309' : '#0f172a', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Bookmark size={15} fill={shortlisted ? "#b45309" : "none"} />
              {shortlisted ? "Shortlisted ✓" : "Shortlist Candidate"}
            </button>

            <button
              onClick={() => setShowContactModal(true)}
              disabled={actionLoading}
              style={{ padding: '0.6rem 1.25rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}
            >
              <Mail size={15} /> Contact Candidate
            </button>
          </div>

        </div>

        {/* 2-COLUMN MAIN CONTENT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '2rem' }}>
          
          {/* LEFT COLUMN: AI MATCH, EDUCATION, EXPERIENCE, PROJECTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* AI Employer Match Breakdown Card */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>AI WORKFORCE MATCHING</span>
                  <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Role Match & Gap Analysis</h3>
                </div>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800 }}>
                  {matchVal}% Role Match
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ width: `${matchVal}%`, height: '100%', background: '#16a34a' }}></div>
              </div>

              {/* AI Explanation Paragraph */}
              <div style={{ background: '#eff6ff', padding: '1rem 1.25rem', borderRadius: '8px', borderLeft: '4px solid #2563eb', marginBottom: '1.5rem' }}>
                <strong style={{ fontSize: '0.85rem', color: '#1e40af', display: 'block', marginBottom: '0.35rem' }}>AI Matching Rationale:</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.45 }}>
                  {candidate.ai_recommendation?.summary || "No role-specific matching rationale has been recorded."}
                </p>
              </div>

              {/* Strengths & Gaps Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <strong style={{ fontSize: '0.8rem', color: '#16a34a', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                    ✓ Recorded matching skills
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {candidate.ai_recommendation?.strengths?.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <strong style={{ fontSize: '0.8rem', color: '#b45309', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                    △ Identified Gaps to Mitigate
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {candidate.ai_recommendation?.skill_gaps?.map((gap, idx) => (
                      <li key={idx}>{gap}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  <strong>Recommended Intervention:</strong> {candidate.ai_recommendation?.intervention_recommendation || "Candidate ready for direct technical placement."}
                </span>
              </div>

            </div>

            {/* Experience & Internships */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BriefcaseBusiness size={18} color="#2563eb" /> Work Experience & Internships
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {candidate.experience?.map((exp, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{exp.role}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{exp.period}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>{exp.company}</span>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects & Capstone Work */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#2563eb" /> Technical Projects & Portfolios
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {candidate.projects?.map((proj, idx) => (
                  <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>{proj.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700, background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '0.4rem' }}>
                      Tech: {proj.tech}
                    </span>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: SKILLS BREAKDOWN, EDUCATION, CERTS, ROLES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Skill Proficiencies */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={18} color="#2563eb" /> Recorded Skill Evidence
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {candidate.skills?.map((s, idx) => {
                  const rawProficiency = Number(s.proficiency);
                  const prof = Number.isFinite(rawProficiency) ? Math.max(0, Math.min(100, rawProficiency)) : null;
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</span>
                        <span style={{ fontWeight: 700, color: prof === null ? '#64748b' : (prof >= 80 ? '#16a34a' : (prof >= 60 ? '#f59e0b' : '#dc2626')) }}>{prof === null ? "Not assessed" : `${prof}%`}</span>
                      </div>
                      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${prof ?? 0}%`, height: '100%', background: prof === null ? '#94a3b8' : (prof >= 80 ? '#16a34a' : (prof >= 60 ? '#f59e0b' : '#dc2626')) }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Education Qualifications */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={18} color="#2563eb" /> Education
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {candidate.education?.map((edu, idx) => (
                  <div key={idx} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>{edu.degree}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{edu.college} • {edu.year}</span>
                    {edu.grade && <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>Score: {edu.grade}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="#2563eb" /> Recorded Certifications
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {candidate.certifications?.map((cert, idx) => (
                  <div key={idx} style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>{cert.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{cert.issuer} • {cert.date}</span>
                    {cert.id && <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, marginTop: '2px' }}>ID: {cert.id}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Eligible / Suggested Roles */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Suggested Job Roles</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {candidate.eligibleRoles?.map((r, idx) => (
                  <span key={idx} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ================= RESUME PREVIEW MODAL ================= */}
      {showResumeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>CANDIDATE PROFILE SUMMARY</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>{candidate.name} — Curriculum Vitae</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{candidate.traineeId} • {candidate.programme}</span>
              </div>
              <button onClick={() => setShowResumeModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', lineHeight: 1.6, color: '#334155' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Executive Summary</h4>
              <p style={{ margin: '0 0 1rem 0' }}>
                {candidate.ai_recommendation?.summary || "No verified resume summary has been recorded for this candidate."}
              </p>

              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Recorded Education</h4>
              <p style={{ margin: '0 0 1rem 0' }}>
                {candidate.education?.length ? "See the recorded education section in this profile." : "No education record has been provided."}
              </p>

              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Core Competencies</h4>
              <p style={{ margin: 0 }}>
                {candidate.skills?.length ? candidate.skills.map((skill) => skill.name).join(", ") : "No skill record has been provided."}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setShowResumeModal(false)} style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SKILL ANALYSIS MODAL ================= */}
      {showSkillAnalysisModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '650px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>AI WORKFORCE INTELLIGENCE</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>3-Way Skill Gap Analysis</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Curriculum vs Candidate Transcripts vs Vacancy Requirements</span>
              </div>
              <button onClick={() => setShowSkillAnalysisModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#334155' }}>
                <strong>Candidate:</strong> {candidate.name} ({candidate.traineeId})
              </p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#334155' }}>
                <strong>Hiring Vacancy:</strong> {candidate.target_role || "No active vacancy"} {candidate.recommended_job_id ? `(${candidate.recommended_job_id})` : ""}
              </p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#334155' }}>
                <strong>Calculated Match:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{matchVal}% Alignment</span>
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                {candidate.ai_recommendation?.summary || "No role-specific analysis is available."}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSkillAnalysisModal(false)} style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONTACT CANDIDATE MODAL ================= */}
      {showContactModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>OUTREACH GATEWAY</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Contact {candidate.name}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Trainee ID: {candidate.traineeId} • {candidate.programme}</span>
              </div>
              <button onClick={() => setShowContactModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            {contactSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.15rem' }}>Contact Request Recorded</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Configure a delivery provider before treating this request as an external message.
                </p>
              </div>
            ) : (
              <>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <p style={{ margin: '0 0 0.4rem 0', color: '#334155' }}><strong>Email:</strong> {candidate.email || "Not provided"}</p>
                  <p style={{ margin: '0 0 0.4rem 0', color: '#334155' }}><strong>Phone:</strong> {candidate.phone || "Not provided"}</p>
                  <p style={{ margin: 0, color: '#334155' }}><strong>Availability:</strong> {candidate.availability || "Not recorded"}</p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    Contact note
                  </label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', height: '90px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    onClick={() => setShowContactModal(false)}
                    style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendContact}
                    style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Record Contact Request
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, MapPin, Target } from "lucide-react";
import EmployerNav from "./Employer/EmployerNav";

function formatSalary(job) {
  if (job.salary_range) return job.salary_range;
  if (job.min_salary == null && job.max_salary == null) return "Salary not recorded";
  if (job.min_salary == null) return `Up to ₹${Number(job.max_salary).toLocaleString()}`;
  if (job.max_salary == null) return `From ₹${Number(job.min_salary).toLocaleString()}`;
  return `₹${Number(job.min_salary).toLocaleString()}–₹${Number(job.max_salary).toLocaleString()}`;
}

export default function JobCandidates() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const readResponse = async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || "Unable to load vacancy matches.");
      return body;
    };

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [loadedJob, matchedCandidates] = await Promise.all([
          fetchAuth(`${API_BASE}/api/jobs/${jobId}`).then(readResponse),
          fetchAuth(`${API_BASE}/api/jobs/${jobId}/candidates`).then(readResponse)
        ]);
        if (!active) return;
        setJob(loadedJob);
        setCandidates(matchedCandidates || []);
      } catch (loadError) {
        console.error(loadError);
        if (active) setError(loadError.message || "Unable to load vacancy matches.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [jobId, organizationId]);

  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#f8fafc' }}><EmployerNav /><div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Evaluating recorded candidate matches…</div></div>;
  }

  if (error || !job) {
    return <div style={{ minHeight: '100vh', background: '#f8fafc' }}><EmployerNav /><div role="alert" style={{ maxWidth: '760px', margin: '3rem auto', padding: '1rem', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>{error || "Vacancy not found."}</div></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmployerNav />
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <button onClick={() => navigate("/employer-dashboard")} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}><BriefcaseBusiness size={18} color="#2563eb" /><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>ACTIVE VACANCY CANDIDATE MATCHING</span></div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>{job.title || job.role}</h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}><MapPin size={13} style={{ verticalAlign: 'middle' }} /> {job.location || "Location not recorded"} • {job.openings ?? 0} openings • {formatSalary(job)}</p>
          </div>
          <div style={{ textAlign: 'right' }}><span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800 }}>{candidates.length} Matches at 65%+</span><div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Calculated from programme, assessment, and vacancy data</div></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {candidates.map((candidate) => {
            const match = Number(candidate.match_percentage) || 0;
            return (
              <div key={candidate.trainee_id} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div><strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>{candidate.name || "Unnamed candidate"}</strong><p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#475569' }}>{candidate.trainee_id} • {candidate.programme || "Programme not recorded"} • <MapPin size={12} style={{ verticalAlign: 'middle' }} /> {candidate.district || "Location not recorded"}</p></div>
                  <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}><span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>3-way Match</span><strong style={{ fontSize: '1.25rem', color: '#16a34a' }}>{match}%</strong></div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                  {(candidate.matched_skills || []).map((skill) => <span key={`met-${skill}`} style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>✓ {skill}</span>)}
                  {(candidate.missing_skills || []).map((skill) => <span key={`gap-${skill}`} style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>△ {skill} gap</span>)}
                </div>
                <div style={{ background: '#eff6ff', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: '4px solid #2563eb', marginBottom: '1.25rem' }}><p style={{ margin: 0, fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.45 }}><strong>Match explanation:</strong> {candidate.reasoning || "No explanation is available."}</p></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button onClick={() => navigate(`/employer/candidates/${candidate.trainee_id}`)} style={{ padding: '0.55rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>View Candidate Profile <ArrowRight size={15} /></button></div>
              </div>
            );
          })}
          {candidates.length === 0 && <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem', color: '#64748b', textAlign: 'center' }}><Target size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />No candidates meet the 65% threshold for this vacancy.</div>}
        </div>
      </div>
    </div>
  );
}

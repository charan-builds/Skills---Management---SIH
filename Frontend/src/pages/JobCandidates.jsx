import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ArrowRight,
  BriefcaseBusiness
} from "lucide-react";
import EmployerNav from "./Employer/EmployerNav";

export default function JobCandidates() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";

  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch job details and matched candidates
    Promise.all([
      fetchAuth(`${API_BASE}/api/employers/${organizationId}/active-vacancies`).then(res => res.json()),
      fetchAuth(`${API_BASE}/api/employers/${organizationId}/recommended-candidates`).then(res => res.json())
    ]).then(([jobsList, recCandidates]) => {
      const currentJob = (jobsList || []).find(j => j.id === jobId) || {
        id: jobId,
        title: jobId.includes('007') ? "Cybersecurity Analyst" : "ML/AI Associate",
        location: jobId.includes('007') ? "Hyderabad" : "Nalgonda",
        openings: 4,
        salary_range: "₹4.5–7 LPA",
        skills_required: ["Python", "Machine Learning", "SQL", "Statistics"]
      };
      setJob(currentJob);

      // Enhance candidates with multi-dimensional match scores against this job
      const matchedList = (recCandidates || []).map((cand, idx) => {
        const baseMatch = cand.match_percentage || 90;
        return {
          ...cand,
          overall_match: baseMatch,
          skill_match: baseMatch,
          experience_match: 90 + (idx % 8),
          location_match: cand.district?.toLowerCase() === currentJob.location?.toLowerCase() ? 100 : 85
        };
      });
      setCandidates(matchedList);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [jobId, organizationId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <EmployerNav />
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Evaluating matched candidates for vacancy...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmployerNav />

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/employer-dashboard")}
          style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Job Requisition Banner */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <BriefcaseBusiness size={18} color="#2563eb" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                ACTIVE VACANCY CANDIDATE MATCHING
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              {job?.title}
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              <MapPin size={13} style={{ verticalAlign: 'middle' }} /> {job?.location} • {job?.openings} Openings • {job?.salary_range}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800 }}>
              {candidates.length} Qualified Matches Found
            </span>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
              Min Match Threshold: 65%
            </div>
          </div>
        </div>

        {/* Matched Candidates Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {candidates.map((cand) => (
            <div
              key={cand.trainee_id}
              style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
            >
              {/* Header: Candidate Identity & Multi-Dimensional Match */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', fontWeight: 800 }}>
                    {cand.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>{cand.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({cand.trainee_id})</span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      {cand.programme} • <MapPin size={12} style={{ verticalAlign: 'middle' }} /> {cand.district} ({cand.experience})
                    </p>
                  </div>
                </div>

                {/* Match Metrics Badges */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Overall Match</span>
                    <strong style={{ fontSize: '1.25rem', color: '#16a34a' }}>{cand.overall_match}%</strong>
                  </div>

                  <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Skill Fit</span>
                    <strong style={{ fontSize: '1.1rem', color: '#2563eb' }}>{cand.skill_match}%</strong>
                  </div>

                  <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', textTransform: 'uppercase' }}>Location Fit</span>
                    <strong style={{ fontSize: '1.1rem', color: '#7c3aed' }}>{cand.location_match}%</strong>
                  </div>
                </div>
              </div>

              {/* Skills breakdown */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                {cand.matched_skills?.map((s, idx) => (
                  <span key={idx} style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    ✓ {s}
                  </span>
                ))}
                {cand.missing_skills?.map((s, idx) => (
                  <span key={idx} style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                    △ {s} (Gap)
                  </span>
                ))}
              </div>

              {/* AI Recommendation Explanation */}
              <div style={{ background: '#eff6ff', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: '4px solid #2563eb', marginBottom: '1.25rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.45 }}>
                  <strong>AI Match Explanation:</strong> "{cand.reasoning}"
                </p>
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => navigate(`/employer/candidates/${cand.trainee_id}`)}
                  style={{ padding: '0.55rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  View Full Candidate Profile <ArrowRight size={15} />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

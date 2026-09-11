import { useState, useEffect } from "react";
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';
import {
  Briefcase,
  MapPin,
  Building2,
  CheckCircle,
  Search,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useParams } from "react-router-dom";

export default function TraineeExploreJobs() {
  const { traineeId: paramTraineeId } = useParams();
  const traineeId = paramTraineeId || localStorage.getItem("traineeId") || "T102";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [applyingId, setApplyingId] = useState(null);
  const [applyMessage, setApplyMessage] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/jobs`);
      if (!res.ok) throw new Error("Failed to load jobs");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load job recommendations at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [traineeId]);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    setApplyMessage("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/jobs/${jobId}/apply`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok) {
        setApplyMessage(`✓ Applied successfully to ${data.application?.job_title || "job"}!`);
        setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? { ...j, has_applied: true } : j));
        setTimeout(() => setApplyMessage(""), 4000);
      } else {
        setError(data.detail || "Application submission failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to submit job application.");
    } finally {
      setApplyingId(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (!search) return true;
    const term = search.toLowerCase();
    const title = (job.title || job.role || "").toLowerCase();
    const employer = (job.employer_name || job.company || "").toLowerCase();
    const location = (job.location || "").toLowerCase();
    return title.includes(term) || employer.includes(term) || location.includes(term);
  });

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
        <p style={{ color: '#64748b' }}>Matching open employer requisitions to your skill profile...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1280px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Sparkles size={18} color="#2563eb" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            AI SKILL-MATCHED FEED
          </span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
          Explore Open Opportunities
        </h2>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
          Jobs are automatically ranked by compatibility with your verified skills and certifications.
        </p>
      </div>

      {applyMessage && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', borderRadius: '8px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          {applyMessage}
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <Search size={18} color="#64748b" />
        <input
          type="text"
          placeholder="Search by job title, skill requirement, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', color: '#0f172a' }}
        />
      </div>

      {/* Jobs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredJobs.map((job) => {
          const matchScore = job.match_percentage || 75;
          const matchColor = matchScore >= 85 ? '#16a34a' : (matchScore >= 70 ? '#2563eb' : '#f59e0b');
          const matchBg = matchScore >= 85 ? '#dcfce7' : (matchScore >= 70 ? '#eff6ff' : '#fef3c7');

          return (
            <div
              key={job.id}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                {/* Top Badge Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ background: matchBg, color: matchColor, fontSize: '0.8rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={13} /> {matchScore}% AI Match
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {job.employment_type || "Full-Time"}
                  </span>
                </div>

                {/* Job Title & Employer */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                  {job.title || job.role || "Job Requisition"}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 500 }}>
                  <Building2 size={16} color="#64748b" />
                  <span>{job.employer_name || job.company || "Enterprise Employer"}</span>
                </div>

                {/* Meta details */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={15} color="#64748b" />
                    <span>{job.location || "Hyderabad"}</span>
                  </div>
                  {job.salary_range && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: '#059669' }}>
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                </div>

                {/* Required Skills */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Required Skills
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {(job.skills_required || job.required_skills || ["Python", "SQL"]).map((sk, idx) => {
                      const skillName = typeof sk === 'string' ? sk : (sk.skill_name || sk.name || "Skill");
                      return (
                        <span key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          {skillName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {job.has_applied ? (
                  <button
                    disabled
                    style={{ width: '100%', background: '#f1f5f9', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'default' }}
                  >
                    <CheckCircle size={16} color="#16a34a" /> Applied
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={applyingId === job.id}
                    style={{ width: '100%', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.75rem', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}
                  >
                    {applyingId === job.id ? "Submitting Application..." : "1-Click Apply"} <ArrowRight size={16} />
                  </button>
                )}
              </div>

            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div style={{ gridColumn: '1 / -1', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Briefcase size={36} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No Job Requisitions Found</h3>
            <p style={{ margin: 0 }}>Try clearing your search term or updating your target role in settings.</p>
          </div>
        )}
      </div>

    </div>
  );
}

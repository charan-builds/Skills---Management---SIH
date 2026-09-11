import { useState, useEffect } from "react";
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';
import {
  Briefcase,
  Plus,
  Building2,
  MapPin,
  X,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import EmployerNav from "./EmployerNav";

export default function EmployerJobs() {
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";
  const organizationName = localStorage.getItem("organizationName") || "TechFlow Solutions";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [postSuccess, setPostSuccess] = useState("");

  const [newJob, setNewJob] = useState({
    title: "",
    role: "",
    location: "Hyderabad",
    work_mode: "Hybrid",
    employment_type: "Full-Time",
    min_salary: 400000,
    max_salary: 600000,
    skills_required: "Python, SQL, Communication",
    description: ""
  });

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/active-vacancies`);
      if (!res.ok) throw new Error("Failed to load vacancies");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load active vacancies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [organizationId]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPostSuccess("");
    setError("");
    try {
      const skillsArray = newJob.skills_required.split(",").map(s => ({
        skill_name: s.trim(),
        required_level: 80,
        importance: 1.0
      })).filter(s => s.skill_name);

      const payload = {
        id: `J${Date.now().toString().slice(-4)}`,
        employer_id: organizationId,
        employer_name: organizationName,
        title: newJob.title || newJob.role,
        role: newJob.role || newJob.title,
        industry: "Information Technology",
        location: newJob.location,
        work_mode: newJob.work_mode,
        employment_type: newJob.employment_type,
        min_salary: Number(newJob.min_salary),
        max_salary: Number(newJob.max_salary),
        skills_required: skillsArray,
        description: newJob.description,
        status: "Active"
      };

      const res = await fetchAuth(`${API_BASE}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setPostSuccess("✓ Job requisition published successfully! Trainees can now view and apply.");
        fetchJobs();
        setTimeout(() => {
          setPostSuccess("");
          setShowPostModal(false);
        }, 1500);
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to post job requisition.");
      }
    } catch (err) {
      console.error(err);
      setError("Error creating job requisition.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmployerNav />

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Briefcase size={18} color="#2563eb" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                RECRUITMENT REQUISITIONS
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              Job Vacancies Management
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
              Post active job openings, define required skills, and discover pre-vetted trainees.
            </p>
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            style={{ padding: '0.75rem 1.25rem', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}
          >
            <Plus size={18} /> Post New Job Requisition
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
            <p style={{ color: '#64748b' }}>Loading active job requisitions...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {jobs.map(job => (
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>
                      {job.status || "Active"}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                      ID: {job.id}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                    {job.title || job.role}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <MapPin size={15} />
                    <span>{job.location} • {job.work_mode || "Hybrid"}</span>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', margin: '0 0 0.4rem 0' }}>
                      Skill Requirements
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {(job.skills_required || job.required_skills || []).map((sk, idx) => (
                        <span key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          {typeof sk === 'string' ? sk : (sk.skill_name || sk.name)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700, paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  {job.salary_range || `₹${job.min_salary || 400000} – ₹${job.max_salary || 600000}`}
                </div>
              </div>
            ))}

            {jobs.length === 0 && (
              <div style={{ gridColumn: '1 / -1', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <Briefcase size={36} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No Job Requisitions Posted Yet</h3>
                <p style={{ margin: 0 }}>Click "Post New Job Requisition" to create your first vacancy.</p>
              </div>
            )}
          </div>
        )}

        {/* POST JOB MODAL */}
        {showPostModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative' }}>
              <button
                onClick={() => setShowPostModal(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Briefcase size={22} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Post Job Requisition</h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Define your hiring requirements to match against certified state trainees.
              </p>

              {postSuccess && (
                <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} /> {postSuccess}
                </div>
              )}

              <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Job Title / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Cybersecurity Analyst"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value, role: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      required
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Work Mode</label>
                    <select
                      value={newJob.work_mode}
                      onChange={(e) => setNewJob({ ...newJob, work_mode: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-Site">On-Site</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Required Skills (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Linux, Networking, Cybersecurity, Python"
                    value={newJob.skills_required}
                    onChange={(e) => setNewJob({ ...newJob, skills_required: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    style={{ flex: 1, padding: '0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '0.75rem', background: '#2563eb', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(37,99,235,0.25)' }}
                  >
                    Publish Requisition
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

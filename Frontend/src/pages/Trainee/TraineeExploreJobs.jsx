import { useState, useEffect } from "react";
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';
import {
  Search,
  Filter,
  MapPin,
  Building,
  DollarSign,
  BriefcaseBusiness,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Send,
  Sparkles,
  Check,
  FileText
} from "lucide-react";
import { useParams } from "react-router-dom";

export default function TraineeExploreJobs({ onApplySuccess }) {
  const { traineeId: paramTraineeId } = useParams();
  const traineeId = paramTraineeId || localStorage.getItem("traineeId") || "T102";

  const [jobsData, setJobsData] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [workModeFilter, setWorkModeFilter] = useState("All");
  const [salaryFilter, setSalaryFilter] = useState("All");
  const [matchFilter, setMatchFilter] = useState("All");

  // Modals
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);
  const [coverNote, setCoverNote] = useState("");
  const [selectedResume, setSelectedResume] = useState("Priya_Gupta_Cybersecurity_Resume.pdf");
  const [appSubmitted, setAppSubmitted] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/jobs`);
      if (res.ok) {
        const data = await res.json();
        setJobsData(data.jobs || []);
        setSavedJobs(data.saved_job_ids || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [traineeId]);

  const handleToggleSave = async (jobId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/jobs/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedJobs(data.saved_jobs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmApply = async () => {
    if (!applyingJob) return;
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: applyingJob.job.id,
          role: applyingJob.job.role,
          company: applyingJob.job.company,
          location: applyingJob.job.location,
          work_mode: applyingJob.job.work_mode,
          salary_range: applyingJob.job.salary_range,
          match_percentage: applyingJob.match_percentage,
          cover_note: coverNote
        })
      });
      if (res.ok) {
        setAppSubmitted(true);
        if (onApplySuccess) onApplySuccess();
        setTimeout(() => {
          setAppSubmitted(false);
          setApplyingJob(null);
          setSelectedJob(null);
          setCoverNote("");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logic
  const filteredJobs = jobsData.filter(item => {
    const job = item.job;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      job.role.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.required_skills.some(s => s.toLowerCase().includes(q));

    const matchesLocation = locationFilter === "All" || job.location.toLowerCase() === locationFilter.toLowerCase();
    const matchesWorkMode = workModeFilter === "All" || (job.work_mode && job.work_mode.toLowerCase() === workModeFilter.toLowerCase());
    const matchesMatch = matchFilter === "All" || (matchFilter === "90" && item.match_percentage >= 90) || (matchFilter === "80" && item.match_percentage >= 80);

    return matchesSearch && matchesLocation && matchesWorkMode && matchesMatch;
  });

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading Opportunities...</div>;
  }

  return (
    <div style={{ maxWidth: '1280px' }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Sparkles size={18} color="#2563eb" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Explore Matching Opportunities</h2>
        </div>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
          Discover verified roles scored deterministically against your certified competencies and training background.
        </p>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        
        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, or required skill (e.g. Linux, SIEM, Python)..."
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
            />
          </div>
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.75rem 1.25rem', borderRadius: '8px', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdowns Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Location</label>
            <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
              <option value="All">All Locations</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Remote">Remote</option>
              <option value="Warangal">Warangal</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Work Mode</label>
            <select value={workModeFilter} onChange={e => setWorkModeFilter(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
              <option value="All">All Work Modes</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="On-site">On-site</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Match Percentage</label>
            <select value={matchFilter} onChange={e => setMatchFilter(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
              <option value="All">All Matches</option>
              <option value="90">90%+ Best Match</option>
              <option value="80">80%+ Strong Match</option>
            </select>
          </div>

        </div>

      </div>

      {/* RESULTS HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          {filteredJobs.length} Verified {filteredJobs.length === 1 ? "Opportunity" : "Opportunities"}
        </h3>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Sorted by AI Skill Match Score
        </span>
      </div>

      {/* JOBS GRID */}
      {filteredJobs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {filteredJobs.map((item, idx) => {
            const isSaved = savedJobs.includes(item.job.id);
            return (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <div>
                  
                  {/* Card Top: Title, Company, Match Badge, Save button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                        {item.job.role}
                      </h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Building size={14} /> {item.job.company} • <MapPin size={13} /> {item.job.location}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
                        {item.match_percentage}% Match
                      </div>
                      <button
                        onClick={(e) => handleToggleSave(item.job.id, e)}
                        title={isSaved ? "Saved Job" : "Save Job"}
                        style={{ background: isSaved ? '#eff6ff' : '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem', color: isSaved ? '#2563eb' : '#94a3b8', cursor: 'pointer' }}
                      >
                        <Bookmark size={16} fill={isSaved ? "#2563eb" : "none"} />
                      </button>
                    </div>
                  </div>

                  {/* Meta Chips */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#475569' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: '#0f172a' }}>
                      <DollarSign size={14} color="#16a34a" /> {item.job.salary_range}
                    </span>
                    <span>•</span>
                    <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{item.job.work_mode || "Hybrid"}</span>
                    <span>•</span>
                    <span>{item.job.openings || 2} Openings</span>
                    <span>•</span>
                    <span style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12}/> Apply by {item.job.deadline || "15 Sep 2026"}</span>
                  </div>

                  {/* AI Reasoning box */}
                  <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #f1f5f9' }}>
                    <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Match Reasoning</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>{item.reasoning}</p>
                  </div>

                  {/* Skills tags */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {item.matched_skills.map((s, i) => (
                        <span key={i} style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px' }}>
                          ✓ {s}
                        </span>
                      ))}
                      {item.missing_skills.map((s, i) => (
                        <span key={i} style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '6px' }}>
                          △ {s} (Gap)
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                  <button
                    onClick={() => setSelectedJob(item)}
                    style={{ flex: 1, padding: '0.7rem', background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setApplyingJob(item)}
                    style={{ flex: 1, padding: '0.7rem', background: '#2563eb', border: 'none', color: '#ffffff', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
                  >
                    Apply Now
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '4rem 2rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <BriefcaseBusiness size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No matching opportunities found</h3>
          <p style={{ margin: 0, color: '#64748b' }}>Try adjusting your search query or relaxing your filter parameters.</p>
        </div>
      )}

      {/* ===================== JOB DETAILS & MATCH MODAL ===================== */}
      {selectedJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ROLE SPECIFICATION</span>
                <h2 style={{ margin: '0.2rem 0 0.4rem 0', fontSize: '1.45rem', fontWeight: 700, color: '#0f172a' }}>{selectedJob.job.role}</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                  {selectedJob.job.company} • {selectedJob.job.location} ({selectedJob.job.work_mode}) • {selectedJob.job.salary_range}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.4rem 0.85rem', borderRadius: '8px', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {selectedJob.match_percentage}% Match
                </div>
                <button onClick={() => setSelectedJob(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
              </div>
            </div>

            <div style={{ padding: '2rem' }}>
              
              {/* Description & Responsibilities */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Job Overview</h3>
                <p style={{ margin: '0 0 1rem 0', color: '#475569', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {selectedJob.job.description}
                </p>
                
                {selectedJob.job.responsibilities && (
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block', marginBottom: '0.4rem' }}>Key Responsibilities:</strong>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {selectedJob.job.responsibilities.map((r, i) => (
                        <li key={i} style={{ marginBottom: '0.35rem' }}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Match Breakdown */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Your Match Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                
                <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#15803d', fontSize: '0.9rem', fontWeight: 700 }}>✓ Matched Skills ({selectedJob.matched_skills.length})</h4>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedJob.matched_skills.map((s, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#166534', fontWeight: 500 }}>
                        <CheckCircle2 size={16} color="#16a34a" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: '#fffbeb', padding: '1.25rem', borderRadius: '10px', border: '1px solid #fde68a' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#b45309', fontSize: '0.9rem', fontWeight: 700 }}>△ Skills to Develop ({selectedJob.missing_skills.length})</h4>
                  {selectedJob.missing_skills.length > 0 ? (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selectedJob.missing_skills.map((s, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#92400e', fontWeight: 500 }}>
                          <AlertCircle size={16} color="#f59e0b" /> {s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>You meet all listed technical requirements!</p>
                  )}
                </div>

              </div>

              {/* How to Improve Your Match */}
              {selectedJob.missing_skills.length > 0 && (
                <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #bfdbfe', marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af', fontSize: '0.9rem', fontWeight: 700 }}>How to Improve Your Match</h4>
                  <ol style={{ margin: '0 0 1rem 0', paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                    <li>Complete SIEM Fundamentals module</li>
                    <li>Take Communication for Technical Roles assessment</li>
                    <li>Verify Linux incident triage project</li>
                  </ol>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid #dbeafe', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Estimated Match Improvement:</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{selectedJob.match_percentage}%</span>
                    <ArrowRight size={16} color="#94a3b8" />
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>97% Target Match</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedJob(null)}
                  style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setApplyingJob(selectedJob);
                    setSelectedJob(null);
                  }}
                  style={{ padding: '0.75rem 2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }}
                >
                  Apply Now
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ===================== APPLICATION CONFIRMATION MODAL ===================== */}
      {applyingJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '1.75rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>CONFIRM APPLICATION</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{applyingJob.job.role}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{applyingJob.job.company} • {applyingJob.match_percentage}% Skill Match</p>
              </div>
              <button onClick={() => setApplyingJob(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ padding: '2rem' }}>
              {!appSubmitted ? (
                <>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FileText size={18} color="#2563eb" />
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Select Resume</strong>
                    </div>
                    <select
                      value={selectedResume}
                      onChange={e => setSelectedResume(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="Priya_Gupta_Cybersecurity_Resume.pdf">Priya_Gupta_Cybersecurity_Resume.pdf (Primary Verified Resume)</option>
                      <option value="Priya_Gupta_General_CV.pdf">Priya_Gupta_General_CV.pdf</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                      Short Note to Hiring Manager (Optional)
                    </label>
                    <textarea
                      value={coverNote}
                      onChange={e => setCoverNote(e.target.value)}
                      placeholder="Highlight your key achievements, Linux security monitoring experience, or availability..."
                      style={{ width: '100%', height: '90px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setApplyingJob(null)}
                      style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmApply}
                      style={{ padding: '0.75rem 2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Send size={16} /> Submit Application
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Application Submitted!</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                    Your application for <strong>{applyingJob.job.role}</strong> at <strong>{applyingJob.job.company}</strong> has been forwarded for employer review.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

import { useState, useEffect } from "react";
import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useParams, useLocation } from "react-router-dom";

import TraineeLayout from './Trainee/TraineeLayout';
import TraineeOverview from './Trainee/TraineeOverview';
import TraineeExploreJobs from './Trainee/TraineeExploreJobs';
import TraineeImproveSkills from './Trainee/TraineeImproveSkills';
import TraineeMyApplications from './Trainee/TraineeMyApplications';
import TraineeProfileSettings from './Trainee/TraineeProfileSettings';

export default function TraineeDashboard({ defaultTab }) {
  const { traineeId: paramTraineeId } = useParams();
  const traineeId = paramTraineeId || localStorage.getItem("traineeId") || "T102";
  const location = useLocation();

  // Determine initial tab from props or URL pathname
  const getInitialTab = () => {
    if (defaultTab) return defaultTab;
    const path = location.pathname.toLowerCase();
    if (path.includes('/jobs')) return 'jobs';
    if (path.includes('/skills')) return 'skills';
    if (path.includes('/applications')) return 'applications';
    if (path.includes('/profile') || path.includes('/settings')) return 'profile';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [portalData, setPortalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals for job details and quick assessment on overview
  const [selectedJob, setSelectedJob] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const fetchPortalData = async () => {
    setError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/dashboard`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unable to load trainee portal data.");
      setPortalData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load trainee portal data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [traineeId]);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname, defaultTab]);

  const handleApplyFromOverview = async (job, matchPercentage) => {
    setError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: job.id,
          role: job.role,
          company: job.company,
          location: job.location,
          salary_range: job.salary_range,
          match_percentage: matchPercentage
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unable to submit application.");
      setToastMsg(data.message || "Application submitted successfully!");
      setTimeout(() => setToastMsg(""), 4000);
      fetchPortalData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to submit application.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: '#64748b', fontWeight: 500 }}>Loading Trainee Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <TraineeLayout activeTab={activeTab} onTabChange={setActiveTab} portalData={portalData}>
      {error && <div role="alert" style={{ margin: '1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '0.85rem 1rem' }}>{error}</div>}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#16a34a',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}
      
      {activeTab === 'overview' && (
        <TraineeOverview
          portalData={portalData}
          onNavigateTab={setActiveTab}
          onOpenJobDetails={(jobItem) => setSelectedJob(jobItem)}
          onApplyJob={handleApplyFromOverview}
          onStartAssessment={() => setActiveTab('skills')}
        />
      )}

      {activeTab === 'jobs' && (
        <TraineeExploreJobs
          onApplySuccess={fetchPortalData}
        />
      )}

      {activeTab === 'skills' && (
        <TraineeImproveSkills
          onSkillUpdated={fetchPortalData}
        />
      )}

      {activeTab === 'applications' && (
        <TraineeMyApplications />
      )}

      {activeTab === 'profile' && (
        <TraineeProfileSettings
          onProfileUpdated={fetchPortalData}
        />
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
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                    Build evidence for the listed gaps and review the vacancy requirements before applying. The portal does not estimate a future match score.
                  </p>
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
                    handleApplyFromOverview(selectedJob.job, selectedJob.match_percentage);
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

    </TraineeLayout>
  );
}

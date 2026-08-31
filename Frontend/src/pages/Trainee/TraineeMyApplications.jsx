import { useState, useEffect } from "react";
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';
import {
  FileText,
  CheckCircle2,
  Clock,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  Trash2,
  Eye,
  ArrowRight
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

export default function TraineeMyApplications() {
  const { traineeId: paramTraineeId } = useParams();
  const traineeId = paramTraineeId || localStorage.getItem("traineeId") || "T102";
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedAppDetails, setSelectedAppDetails] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/applications`);
      if (res.ok) {
        const data = await res.json();
        setApps(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [traineeId]);

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/applications/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: appId })
      });
      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const totalCount = apps.length;
  const appliedCount = apps.filter(a => a.status === 'Applied' || a.status === 'Application Submitted').length;
  const shortlistedCount = apps.filter(a => a.status === 'Shortlisted').length;
  const interviewCount = apps.filter(a => a.status === 'Interview' || (a.next_step && a.next_step.toLowerCase().includes('interview'))).length;
  const underReviewCount = apps.filter(a => a.status === 'Under Review').length;

  const filteredApps = apps.filter(a => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Shortlisted") return a.status === "Shortlisted";
    if (statusFilter === "Under Review") return a.status === "Under Review";
    if (statusFilter === "Applied") return a.status === "Applied" || a.status === "Application Submitted";
    return true;
  });

  const timelineSteps = ["Applied", "Screening", "Shortlisted", "Interview", "Offer"];

  const getStepIndex = (status) => {
    if (status === "Applied" || status === "Application Submitted") return 0;
    if (status === "Under Review") return 1;
    if (status === "Shortlisted") return 2;
    if (status === "Interview") return 3;
    if (status === "Offer") return 4;
    return 1;
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading Applications...</div>;
  }

  return (
    <div style={{ maxWidth: '1280px' }}>
      
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Sparkles size={18} color="#2563eb" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>My Job Applications</h2>
        </div>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
          Track application stages, hiring manager reviews, and interview schedules in real-time.
        </p>
      </div>

      {/* SUMMARY METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Applications</span>
          <h4 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{totalCount}</h4>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Shortlisted</span>
          <h4 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>{shortlistedCount}</h4>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Interviews</span>
          <h4 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#2563eb' }}>{interviewCount}</h4>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Under Review</span>
          <h4 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>{underReviewCount}</h4>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Offers</span>
          <h4 style={{ margin: '0.35rem 0 0 0', fontSize: '1.6rem', fontWeight: 800, color: '#8b5cf6' }}>0</h4>
        </div>

      </div>

      {/* FILTER TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        {["All", "Shortlisted", "Under Review", "Applied"].map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: statusFilter === tab ? '#2563eb' : '#f1f5f9',
              color: statusFilter === tab ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* APPLICATIONS LIST */}
      {filteredApps.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredApps.map((app, idx) => {
            const currentStepIdx = getStepIndex(app.status);
            let badgeBg = '#eff6ff';
            let badgeColor = '#1d4ed8';
            if (app.status === 'Shortlisted') {
              badgeBg = '#dcfce7';
              badgeColor = '#15803d';
            } else if (app.status === 'Under Review') {
              badgeBg = '#fef3c7';
              badgeColor = '#b45309';
            }

            return (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '1.75rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                {/* Header: Role, Company, Status, Match % */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{app.role}</h3>
                      <span style={{ background: badgeBg, color: badgeColor, padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {app.status}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building size={14} /> {app.company} • <MapPin size={13} /> {app.location || "Hyderabad"} ({app.work_mode || "Hybrid"}) • <Calendar size={13} /> Applied on {app.applied_date}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>
                      {app.match_percentage}% Match
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Verified Profile</span>
                  </div>
                </div>

                {/* Progress / Status Timeline */}
                <div style={{ background: '#f8fafc', padding: '1.25rem 1.5rem', borderRadius: '10px', border: '1px solid #f1f5f9', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    
                    {timelineSteps.map((step, sIdx) => {
                      const isCompleted = sIdx <= currentStepIdx;
                      const isCurrent = sIdx === currentStepIdx;
                      return (
                        <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: isCompleted ? '#2563eb' : '#ffffff',
                              border: isCompleted ? 'none' : '2px solid #cbd5e1',
                              color: isCompleted ? '#ffffff' : '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              marginBottom: '0.35rem'
                            }}
                          >
                            {isCompleted ? <CheckCircle2 size={16} /> : sIdx + 1}
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#2563eb' : (isCompleted ? '#0f172a' : '#94a3b8') }}>
                            {step}
                          </span>
                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* Next Steps & Notes */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                      Next Action: <strong style={{ color: '#2563eb' }}>{app.next_step || "Employer review in progress"}</strong>
                    </span>
                    {app.notes && (
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                        Note: "{app.notes}"
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => setSelectedAppDetails(app)}
                      style={{ padding: '0.55rem 1rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Eye size={15} /> View Summary
                    </button>
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      style={{ padding: '0.55rem 0.85rem', background: 'transparent', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Trash2 size={15} /> Withdraw
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '4rem 2rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <FileText size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No applications in this category</h3>
          <p style={{ margin: 0, color: '#64748b' }}>Explore matching jobs and submit applications to track them here.</p>
        </div>
      )}

      {/* APPLICATION SUMMARY MODAL */}
      {selectedAppDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>APPLICATION RECORD</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>{selectedAppDetails.role}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{selectedAppDetails.company} • Applied {selectedAppDetails.applied_date}</p>
              </div>
              <button onClick={() => setSelectedAppDetails(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#334155' }}>
                <strong>Current Stage:</strong> <span style={{ color: '#2563eb', fontWeight: 700 }}>{selectedAppDetails.status}</span>
              </p>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#334155' }}>
                <strong>Skill Match Score:</strong> {selectedAppDetails.match_percentage}%
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>
                <strong>Next Step:</strong> {selectedAppDetails.next_step}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedAppDetails(null)} style={{ padding: '0.7rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

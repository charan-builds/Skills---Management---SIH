import { useState, useEffect } from "react";
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useParams } from "react-router-dom";

export default function TraineeApplications() {
  const { traineeId: paramTraineeId } = useParams();
  const traineeId = paramTraineeId || localStorage.getItem("traineeId") || "T102";

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/applications`);
      if (!res.ok) throw new Error("Failed to load applications");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load application history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [traineeId]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
        <p style={{ color: '#64748b' }}>Loading application tracking pipeline...</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = (status || "Applied").toLowerCase();
    if (s.includes("hired") || s.includes("selected")) {
      return (
        <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={14} /> Hired / Selected
        </span>
      );
    }
    if (s.includes("shortlisted")) {
      return (
        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={14} /> Shortlisted
        </span>
      );
    }
    if (s.includes("interview")) {
      return (
        <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={14} /> Interview Scheduled
        </span>
      );
    }
    if (s.includes("rejected")) {
      return (
        <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <XCircle size={14} /> Not Selected
        </span>
      );
    }
    return (
      <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={14} /> Application Submitted
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1280px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <FileText size={18} color="#2563eb" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            RECRUITMENT PIPELINE
          </span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
          My Submitted Applications
        </h2>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
          Track real-time status changes and employer feedback for your active job applications.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Applications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {applications.map((app) => (
          <div
            key={app.id}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {app.job_title || "Job Application"}
                </h3>
                {getStatusBadge(app.status)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={15} />
                  <strong>{app.employer_name || "Employer Organization"}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={15} />
                  <span>Applied on {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Recent"}</span>
                </div>
              </div>

              {app.employer_notes && (
                <div style={{ marginTop: '0.75rem', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '6px', borderLeft: '3px solid #2563eb', fontSize: '0.85rem', color: '#334155' }}>
                  <strong>Employer Remark:</strong> {app.employer_notes}
                </div>
              )}
            </div>
          </div>
        ))}

        {applications.length === 0 && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <FileText size={36} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No Active Applications</h3>
            <p style={{ margin: 0 }}>Browse the "Explore Jobs" tab to find opportunities matched to your skill profile and submit your 1-click application.</p>
          </div>
        )}
      </div>

    </div>
  );
}

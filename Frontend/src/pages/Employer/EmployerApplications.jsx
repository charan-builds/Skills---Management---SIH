import { useState, useEffect } from "react";
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';
import {
  FileText,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Building2,
  Check,
  X,
  Sparkles
} from "lucide-react";
import EmployerNav from "./EmployerNav";

export default function EmployerApplications() {
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/applications`);
      if (!res.ok) throw new Error("Failed to load applications");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load candidate applications queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [organizationId]);

  const handleUpdateStatus = async (appId, newStatus) => {
    setActionSuccessMsg("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          employer_notes: `Status updated to ${newStatus} on ${new Date().toLocaleDateString()}`
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccessMsg(`✓ Application updated to '${newStatus}'.`);
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
        setTimeout(() => setActionSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredApps = applications.filter(a => {
    if (statusFilter === "All") return true;
    return (a.status || "").toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmployerNav />

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <FileText size={18} color="#2563eb" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              RECRUITMENT PIPELINE
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
            Candidate Applications Queue
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
            Review applicants, advance recruitment stages, and record hiring outcomes.
          </p>
        </div>

        {actionSuccessMsg && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontWeight: 600 }}>
            {actionSuccessMsg}
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Filter */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Filter Stage:</span>
          {["All", "Applied", "Shortlisted", "Interview", "Hired", "Rejected"].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: statusFilter === st ? '#eff6ff' : '#ffffff',
                color: statusFilter === st ? '#1d4ed8' : '#475569',
                fontWeight: statusFilter === st ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
            <p style={{ color: '#64748b' }}>Loading applicant queue...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredApps.map(app => (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {app.trainee_name || "Applicant"}
                    </h3>
                    <span style={{ background: app.status === 'Hired' ? '#dcfce7' : (app.status === 'Shortlisted' ? '#eff6ff' : '#f8fafc'), color: app.status === 'Hired' ? '#15803d' : (app.status === 'Shortlisted' ? '#1d4ed8' : '#475569'), fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                      {app.status || "Applied"}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#2563eb', fontWeight: 600 }}>
                    Requisition: {app.job_title}
                  </p>

                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                    Applied on: {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Recent"}
                  </p>
                </div>

                {/* Workflow Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {app.status !== 'Shortlisted' && app.status !== 'Hired' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, "Shortlisted")}
                      style={{ padding: '0.5rem 0.85rem', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Shortlist
                    </button>
                  )}
                  {app.status !== 'Interview' && app.status !== 'Hired' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, "Interview")}
                      style={{ padding: '0.5rem 0.85rem', background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Schedule Interview
                    </button>
                  )}
                  {app.status !== 'Hired' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, "Hired")}
                      style={{ padding: '0.5rem 0.85rem', background: '#16a34a', border: 'none', color: '#ffffff', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Check size={14} /> Hire Candidate
                    </button>
                  )}
                  {app.status !== 'Rejected' && app.status !== 'Hired' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, "Rejected")}
                      style={{ padding: '0.5rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', color: '#dc2626', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredApps.length === 0 && (
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <FileText size={36} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No Applications in Selected Stage</h3>
                <p style={{ margin: 0 }}>Applicants submitting 1-click applications will appear here in real time.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

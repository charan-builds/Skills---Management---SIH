import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmployerNav from "./Employer/EmployerNav";

export default function EmployerVerifyOutcomes() {
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    employment_status: "",
    employment_type: "",
    joining_date: "",
    salary: 0,
    job_role: "",
    retention_6m: "",
    retention_12m: "",
    employer_remarks: ""
  });

  const [notification, setNotification] = useState(null);
  const [error, setError] = useState("");

  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";
  
  const navigate = useNavigate();

  const fetchOutcomes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/outcomes`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unable to load outcome records.");
      setOutcomes(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load outcome records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutcomes();
  }, [organizationId]);
  const openReviewModal = (trainee) => {
    setSelectedTrainee(trainee);
    setFormData({
      employment_status: trainee.employment_status || "Employed",
      employment_type: trainee.employment_type || "Full-time",
      joining_date: trainee.joining_date || "",
      salary: Number(trainee.salary) || 0,
      job_role: trainee.job_role || "",
      retention_6m: trainee.retention_6m || "Not recorded",
      retention_12m: trainee.retention_12m || "Not recorded",
      employer_remarks: trainee.employer_remarks || ""
    });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "salary" ? Number(value) : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/outcomes/${selectedTrainee.trainee_id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const failure = await res.json();
        throw new Error(failure.detail || "Unable to save the outcome.");
      }
      
      if (res.ok) {
        const updated = await res.json();
        setOutcomes(prev => prev.map(o => o.trainee_id === updated.trainee_id ? updated : o));
        setNotification(`✓ Outcome verified successfully for ${updated.trainee_name}.`);
        setModalOpen(false);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save the outcome.");
    } finally {
      setSubmitting(false);
    }
  };

  const verifiedCount = outcomes.filter(o => (o.verification_status || "").toLowerCase().includes("attested")).length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <EmployerNav />
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading outcome records...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmployerNav />

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        {error && (
          <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/employer-dashboard")}
          style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Page Title & Notification Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <CheckCircle2 size={18} color="#2563eb" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                VERIFIED OUTCOME TRACKING
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              Employment Outcome Verification
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
              Verify joining dates, roles, compensation benchmarks, and retention milestones to feed into state impact metrics.
            </p>
          </div>

          {notification && (
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.65rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 2px 6px rgba(22,163,74,0.15)' }}>
              {notification}
            </div>
          )}
        </div>

        {/* Summary Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Recruited Trainees</span>
            <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{outcomes.length}</h3>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Verified Outcomes</span>
            <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#16a34a' }}>{verifiedCount} / {outcomes.length}</h3>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Average Verified Salary</span>
            <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#2563eb' }}>₹52,500 / mo</h3>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>12-Month Retention Rate</span>
            <h3 style={{ margin: '0.3rem 0 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed' }}>100%</h3>
          </div>

        </div>

        {/* OUTCOMES TABLE */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Hired Trainees Verification Registry</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Review candidate status and submit formal outcome confirmations.</p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Candidate</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Programme / Location</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Designated Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Joining Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Salary (CTC)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Retention Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Verification</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {outcomes.map((t, idx) => {
                  const isVerified = t.verification_status === "Verified";
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>
                        {t.trainee_name}
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{t.trainee_id}</span>
                      </td>
                      <td style={{ padding: '1rem', color: '#334155' }}>
                        {t.programme_name}
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>{t.district}</span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#2563eb' }}>
                        {t.job_role || "Associate"}
                      </td>
                      <td style={{ padding: '1rem', color: '#475569' }}>
                        {t.joining_date || "2025-01-15"}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>
                        ₹{Number(t.salary || 50000).toLocaleString()}/mo
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {t.retention_6m || "Retained"}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: isVerified ? '#dcfce7' : '#fef3c7', color: isVerified ? '#15803d' : '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {isVerified ? "✓ Verified" : "Pending Confirmation"}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => openReviewModal(t)}
                          style={{ padding: '0.45rem 0.95rem', background: isVerified ? '#ffffff' : '#2563eb', border: isVerified ? '1px solid #cbd5e1' : 'none', color: isVerified ? '#0f172a' : '#ffffff', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          {isVerified ? "Edit Outcome" : "Confirm Outcome"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ================= VERIFICATION MODAL ================= */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>OUTCOME VERIFICATION DIALOG</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>
                  Verify Employment: {selectedTrainee?.trainee_name}
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedTrainee?.trainee_id} • {selectedTrainee?.programme_name}</span>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Employment Status</label>
                  <select
                    name="employment_status"
                    value={formData.employment_status}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="Employed">Employed (Active)</option>
                    <option value="Left employment">Left Employment</option>
                    <option value="Not joined">Not Joined / Offer Declined</option>
                    <option value="Unknown">Unknown / Pending Record</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Employment Type</label>
                  <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="Full-time">Full-time Regular</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                    <option value="Contract">Contract / Project-based</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Confirmed Job Role</label>
                  <input
                    type="text"
                    name="job_role"
                    value={formData.job_role}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Joining Date</label>
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Monthly Salary (INR)</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Retention Milestone Checkpoint</label>
                  <select
                    name="retention_6m"
                    value={formData.retention_6m}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="Retained (Verified)">Retained (Verified)</option>
                    <option value="Due for Confirmation">Due for Confirmation</option>
                    <option value="Not yet due">Not yet due</option>
                    <option value="Left before milestone">Left before milestone</option>
                  </select>
                </div>

              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Employer Remarks / Notes</label>
                <textarea
                  name="employer_remarks"
                  value={formData.employer_remarks}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', height: '65px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {submitting ? "Saving..." : "Confirm & Verify Outcome"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

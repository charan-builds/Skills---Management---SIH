import { useState } from "react";
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';
import { Briefcase, Building, Calendar, CreditCard, ExternalLink } from "lucide-react";

export default function EmploymentStatusForm({ traineeId, onSuccess }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    employer_name: "",
    role: "",
    salary: "",
    start_date: "",
    work_location: "",
    business_type: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let finalEmployerName = form.employer_name;
      if (status === "SELF_EMPLOYED") {
        finalEmployerName = "Self-Employed";
      }

      const payload = {
        status: status,
        employer_name: finalEmployerName,
        role: form.role,
        salary: Number(form.salary) || 0,
        start_date: form.start_date,
        verification_state: "SELF_REPORTED"
      };

      const res = await fetchAuth(`${API_BASE}/api/trainees/${traineeId}/outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update employment status");
      }

      alert("Employment status updated successfully!");
      if (onSuccess) onSuccess();
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Employment Status</h2>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
          Update your current employment outcome to keep your records accurate and trigger employer verification.
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
            What is your current status?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {['EMPLOYED', 'SELF_EMPLOYED', 'APPRENTICESHIP', 'UNEMPLOYED', 'IN_TRAINING'].map(s => (
              <label 
                key={s} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', 
                  border: status === s ? '2px solid #2563eb' : '1px solid #e2e8f0', 
                  borderRadius: '8px', cursor: 'pointer',
                  background: status === s ? '#eff6ff' : '#ffffff'
                }}>
                <input 
                  type="radio" 
                  name="status" 
                  value={s} 
                  checked={status === s}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: status === s ? 700 : 500, color: '#334155' }}>
                  {s.replace("_", "-")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {status && ['EMPLOYED', 'APPRENTICESHIP', 'SELF_EMPLOYED'].includes(status) && (
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: '#0f172a' }}>
                {status === 'SELF_EMPLOYED' ? 'Business Details' : 'Employer Details'}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                
                {status !== 'SELF_EMPLOYED' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Organization / Employer Name</label>
                    <div style={{ position: 'relative' }}>
                      <Building size={16} color="#64748b" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                      <input 
                        required 
                        type="text" 
                        value={form.employer_name} 
                        onChange={e => setForm({...form, employer_name: e.target.value})} 
                        style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                        placeholder="e.g. TechCorp Ltd."
                      />
                    </div>
                  </div>
                )}

                {status === 'SELF_EMPLOYED' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Business Name</label>
                    <input 
                      required 
                      type="text" 
                      value={form.role} 
                      onChange={e => setForm({...form, role: e.target.value})} 
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                      placeholder="e.g. Priya's Boutique"
                    />
                  </div>
                )}

                {status !== 'SELF_EMPLOYED' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Job Title / Role</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={16} color="#64748b" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                      <input 
                        required 
                        type="text" 
                        value={form.role} 
                        onChange={e => setForm({...form, role: e.target.value})} 
                        style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    {status === 'APPRENTICESHIP' ? 'Monthly Stipend' : (status === 'SELF_EMPLOYED' ? 'Estimated Monthly Income' : 'Monthly Salary')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <CreditCard size={16} color="#64748b" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                    <input 
                      required 
                      type="number" 
                      value={form.salary} 
                      onChange={e => setForm({...form, salary: e.target.value})} 
                      style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                      placeholder="e.g. 25000"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Start Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} color="#64748b" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                    <input 
                      required 
                      type="date" 
                      value={form.start_date} 
                      onChange={e => setForm({...form, start_date: e.target.value})} 
                      style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2.2rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
                    />
                  </div>
                </div>

              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              style={{ width: '100%', padding: '0.85rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <ExternalLink size={18} /> {loading ? "Submitting..." : "Submit Employment Details"}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>
              Submitting this form will automatically generate an outcome verification request for your employer.
            </p>
          </form>
        )}

        {status && ['UNEMPLOYED', 'IN_TRAINING'].includes(status) && (
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
                You have selected <strong>{status.replace("_", "-")}</strong>. Click submit to save your current outcome status.
              </p>
            </div>
            <button 
              disabled={loading}
              type="submit" 
              style={{ width: '100%', padding: '0.85rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? "Submitting..." : "Save Status"}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}

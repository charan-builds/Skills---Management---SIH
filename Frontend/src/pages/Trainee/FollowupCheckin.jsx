import { useState, useEffect } from "react";
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';
import { ClipboardCheck, ArrowRight } from "lucide-react";
import { DataStateWrapper } from "../../components/common/DataStateComponents";

export default function FollowupCheckin({ traineeId, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followups, setFollowups] = useState([]);
  
  const [activeCheckin, setActiveCheckin] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    employment_status: "",
    employer_or_activity: "",
    salary: "",
    job_relevance: "",
    description: "",
    
    // Sub-fields for specific paths
    attrition_reason: "",
    non_placement_reason: "",
    missing_skills: ""
  });

  const loadFollowups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainees/${traineeId}/follow-ups`);
      if (res.ok) {
        const data = await res.json();
        setFollowups(data);
      } else {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to load follow-ups");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowups();
  }, [traineeId]);

  const startCheckin = (chk) => {
    setActiveCheckin(chk);
    setStep(1);
    setFormData({
      employment_status: "",
      employer_or_activity: "",
      salary: "",
      job_relevance: "",
      description: "",
      attrition_reason: "",
      non_placement_reason: "",
      missing_skills: ""
    });
  };

  const handleNext = () => setStep(s => s + 1);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Construct description payload combining the sub-reasons
    let combinedDescription = formData.description;
    if (formData.employment_status === "Resigned" || formData.employment_status === "Terminated") {
      combinedDescription = `Attrition Reason: ${formData.attrition_reason}. ${combinedDescription}`;
    } else if (formData.employment_status === "Unemployed") {
      combinedDescription = `Non-Placement Reason: ${formData.non_placement_reason}. ${combinedDescription}`;
    }
    if (formData.missing_skills) {
      combinedDescription += ` | Missing Skills: ${formData.missing_skills}`;
    }

    const payload = {
      checkpoint: activeCheckin.checkpoint,
      employment_status: formData.employment_status,
      employer_or_activity: formData.employer_or_activity || "N/A",
      salary: formData.salary || "0",
      job_relevance: formData.job_relevance || "N/A",
      verification_status: "Pending",
      description: combinedDescription.trim() || "No additional comments."
    };

    try {
      const res = await fetchAuth(`${API_BASE}/api/trainees/${traineeId}/followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Check-in completed successfully!");
        setActiveCheckin(null);
        if (onSuccess) onSuccess();
        loadFollowups();
      } else {
        const data = await res.json();
        throw new Error(data.detail || "Failed to submit follow-up");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Post-Training Check-ins</h2>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
          Complete your scheduled follow-ups to help us improve training and provide better career support.
        </p>
      </div>

      <DataStateWrapper
        isLoading={loading && !activeCheckin}
        error={error}
        data={followups}
        onRetry={loadFollowups}
        isDataAvailable={() => followups && followups.length > 0}
        isEmptyDetails="No follow-ups scheduled at this time."
      >
        {!activeCheckin ? (
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {followups.map((chk, idx) => {
                const isPending = chk.status === 'Pending';
                return (
                  <div key={idx} style={{ padding: '1.25rem', background: isPending ? '#f0fdf4' : '#f8fafc', borderRadius: '8px', border: `1px solid ${isPending ? '#bbf7d0' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', color: isPending ? '#16a34a' : '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ClipboardCheck size={18} /> {chk.checkpoint}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>
                        Scheduled Date: {chk.date}
                      </p>
                    </div>
                    {isPending ? (
                      <button onClick={() => startCheckin(chk)} style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', padding: '0.6rem 1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        Start Check-in <ArrowRight size={16} />
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{chk.status}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <ClipboardCheck size={20} color="#2563eb" /> Completing {activeCheckin.checkpoint}
          </h3>

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            
            {/* STEP 1: CURRENT STATUS */}
            {step === 1 && (
              <div>
                <label style={{ display: 'block', marginBottom: '1rem', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Are you currently working?</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  {['Employed', 'Self-Employed', 'Apprentice', 'Resigned', 'Terminated', 'Unemployed'].map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: formData.employment_status === s ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: formData.employment_status === s ? '#eff6ff' : '#ffffff' }}>
                      <input type="radio" value={s} checked={formData.employment_status === s} onChange={e => setFormData({...formData, employment_status: e.target.value})} style={{ width: '18px', height: '18px' }} required />
                      <span style={{ fontWeight: formData.employment_status === s ? 700 : 500, color: '#334155' }}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: CONTEXT & DETAILS */}
            {step === 2 && (
              <div>
                
                {['Employed', 'Self-Employed', 'Apprentice'].includes(formData.employment_status) && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>Employer / Business Name</label>
                    <input required type="text" value={formData.employer_or_activity} onChange={e => setFormData({...formData, employer_or_activity: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
                
                {['Employed', 'Self-Employed', 'Apprentice'].includes(formData.employment_status) && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>Current Salary / Income</label>
                    <input required type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}

                {['Resigned', 'Terminated'].includes(formData.employment_status) && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>Primary Reason for Leaving</label>
                    <select required value={formData.attrition_reason} onChange={e => setFormData({...formData, attrition_reason: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="">Select a reason...</option>
                      <option value="Low Salary">Low Salary</option>
                      <option value="Better Opportunity">Better Opportunity</option>
                      <option value="Skill Mismatch">Skill Mismatch</option>
                      <option value="Working Conditions">Poor Working Conditions</option>
                      <option value="Relocation">Relocation</option>
                      <option value="Contract Ended">Contract Ended</option>
                      <option value="Personal Reasons">Personal Reasons</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}

                {formData.employment_status === 'Unemployed' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>Primary Barrier to Employment</label>
                    <select required value={formData.non_placement_reason} onChange={e => setFormData({...formData, non_placement_reason: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                      <option value="">Select a barrier...</option>
                      <option value="Lack of Required Skills">Lack of required skills</option>
                      <option value="No Suitable Jobs">No suitable jobs in area</option>
                      <option value="Salary Expectations">Salary expectations too low</option>
                      <option value="Experience Required">Employers require more experience</option>
                      <option value="Studying Further">Pursuing further education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}

              </div>
            )}

            {/* STEP 3: RELEVANCE & FEEDBACK */}
            {step === 3 && (
              <div>
                
                {['Employed', 'Self-Employed', 'Apprentice'].includes(formData.employment_status) && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>Are the skills you learned relevant to your current job?</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      {['Yes', 'Partially', 'No'].map(r => (
                        <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input type="radio" value={r} checked={formData.job_relevance === r} onChange={e => setFormData({...formData, job_relevance: e.target.value})} required /> {r}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>Skill-Gap Feedback</label>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#64748b' }}>Were there any critical skills missing from your training that employers are asking for?</p>
                  <input type="text" placeholder="e.g. AWS Cloud, Advanced Excel, English Communication" value={formData.missing_skills} onChange={e => setFormData({...formData, missing_skills: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>Additional Comments (Optional)</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}></textarea>
                </div>

              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button type="button" onClick={() => step === 1 ? setActiveCheckin(null) : setStep(s => s - 1)} style={{ background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              <button type="submit" style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '0.75rem 1.5rem', fontWeight: 700, cursor: 'pointer' }}>
                {step === 3 ? (loading ? 'Submitting...' : 'Submit Check-in') : 'Next'}
              </button>
            </div>

          </form>

        </div>
      )}
      </DataStateWrapper>
    </div>
  );
}

import { useState } from "react";
import {
  BriefcaseBusiness,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  IndianRupee,
  Building,
  Check,
  ShieldCheck,
  RotateCcw,
  Search,
  SlidersHorizontal,
  FileCheck,
  ArrowRight
} from "lucide-react";
import { adminIntelligenceData } from "../utils/adminData";

export default function Outcomes() {
  const [verificationList, setVerificationList] = useState(adminIntelligenceData.verification_queue);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState("Verified");
  const [verifyRemarks, setVerifyRemarks] = useState("Verified against employer PF/HRMS record.");
  const [verifySuccess, setVerifySuccess] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!selectedVerification) return;

    setVerificationList(prev => prev.map(item => {
      if (item.trainee_id === selectedVerification.trainee_id) {
        return {
          ...item,
          verification_status: verifyStatus,
          retention_3m: "Retained (Verified)",
          last_updated: "2025-08-31"
        };
      }
      return item;
    }));

    setVerifySuccess(true);
    setTimeout(() => {
      setVerifySuccess(false);
      setSelectedVerification(null);
    }, 1500);
  };

  const filteredQueue = verificationList.filter(item => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      item.trainee_name.toLowerCase().includes(q) ||
      item.trainee_id.toLowerCase().includes(q) ||
      item.employer.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "All" ||
      item.verification_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="dashboard" style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <BriefcaseBusiness size={18} color="#2563eb" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              LONGITUDINAL EMPLOYMENT & RETENTION AUDIT
            </span>
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Employment Outcome Intelligence & Verification
          </h1>
          <p className="page-description" style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Monitor post-training placement velocity, wage progression, and 3M / 6M / 12M longitudinal job retention across hiring employers.
          </p>
        </div>
      </div>

      {/* 5 OUTCOME KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Employment Rate</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#15803d' }}>78%</h3>
          <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>+6.0% YoY Increase</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Placed Trainees</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a' }}>80 / 380</h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Across 28 verified employers</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Avg Starting Salary</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#2563eb' }}>₹5.2 LPA</h3>
          <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>₹45k–₹60k/month range</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>12-Month Retention</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#7c3aed' }}>84%</h3>
          <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 700 }}>High longitudinal stability</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Partner Employers</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a' }}>28</h3>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Active Enterprise Gateway</span>
        </div>
      </div>

      {/* 2-COLUMN SECTION: BREAKDOWN BY PROGRAMME + TOP HIRING SKILLS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Employment Outcomes by Programme */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
            Employment Placement Rate by Programme
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {adminIntelligenceData.programmes.map((p) => (
              <div key={p.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</span>
                  <span style={{ fontWeight: 800, color: '#15803d' }}>{p.employment_rate}% Placed ({p.enrolled} Trainees)</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${p.employment_rate}%`, height: '100%', background: '#16a34a', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills Associated with Successful Hiring */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
            Top Skills Associated With Hiring
          </h3>
          <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.85rem' }}>Empirical correlation with offer generation and wage premium.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>Python + SQL Joint Stack</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Data Analytics & AI Engineering</span>
              </div>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                92% Hiring Rate
              </span>
            </div>

            <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>Linux + Network Security Triage</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cybersecurity Operations (SOC)</span>
              </div>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                89% Hiring Rate
              </span>
            </div>

            <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>Machine Learning + Model Evaluation</strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>AI Associate Positions</span>
              </div>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                88% Hiring Rate
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* OUTCOME VERIFICATION REGISTRY TABLE */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <ShieldCheck size={18} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Employment Verification & Retention Registry</h3>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Audit and confirm employer-submitted hiring outcomes and longitudinal retention checkpoints.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.45rem 0.85rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}
            >
              <option value="All">All Verification Statuses</option>
              <option value="Verified">Verified Only</option>
              <option value="Pending">Pending Audit</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Candidate & ID</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Hiring Employer & Role</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Monthly Salary</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>3M Retention</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>6M Retention</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>12M Retention</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Audit Status</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.map((item) => (
                <tr key={item.trainee_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    {item.trainee_name}
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{item.trainee_id} • {item.programme}</span>
                  </td>
                  <td style={{ padding: '1rem', color: '#0f172a' }}>
                    <strong>{item.employer}</strong>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>{item.role}</span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#15803d' }}>
                    {item.salary}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#334155' }}>
                    {item.retention_3m}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#334155' }}>
                    {item.retention_6m}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#334155' }}>
                    {item.retention_12m}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ background: item.verification_status === 'Verified' ? '#dcfce7' : '#fef3c7', color: item.verification_status === 'Verified' ? '#15803d' : '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {item.verification_status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedVerification(item);
                        setVerifyStatus(item.verification_status);
                      }}
                      style={{ padding: '0.4rem 0.85rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Audit / Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= OUTCOME VERIFICATION MODAL ================= */}
      {selectedVerification && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '580px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>STATE EMPLOYMENT AUDIT</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Verify {selectedVerification.trainee_name}</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedVerification.trainee_id} • {selectedVerification.employer}</span>
              </div>
              <button onClick={() => setSelectedVerification(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            {verifySuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.15rem' }}>Outcome Successfully Verified!</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  The employment status and 3M retention checkpoint have been confirmed in the State Registry.
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifySubmit}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <p style={{ margin: '0 0 0.35rem 0' }}><strong>Role:</strong> {selectedVerification.role}</p>
                  <p style={{ margin: '0 0 0.35rem 0' }}><strong>Starting Salary:</strong> {selectedVerification.salary}</p>
                  <p style={{ margin: 0 }}><strong>Joining Date:</strong> {selectedVerification.joining_date}</p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    Audit Status
                  </label>
                  <select
                    value={verifyStatus}
                    onChange={(e) => setVerifyStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}
                  >
                    <option value="Verified">Verified (Confirmed Active Employment)</option>
                    <option value="Pending">Pending Additional Verification</option>
                    <option value="Needs Review">Needs Auditor Review</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    Verification Remarks / Notes
                  </label>
                  <input
                    type="text"
                    value={verifyRemarks}
                    onChange={(e) => setVerifyRemarks(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedVerification(null)}
                    style={{ padding: '0.65rem 1.25rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Confirm & Save Verification
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

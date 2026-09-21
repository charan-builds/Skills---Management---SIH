import { useState, useEffect } from "react";
import {
  ShieldCheck, CheckCircle, XCircle, AlertCircle, Building2, Search, Eye, X,
  Play, RotateCcw, Zap, Layers, Mail, CheckCircle2, ArrowRight, RefreshCw, Info, HelpCircle
} from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import DataTable from "../components/common/DataTable";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function EmployerVerifyOutcomes() {
  const store = usePlatformStore();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'Pending' | 'Verified' | 'Rejected'
  const [confirmModal, setConfirmModal] = useState(null); // { employer, action: 'Verified' | 'Rejected' }
  const [reviewEmployer, setReviewEmployer] = useState(null);

  // 3-Tier Verification Engine State
  const [demoTrainees, setDemoTrainees] = useState([]);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [checkSummary, setCheckSummary] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, demoRes] = await Promise.all([
        platformService.getEmployerRegistrations(),
        platformService.get3TierDemoTrainees()
      ]);
      setEmployers(empRes.employers || []);
      setDemoTrainees(demoRes || []);
    } catch (err) {
      console.error("Failed to load employers/verifications", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [store.last_updated]);

  // Execute 3-Tier Verification Engine Check
  const handleRun3TierCheck = async () => {
    setIsRunningCheck(true);
    setToastMsg(null);
    try {
      const summary = await platformService.run3TierVerificationCheck();
      setCheckSummary(summary);
      setDemoTrainees(summary.results || []);
      setToastMsg(`Verification complete! Tier 1 (EPFO): ${summary.tier1_epfo}, Tier 3 (HRIS): ${summary.tier3_hris}, Tier 2 (Manual): ${summary.tier2_manual}`);
      setTimeout(() => setToastMsg(null), 5000);
    } catch (err) {
      console.error("3-Tier Verification Error:", err);
      alert("Verification check error. Please try again.");
    } finally {
      setIsRunningCheck(false);
    }
  };

  // Reset Demo Verification Claims
  const handleResetDemoClaims = async () => {
    const resetList = await platformService.reset3TierVerification();
    setDemoTrainees(resetList);
    setCheckSummary(null);
    setToastMsg("Demo verification claims reset to pending state.");
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmAction = async (empId, status) => {
    try {
      await platformService.updateEmployerStatus(empId, status);
      setConfirmModal(null);
      setReviewEmployer(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Error updating employer status");
    }
  };

  const filteredEmployers = employers.filter(e => {
    if (activeTab === "all") return true;
    return e.status === activeTab;
  });

  const pendingCount = employers.filter(e => e.status === "Pending").length;
  const verifiedCount = employers.filter(e => e.status === "Verified").length;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "4rem" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
          <div style={{ padding: "0.35rem", borderRadius: "6px", background: "#eff6ff", display: "flex", alignItems: "center" }}>
            <ShieldCheck size={20} color="#2563eb" />
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            EMPLOYMENT VERIFICATION & CREDENTIAL OVERSIGHT
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          3-Tier Employment Verification Oversight
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Automated multi-tier verification engine linking statutory EPFO government records, corporate HRIS feeds, and 2-tap employer requests.
        </p>
      </div>

      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div style={{
          background: "#ecfdf5",
          border: "1px solid #6ee7b7",
          color: "#047857",
          padding: "0.85rem 1.25rem",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "0.9rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── 3-TIER VERIFICATION CASCADE ENGINE PANEL ── */}
      <div style={{ background: "white", borderRadius: "14px", border: "1px solid #cbd5e1", padding: "1.75rem", marginBottom: "2.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, padding: "0.2rem 0.65rem", borderRadius: "12px", background: "#dbeafe", color: "#1e40af" }}>
                AUTOMATED VERIFICATION PIPELINE
              </span>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b" }}>
                Multi-Layered Verification Architecture
              </span>
            </div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Live 3-Tier Verification Check Engine
            </h2>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              onClick={handleRun3TierCheck}
              disabled={isRunningCheck}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "0.92rem",
                cursor: isRunningCheck ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 2px 8px rgba(37,99,235,0.25)"
              }}
            >
              {isRunningCheck ? (
                <>
                  <div className="spinner" style={{ width: "16px", height: "16px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <span>Evaluating 3 Tiers...</span>
                </>
              ) : (
                <>
                  <Play size={18} fill="white" />
                  <span>Run Verification Check</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetDemoClaims}
              style={{
                background: "white",
                color: "#475569",
                border: "1px solid #cbd5e1",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <RotateCcw size={16} />
              <span>Reset Claims</span>
            </button>
          </div>
        </div>

        {/* 3-Tier Pathway Visual Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          
          {/* TIER 1 CARD */}
          <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #cbd5e1", borderLeft: "4px solid #16a34a" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#166534", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "#dcfce7" }}>
                TIER 1 (PRIMARY)
              </span>
              <ShieldCheck size={20} color="#16a34a" />
            </div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
              EPFO Government DB Check
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#475569", margin: "0 0 0.75rem 0", lineHeight: "1.45" }}>
              Instant zero-touch verification via Employees' Provident Fund Organisation statutory data. Covers all formal firms (20+ staff) automatically without partnerships.
            </p>
            {checkSummary && (
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#15803d" }}>
                ✓ {checkSummary.tier1_epfo} Candidate(s) Verified via EPFO
              </div>
            )}
          </div>

          {/* TIER 3 CARD */}
          <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #cbd5e1", borderLeft: "4px solid #2563eb" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#1e40af", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "#dbeafe" }}>
                TIER 3 (FAST LANE)
              </span>
              <Zap size={20} color="#2563eb" />
            </div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
              Partner HRIS API Integration
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#475569", margin: "0 0 0.75rem 0", lineHeight: "1.45" }}>
              Real-time API reconciliation with connected placement partners (Workday HCM, BambooHR, Darwinbox). Eliminates 30-day EPFO reporting lag for active partners.
            </p>
            {checkSummary && (
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1d4ed8" }}>
                ✓ {checkSummary.tier3_hris} Candidate(s) Verified via HRIS
              </div>
            )}
          </div>

          {/* TIER 2 CARD */}
          <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #cbd5e1", borderLeft: "4px solid #b45309" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#92400e", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "#fef3c7" }}>
                TIER 2 (SAFETY NET)
              </span>
              <Mail size={20} color="#b45309" />
            </div>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
              Direct Employer Confirmation
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#475569", margin: "0 0 0.75rem 0", lineHeight: "1.45" }}>
              Universal fallback sending a direct 2-tap confirmation link to employer HR. Guarantees 100% verification coverage for small businesses (under 20 staff) and unintegrated employers.
            </p>
            {checkSummary && (
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#b45309" }}>
                ⌛ {checkSummary.tier2_manual} Candidate(s) Awaiting Confirmation
              </div>
            )}
          </div>

        </div>

        {/* Live Demo Verification Claims Table */}
        <div>
          <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Layers size={18} color="#2563eb" />
            Live Verification Claims & Tier Resolution Status
          </h4>

          <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569" }}>Candidate Name</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569" }}>Master-ID (Aadhaar Hash)</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569" }}>Claimed Employer</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569" }}>Verification Pathway</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: 800, color: "#475569" }}>Status & Resolution Notes</th>
                </tr>
              </thead>
              <tbody>
                {demoTrainees.map(t => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 800, color: "#0f172a" }}>
                      {t.full_name}
                      <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>ID: {t.id}</span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", fontFamily: "monospace", fontSize: "0.8rem", color: "#334155" }}>
                      •••• •••• {t.aadhaar_number.slice(-4)}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#1e293b" }}>
                      {t.claimed_employer}
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        background: t.verification_tier === "EPFO" ? "#dcfce7" : t.verification_tier === "HRIS" ? "#dbeafe" : t.verification_tier === "MANUAL_REQUEST" ? "#fef3c7" : "#f1f5f9",
                        color: t.verification_tier === "EPFO" ? "#15803d" : t.verification_tier === "HRIS" ? "#1d4ed8" : t.verification_tier === "MANUAL_REQUEST" ? "#b45309" : "#475569"
                      }}>
                        {t.verification_badge}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", fontSize: "0.82rem", color: "#475569", lineHeight: "1.4" }}>
                      {t.notes || "Pending verification run."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── REGISTERED CORPORATE EMPLOYERS LIST ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Registered Employers & Corporate Partners
        </h2>

        {/* KPI Badges */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem", borderRadius: "6px", background: "white", border: "1px solid #cbd5e1", fontWeight: 700, color: "#475569" }}>
            Total Employers: {employers.length}
          </span>
          <span style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem", borderRadius: "6px", background: "#fef3c7", border: "1px solid #fde68a", fontWeight: 800, color: "#b45309" }}>
            Pending Approval: {pendingCount}
          </span>
          <span style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem", borderRadius: "6px", background: "#dcfce7", border: "1px solid #86efac", fontWeight: 800, color: "#15803d" }}>
            Verified Partners: {verifiedCount}
          </span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {["all", "Pending", "Verified", "Rejected"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: activeTab === tab ? "2px solid #2563eb" : "1px solid #cbd5e1",
              background: activeTab === tab ? "#eff6ff" : "white",
              color: activeTab === tab ? "#1d4ed8" : "#475569",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {tab === "all" ? "All Employers" : `${tab} Employers`}
            {tab === "Pending" && pendingCount > 0 && ` (${pendingCount})`}
          </button>
        ))}
      </div>

      {/* Employers Table */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <DataStateWrapper
          isLoading={loading}
          error={error}
          data={filteredEmployers}
          onRetry={loadData}
          isDataAvailable={(d) => d && d.length > 0}
          isEmptyDetails="No employers match the selected filter category."
        >
          {filteredEmployers && (
            <DataTable
              columns={[
                {
                  header: "Employer / Corporate Partner",
                  accessor: "name",
                  render: (row) => (
                    <div>
                      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>{row.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>ID: {row.id} • GST: {row.gst_number || "GST27AABC1234F"}</div>
                    </div>
                  )
                },
                {
                  header: "Industry Sector",
                  accessor: "sector",
                  render: (row) => <span style={{ fontWeight: 600, color: "#334155" }}>{row.sector || "IT & Technology"}</span>
                },
                {
                  header: "Location / District",
                  accessor: "district",
                  render: (row) => <span style={{ color: "#475569" }}>{row.district || "Pune"}</span>
                },
                {
                  header: "HRIS System",
                  accessor: "hris_system",
                  render: (row) => (
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: "4px", background: "#f1f5f9", color: "#334155" }}>
                      {row.name.includes("Tata") ? "Workday HCM" : row.name.includes("Apollo") ? "BambooHR" : "Custom HR API"}
                    </span>
                  )
                },
                {
                  header: "Status",
                  accessor: "status",
                  render: (row) => (
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      background: row.status === "Verified" ? "#dcfce7" : row.status === "Pending" ? "#fef3c7" : "#fee2e2",
                      color: row.status === "Verified" ? "#15803d" : row.status === "Pending" ? "#b45309" : "#dc2626"
                    }}>
                      {row.status}
                    </span>
                  )
                },
                {
                  header: "Actions",
                  accessor: "actions",
                  render: (row) => (
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        onClick={() => setReviewEmployer(row)}
                        style={{ padding: "0.35rem 0.65rem", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                      >
                        Details
                      </button>
                      {row.status === "Pending" && (
                        <>
                          <button
                            onClick={() => setConfirmModal({ employer: row, action: "Verified" })}
                            style={{ padding: "0.35rem 0.65rem", background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 800, cursor: "pointer" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setConfirmModal({ employer: row, action: "Rejected" })}
                            style={{ padding: "0.35rem 0.65rem", background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 800, cursor: "pointer" }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  )
                }
              ]}
              data={filteredEmployers}
            />
          )}
        </DataStateWrapper>
      </div>

      {/* Details Modal */}
      {reviewEmployer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "14px", padding: "2rem", maxWidth: "600px", width: "90%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a" }}>Employer Profile & Integration Details</h3>
              <button onClick={() => setReviewEmployer(null)} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ fontSize: "0.9rem", color: "#334155", lineHeight: "1.6" }}>
              <p><strong>Company Name:</strong> {reviewEmployer.name}</p>
              <p><strong>Employer ID:</strong> {reviewEmployer.id}</p>
              <p><strong>Sector:</strong> {reviewEmployer.sector}</p>
              <p><strong>GST Number:</strong> {reviewEmployer.gst_number || "GST27AABC1234F"}</p>
              <p><strong>Verification Status:</strong> {reviewEmployer.status}</p>
              <p><strong>Registered Email:</strong> hr@{reviewEmployer.name.toLowerCase().replace(/\s+/g, '')}.com</p>
            </div>
            <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
              <button onClick={() => setReviewEmployer(null)} style={{ padding: "0.6rem 1.25rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "14px", padding: "1.75rem", maxWidth: "450px", width: "90%" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.15rem", color: "#0f172a" }}>Confirm Action</h3>
            <p style={{ fontSize: "0.9rem", color: "#475569" }}>
              Are you sure you want to mark <strong>{confirmModal.employer.name}</strong> as <strong>{confirmModal.action}</strong>?
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button onClick={() => setConfirmModal(null)} style={{ padding: "0.5rem 1rem", border: "1px solid #cbd5e1", background: "white", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleConfirmAction(confirmModal.employer.id, confirmModal.action)} style={{ padding: "0.5rem 1rem", background: confirmModal.action === "Verified" ? "#16a34a" : "#dc2626", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

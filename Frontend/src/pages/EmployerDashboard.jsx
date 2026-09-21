import { useState, useEffect } from "react";
import { 
  Users, CheckCircle2, AlertCircle, Clock, TrendingUp, XCircle, 
  ArrowRight, ShieldCheck, Activity, MessageSquare, GitBranch,
  Briefcase, Award, RefreshCw, AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import { platformService, usePlatformStore } from "../services/platformService";
import { mockStore } from "../services/mockStore";

export default function EmployerDashboard() {
  const storeState = usePlatformStore();
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";
  const organizationName = localStorage.getItem("organizationName") || "Tata Consultancy Services";
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getEmployerDashboard(organizationId);
      setStats(res.stats || null);
    } catch (err) {
      console.error("Failed to load employer dashboard", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [organizationId, storeState.last_updated]);

  const employer = stats?.employer || mockStore.getEmployer(organizationId);
  const verificationStatus = employer?.status || "Verified";

  const workforce = stats?.workforce_breakdown || { employed: 36, resigned: 4, terminated: 1, contract_completed: 1 };
  const verActivity = stats?.verification_activity || { pending: 3, confirmed: 38, rejected: 2, correction: 1 };
  const rankedSkills = stats?.skills_we_need || [];
  const recentActivities = stats?.recent_activity || [];

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header & Verification Badge (Section 5) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
              {employer?.name || organizationName}
            </h1>

            {/* Read-only Admin Verification Badge */}
            {verificationStatus === "Verified" ? (
              <span style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", fontSize: "0.8rem", fontWeight: 700, padding: "3px 10px", borderRadius: "14px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheck size={14} /> Verified Employer
              </span>
            ) : verificationStatus === "Pending" ? (
              <span style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fcd34d", fontSize: "0.8rem", fontWeight: 700, padding: "3px 10px", borderRadius: "14px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Clock size={14} /> Verification Pending
              </span>
            ) : (
              <span style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", fontSize: "0.8rem", fontWeight: 700, padding: "3px 10px", borderRadius: "14px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <XCircle size={14} /> Verification Rejected
              </span>
            )}
          </div>

          <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
            Enterprise Desk for Trainee Claim Verification, Workforce Retention &amp; Skill Gap Intelligence.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => navigate("/employer/verifications")}
            style={{
              padding: "0.65rem 1.25rem",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "0 1px 2px rgba(37, 99, 235, 0.2)"
            }}
          >
            Review Inbox ({stats?.pending_verifications_count || 0}) <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate("/employer/integrations")}
            style={{
              padding: "0.65rem 1.25rem",
              background: "white",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            <GitBranch size={15} color="#2563eb" /> HR/ATS Sync
          </button>
        </div>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={stats}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d)}
        isEmptyDetails="No employer metrics found for this organization."
      >
        {stats && (
          <>
            {/* ========================================================================= */}
            {/* 1. KEY PERFORMANCE INDICATORS (Section 6) */}
            {/* ========================================================================= */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
              {/* Pending Verifications */}
              <div 
                onClick={() => navigate("/employer/verifications")}
                style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", transition: "transform 0.15s" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Pending Verification</span>
                  <AlertCircle size={18} color="#f59e0b" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: stats.pending_verifications_count > 0 ? "#b45309" : "#0f172a" }}>
                  {stats.pending_verifications_count}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 600, marginTop: "0.35rem" }}>
                  Review claims &rarr;
                </div>
              </div>

              {/* Verified Workforce */}
              <div 
                onClick={() => navigate("/employer/workforce")}
                style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Verified Workforce</span>
                  <CheckCircle2 size={18} color="#16a34a" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#166534" }}>
                  {stats.verified_workforce_count}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.35rem" }}>
                  Active confirmed roster
                </div>
              </div>

              {/* Rejected Claims */}
              <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Rejected Claims</span>
                  <XCircle size={18} color="#ef4444" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#b91c1c" }}>
                  {stats.rejected_claims_count}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.35rem" }}>
                  Non-qualifying records
                </div>
              </div>

              {/* Correction Requests */}
              <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Correction Requests</span>
                  <AlertTriangle size={18} color="#f97316" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#c2410c" }}>
                  {stats.correction_requests_count}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.35rem" }}>
                  Awaiting candidate resubmission
                </div>
              </div>

              {/* 6M Retention */}
              <div style={{ background: "white", borderRadius: "12px", padding: "1.25rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>6M Retention Benchmark</span>
                  <TrendingUp size={18} color="#10b981" />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a" }}>
                  {stats.six_month_retention}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.35rem" }}>
                  Wage Confirmed: {stats.wage_confirmation_rate}
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. VISUAL CHARTS: WORKFORCE & VERIFICATION DONUTS + SKILL GAPS (Sections 38–40) */}
            {/* ========================================================================= */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2.5rem" }}>
              {/* Workforce Lifecycle Donut */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                      Workforce Status Distribution
                    </h3>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Current employment status of verified graduates</span>
                  </div>
                  <button onClick={() => navigate("/employer/workforce")} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                    Roster &rarr;
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                  {/* SVG Donut */}
                  <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                    {/* Employed (green) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#16a34a" strokeWidth="18" strokeDasharray="180 238" strokeDashoffset="0" />
                    {/* Resigned (amber) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="18" strokeDasharray="35 238" strokeDashoffset="-180" />
                    {/* Terminated (red) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#ef4444" strokeWidth="18" strokeDasharray="12 238" strokeDashoffset="-215" />
                    {/* Contract Completed (blue) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#3b82f6" strokeWidth="18" strokeDasharray="11 238" strokeDashoffset="-227" />
                  </svg>

                  {/* Legend breakdown */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#16a34a" }} />
                        Currently Employed
                      </span>
                      <strong style={{ color: "#0f172a" }}>{workforce.employed}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
                        Resigned
                      </span>
                      <strong style={{ color: "#0f172a" }}>{workforce.resigned}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
                        Terminated
                      </span>
                      <strong style={{ color: "#0f172a" }}>{workforce.terminated}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3b82f6" }} />
                        Contract Completed
                      </span>
                      <strong style={{ color: "#0f172a" }}>{workforce.contract_completed}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Activity Donut */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                      Claim Attestation Breakdown
                    </h3>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Clickable verification decision distribution</span>
                  </div>
                  <button onClick={() => navigate("/employer/verifications")} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                    Inbox &rarr;
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                  {/* SVG Donut */}
                  <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                    {/* Confirmed (green) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#16a34a" strokeWidth="18" strokeDasharray="190 238" strokeDashoffset="0" />
                    {/* Pending (amber) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#f59e0b" strokeWidth="18" strokeDasharray="25 238" strokeDashoffset="-190" />
                    {/* Rejected (red) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#ef4444" strokeWidth="18" strokeDasharray="15 238" strokeDashoffset="-215" />
                    {/* Correction Requested (purple) */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#8b5cf6" strokeWidth="18" strokeDasharray="8 238" strokeDashoffset="-230" />
                  </svg>

                  {/* Clickable Legend */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", flex: 1 }}>
                    <div 
                      onClick={() => navigate("/employer/verifications?status=confirmed")}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", cursor: "pointer", padding: "3px 6px", borderRadius: "6px" }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#16a34a" }} />
                        Confirmed / Verified
                      </span>
                      <strong style={{ color: "#16a34a" }}>{verActivity.confirmed}</strong>
                    </div>
                    <div 
                      onClick={() => navigate("/employer/verifications?status=pending")}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", cursor: "pointer", padding: "3px 6px", borderRadius: "6px", background: "#fef3c7" }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b" }} />
                        Pending Action
                      </span>
                      <strong style={{ color: "#b45309" }}>{verActivity.pending}</strong>
                    </div>
                    <div 
                      onClick={() => navigate("/employer/verifications?status=rejected")}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", cursor: "pointer", padding: "3px 6px", borderRadius: "6px" }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444" }} />
                        Rejected Claims
                      </span>
                      <strong style={{ color: "#b91c1c" }}>{verActivity.rejected}</strong>
                    </div>
                    <div 
                      onClick={() => navigate("/employer/verifications?status=correction")}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", cursor: "pointer", padding: "3px 6px", borderRadius: "6px" }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#8b5cf6" }} />
                        Correction Requested
                      </span>
                      <strong style={{ color: "#6d28d9" }}>{verActivity.correction}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 3. SKILLS WE NEED & RECENT ACTIVITY (Sections 7, 40) */}
            {/* ========================================================================= */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              {/* Skills We Need Bar Chart */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                      Skills We Need
                    </h3>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Ranked skill shortages reported by your hiring managers</span>
                  </div>
                  <button onClick={() => navigate("/employer/feedback")} style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
                    + Report Gap
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "1rem" }}>
                  {rankedSkills.slice(0, 4).map((item, idx) => {
                    const maxVal = rankedSkills[0]?.count || 1;
                    const pct = Math.round((item.count / maxVal) * 100);
                    return (
                      <div key={item.skill}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
                          <span style={{ fontWeight: 600, color: "#334155" }}>{item.skill}</span>
                          <span style={{ fontWeight: 700, color: "#2563eb" }}>{item.count} report{item.count !== 1 ? "s" : ""}</span>
                        </div>
                        <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: idx === 0 ? "#2563eb" : "#3b82f6", borderRadius: "4px" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chronological Recent Activity (Section 7) */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                    Recent Operational Activity
                  </h3>
                  <span style={{ fontSize: "0.75rem", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                    Live Audit Stream
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {recentActivities.slice(0, 4).map((act) => (
                    <div key={act.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", padding: "0.75rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                      <div style={{ marginTop: "2px" }}>
                        {act.type === "CLAIM_CONFIRMED" ? (
                          <CheckCircle2 size={16} color="#16a34a" />
                        ) : act.type === "CLAIM_REJECTED" ? (
                          <XCircle size={16} color="#ef4444" />
                        ) : act.type === "CORRECTION_REQUESTED" ? (
                          <AlertTriangle size={16} color="#f59e0b" />
                        ) : act.type === "SYNC_COMPLETED" || act.type === "SYNC_NOW" ? (
                          <GitBranch size={16} color="#2563eb" />
                        ) : (
                          <Activity size={16} color="#64748b" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                          <strong style={{ fontSize: "0.85rem", color: "#0f172a" }}>{act.title}</strong>
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#475569" }}>
                          {act.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </DataStateWrapper>
    </div>
  );
}

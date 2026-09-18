import { useState, useEffect } from "react";
import { 
  ShieldCheck, XCircle, AlertCircle, CheckCircle, Search, Filter,
  Clock, AlertTriangle, ArrowRight, UserCheck, Calendar, DollarSign,
  Briefcase, Building, FileText, Check, History
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import { platformService, usePlatformStore } from "../services/platformService";
import { mockStore } from "../services/mockStore";

export default function VerificationRequests() {
  const storeState = usePlatformStore();
  const [searchParams] = useSearchParams();
  const initialStatusParam = searchParams.get("status") || "All";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusParam);
  const [typeFilter, setTypeFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("inbox"); // "inbox" | "history"
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";
  const organizationName = localStorage.getItem("organizationName") || "Tata Consultancy Services";

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getVerificationRequests(organizationId, "All");
      setRequests(res.requests || []);
    } catch (err) {
      console.error("Failed to load requests", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [organizationId, storeState.last_updated]);

  useEffect(() => {
    if (searchParams.get("status")) {
      const p = searchParams.get("status").toLowerCase();
      if (p.includes("pending")) setStatusFilter("Pending");
      else if (p.includes("confirmed")) setStatusFilter("Confirmed");
      else if (p.includes("rejected")) setStatusFilter("Rejected");
      else if (p.includes("correction")) setStatusFilter("Correction Requested");
    }
  }, [searchParams]);

  // Filter requests
  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      (r.trainee_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.job_role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.trainee_id || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || r.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === "All" || (typeFilter === "Apprenticeship" ? r.employment_type === "Apprenticeship" : r.employment_type !== "Apprenticeship");

    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = requests.filter(r => r.status === "Pending").length;
  const historyRequests = requests.filter(r => r.status !== "Pending");

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header (Section 8) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.4rem 0" }}>
            Verification Requests Inbox
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
            Review trainees claiming employment or apprenticeship at <strong>{organizationName}</strong>.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: "flex", background: "#e2e8f0", padding: "3px", borderRadius: "8px" }}>
          <button
            onClick={() => setActiveTab("inbox")}
            style={{
              padding: "0.5rem 1rem",
              background: activeTab === "inbox" ? "white" : "none",
              border: "none",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: activeTab === "inbox" ? "#2563eb" : "#475569",
              cursor: "pointer",
              boxShadow: activeTab === "inbox" ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
            }}
          >
            Active Inbox ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              padding: "0.5rem 1rem",
              background: activeTab === "history" ? "white" : "none",
              border: "none",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: activeTab === "history" ? "#2563eb" : "#475569",
              cursor: "pointer",
              boxShadow: activeTab === "history" ? "0 1px 2px rgba(0,0,0,0.05)" : "none"
            }}
          >
            Decision History ({historyRequests.length})
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", padding: "0.85rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle size={18} /> {actionSuccessMsg}
          </span>
          <button onClick={() => setActionSuccessMsg("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#166534", fontWeight: 800 }}>✕</button>
        </div>
      )}

      {/* Filter Toolbar (Section 8) */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
          <input
            type="text"
            placeholder="Search candidate by name, role, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.55rem 1rem 0.55rem 2.25rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.875rem"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.55rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              fontWeight: 600,
              background: "#f8fafc",
              color: "#334155",
              cursor: "pointer"
            }}
          >
            <option value="All">All Verification Statuses</option>
            <option value="Pending">Pending Action</option>
            <option value="Confirmed">Confirmed / Verified</option>
            <option value="Correction Requested">Correction Requested</option>
            <option value="Rejected">Rejected Claims</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: "0.55rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              fontWeight: 600,
              background: "#f8fafc",
              color: "#334155",
              cursor: "pointer"
            }}
          >
            <option value="All">All Types (Employment &amp; Apprenticeship)</option>
            <option value="Employment">Regular Full-time</option>
            <option value="Apprenticeship">Apprenticeship Only</option>
          </select>
        </div>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={filteredRequests}
        onRetry={loadRequests}
        isDataAvailable={() => filteredRequests && filteredRequests.length > 0}
        isEmptyDetails="No verification claims matching the selected filters."
      >
        <div style={{ display: "grid", gridTemplateColumns: selectedRequest ? "1fr 440px" : "1fr", gap: "2rem" }}>
          
          {/* Requests Table (Section 8) */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "0.85rem 1.25rem" }}>Candidate</th>
                    <th style={{ padding: "0.85rem 1rem" }}>Claimed Job Role</th>
                    <th style={{ padding: "0.85rem 1rem" }}>Joining Date</th>
                    <th style={{ padding: "0.85rem 1rem" }}>Type</th>
                    <th style={{ padding: "0.85rem 1rem" }}>Claimed Wage</th>
                    <th style={{ padding: "0.85rem 1rem" }}>Status</th>
                    <th style={{ padding: "0.85rem 1.25rem", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => {
                    const isSelected = selectedRequest?.id === req.id;
                    return (
                      <tr 
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          cursor: "pointer",
                          background: isSelected ? "#eff6ff" : "white",
                          transition: "background 0.1s ease"
                        }}
                      >
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <strong style={{ color: "#0f172a", display: "block" }}>{req.trainee_name}</strong>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: {req.trainee_id}</span>
                        </td>
                        <td style={{ padding: "1rem 1rem", fontWeight: 600, color: "#334155" }}>
                          {req.job_role}
                        </td>
                        <td style={{ padding: "1rem 1rem", color: "#64748b" }}>
                          {req.joining_date || "2023-05-01"}
                        </td>
                        <td style={{ padding: "1rem 1rem" }}>
                          <span style={{
                            background: req.employment_type === "Apprenticeship" ? "#f3e8ff" : "#f1f5f9",
                            color: req.employment_type === "Apprenticeship" ? "#6b21a8" : "#475569",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontSize: "0.75rem",
                            fontWeight: 700
                          }}>
                            {req.employment_type || "Full-time"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 1rem", fontWeight: 700, color: "#0f172a" }}>
                          ₹{(req.salary || 25000).toLocaleString()}/mo
                        </td>
                        <td style={{ padding: "1rem 1rem" }}>
                          {req.status === "Confirmed" ? (
                            <span style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                              <CheckCircle size={12} /> Confirmed
                            </span>
                          ) : req.status === "Correction Requested" ? (
                            <span style={{ background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                              <AlertTriangle size={12} /> Correction Note
                            </span>
                          ) : req.status === "Rejected" || req.status === "Rejected Claim" ? (
                            <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                              <XCircle size={12} /> Rejected
                            </span>
                          ) : (
                            <span style={{ background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                              <Clock size={12} /> Pending Review
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }}
                            style={{
                              padding: "0.4rem 0.85rem",
                              background: isSelected ? "#2563eb" : "white",
                              color: isSelected ? "white" : "#2563eb",
                              border: "1px solid #2563eb",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            Review Claim &rarr;
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Claim Detail Drawer & Actions (Sections 9–12, 20) */}
          {selectedRequest && (
            <DetailDrawer
              req={selectedRequest}
              onClose={() => setSelectedRequest(null)}
              onSuccess={(msg) => {
                setSelectedRequest(null);
                setActionSuccessMsg(msg);
                loadRequests();
              }}
            />
          )}

        </div>
      </DataStateWrapper>
    </div>
  );
}

/**
 * Detail Drawer with Confirm, Reject (with reason), and Request Correction (with note)
 */
function DetailDrawer({ req, onClose, onSuccess }) {
  const [wageConfirmation, setWageConfirmation] = useState("Confirmed");
  const [roleConfirmed, setRoleConfirmed] = useState("yes");
  const [confirmedRole, setConfirmedRole] = useState(req.job_role || "Associate");
  const [confirmedWage, setConfirmedWage] = useState(req.salary || 26000);
  
  // Modals for Reject and Request Correction
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("Candidate never worked here");
  const [rejectNotes, setRejectNotes] = useState("");

  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionNote, setCorrectionNote] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Section 10: Confirm Employment
  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await platformService.verifyEmployment(
        req.id || req.trainee_id,
        "Confirmed",
        "Confirmed by employer desk review.",
        {
          job_role: roleConfirmed === "yes" ? req.job_role : confirmedRole,
          salary: confirmedWage,
          wage_confirmation: wageConfirmation,
          role_confirmed: roleConfirmed === "yes"
        }
      );
      onSuccess(`Successfully confirmed employment claim for ${req.trainee_name}.`);
    } catch (err) {
      console.error(err);
      alert("Failed to confirm: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Section 11: Reject Claim
  const handleReject = async () => {
    setSubmitting(true);
    try {
      const fullReason = `${rejectReason}${rejectNotes ? `: ${rejectNotes}` : ""}`;
      await platformService.verifyEmployment(
        req.id || req.trainee_id,
        "Rejected",
        fullReason,
        {}
      );
      setShowRejectModal(false);
      onSuccess(`Claim for ${req.trainee_name} has been rejected.`);
    } catch (err) {
      console.error(err);
      alert("Failed to reject: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Section 12: Request Correction
  const handleRequestCorrection = async () => {
    if (!correctionNote.trim()) {
      alert("Please specify what needs to be corrected by the candidate.");
      return;
    }

    setSubmitting(true);
    try {
      await platformService.verifyEmployment(
        req.id || req.trainee_id,
        "Correction Requested",
        correctionNote.trim(),
        {}
      );
      setShowCorrectionModal(false);
      onSuccess(`Correction note sent to candidate ${req.trainee_name}.`);
    } catch (err) {
      console.error(err);
      alert("Failed to request correction: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isApprentice = req.employment_type === "Apprenticeship";

  return (
    <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Drawer Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem" }}>
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            {isApprentice ? "Apprenticeship Attestation Claim" : "Employment Verification Claim"}
          </span>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", margin: "0.2rem 0 0.1rem 0" }}>
            {req.trainee_name}
          </h2>
          <span style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 600 }}>Candidate Identifier: {req.trainee_id}</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b" }}>✕</button>
      </div>

      {/* Claim Summary Cards */}
      <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "1rem", border: "1px solid #e2e8f0", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Claimed Role:</span>
          <strong style={{ color: "#0f172a" }}>{req.job_role}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Joining Date:</span>
          <strong style={{ color: "#0f172a" }}>{req.joining_date || "2023-05-01"}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>Employment Type:</span>
          <strong style={{ color: "#0f172a" }}>{req.employment_type || "Full-time"}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#64748b" }}>{isApprentice ? "Monthly Stipend:" : "Self-Reported Wage:"}</span>
          <strong style={{ color: "#16a34a" }}>₹{(req.salary || 25000).toLocaleString()}/mo</strong>
        </div>
      </div>

      {req.employer_remarks && (
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "0.75rem", borderRadius: "8px", fontSize: "0.8rem", color: "#1e40af" }}>
          <strong>Previous Note:</strong> {req.employer_remarks}
        </div>
      )}

      {/* Section 18: Wage Confirmation Form */}
      <div>
        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "0.35rem" }}>
          Wage Confirmation (Section 18):
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem", marginBottom: "0.5rem" }}>
          {["Confirmed", "Different", "Cannot Disclose"].map(choice => (
            <button
              key={choice}
              type="button"
              onClick={() => setWageConfirmation(choice)}
              style={{
                padding: "0.45rem 0.25rem",
                background: wageConfirmation === choice ? "#2563eb" : "#f1f5f9",
                color: wageConfirmation === choice ? "white" : "#334155",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              {choice}
            </button>
          ))}
        </div>
        {wageConfirmation === "Different" && (
          <input
            type="number"
            value={confirmedWage}
            onChange={(e) => setConfirmedWage(e.target.value)}
            placeholder="Enter actual monthly compensation"
            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
          />
        )}
      </div>

      {/* Section 19: Job Role Confirmation */}
      <div>
        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: "0.35rem" }}>
          Job Role Confirmation (Section 19):
        </label>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setRoleConfirmed("yes")}
            style={{
              flex: 1,
              padding: "0.45rem",
              background: roleConfirmed === "yes" ? "#2563eb" : "#f1f5f9",
              color: roleConfirmed === "yes" ? "white" : "#334155",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Confirmed as Claimed
          </button>
          <button
            type="button"
            onClick={() => setRoleConfirmed("no")}
            style={{
              flex: 1,
              padding: "0.45rem",
              background: roleConfirmed === "no" ? "#2563eb" : "#f1f5f9",
              color: roleConfirmed === "no" ? "white" : "#334155",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Different Job Role
          </button>
        </div>
        {roleConfirmed === "no" && (
          <input
            type="text"
            value={confirmedRole}
            onChange={(e) => setConfirmedRole(e.target.value)}
            placeholder="Enter correct employee role"
            style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
          />
        )}
      </div>

      {/* Action Triggers (Sections 10, 11, 12) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.5rem" }}>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          style={{
            padding: "0.75rem",
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: submitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem"
          }}
        >
          <CheckCircle size={16} /> Confirm Employment
        </button>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setShowCorrectionModal(true)}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "0.6rem",
              background: "#fef3c7",
              color: "#b45309",
              border: "1px solid #fcd34d",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: submitting ? "not-allowed" : "pointer"
            }}
          >
            Request Correction
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "0.6rem",
              background: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: submitting ? "not-allowed" : "pointer"
            }}
          >
            Reject Claim
          </button>
        </div>
      </div>

      {/* Section 11: Reject Reason Modal */}
      {showRejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: "14px", padding: "1.75rem", maxWidth: "460px", width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#b91c1c", fontSize: "1.2rem", fontWeight: 800 }}>
              Reject Employment Claim
            </h3>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "#475569" }}>
              Select an approved non-verification reason. The candidate will see this status reflected in their career journey.
            </p>

            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>
              Rejection Reason:
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "1rem", fontSize: "0.85rem" }}
            >
              <option value="Candidate never worked here">Candidate never worked here</option>
              <option value="Incorrect employment details">Incorrect employment details</option>
              <option value="Incorrect joining date">Incorrect joining date</option>
              <option value="Incorrect job role">Incorrect job role</option>
              <option value="Disciplinary departure">Disciplinary departure</option>
              <option value="Other">Other</option>
            </select>

            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>
              Additional Remarks (Optional):
            </label>
            <textarea
              rows={2}
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Provide context for the audit record..."
              style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "1.25rem", fontSize: "0.85rem" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                style={{ padding: "0.5rem 1rem", background: "#f1f5f9", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", color: "#475569" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                style={{ padding: "0.5rem 1rem", background: "#dc2626", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 12: Request Correction Modal */}
      {showCorrectionModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: "14px", padding: "1.75rem", maxWidth: "460px", width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#c2410c", fontSize: "1.2rem", fontWeight: 800 }}>
              Request Claim Correction
            </h3>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "#475569" }}>
              Specify the exact discrepancies for <strong>{req.trainee_name}</strong> to correct and resubmit.
            </p>

            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem" }}>
              Correction Note for Candidate (Required):
            </label>
            <textarea
              rows={3}
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
              placeholder="e.g. Joining date is incorrect. Please update to 18-May-2023 and resubmit."
              style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "1.25rem", fontSize: "0.85rem" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setShowCorrectionModal(false)}
                style={{ padding: "0.5rem 1rem", background: "#f1f5f9", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer", color: "#475569" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestCorrection}
                style={{ padding: "0.5rem 1rem", background: "#ea580c", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
              >
                Send Correction Note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

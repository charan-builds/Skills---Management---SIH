import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PhoneCall, Clock, CheckCircle2, AlertTriangle, AlertCircle,
  Calendar, Search, Filter, ArrowRight, UserCheck, Phone,
  Send, ShieldCheck, ChevronLeft, ChevronRight, X, ExternalLink,
  ShieldAlert, FileCheck, Check
} from "lucide-react";
import { useFilters } from "../context/FilterContext";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function FollowUpManagement() {
  const navigate = useNavigate();
  const { filters } = useFilters();
  const store = usePlatformStore();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [activeTab, setActiveTab] = useState("all"); // "all" | "due" | "needs_verification" | "needs_assistance" | "completed" | "upcoming"
  const [search, setSearch] = useState("");
  const [milestoneFilter, setMilestoneFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Assisted Follow-Up Modal
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [outreachChannel, setOutreachChannel] = useState("Call Center (Assisted Telephone)");
  const [captureOutcome, setCaptureOutcome] = useState(true);
  const [isEmployed, setIsEmployed] = useState(true);
  const [capturedWage, setCapturedWage] = useState("26000");
  const [attritionReason, setAttritionReason] = useState("Low salary / inadequate compensation");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getFollowUpManagementData(filters, {
        status: activeTab === "all" ? "All"
          : activeTab === "due" ? "Due"
          : activeTab === "needs_verification" ? "Needs Verification"
          : activeTab === "needs_assistance" ? "Needs Assistance"
          : activeTab === "completed" ? "Completed"
          : activeTab === "upcoming" ? "Upcoming"
          : "All",
        search,
        milestone: milestoneFilter,
        page,
        limit
      });
      setWorkspace(res);
    } catch (err) {
      console.error("Failed to load follow-up management workspace:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, activeTab, search, milestoneFilter, page, store.last_updated]);

  const summary = workspace?.summary || {
    total_followups: 0,
    due: 0,
    needs_verification: 0,
    upcoming: 0,
    completed: 0,
    missed: 0,
    needs_assistance: 0,
    response_rate: "0%"
  };

  const records = workspace?.records || [];

  const handleOpenAssistedModal = (record) => {
    setSelectedRecord(record);
    setIsEmployed(record.current_employment === "EMPLOYED" || record.current_employment === "APPRENTICESHIP");
    setCapturedWage(record.current_wage ? record.current_wage.toString() : "26000");
    setResolutionNotes(`Assisted phone outreach conducted by state verification officer. Verified current outcome status.`);
  };

  const handleVerifyOutcome = async (record) => {
    try {
      await platformService.verifyFollowupOutcome(record.trainee_id, record.id, {
        verified_by: "State Nodal Verification Desk",
        notes: `Outcome claim for candidate ${record.trainee_name} verified against payroll & institutional records.`
      });
      setSuccessToast(`Follow-up outcome for candidate ${record.trainee_name} (${record.trainee_id}) successfully verified!`);
      setTimeout(() => setSuccessToast(""), 4000);
      loadData();
    } catch (err) {
      alert("Verification failed: " + err.message);
    }
  };

  const handleSendReminder = async (record) => {
    try {
      await platformService.sendFollowupReminder(record.trainee_id, record.id, "SMS & WhatsApp Official Channel");
      setSuccessToast(`Omnichannel reminder sent to ${record.trainee_name} (${record.phone})!`);
      setTimeout(() => setSuccessToast(""), 4000);
      loadData();
    } catch (err) {
      alert("Failed to send reminder: " + err.message);
    }
  };

  const handleSubmitResolution = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setSubmitting(true);
    try {
      await platformService.resolveAssistedFollowup(selectedRecord.trainee_id, selectedRecord.id, {
        channel: outreachChannel,
        outcome_captured: captureOutcome,
        is_employed: isEmployed,
        current_wage: isEmployed ? Number(capturedWage) : 0,
        attrition_reason: !isEmployed ? attritionReason : undefined,
        notes: resolutionNotes
      });

      setSuccessToast(`Assisted follow-up for candidate ${selectedRecord.trainee_name} (${selectedRecord.trainee_id}) successfully recorded!`);
      setSelectedRecord(null);
      setTimeout(() => setSuccessToast(""), 4000);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to record assisted follow-up: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "1440px", margin: "0 auto", paddingBottom: "4rem" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <PhoneCall size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            ADMIN OUTCOME GOVERNANCE & FOLLOW-UP MANAGEMENT
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
              Follow-Up Management
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
              Monitor longitudinal 3M, 6M, and 12M post-training milestone check-ins, resolve pending verifications, outreach errors, and uncontactable candidates.
            </p>
          </div>

          <div style={{ background: "#f8fafc", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
            <span style={{ color: "#64748b" }}>Overall Follow-Up Response Rate: </span>
            <strong style={{ color: "#16a34a", fontSize: "1.1rem" }}>{summary.response_rate}</strong>
          </div>
        </div>
      </div>

      {successToast && (
        <div style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", padding: "0.85rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={18} /> {successToast}
          </span>
          <button onClick={() => setSuccessToast("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#166534", fontWeight: 800 }}>✕</button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Total Milestone Checks</span>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
            {summary.total_followups.toLocaleString()}
          </div>
          <span style={{ fontSize: "0.7rem", color: "#2563eb", fontWeight: 600 }}>In Filtered Scope</span>
        </div>

        <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #fef3c7" }}>
          <span style={{ fontSize: "0.75rem", color: "#b45309", fontWeight: 600 }}>Due Now (Actionable)</span>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#b45309", marginTop: "0.2rem" }}>
            {summary.due.toLocaleString()}
          </div>
          <span style={{ fontSize: "0.7rem", color: "#b45309", fontWeight: 600 }}>Awaiting Response</span>
        </div>

        <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #f3e8ff" }}>
          <span style={{ fontSize: "0.75rem", color: "#7e22ce", fontWeight: 600 }}>Needs Verification</span>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#7e22ce", marginTop: "0.2rem" }}>
            {(summary.needs_verification || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: "0.7rem", color: "#7e22ce", fontWeight: 700 }}>Pending Review</span>
        </div>

        <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #fee2e2" }}>
          <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600 }}>Needs Assistance / Errors</span>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#dc2626", marginTop: "0.2rem" }}>
            {summary.needs_assistance.toLocaleString()}
          </div>
          <span style={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 700 }}>Delivery / Contact Failed</span>
        </div>

        <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #dcfce7" }}>
          <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>Completed</span>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#16a34a", marginTop: "0.2rem" }}>
            {summary.completed.toLocaleString()}
          </div>
          <span style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 600 }}>Verified & Archived</span>
        </div>

        <div style={{ background: "white", padding: "1.1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Upcoming Scheduled</span>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#64748b", marginTop: "0.2rem" }}>
            {summary.upcoming.toLocaleString()}
          </div>
          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Future Timeline</span>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem", marginBottom: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        {/* Status Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All Follow-ups", count: summary.total_followups },
            { key: "due", label: "Due Now", count: summary.due, color: "#b45309", bg: "#fef3c7" },
            { key: "needs_verification", label: "Needs Verification", count: summary.needs_verification || 0, color: "#7e22ce", bg: "#f3e8ff" },
            { key: "needs_assistance", label: "Needs Assistance / Errors", count: summary.needs_assistance, color: "#dc2626", bg: "#fee2e2" },
            { key: "completed", label: "Completed", count: summary.completed, color: "#16a34a", bg: "#dcfce7" },
            { key: "upcoming", label: "Upcoming", count: summary.upcoming, color: "#64748b", bg: "#f1f5f9" }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: "8px",
                border: "none",
                background: activeTab === tab.key ? "#2563eb" : "#f8fafc",
                color: activeTab === tab.key ? "white" : "#475569",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: activeTab === tab.key ? "rgba(255,255,255,0.25)" : (tab.bg || "#e2e8f0"),
                color: activeTab === tab.key ? "white" : (tab.color || "#334155"),
                padding: "1px 6px",
                borderRadius: "10px",
                fontSize: "0.75rem",
                fontWeight: 800
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Milestone Filter Controls */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 280px" }}>
            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
            <input
              type="text"
              placeholder="Search candidate name, trainee ID, programme, district..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: "100%",
                padding: "0.55rem 1rem 0.55rem 2.25rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Milestone:</span>
            <select
              value={milestoneFilter}
              onChange={(e) => { setMilestoneFilter(e.target.value); setPage(1); }}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                background: "white",
                cursor: "pointer"
              }}
            >
              <option value="All">All Milestones</option>
              <option value="3">3-Month</option>
              <option value="6">6-Month</option>
              <option value="12">12-Month</option>
            </select>
          </div>
        </div>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={workspace}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d && d.records)}
        isEmptyDetails="No follow-up records found matching the active filters."
      >
        {/* Records Table */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 700 }}>
                  <th style={{ padding: "0.85rem 1.25rem" }}>Trainee</th>
                  <th style={{ padding: "0.85rem 1.25rem" }}>Programme & District</th>
                  <th style={{ padding: "0.85rem 1.25rem" }}>Milestone</th>
                  <th style={{ padding: "0.85rem 1.25rem" }}>Due Date</th>
                  <th style={{ padding: "0.85rem 1.25rem" }}>Status</th>
                  <th style={{ padding: "0.85rem 1.25rem" }}>Telemetry & Response Notes</th>
                  <th style={{ padding: "0.85rem 1.25rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>
                      No follow-up records match the selected scope criteria.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    const isNeedsVerification = r.status === "Needs Verification";
                    const isNeedsAssistance = r.status === "Needs Assistance" || r.status === "Contact Error" || r.status === "Delivery Error";
                    const isDue = r.status === "Due";
                    const isCompleted = r.status === "Completed";
                    const isUpcoming = r.status === "Upcoming";

                    return (
                      <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <strong style={{ color: "#0f172a", display: "block" }}>{r.trainee_name}</strong>
                          <span style={{ fontFamily: "monospace", color: "#2563eb", fontSize: "0.75rem", fontWeight: 700 }}>
                            {r.trainee_id}
                          </span>
                        </td>

                        <td style={{ padding: "1rem 1.25rem" }}>
                          <div style={{ color: "#1e293b", fontWeight: 600 }}>{r.programme_name}</div>
                          <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                            District: {r.district} • Cohort: {r.cohort}
                          </span>
                        </td>

                        <td style={{ padding: "1rem 1.25rem" }}>
                          <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "3px 8px", borderRadius: "6px", fontWeight: 700, fontSize: "0.75rem" }}>
                            {r.milestone}
                          </span>
                        </td>

                        <td style={{ padding: "1rem 1.25rem", color: "#475569", whiteSpace: "nowrap" }}>
                          {r.due_date}
                        </td>

                        <td style={{ padding: "1rem 1.25rem" }}>
                          <span style={{
                            padding: "3px 9px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            background: isCompleted ? "#dcfce7" : isNeedsVerification ? "#f3e8ff" : isNeedsAssistance ? "#fee2e2" : isDue ? "#fef3c7" : "#f1f5f9",
                            color: isCompleted ? "#15803d" : isNeedsVerification ? "#7e22ce" : isNeedsAssistance ? "#b91c1c" : isDue ? "#b45309" : "#64748b",
                            border: isNeedsVerification ? "1px solid #d8b4fe" : isNeedsAssistance ? "1px solid #fca5a5" : isDue ? "1px solid #fde68a" : "1px solid transparent"
                          }}>
                            {isCompleted && <CheckCircle2 size={12} />}
                            {isNeedsVerification && <ShieldAlert size={12} />}
                            {isNeedsAssistance && <AlertTriangle size={12} />}
                            {isDue && <Clock size={12} />}
                            {isUpcoming && <Calendar size={12} />}
                            {r.status}
                          </span>
                        </td>

                        <td style={{ padding: "1rem 1.25rem", color: "#475569", maxWidth: "280px" }}>
                          {isNeedsAssistance ? (
                            <div>
                              <span style={{ color: "#b91c1c", fontWeight: 700, fontSize: "0.75rem", display: "block" }}>
                                {r.outreach_attempts || 2} attempt(s) • {r.last_attempt_channel}
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{r.notes}</span>
                            </div>
                          ) : isNeedsVerification ? (
                            <div>
                              <span style={{ color: "#7e22ce", fontWeight: 700, fontSize: "0.75rem", display: "block" }}>
                                Self-Reported Check-In (Pending Review)
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{r.notes}</span>
                            </div>
                          ) : isDue ? (
                            <div>
                              <span style={{ color: "#b45309", fontWeight: 700, fontSize: "0.75rem", display: "block" }}>
                                Survey Window Open (Action Required)
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{r.notes}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: "0.8rem" }}>{r.notes || "Recorded in database."}</span>
                          )}
                        </td>

                        <td style={{ padding: "1rem 1.25rem", textAlign: "right", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            {isNeedsVerification && (
                              <button
                                onClick={() => handleVerifyOutcome(r)}
                                style={{
                                  padding: "0.45rem 0.8rem",
                                  background: "#7e22ce",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.3rem"
                                }}
                              >
                                <Check size={12} /> Verify Outcome
                              </button>
                            )}

                            {isNeedsAssistance && (
                              <button
                                onClick={() => handleOpenAssistedModal(r)}
                                style={{
                                  padding: "0.45rem 0.8rem",
                                  background: "#dc2626",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.3rem"
                                }}
                              >
                                <PhoneCall size={12} /> Assisted Follow-Up
                              </button>
                            )}

                            {isDue && (
                              <>
                                <button
                                  onClick={() => handleSendReminder(r)}
                                  style={{
                                    padding: "0.45rem 0.75rem",
                                    background: "#fef3c7",
                                    color: "#92400e",
                                    border: "1px solid #fde68a",
                                    borderRadius: "6px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.3rem"
                                  }}
                                >
                                  <Send size={12} /> Send Reminder
                                </button>
                                <button
                                  onClick={() => handleOpenAssistedModal(r)}
                                  style={{
                                    padding: "0.45rem 0.8rem",
                                    background: "#2563eb",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.3rem"
                                  }}
                                >
                                  <Phone size={12} /> Conduct Outreach
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => navigate(`/admin/trainees/${r.trainee_id}`)}
                              style={{
                                padding: "0.45rem 0.75rem",
                                background: "#f1f5f9",
                                color: "#334155",
                                border: "1px solid #cbd5e1",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer"
                              }}
                            >
                              View Trainee &rarr;
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {workspace?.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                Showing page {workspace.page} of {workspace.totalPages} ({workspace.total} records)
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: page <= 1 ? "not-allowed" : "pointer" }}
                >
                  Previous
                </button>
                <button
                  disabled={page >= workspace.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: page >= workspace.totalPages ? "not-allowed" : "pointer" }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </DataStateWrapper>

      {/* Interactive Assisted Follow-Up Modal (Section 17) */}
      {selectedRecord && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem"
        }}>
          <div style={{ background: "white", borderRadius: "14px", maxWidth: "560px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "2rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                  Government Assisted Follow-Up Desk (Simulation)
                </span>
                <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.25rem", color: "#0f172a" }}>
                  Assisted Outreach: {selectedRecord.trainee_name}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  ID: {selectedRecord.trainee_id} • Phone: {selectedRecord.phone} • {selectedRecord.milestone} Checkpoint
                </span>
              </div>
              <button onClick={() => setSelectedRecord(null)} style={{ background: "none", border: "none", fontSize: "1.25rem", color: "#64748b", cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleSubmitResolution}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Outreach Communication Channel
                </label>
                <select
                  value={outreachChannel}
                  onChange={(e) => setOutreachChannel(e.target.value)}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                >
                  <option value="Call Center (Assisted Telephone)">Government Call Center (Telephone Agent)</option>
                  <option value="In-Person Centre Visit">In-Person Training Centre Domicile Visit</option>
                  <option value="WhatsApp Official Verified Outreach">WhatsApp Official Government Channel</option>
                </select>
              </div>

              <div style={{ marginBottom: "1.25rem", background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
                  Candidate Contact Result
                </label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: captureOutcome ? "#16a34a" : "#475569" }}>
                    <input
                      type="radio"
                      name="captureOutcome"
                      checked={captureOutcome}
                      onChange={() => setCaptureOutcome(true)}
                    />
                    Candidate Reached (Capture Outcome)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, color: !captureOutcome ? "#b45309" : "#475569" }}>
                    <input
                      type="radio"
                      name="captureOutcome"
                      checked={!captureOutcome}
                      onChange={() => setCaptureOutcome(false)}
                    />
                    Outreach Attempt Only (Schedule Retry)
                  </label>
                </div>
              </div>

              {captureOutcome && (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                      Is the candidate currently employed?
                    </label>
                    <select
                      value={isEmployed ? "yes" : "no"}
                      onChange={(e) => setIsEmployed(e.target.value === "yes")}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    >
                      <option value="yes">Yes — Active in corporate / contractual employment</option>
                      <option value="no">No — Unemployed or exited previous employment</option>
                    </select>
                  </div>

                  {isEmployed ? (
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                        Confirmed Monthly Gross Compensation (₹)
                      </label>
                      <input
                        type="number"
                        value={capturedWage}
                        onChange={(e) => setCapturedWage(e.target.value)}
                        placeholder="e.g. 26000"
                        required
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      />
                    </div>
                  ) : (
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                        Reported Non-Placement / Exit Reason
                      </label>
                      <select
                        value={attritionReason}
                        onChange={(e) => setAttritionReason(e.target.value)}
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      >
                        <option value="Low salary / inadequate compensation">Low salary / inadequate compensation</option>
                        <option value="Relocation / location mismatch">Relocation / location mismatch</option>
                        <option value="Lack of required skills / failed technical assessment">Lack of required skills</option>
                        <option value="Family / personal reasons">Family / personal reasons</option>
                        <option value="Company downsized / contract completed">Company downsized / contract completed</option>
                        <option value="Enrolled in higher studies / competitive exams">Enrolled in higher studies</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Assisted Outreach Case Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={2}
                  placeholder="Record summary of verification conversation..."
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  style={{ padding: "0.6rem 1.25rem", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: "0.6rem 1.5rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
                >
                  {submitting ? "Recording..." : "Commit Assisted Resolution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

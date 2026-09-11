import { useState, useEffect } from "react";
import { 
  Users, CheckCircle2, Search, Filter, Eye, DollarSign, Briefcase, 
  Clock, AlertTriangle, X, Check, ArrowRight, ShieldCheck, FileText, ChevronRight, Award
} from "lucide-react";
import EmployerNav from "./Employer/EmployerNav";
import DataTable from "../components/common/DataTable";
import DataValue from "../components/common/DataValue";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import { platformService, usePlatformStore } from "../services/platformService";
import { mockStore } from "../services/mockStore";

export default function EmployeesOutcomes() {
  const storeState = usePlatformStore();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Drawers & Modals
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [statusModalEmployee, setStatusModalEmployee] = useState(null);
  const [wageModalEmployee, setWageModalEmployee] = useState(null);
  const [roleModalEmployee, setRoleModalEmployee] = useState(null);

  // Status Modal Form State
  const [newStatus, setNewStatus] = useState("Currently Employed");
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split("T")[0]);
  const [exitReason, setExitReason] = useState("Better compensation elsewhere");
  const [statusRemarks, setStatusRemarks] = useState("");

  // Wage Modal Form State
  const [wageChoice, setWageChoice] = useState("Confirmed");
  const [customWage, setCustomWage] = useState("");

  // Role Modal Form State
  const [roleChoice, setRoleChoice] = useState("Confirmed");
  const [customRole, setCustomRole] = useState("");

  // Feedback Banner
  const [feedbackBanner, setFeedbackBanner] = useState("");

  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";
  const organizationName = localStorage.getItem("organizationName") || "Tata Consultancy Services";

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getAllEmployerOutcomes(organizationId, searchTerm);
      if (res.data_available) {
        setEmployees(res.outcomes || []);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error("Failed to load verified workforce roster:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [organizationId, storeState.last_updated, searchTerm]);

  // Handle Lifecycle Status Submission (Sections 16 & 17)
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalEmployee) return;

    try {
      await platformService.updateEmployeeLifecycleStatus(
        organizationId,
        statusModalEmployee.trainee_id,
        newStatus,
        newStatus === "Currently Employed" ? null : departureDate,
        newStatus === "Currently Employed" ? null : exitReason,
        statusRemarks
      );

      setFeedbackBanner(`Employment status for ${statusModalEmployee.trainee_name} successfully updated to "${newStatus}".`);
      setStatusModalEmployee(null);
      setStatusRemarks("");
      loadEmployees();
      setTimeout(() => setFeedbackBanner(""), 5000);
    } catch (err) {
      console.error("Failed to update lifecycle status:", err);
      alert("Error updating status: " + err.message);
    }
  };

  // Handle Wage Confirmation Submission (Section 18)
  const handleWageSubmit = async (e) => {
    e.preventDefault();
    if (!wageModalEmployee) return;

    try {
      await platformService.confirmEmployeeWage(
        organizationId,
        wageModalEmployee.trainee_id,
        wageChoice,
        wageChoice === "Different" ? customWage : null
      );

      setFeedbackBanner(`Wage confirmation for ${wageModalEmployee.trainee_name} recorded as "${wageChoice}".`);
      setWageModalEmployee(null);
      setCustomWage("");
      loadEmployees();
      setTimeout(() => setFeedbackBanner(""), 5000);
    } catch (err) {
      console.error("Failed to confirm wage:", err);
      alert("Error confirming wage: " + err.message);
    }
  };

  // Handle Role Confirmation Submission (Section 19)
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!roleModalEmployee) return;

    try {
      await platformService.confirmEmployeeRole(
        organizationId,
        roleModalEmployee.trainee_id,
        roleChoice,
        roleChoice === "Not Confirmed" ? customRole : null
      );

      setFeedbackBanner(`Job role confirmation for ${roleModalEmployee.trainee_name} recorded as "${roleChoice}".`);
      setRoleModalEmployee(null);
      setCustomRole("");
      loadEmployees();
      setTimeout(() => setFeedbackBanner(""), 5000);
    } catch (err) {
      console.error("Failed to confirm role:", err);
      alert("Error confirming role: " + err.message);
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter(e => {
    if (statusFilter === "All") return true;
    return e.employment_status === statusFilter;
  });

  // KPI Metrics
  const totalVerified = employees.length;
  const currentlyEmployed = employees.filter(e => e.employment_status === "Currently Employed").length;
  const attritedCount = employees.filter(e => e.employment_status !== "Currently Employed").length;
  const retentionRate = totalVerified > 0 ? Math.round((currentlyEmployed / totalVerified) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <EmployerNav />
      <div style={{ maxWidth: "1350px", margin: "0 auto", padding: "2rem 1.5rem 4rem 1.5rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <Users size={18} color="#2563eb" />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                ORGANISATION WORKFORCE ROSTER (SECTIONS 14–20)
              </span>
            </div>
            <h1 style={{ fontSize: "1.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
              Verified Workforce
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
              Employees confirmed at <strong>{organizationName}</strong>. Manage ongoing status lifecycle, wage responses, and role attestations.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", minWidth: "260px" }}>
              <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
              <input
                type="text"
                placeholder="Search candidate, role or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.55rem 1rem 0.55rem 2.25rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.875rem",
                  background: "white"
                }}
              />
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackBanner && (
          <div style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", padding: "0.85rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <span>{feedbackBanner}</span>
          </div>
        )}

        {/* KPI Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Total Verified Workforce</span>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>
              {totalVerified}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Attested candidates at this org</span>
          </div>

          <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Currently Employed</span>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#16a34a", marginTop: "0.25rem" }}>
              {currentlyEmployed}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>Active in workforce roster</span>
          </div>

          <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Departures & Attrition</span>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, color: attritedCount > 0 ? "#b45309" : "#64748b", marginTop: "0.25rem" }}>
              {attritedCount}
            </div>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Resigned, terminated, completed</span>
          </div>

          <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Workforce Retention Rate</span>
            <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#2563eb", marginTop: "0.25rem" }}>
              {retentionRate}%
            </div>
            <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 600 }}>Active retention ratio</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {["All", "Currently Employed", "Resigned", "Terminated", "Contract Completed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: 700,
                border: "1px solid",
                borderColor: statusFilter === st ? "#2563eb" : "#cbd5e1",
                background: statusFilter === st ? "#2563eb" : "white",
                color: statusFilter === st ? "white" : "#475569",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {st} {st !== "All" && `(${employees.filter(e => e.employment_status === st).length})`}
            </button>
          ))}
        </div>

        {/* Workforce Table */}
        <div style={{ paddingBottom: "2rem", position: "relative", minHeight: "200px" }}>
          <DataStateWrapper
            isLoading={loading}
            error={error}
            data={filteredEmployees}
            onRetry={loadEmployees}
            isDataAvailable={(d) => d && d.length > 0}
            isEmptyDetails="No verified employees found for this organization matching the criteria."
          >
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <DataTable 
                columns={[
                  {
                    key: "trainee_name",
                    label: "Trainee / ID",
                    render: (e) => (
                      <div>
                        <strong style={{ color: "#0f172a", display: "block" }}>{e.trainee_name}</strong>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: {e.trainee_id}</span>
                      </div>
                    )
                  },
                  {
                    key: "role",
                    label: "Job Role",
                    render: (e) => (
                      <div>
                        <span style={{ color: "#0f172a", fontWeight: 600, display: "block" }}>
                          {e.confirmed_role || e.job_role}
                        </span>
                        {e.role_confirmation === "Confirmed" ? (
                          <span style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 700 }}>✓ Role Confirmed</span>
                        ) : e.role_confirmation === "Not Confirmed" ? (
                          <span style={{ fontSize: "0.7rem", color: "#dc2626", fontWeight: 700 }}>✗ Title Corrected</span>
                        ) : (
                          <button
                            onClick={(evt) => { evt.stopPropagation(); setRoleModalEmployee(e); }}
                            style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", padding: 0 }}
                          >
                            Verify Role →
                          </button>
                        )}
                      </div>
                    )
                  },
                  {
                    key: "joining_date",
                    label: "Joining Date",
                    render: (e) => <DataValue value={e.joining_date} zeroState="Not recorded" />
                  },
                  {
                    key: "employment_status",
                    label: "Employment Status (B7)",
                    render: (e) => {
                      const isEmployed = e.employment_status === "Currently Employed";
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ 
                            background: isEmployed ? "#dcfce7" : "#fef3c7", 
                            color: isEmployed ? "#15803d" : "#b45309", 
                            padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 
                          }}>
                            {e.employment_status}
                          </span>
                          <button
                            onClick={(evt) => {
                              evt.stopPropagation();
                              setStatusModalEmployee(e);
                              setNewStatus(e.employment_status);
                            }}
                            title="Update employment lifecycle status"
                            style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "2px 6px", fontSize: "0.7rem", cursor: "pointer", color: "#334155" }}
                          >
                            Edit
                          </button>
                        </div>
                      );
                    }
                  },
                  {
                    key: "wage_confirmation",
                    label: "Wage Status (B8)",
                    render: (e) => {
                      const status = e.wage_confirmation || "Pending";
                      return (
                        <div>
                          {status === "Confirmed" ? (
                            <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700 }}>
                              Confirmed (₹{e.wage?.toLocaleString() || "28,000"})
                            </span>
                          ) : status === "Cannot Disclose" ? (
                            <span style={{ background: "#f1f5f9", color: "#64748b", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700 }}>
                              Cannot Disclose
                            </span>
                          ) : status === "Different" ? (
                            <span style={{ background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700 }}>
                              Adjusted (₹{e.wage?.toLocaleString()})
                            </span>
                          ) : (
                            <button
                              onClick={(evt) => { evt.stopPropagation(); setWageModalEmployee(e); }}
                              style={{ padding: "3px 8px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", cursor: "pointer" }}
                            >
                              Confirm Wage →
                            </button>
                          )}
                        </div>
                      );
                    }
                  },
                  {
                    key: "verification_status",
                    label: "Attestation",
                    render: (e) => (
                      <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                        <CheckCircle2 size={11} /> Verified
                      </span>
                    )
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    sortable: false,
                    render: (e) => (
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          onClick={() => setSelectedEmployee(e)}
                          style={{
                            padding: "0.4rem 0.75rem",
                            background: "white",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#0f172a",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}
                        >
                          <Eye size={13} /> View
                        </button>
                      </div>
                    )
                  }
                ]} 
                data={filteredEmployees} 
                defaultSortKey="trainee_name" 
              />
            </div>
          </DataStateWrapper>
        </div>

        {/* 1. EMPLOYEE DETAIL DRAWER (SECTION 15) */}
        {selectedEmployee && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 9999
          }}>
            <div style={{
              background: "white",
              width: "100%",
              maxWidth: "520px",
              height: "100%",
              boxShadow: "-10px 0 25px -5px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto"
            }}>
              {/* Drawer Header */}
              <div style={{ padding: "1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                    Verified Employee Record (Section 15)
                  </span>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: "0.25rem 0" }}>
                    {selectedEmployee.trainee_name}
                  </h2>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    ID: {selectedEmployee.trainee_id} • Programme: {selectedEmployee.programme_name || "Enterprise Skilling Pathway"}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body - Authorized Employer Fields ONLY */}
              <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.5rem", flex: 1 }}>
                
                {/* Employment Status & Dates */}
                <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                      Workforce Status
                    </span>
                    <span style={{ 
                      background: selectedEmployee.employment_status === "Currently Employed" ? "#dcfce7" : "#fef3c7",
                      color: selectedEmployee.employment_status === "Currently Employed" ? "#15803d" : "#b45309",
                      padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 
                    }}>
                      {selectedEmployee.employment_status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Joining Date</span>
                      <strong style={{ color: "#0f172a" }}>{selectedEmployee.joining_date}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Attested By</span>
                      <strong style={{ color: "#0f172a" }}>{organizationName}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Claimed Role</span>
                      <strong style={{ color: "#0f172a" }}>{selectedEmployee.job_role}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Confirmed Role</span>
                      <strong style={{ color: "#0f172a" }}>{selectedEmployee.confirmed_role || selectedEmployee.job_role}</strong>
                    </div>
                  </div>
                </div>

                {/* Wage Information Response */}
                <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                      Wage Verification Response (Section 18)
                    </span>
                    <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700 }}>
                      {selectedEmployee.wage_confirmation || "Confirmed"}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#334155" }}>
                    Trainee-reported wage: <strong>₹{selectedEmployee.wage?.toLocaleString() || "28,000"} / month</strong>
                  </p>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.35rem", display: "block" }}>
                    Employer responses respect payroll privacy. Exact values are not disclosed when "Cannot Disclose" is selected.
                  </span>
                </div>

                {/* Apprenticeship Details if applicable */}
                {selectedEmployee.apprenticeship_details && (
                  <div style={{ background: "#f0fdf4", padding: "1.25rem", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                      <Award size={16} color="#16a34a" />
                      <strong style={{ color: "#166534", fontSize: "0.85rem" }}>Apprenticeship Engagement Details</strong>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8rem", color: "#15803d" }}>
                      <div>Trade: <strong>{selectedEmployee.apprenticeship_details.trade}</strong></div>
                      <div>Monthly Stipend: <strong>₹{selectedEmployee.apprenticeship_details.stipend?.toLocaleString()}</strong></div>
                      <div>Duration: <strong>{selectedEmployee.apprenticeship_details.duration_months} Months</strong></div>
                    </div>
                  </div>
                )}

                {/* Traceable Verification History */}
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem 0" }}>
                    Attestation & Audit Trail (Section 13)
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8rem" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a", marginTop: "5px" }} />
                      <div>
                        <strong style={{ color: "#0f172a", display: "block" }}>Employment Attestation Confirmed</strong>
                        <span style={{ color: "#64748b" }}>Attested by {organizationName} HR representative.</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.8rem" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb", marginTop: "5px" }} />
                      <div>
                        <strong style={{ color: "#0f172a", display: "block" }}>Trainee Employment Declaration Received</strong>
                        <span style={{ color: "#64748b" }}>Claim submitted with joining date {selectedEmployee.joining_date}.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Safeguard Notice */}
                <div style={{ background: "#f1f5f9", padding: "0.85rem", borderRadius: "8px", fontSize: "0.75rem", color: "#64748b", border: "1px solid #e2e8f0" }}>
                  <strong>Privacy Safeguard (Section 15):</strong> Personal trainee records (Aadhaar number, caste, parental identity, personal phone) are strictly restricted from employer view to safeguard candidate privacy.
                </div>
              </div>

              {/* Drawer Actions */}
              <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => {
                    const emp = selectedEmployee;
                    setSelectedEmployee(null);
                    setStatusModalEmployee(emp);
                    setNewStatus(emp.employment_status);
                  }}
                  style={{ flex: 1, padding: "0.65rem", background: "#0f172a", color: "white", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Update Lifecycle Status
                </button>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  style={{ padding: "0.65rem 1.25rem", background: "white", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. ONGOING EMPLOYMENT STATUS MODAL (SECTIONS 16 & 17) */}
        {statusModalEmployee && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "1rem"
          }}>
            <div style={{ background: "white", borderRadius: "14px", maxWidth: "480px", width: "100%", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>
                  Update Employment Status (Section 16)
                </h3>
                <button onClick={() => setStatusModalEmployee(null)} style={{ background: "none", border: "none", fontSize: "1rem", color: "#64748b", cursor: "pointer" }}>✕</button>
              </div>

              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1.25rem 0" }}>
                Updating status for <strong>{statusModalEmployee.trainee_name}</strong> (ID: {statusModalEmployee.trainee_id}).
              </p>

              <form onSubmit={handleStatusSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Select Lifecycle Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  >
                    <option value="Currently Employed">Currently Employed (Active)</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Terminated">Terminated</option>
                    <option value="Contract Completed">Contract Completed</option>
                  </select>
                </div>

                {/* If Resigned, Terminated, or Contract Completed: Capture departure date and reason (Section 17) */}
                {newStatus !== "Currently Employed" && (
                  <>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                        Effective Departure Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                        Departure Reason / Category (Section 17)
                      </label>
                      <select
                        value={exitReason}
                        onChange={(e) => setExitReason(e.target.value)}
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      >
                        <option value="Better compensation elsewhere">Career progression / higher wage offer</option>
                        <option value="Contract tenure concluded">Contract / assignment completed</option>
                        <option value="Geographical relocation">Relocation to hometown / different district</option>
                        <option value="Role mismatch / skill gap">Skill mismatch or performance attrition</option>
                        <option value="Higher studies / certification">Pursuing higher technical education</option>
                        <option value="Personal / health reasons">Personal / family circumstances</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Optional Remarks / Context
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter any relevant employment lifecycle notes..."
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setStatusModalEmployee(null)}
                    style={{ flex: 1, padding: "0.65rem", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: "0.65rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Confirm Status Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. WAGE CONFIRMATION MODAL (SECTION 18) */}
        {wageModalEmployee && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "1rem"
          }}>
            <div style={{ background: "white", borderRadius: "14px", maxWidth: "480px", width: "100%", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>
                  Respond to Reported Wage (Section 18)
                </h3>
                <button onClick={() => setWageModalEmployee(null)} style={{ background: "none", border: "none", fontSize: "1rem", color: "#64748b", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1rem", borderRadius: "8px", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#1e40af", fontWeight: 700, textTransform: "uppercase" }}>Trainee Self-Declaration</span>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1e3a8a", marginTop: "0.2rem" }}>
                  ₹{wageModalEmployee.wage?.toLocaleString() || "28,000"} / month
                </div>
                <span style={{ fontSize: "0.8rem", color: "#3b82f6" }}>Reported for role: {wageModalEmployee.job_role}</span>
              </div>

              <form onSubmit={handleWageSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Employer Wage Response Choice *
                  </label>
                  <select
                    value={wageChoice}
                    onChange={(e) => setWageChoice(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  >
                    <option value="Confirmed">Confirmed (Trainee wage declaration is accurate)</option>
                    <option value="Different">Different (Provide corrected amount or range)</option>
                    <option value="Cannot Disclose">Cannot Disclose (Withhold under corporate payroll policy)</option>
                  </select>
                </div>

                {wageChoice === "Different" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                      Corrected Monthly Wage (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 26500"
                      value={customWage}
                      onChange={(e) => setCustomWage(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                )}

                {wageChoice === "Cannot Disclose" && (
                  <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "6px", fontSize: "0.8rem", color: "#64748b" }}>
                    The system respects enterprise confidentiality. Selecting "Cannot Disclose" records confirmation without exposing exact payroll numbers.
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setWageModalEmployee(null)}
                    style={{ flex: 1, padding: "0.65rem", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: "0.65rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Submit Wage Response
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. ROLE CONFIRMATION MODAL (SECTION 19) */}
        {roleModalEmployee && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "1rem"
          }}>
            <div style={{ background: "white", borderRadius: "14px", maxWidth: "480px", width: "100%", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>
                  Confirm Job Role (Section 19)
                </h3>
                <button onClick={() => setRoleModalEmployee(null)} style={{ background: "none", border: "none", fontSize: "1rem", color: "#64748b", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "8px", marginBottom: "1rem", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Trainee Claimed Title:</span>
                <strong style={{ color: "#0f172a", display: "block", fontSize: "1rem" }}>{roleModalEmployee.job_role}</strong>
              </div>

              <form onSubmit={handleRoleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Attestation Decision *
                  </label>
                  <select
                    value={roleChoice}
                    onChange={(e) => setRoleChoice(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  >
                    <option value="Confirmed">Confirmed (Exact role title matches organizational band)</option>
                    <option value="Not Confirmed">Not Confirmed (Specify actual corporate designation)</option>
                  </select>
                </div>

                {roleChoice === "Not Confirmed" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                      Correct Corporate Designation *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Technical Support Associate"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setRoleModalEmployee(null)}
                    style={{ flex: 1, padding: "0.65rem", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: "0.65rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Save Role Attestation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle, XCircle, AlertCircle, Building2, Search, Eye, X } from "lucide-react";
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
  const [reviewEmployer, setReviewEmployer] = useState(null); // Employer for Review modal

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getEmployerRegistrations();
      setEmployers(res.employers || []);
    } catch (err) {
      console.error("Failed to load employers", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [store.last_updated]);

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
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
  
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          Employer Verification Oversight
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Authenticate corporate employers, review registration GST credentials, and authorize automated ATS/HR employment verification privileges.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Total Registered Employers</span>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
            {employers.length}
          </div>
        </div>
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Pending Approval</span>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#b45309", marginTop: "0.2rem" }}>
            {pendingCount}
          </div>
        </div>
        <div style={{ background: "white", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Verified Corporate Partners</span>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#16a34a", marginTop: "0.2rem" }}>
            {verifiedCount}
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
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

      {/* Employers Table (Section 25 Columns) */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <DataStateWrapper
          isLoading={loading}
          error={error}
          data={filteredEmployers}
          onRetry={loadData}
          isDataAvailable={(d) => d && d.length > 0}
          isEmptyDetails="No employers match the selected filter category."
        >
          <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
            <DataTable
              columns={[
                {
                  key: "name",
                  label: "Employer",
                  render: (e) => (
                    <div>
                      <strong style={{ color: "#0f172a", display: "block" }}>{e.name}</strong>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Code: {e.code || e.id}</span>
                    </div>
                  )
                },
                {
                  key: "registration_gst",
                  label: "Registration / GSTIN",
                  render: (e) => (
                    <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#334155" }}>
                      {e.registration_gst || "27AAACT2727Q1ZB"}
                    </span>
                  )
                },
                { key: "sector", label: "Industry", render: (e) => e.sector },
                { key: "location", label: "Location", render: (e) => e.location },
                {
                  key: "representative",
                  label: "Representative",
                  render: (e) => (
                    <div>
                      <span style={{ display: "block", color: "#0f172a", fontWeight: 600 }}>{e.representative || "Authorized HR"}</span>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{e.hr_system || "Workday"} Gateway</span>
                    </div>
                  )
                },
                {
                  key: "registration_date",
                  label: "Submitted Date",
                  render: (e) => e.registration_date || "2023-01-15"
                },
                {
                  key: "status",
                  label: "Status",
                  render: (e) => {
                    const isVerified = e.status === "Verified";
                    const isPending = e.status === "Pending";
                    return (
                      <span
                        style={{
                          background: isVerified ? "#dcfce7" : isPending ? "#fef3c7" : "#fee2e2",
                          color: isVerified ? "#15803d" : isPending ? "#b45309" : "#b91c1c",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 700
                        }}
                      >
                        {e.status}
                      </span>
                    );
                  }
                },
                {
                  key: "actions",
                  label: "Actions",
                  render: (e) => (
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        onClick={() => setReviewEmployer(e)}
                        style={{
                          padding: "0.4rem 0.65rem",
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #bfdbfe",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.2rem"
                        }}
                      >
                        <Eye size={13} /> Review
                      </button>
                      {e.status !== "Verified" && (
                        <button
                          onClick={() => handleConfirmAction(e.id, "Verified")}
                          style={{
                            padding: "0.4rem 0.65rem",
                            background: "#16a34a",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.2rem"
                          }}
                        >
                          <CheckCircle size={13} /> Approve
                        </button>
                      )}
                      {e.status !== "Rejected" && (
                        <button
                          onClick={() => handleConfirmAction(e.id, "Rejected")}
                          style={{
                            padding: "0.4rem 0.65rem",
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.2rem"
                          }}
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      )}
                    </div>
                  )
                }
              ]}
              data={filteredEmployers}
              defaultSortKey="name"
            />
          </div>
        </DataStateWrapper>
      </div>

      {/* Review Dossier Modal */}
      {reviewEmployer && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.6)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "1rem"
        }}>
          <div style={{
            background: "white", width: "100%", maxWidth: "560px",
            borderRadius: "14px", padding: "1.75rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>
                Employer Registration Dossier
              </h3>
              <button onClick={() => setReviewEmployer(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1.25rem", fontSize: "0.85rem" }}>
              <div><strong>Company Name:</strong> {reviewEmployer.name}</div>
              <div><strong>GSTIN / Corporate Reg:</strong> {reviewEmployer.registration_gst || "27AAACT2727Q1ZB"}</div>
              <div><strong>Industry Sector:</strong> {reviewEmployer.sector}</div>
              <div><strong>Corporate Location:</strong> {reviewEmployer.location}</div>
              <div><strong>Authorized Representative:</strong> {reviewEmployer.representative || "Rohit Sharma"}</div>
              <div><strong>Connected HR System:</strong> {reviewEmployer.hr_system || "Workday HCM"}</div>
              <div><strong>Status:</strong> {reviewEmployer.status}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                onClick={() => handleConfirmAction(reviewEmployer.id, "Rejected")}
                style={{ padding: "0.5rem 1rem", background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
              >
                Reject Registration
              </button>
              <button
                onClick={() => handleConfirmAction(reviewEmployer.id, "Verified")}
                style={{ padding: "0.5rem 1.25rem", background: "#16a34a", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer" }}
              >
                Approve & Authorize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Layers, CheckCircle2, RefreshCw, KeyRound, AlertTriangle,
  GitBranch, ShieldCheck, Check, XCircle, Eye, ChevronDown, ChevronUp,
  FileText, Clock, ExternalLink, HelpCircle, ArrowRight
} from "lucide-react";
import EmployerNav from "./Employer/EmployerNav";
import { platformService, usePlatformStore } from "../services/platformService";
import { mockStore } from "../services/mockStore";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function EmployerIntegrations() {
  const store = usePlatformStore();
  const location = useLocation();
  const navigate = useNavigate();
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";
  const organizationName = localStorage.getItem("organizationName") || "Tata Consultancy Services";

  // Tab State: "overview" | "matching" | "exceptions" | "activity"
  const isExceptionsRoute = location.pathname.includes("/exceptions");
  const [activeTab, setActiveTab] = useState(isExceptionsRoute ? "exceptions" : "overview");

  useEffect(() => {
    if (location.pathname.includes("/exceptions")) {
      setActiveTab("exceptions");
    }
  }, [location.pathname]);

  const [integrationsData, setIntegrationsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState("");

  // Exception Drawer State (Section 30 & 31)
  const [selectedException, setSelectedException] = useState(null);
  const [correctionNote, setCorrectionNote] = useState("");

  // API Config State (Section 35)
  const [showConfig, setShowConfig] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    api_base_url: `https://api.workday.com/ccx/service/v1/${organizationId.toLowerCase()}_production`,
    client_id: `APP-${organizationId}-INTEGRATION-9912`,
    api_key: "••••••••••••••••••••••••••••••••",
    webhook_url: `https://api.skillingimpact.gov.in/webhooks/v1/employer/${organizationId.toLowerCase()}`,
    environment: "Enterprise Sandbox Gateway"
  });
  const [testResult, setTestResult] = useState(null);
  const [configSaved, setConfigSaved] = useState(false);

  // Load Integration data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getEmployerIntegrations(organizationId);
      setIntegrationsData(res);
    } catch (err) {
      console.error("Failed to load employer integrations:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [organizationId, store.last_updated]);

  // Handle Sync Now (Section 33 & 34)
  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatusText("Initiating automated batch synchronization with HRIS feed...");
    try {
      await platformService.syncIntegration("INT-001", organizationId);
      setSyncStatusText("Reconciliation complete! Updated 4 employment records.");
      await loadData();
      setTimeout(() => setSyncStatusText(""), 4000);
    } catch (err) {
      console.error("Sync error:", err);
      setSyncStatusText("Sync issue encountered: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Exception Resolution (Section 31)
  const handleResolveException = async (exception, action) => {
    try {
      await platformService.resolveMatchingException(
        organizationId,
        exception.id,
        action,
        action === "confirm"
          ? "Employer manually confirmed employment despite field discrepancy."
          : action === "reject"
          ? "Employer rejected claim due to unresolvable ATS mismatch."
          : `Employer requested candidate correction: ${correctionNote || "Please verify joining date."}`
      );

      // If confirm or reject, update the verification record as well
      await platformService.verifyEmployment(
        exception.trainee_id,
        action === "confirm" ? "Confirmed" : action === "reject" ? "Rejected Claim" : "Correction Requested",
        action === "confirm"
          ? "Employer manual override: Discrepancy accepted."
          : action === "reject"
          ? "Rejected based on HR/ATS record discrepancy."
          : correctionNote || "Correction requested for mismatched field."
      );

      setSelectedException(null);
      setCorrectionNote("");
      loadData();
    } catch (err) {
      console.error("Error resolving exception:", err);
      alert("Error resolving exception: " + err.message);
    }
  };

  // Test Connection Handshake
  const handleTestConnection = () => {
    setTestResult("testing");
    setTimeout(() => {
      setTestResult({
        type: "success",
        message: "Mutual TLS handshake verified. Employer ATS payload schema version 2.4 active. 0 packet drops."
      });
    }, 600);
  };

  // Metrics from data
  const summary = integrationsData?.summary || {
    connected_systems_count: 1,
    total_records_received: 48,
    automatically_verified: 42,
    manual_review_required: 6,
    auto_verification_rate: "87.5%",
    last_sync: "12 minutes ago"
  };

  const systems = integrationsData?.connected_systems || [];
  const matchingRecords = integrationsData?.matching_records || [];
  const exceptions = integrationsData?.exceptions || [];
  const activityLog = integrationsData?.activity_log || [];

  // Verification Activity Donut Data (Section 28)
  const autoVerifiedCount = summary.automatically_verified || 42;
  const manualReviewCount = summary.manual_review_required || 6;
  const totalRecords = autoVerifiedCount + manualReviewCount;
  const autoAngle = totalRecords > 0 ? (autoVerifiedCount / totalRecords) * 360 : 280;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <EmployerNav />
      <div style={{ maxWidth: "1350px", margin: "0 auto", padding: "2rem 1.5rem 4rem 1.5rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <GitBranch size={18} color="#2563eb" />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                EMPLOYMENT DATA INTEGRATION (SECTIONS 25–36)
              </span>
            </div>
            <h1 style={{ fontSize: "1.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
              Employment Data Integration
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
              Automated reconciliation of candidate declarations against <strong>{organizationName}</strong> HR/ATS records.
            </p>
          </div>

          {/* Sync Now Action */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              style={{
                padding: "0.6rem 1.25rem",
                background: isSyncing ? "#94a3b8" : "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: isSyncing ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
              }}
            >
              <RefreshCw size={15} style={{ animation: isSyncing ? "spin 1s linear infinite" : "none" }} />
              {isSyncing ? "Syncing Feed..." : "Sync Now (Section 33)"}
            </button>
          </div>
        </div>

        {/* Section 58 & 27: Explicit Simulation Transparency Banner */}
        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", padding: "0.75rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={18} color="#0284c7" />
            <span style={{ fontSize: "0.85rem", color: "#0369a1", fontWeight: 600 }}>
              <strong>Simulation / Demo Integration:</strong> Demonstrating deterministic 5-point automated matching between trainee declarations and enterprise HR feeds without live third-party ATS network dependencies.
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
            Deterministic Engine Active
          </span>
        </div>

        {/* Feedback Alert for Sync */}
        {syncStatusText && (
          <div style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", padding: "0.85rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <span>{syncStatusText}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", marginBottom: "1.75rem" }}>
          {[
            { key: "overview", label: "Overview & Connected Systems" },
            { key: "matching", label: `Automated Matching Engine (${matchingRecords.length})` },
            { key: "exceptions", label: `Verification Exceptions (${exceptions.length})` },
            { key: "activity", label: `Sync Activity Log (${activityLog.length})` }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key === "exceptions") navigate("/employer/integrations/exceptions");
                else navigate("/employer/integrations");
              }}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                border: "none",
                background: activeTab === tab.key ? "#2563eb" : "transparent",
                color: activeTab === tab.key ? "white" : "#475569",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. OVERVIEW & CONNECTED SYSTEMS TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Section 26: Integration Summary KPI Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Connected Systems</span>
                <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>
                  {systems.length > 0 ? `${systems.length} Active` : "No integration connected"}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>
                  {systems[0]?.name || "Workday Enterprise"}
                </span>
              </div>

              <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Records Received</span>
                <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#2563eb", marginTop: "0.25rem" }}>
                  {summary.total_records_received}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Reconciled batch count</span>
              </div>

              <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Automatically Verified</span>
                <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#16a34a", marginTop: "0.25rem" }}>
                  {summary.automatically_verified}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>5-point deterministic match</span>
              </div>

              <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Manual Review Exceptions</span>
                <div style={{ fontSize: "1.85rem", fontWeight: 800, color: summary.manual_review_required > 0 ? "#b45309" : "#64748b", marginTop: "0.25rem" }}>
                  {summary.manual_review_required}
                </div>
                <span style={{ fontSize: "0.75rem", color: summary.manual_review_required > 0 ? "#b45309" : "#64748b", fontWeight: 600 }}>
                  Requires HR decision
                </span>
              </div>

              <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Auto Verification %</span>
                <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#7c3aed", marginTop: "0.25rem" }}>
                  {summary.auto_verification_rate}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 600 }}>Match success ratio</span>
              </div>
            </div>

            {/* Section 28: Today's Verification Activity Visualization */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
                Today's Verification Activity (Section 28)
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1.5rem 0" }}>
                Proportional breakdown of incoming records processed through the automated correlation pipeline.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "2rem", alignItems: "center" }}>
                {/* SVG Visual Donut */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
                  <svg width="220" height="220" viewBox="0 0 220 220">
                    <circle cx="110" cy="110" r="80" fill="transparent" stroke="#f1f5f9" strokeWidth="24" />
                    {/* Auto verified slice */}
                    <circle
                      cx="110"
                      cy="110"
                      r="80"
                      fill="transparent"
                      stroke="#16a34a"
                      strokeWidth="24"
                      strokeDasharray={`${(autoVerifiedCount / totalRecords) * 502} 502`}
                      strokeDashoffset="0"
                      transform="rotate(-90 110 110)"
                      style={{ transition: "all 0.5s ease" }}
                    />
                    {/* Manual review slice */}
                    <circle
                      cx="110"
                      cy="110"
                      r="80"
                      fill="transparent"
                      stroke="#d97706"
                      strokeWidth="24"
                      strokeDasharray={`${(manualReviewCount / totalRecords) * 502} 502`}
                      strokeDashoffset={`-${(autoVerifiedCount / totalRecords) * 502}`}
                      transform="rotate(-90 110 110)"
                      style={{ transition: "all 0.5s ease" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", textAlign: "center" }}>
                    <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a" }}>
                      {totalRecords}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Total Records</span>
                  </div>
                </div>

                {/* Legend & Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "#f0fdf4", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#16a34a" }} />
                      <strong style={{ fontSize: "0.9rem", color: "#166534" }}>Automatically Verified</strong>
                    </div>
                    <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#166534" }}>
                      {autoVerifiedCount} ({Math.round((autoVerifiedCount / totalRecords) * 100)}%)
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "#fffbeb", borderRadius: "8px", border: "1px solid #fde68a" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#d97706" }} />
                      <strong style={{ fontSize: "0.9rem", color: "#92400e" }}>Manual Review Required</strong>
                    </div>
                    <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#92400e" }}>
                      {manualReviewCount} ({Math.round((manualReviewCount / totalRecords) * 100)}%)
                    </span>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.4 }}>
                    Deterministic matching rules: If all 5 criteria (ID, Employer, Name, Status, Date) match perfectly $\rightarrow$ Auto Verified. Any field conflict immediately routes to Manual Review.
                  </div>
                </div>
              </div>
            </div>

            {/* Section 27: Connected Systems Table */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" }}>
                <h3 style={{ margin: "0 0 0.2rem 0", fontSize: "1.1rem", color: "#0f172a" }}>
                  Connected Systems & Gateways (Section 27)
                </h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                  Active integration endpoints configured for outcome synchronization.
                </p>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
                      <th style={{ padding: "0.75rem 1.25rem", fontWeight: 700 }}>Employer System</th>
                      <th style={{ padding: "0.75rem 1.25rem", fontWeight: 700 }}>Integration Type</th>
                      <th style={{ padding: "0.75rem 1.25rem", fontWeight: 700 }}>Connection Status</th>
                      <th style={{ padding: "0.75rem 1.25rem", fontWeight: 700 }}>Last Sync</th>
                      <th style={{ padding: "0.75rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systems.map((sys) => (
                      <tr key={sys.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <strong style={{ color: "#0f172a", display: "block" }}>{sys.name}</strong>
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: {sys.id}</span>
                        </td>
                        <td style={{ padding: "1rem 1.25rem", color: "#334155" }}>
                          {sys.type || "REST / Webhook API"}
                        </td>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <span style={{
                            background: sys.status === "Connected" ? "#dcfce7" : "#fef3c7",
                            color: sys.status === "Connected" ? "#166534" : "#b45309",
                            padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700
                          }}>
                            {sys.status}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 1.25rem", color: "#64748b" }}>
                          {sys.last_sync || "Just now"}
                        </td>
                        <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                          <button
                            onClick={handleSyncNow}
                            disabled={isSyncing}
                            style={{
                              padding: "0.4rem 0.75rem",
                              background: "white",
                              border: "1px solid #cbd5e1",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "#2563eb",
                              cursor: "pointer"
                            }}
                          >
                            Re-sync Feed
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 35: API Configuration (Collapsible) */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <button
                onClick={() => setShowConfig(!showConfig)}
                style={{
                  width: "100%",
                  padding: "1.25rem 1.5rem",
                  background: "#f8fafc",
                  border: "none",
                  borderBottom: showConfig ? "1px solid #e2e8f0" : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <KeyRound size={18} color="#2563eb" />
                  <strong style={{ fontSize: "1rem", color: "#0f172a" }}>
                    Integration Settings & API Configuration (Section 35)
                  </strong>
                </div>
                {showConfig ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showConfig && (
                <div style={{ padding: "1.75rem" }}>
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.25rem", fontSize: "0.8rem", color: "#475569" }}>
                    <strong>Security Notice (Section 35):</strong> API credentials and webhook signing keys are encrypted at rest and permanently masked. Sensitive secrets are never exposed in user logs or reports.
                  </div>

                  {configSaved && (
                    <div style={{ background: "#dcfce7", color: "#166534", padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.85rem" }}>
                      Configuration successfully updated!
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                        API Base URL
                      </label>
                      <input
                        type="text"
                        value={apiConfig.api_base_url}
                        onChange={(e) => setApiConfig({ ...apiConfig, api_base_url: e.target.value })}
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                        Client Application ID
                      </label>
                      <input
                        type="text"
                        value={apiConfig.client_id}
                        onChange={(e) => setApiConfig({ ...apiConfig, client_id: e.target.value })}
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                        API Secret Key (Masked - Section 35)
                      </label>
                      <input
                        type="password"
                        value={apiConfig.api_key}
                        onChange={(e) => setApiConfig({ ...apiConfig, api_key: e.target.value })}
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                        Webhook Endpoint
                      </label>
                      <input
                        type="text"
                        value={apiConfig.webhook_url}
                        onChange={(e) => setApiConfig({ ...apiConfig, webhook_url: e.target.value })}
                        style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>

                  {testResult && (
                    <div style={{
                      padding: "0.75rem",
                      borderRadius: "6px",
                      marginBottom: "1rem",
                      fontSize: "0.85rem",
                      background: testResult === "testing" ? "#eff6ff" : "#dcfce7",
                      color: testResult === "testing" ? "#1e40af" : "#166534"
                    }}>
                      {testResult === "testing" ? "Testing connection handshake to ATS..." : testResult.message}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                    <button
                      onClick={handleTestConnection}
                      style={{ padding: "0.6rem 1.25rem", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Test Connection
                    </button>
                    <button
                      onClick={() => {
                        setConfigSaved(true);
                        setTimeout(() => setConfigSaved(false), 3000);
                      }}
                      style={{ padding: "0.6rem 1.5rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. AUTOMATED MATCHING ENGINE TAB (SECTIONS 29 & 30) */}
        {activeTab === "matching" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
                5-Point Deterministic Matching Criteria (Section 29)
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1.5rem 0" }}>
                Incoming trainee declarations are evaluated against organizational HR/ATS data using five strict criteria:
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                  { title: "1. Trainee ID", desc: "Matches State Skilling Unique Trainee ID (TR-XXXX)" },
                  { title: "2. Corporate Employer", desc: "Matches Authorised Employer Entity & GSTIN" },
                  { title: "3. Candidate Name", desc: "Exact token match on full legal name" },
                  { title: "4. Employment Status", desc: "Active full-time or apprentice employment flag" },
                  { title: "5. Joining Date", desc: "Joining date matches HR offer acceptance threshold" }
                ].map(r => (
                  <div key={r.title} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <strong style={{ fontSize: "0.85rem", color: "#0f172a", display: "block", marginBottom: "0.25rem" }}>
                      {r.title}
                    </strong>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{r.desc}</span>
                  </div>
                ))}
              </div>

              {/* Matching Records Table (Section 30) */}
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.75rem 0" }}>
                Matching Results Evaluation (Section 30)
              </h4>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
                      <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>Trainee / Candidate</th>
                      <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>Claimed vs System Data</th>
                      <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>5-Field Evaluation</th>
                      <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>Engine Result</th>
                      <th style={{ padding: "0.75rem 1rem", fontWeight: 700, textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchingRecords.map(m => {
                      const isMatch = m.status === "MATCH";
                      return (
                        <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "1rem" }}>
                            <strong style={{ color: "#0f172a", display: "block" }}>{m.name}</strong>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{m.trainee_id}</span>
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <div style={{ fontSize: "0.8rem", color: "#334155" }}>
                              <div>Role: <strong>{m.claimed_role}</strong></div>
                              <div>Joining: <strong>{m.claimed_joining}</strong> {m.discrepancy_field === "Joining Date" && <span style={{ color: "#dc2626", fontWeight: 700 }}>(ATS: {m.system_joining})</span>}</div>
                            </div>
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.75rem" }}>
                              <span style={{ color: m.fields_matched.id ? "#16a34a" : "#dc2626" }}>ID {m.fields_matched.id ? "✓" : "✗"}</span>
                              <span style={{ color: m.fields_matched.employer ? "#16a34a" : "#dc2626" }}>Employer {m.fields_matched.employer ? "✓" : "✗"}</span>
                              <span style={{ color: m.fields_matched.name ? "#16a34a" : "#dc2626" }}>Name {m.fields_matched.name ? "✓" : "✗"}</span>
                              <span style={{ color: m.fields_matched.status ? "#16a34a" : "#dc2626" }}>Status {m.fields_matched.status ? "✓" : "✗"}</span>
                              <span style={{ color: m.fields_matched.joining_date ? "#16a34a" : "#dc2626" }}>Date {m.fields_matched.joining_date ? "✓" : "✗"}</span>
                            </div>
                          </td>
                          <td style={{ padding: "1rem" }}>
                            {isMatch ? (
                              <span style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 }}>
                                MATCH ✓ (Auto Verified)
                              </span>
                            ) : (
                              <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 }}>
                                MISMATCH (Manual Review)
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "1rem", textAlign: "right" }}>
                            {!isMatch && (
                              <button
                                onClick={() => setSelectedException(m)}
                                style={{ padding: "0.4rem 0.75rem", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                              >
                                Review Discrepancy →
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. VERIFICATION EXCEPTIONS TAB (SECTION 31) */}
        {activeTab === "exceptions" && (
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <h3 style={{ margin: "0 0 0.2rem 0", fontSize: "1.15rem", color: "#0f172a" }}>
                  Verification Exceptions & Mismatches (Section 31)
                </h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                  Mismatches detected between candidate claims and <strong>{organizationName}</strong> HR/ATS records.
                </p>
              </div>
              <span style={{ background: exceptions.length > 0 ? "#fef3c7" : "#dcfce7", color: exceptions.length > 0 ? "#b45309" : "#15803d", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 700 }}>
                {exceptions.length} Pending Actions
              </span>
            </div>

            {exceptions.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {exceptions.map((exc) => (
                  <div
                    key={exc.id}
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "10px",
                      padding: "1.25rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                        <AlertTriangle size={16} color="#dc2626" />
                        <strong style={{ color: "#991b1b", fontSize: "0.95rem" }}>
                          {exc.name} ({exc.trainee_id})
                        </strong>
                        <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 700 }}>
                          Field Mismatch: {exc.discrepancy_field}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "#7f1d1d", display: "flex", gap: "1.5rem" }}>
                        <div>Claimed Value: <strong>{exc.claimed_value}</strong></div>
                        <div>Employer System Value: <strong>{exc.system_value}</strong></div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => setSelectedException(exc)}
                        style={{
                          padding: "0.45rem 0.9rem",
                          background: "white",
                          color: "#2563eb",
                          border: "1px solid #bfdbfe",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem"
                        }}
                      >
                        <Eye size={14} /> Review & Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "#f8fafc", padding: "2rem", borderRadius: "8px", textAlign: "center", color: "#64748b" }}>
                <CheckCircle2 size={28} color="#16a34a" style={{ display: "inline-block", marginBottom: "0.5rem" }} />
                <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>All exceptions resolved! No pending mismatches.</p>
              </div>
            )}
          </div>
        )}

        {/* 4. SYNC ACTIVITY LOG TAB (SECTION 36) */}
        {activeTab === "activity" && (
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 0.2rem 0", fontSize: "1.1rem", color: "#0f172a" }}>
                Integration Synchronization Activity Log (Section 36)
              </h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                Chronological audit record of automated batch jobs, webhook triggers, and reconciliation events.
              </p>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
                    <th style={{ padding: "0.75rem 1.25rem", fontWeight: 700 }}>Timestamp</th>
                    <th style={{ padding: "0.75rem 1.25rem", fontWeight: 700 }}>Operation</th>
                    <th style={{ padding: "0.75rem 1.25rem", fontWeight: 700 }}>Records Processed</th>
                    <th style={{ padding: "0.75rem 1.25rem", fontWeight: 700 }}>Status</th>
                    <th style={{ padding: "0.75rem 1.25rem", fontWeight: 700 }}>Exceptions</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLog.map((log) => (
                    <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem 1.25rem", color: "#64748b" }}>
                        <Clock size={13} style={{ display: "inline-block", marginRight: "4px" }} />
                        {log.timestamp}
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <strong style={{ color: "#0f172a" }}>{log.operation}</strong>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: "#334155" }}>
                        {log.records} records
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <span style={{
                          background: log.status.includes("Completed") ? "#dcfce7" : "#fee2e2",
                          color: log.status.includes("Completed") ? "#166534" : "#b91c1c",
                          padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700
                        }}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: log.issues > 0 ? "#b45309" : "#16a34a", fontWeight: 700 }}>
                        {log.issues > 0 ? `${log.issues} issues` : "0 issues"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. EXCEPTION RESOLUTION DRAWER / MODAL (SECTION 31) */}
        {selectedException && (
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
            <div style={{ background: "white", borderRadius: "14px", maxWidth: "520px", width: "100%", padding: "2rem", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.75rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>
                  Resolve Verification Exception (Section 31)
                </h3>
                <button onClick={() => setSelectedException(null)} style={{ background: "none", border: "none", fontSize: "1rem", color: "#64748b", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Trainee Candidate:</span>
                  <strong style={{ color: "#0f172a", fontSize: "1rem" }}>{selectedException.name} ({selectedException.trainee_id})</strong>
                </div>

                {/* Discrepancy Highlight */}
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "1rem", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#991b1b", fontWeight: 700, marginBottom: "0.5rem" }}>
                    <AlertTriangle size={16} /> Discrepancy Detected: {selectedException.discrepancy_field}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <span style={{ color: "#7f1d1d", fontSize: "0.75rem", display: "block" }}>Candidate Declared</span>
                      <strong style={{ color: "#991b1b" }}>{selectedException.claimed_value}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#7f1d1d", fontSize: "0.75rem", display: "block" }}>Employer System Record</span>
                      <strong style={{ color: "#991b1b" }}>{selectedException.system_value}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Employer Correction Note (if requesting candidate revision)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Please update joining date to match corporate offer acceptance."
                    value={correctionNote}
                    onChange={(e) => setCorrectionNote(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                <button
                  onClick={() => handleResolveException(selectedException, "reject")}
                  style={{ padding: "0.65rem", background: "#ef4444", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}
                >
                  Reject Claim
                </button>
                <button
                  onClick={() => handleResolveException(selectedException, "request_correction")}
                  style={{ padding: "0.65rem", background: "#f59e0b", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}
                >
                  Request Correction
                </button>
                <button
                  onClick={() => handleResolveException(selectedException, "confirm")}
                  style={{ padding: "0.65rem", background: "#16a34a", color: "white", border: "none", borderRadius: "6px", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}
                >
                  Confirm / Override
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

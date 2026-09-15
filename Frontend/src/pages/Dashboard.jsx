import { useState, useEffect } from "react";
import { 
  Users, GraduationCap, Briefcase, TrendingUp, Award, CheckCircle2, 
  Sparkles, Layers, ArrowUpRight, ShieldCheck, ChevronRight, AlertCircle,
  X, ExternalLink, Banknote, Search
} from "lucide-react";
import { Link } from "react-router-dom";
import { useFilters } from "../context/FilterContext";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import DataTable from "../components/common/DataTable";

export default function Dashboard() {
  const { filters } = useFilters();
  const store = usePlatformStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [funnelData, setFunnelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive drilldown state (Section 27: Drilldown Principle)
  const [drilldownStage, setDrilldownStage] = useState(null);
  const [drilldownTrainees, setDrilldownTrainees] = useState([]);
  const [drilldownSearch, setDrilldownSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, fun] = await Promise.all([
        platformService.getAdminDashboard(filters),
        platformService.getOutcomeFunnel(filters)
      ]);
      setDashboardData(dash);
      setFunnelData(fun);
    } catch (err) {
      console.error("Dashboard data load failed", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, store.last_updated]);

  // Handle stage or KPI click to open drilldown
  const handleOpenDrilldown = (stageId, stageLabel) => {
    const allTrainees = platformService.filterTrainees(store.trainees || [], filters);
    let matched = [];

    switch (stageId) {
      case "trained":
        matched = allTrainees;
        break;
      case "certified":
        matched = allTrainees.filter(t => t.certified);
        break;
      case "placed":
        matched = allTrainees.filter(t => t.employment?.status === "EMPLOYED" || t.employment?.status === "APPRENTICESHIP");
        break;
      case "rate":
        matched = allTrainees.filter(t => t.employment?.status === "EMPLOYED" || t.employment?.status === "APPRENTICESHIP" || t.employment?.status === "SELF_EMPLOYED");
        break;
      case "self":
      case "self_employed":
        matched = allTrainees.filter(t => t.employment?.status === "SELF_EMPLOYED");
        break;
      case "apprentice":
      case "apprenticeship":
        matched = allTrainees.filter(t => t.employment?.status === "APPRENTICESHIP");
        break;
      case "unemployed":
        matched = allTrainees.filter(t => t.employment?.status === "UNEMPLOYED");
        break;
      case "retention":
        matched = allTrainees.filter(t => t.retention?.retention_6m === "Retained");
        break;
      case "wage":
        matched = allTrainees.filter(t => t.employment?.current_wage > 0);
        break;
      case "followup":
        matched = allTrainees.filter(t => (t.follow_ups || []).some(f => f.status === "Completed"));
        break;
      default:
        matched = allTrainees;
    }

    setDrilldownStage({ id: stageId, label: stageLabel });
    setDrilldownTrainees(matched);
    setDrilldownSearch("");
  };

  const kpis = dashboardData?.stats || [];

  const getKpiIcon = (iconName) => {
    switch (iconName) {
      case "Users": return <Users size={18} color="#2563eb" />;
      case "GraduationCap": return <GraduationCap size={18} color="#3b82f6" />;
      case "Briefcase": return <Briefcase size={18} color="#16a34a" />;
      case "TrendingUp": return <TrendingUp size={18} color="#0d9488" />;
      case "Award": return <Award size={18} color="#7c3aed" />;
      case "Layers": return <Layers size={18} color="#8b5cf6" />;
      case "AlertCircle": return <AlertCircle size={18} color="#ea580c" />;
      case "ShieldCheck": return <ShieldCheck size={18} color="#15803d" />;
      case "Banknote": return <Banknote size={18} color="#059669" />;
      case "CheckCircle2": return <CheckCircle2 size={18} color="#2563eb" />;
      default: return <Sparkles size={18} color="#2563eb" />;
    }
  };

  const filteredDrilldownList = drilldownTrainees.filter(t =>
    (t.name || "").toLowerCase().includes(drilldownSearch.toLowerCase()) ||
    (t.id || "").toLowerCase().includes(drilldownSearch.toLowerCase()) ||
    (t.programme_name || "").toLowerCase().includes(drilldownSearch.toLowerCase()) ||
    (t.district || "").toLowerCase().includes(drilldownSearch.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "1440px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Sparkles size={18} color="#2563eb" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              STATE SKILLING IMPACT INTELLIGENCE • EXECUTIVE OVERVIEW (A1, A2)
            </span>
          </div>
          <h1 style={{ fontSize: "1.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
            Executive Outcome Dashboard
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
            Real-time longitudinal indicators monitoring training completion, verified placement velocity, and wage retention across 800 relational records.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link
            to="/admin/reports"
            style={{
              padding: "0.6rem 1.25rem",
              background: "#2563eb",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >
            Generate Report
          </Link>
        </div>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={dashboardData}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d && d.data_available)}
        isInsufficientData={(d) => Boolean(d && d.insufficient_data)}
        insufficientReason={(d) => d?.reason || "Cohort size below privacy threshold (N < 5)."}
        isEmptyDetails="No outcome records match the current filter selection. Adjust or clear filters to view data."
      >
        {/* A1: 10-KPI SECTION (Section 12.1) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {kpis.map((kpi) => (
            <div
              key={kpi.id || kpi.title}
              className="kpi-card"
              onClick={() => handleOpenDrilldown(kpi.id, kpi.title)}
              style={{
                background: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                padding: "1.15rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                cursor: "pointer",
                transition: "transform 0.15s ease, border-color 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "none"; }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569" }}>{kpi.title}</span>
                  <div style={{ background: "#f8fafc", padding: "5px", borderRadius: "6px" }}>
                    {getKpiIcon(kpi.icon)}
                  </div>
                </div>
                <div className="kpi-value" style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>
                  {kpi.value}
                </div>
              </div>
              {kpi.change && (
                <div style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 600, marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  <ArrowUpRight size={13} /> {kpi.change}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* A2: OUTCOME FUNNEL (Section 12.2) */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.2rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <TrendingUp size={20} color="#2563eb" /> Training to Employment Funnel (A2)
              </h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                Dynamic progression from enrolment through long-term career engagement. Click any funnel stage to inspect the candidate cohort.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1rem" }}>
            {(funnelData?.stages || []).map((stage, idx) => (
              <div
                key={stage.id || stage.label}
                className="funnel-step"
                onClick={() => handleOpenDrilldown(stage.id, stage.label)}
                style={{
                  background: drilldownStage?.id === stage.id ? "#eff6ff" : "#f8fafc",
                  borderRadius: "10px",
                  borderStyle: "solid",
                  borderWidth: drilldownStage?.id === stage.id ? "4px 2px 2px 2px" : "4px 1px 1px 1px",
                  borderColor: drilldownStage?.id === stage.id 
                    ? `${stage.color} ${stage.color} ${stage.color} ${stage.color}`
                    : `${stage.color} #e2e8f0 #e2e8f0 #e2e8f0`,
                  padding: "1.25rem",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
              >
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "0.25rem" }}>
                  Stage {idx + 1}
                </span>
                <strong style={{ fontSize: "0.92rem", color: "#0f172a", display: "block", marginBottom: "0.5rem", minHeight: "2.4rem" }}>
                  {stage.label}
                </strong>
                <div className="funnel-step-count" style={{ fontSize: "1.75rem", fontWeight: 800, color: stage.color, marginBottom: "0.25rem" }}>
                  {stage.count.toLocaleString()}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>
                  {stage.percentage}% of cohort
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Recommendation & Action Center */}
        {dashboardData?.priority_insight && (
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ background: "#2563eb", color: "white", padding: "10px", borderRadius: "10px" }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1e40af", textTransform: "uppercase" }}>
                  System Priority Insight • {dashboardData.priority_insight.programme}
                </span>
                <h4 style={{ margin: "0.2rem 0", fontSize: "1rem", color: "#1e3a8a" }}>
                  {dashboardData.priority_insight.message}
                </h4>
              </div>
            </div>

            <Link
              to="/admin/interventions"
              style={{
                padding: "0.55rem 1.25rem",
                background: "#2563eb",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              {dashboardData.priority_insight.action} <ChevronRight size={16} />
            </Link>
          </div>
        )}

        {/* INTERACTIVE DRILLDOWN DRAWER / MODAL (Section 27) */}
        {drilldownStage && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            justifyContent: "flex-end",
            zIndex: 1000
          }}>
            <div className="drilldown-drawer" style={{
              background: "white",
              width: "100%",
              maxWidth: "720px",
              height: "100%",
              boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}>
              {/* Drawer Header */}
              <div className="drilldown-header" style={{ padding: "1.5rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                    COHORT DRILLDOWN INSPECTION
                  </span>
                  <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.3rem", color: "#0f172a" }}>
                    {drilldownStage.label} ({drilldownTrainees.length} Records)
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    Filtered under active analytical scope ({Object.values(filters).filter(Boolean).join(", ") || "All State"})
                  </span>
                </div>
                <button
                  className="drilldown-close"
                  onClick={() => setDrilldownStage(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "6px" }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Search within drilldown */}
              <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ position: "relative" }}>
                  <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "10px" }} />
                  <input
                    type="text"
                    placeholder="Search candidate name, ID, programme, or district..."
                    value={drilldownSearch}
                    onChange={(e) => setDrilldownSearch(e.target.value)}
                    style={{ width: "100%", padding: "0.55rem 1rem 0.55rem 2.25rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              {/* Candidate Roster List */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
                {filteredDrilldownList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
                    No candidates match the drilldown search query.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {filteredDrilldownList.map((t) => (
                      <div key={t.id} style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                          <div>
                            <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{t.name}</strong>
                            <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: "0.5rem" }}>({t.id})</span>
                          </div>
                          <span style={{ 
                            fontSize: "0.72rem", 
                            fontWeight: 700, 
                            padding: "2px 8px", 
                            borderRadius: "10px",
                            background: t.employment?.status === "EMPLOYED" ? "#dcfce7" : t.employment?.status === "UNEMPLOYED" ? "#fee2e2" : "#fef3c7",
                            color: t.employment?.status === "EMPLOYED" ? "#166534" : t.employment?.status === "UNEMPLOYED" ? "#991b1b" : "#b45309"
                          }}>
                            {t.employment?.status || "ENROLLED"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#475569", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem" }}>
                          <span><strong>Programme:</strong> {t.programme_name}</span>
                          <span><strong>District:</strong> {t.district}</span>
                          <span><strong>Provider:</strong> {t.provider_name}</span>
                          <span><strong>Cohort:</strong> {t.cohort}</span>
                          {t.employment?.employer_name && <span><strong>Employer:</strong> {t.employment.employer_name}</span>}
                          {t.employment?.current_wage > 0 && <span><strong>Wage:</strong> ₹{t.employment.current_wage.toLocaleString()}/mo</span>}
                          {(t.employment?.status_reason || t.employment?.unemployment_reason || t.employment?.comments) && (
                            <span><strong>Reason / Context:</strong> {t.employment.status_reason || t.employment.unemployment_reason || t.employment.comments}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Showing {filteredDrilldownList.length} of {drilldownTrainees.length} records
                </span>
                <button
                  onClick={() => setDrilldownStage(null)}
                  style={{ padding: "0.5rem 1.25rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
}

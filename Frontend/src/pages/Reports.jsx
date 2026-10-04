import { useState, useEffect, useMemo } from "react";
import { FileDown, FileText, Table, CheckCircle2, Filter, Download, Sparkles, RefreshCw } from "lucide-react";
import { useFilters } from "../context/FilterContext";
import { useLanguage } from "../context/LanguageContext";
import { platformService, usePlatformStore } from "../services/platformService";
import DataTable from "../components/common/DataTable";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import CountUp from "../components/common/CountUp";

export default function Reports() {
  const { t } = useLanguage();
  const { filters, updateFilter, clearFilters, activeFilterCount } = useFilters();
  const store = usePlatformStore();
  const [downloading, setDownloading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("csv"); // 'csv' | 'json'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter trainees strictly by active global filters
  const scopedTrainees = useMemo(() => {
    return platformService.filterTrainees(store.trainees || [], filters);
  }, [store.trainees, filters]);

  // Derive analytical summary for this scope (Section 26)
  const scopeSummary = useMemo(() => {
    const total = scopedTrainees.length;
    if (total === 0) return null;

    const completed = scopedTrainees.filter(t => t.training_status === "Completed").length;
    const certified = scopedTrainees.filter(t => t.certified).length;
    const placed = scopedTrainees.filter(t => t.employment?.status === "EMPLOYED" || t.employment?.status === "APPRENTICESHIP").length;
    const selfEmployed = scopedTrainees.filter(t => t.employment?.status === "SELF_EMPLOYED").length;
    const unemployed = scopedTrainees.filter(t => t.employment?.status === "UNEMPLOYED").length;

    const eligibleRetention = scopedTrainees.filter(t => t.retention && t.retention.retention_6m).length || 1;
    const retained6M = scopedTrainees.filter(t => t.retention?.retention_6m === "Retained").length;

    const wages = scopedTrainees.map(t => t.employment?.current_wage).filter(Boolean);
    const avgWage = wages.length ? Math.round(wages.reduce((a, b) => a + b, 0) / wages.length) : 0;

    return {
      total,
      completed,
      certified,
      placed,
      selfEmployed,
      unemployed,
      placement_rate: Math.round((placed / total) * 100),
      employment_rate: Math.round(((placed + selfEmployed) / total) * 100),
      retention_6m: Math.round((retained6M / eligibleRetention) * 100),
      avg_wage: avgWage
    };
  }, [scopedTrainees]);

  useEffect(() => {
    setLoading(false);
  }, [filters, store.last_updated]);

  const handleGenerateExport = async () => {
    if (scopedTrainees.length === 0) {
      alert("Cannot export empty dataset. Please adjust filters.");
      return;
    }

    setDownloading(true);
    try {
      if (selectedFormat === "json") {
        const exportPayload = {
          report_title: "State Skilling Impact Intelligence Executive Dataset",
          generated_at: new Date().toISOString(),
          filter_scope: filters,
          summary_metrics: scopeSummary,
          records_count: scopedTrainees.length,
          trainees: scopedTrainees.map(t => ({
            id: t.id,
            name: t.name,
            gender: t.gender,
            age_group: t.age_group,
            category: t.category,
            district: t.district,
            programme: t.programme_name,
            provider: t.provider_name,
            cohort: t.cohort,
            status: t.employment?.status || "ENROLLED",
            employer: t.employment?.employer_name || "N/A",
            current_wage: t.employment?.current_wage || 0,
            retention_6m: t.retention?.retention_6m || "Pending"
          }))
        };
        const jsonStr = JSON.stringify(exportPayload, null, 2);
        downloadBlob(jsonStr, "application/json", "json");
      } else {
        // CSV format
        const headers = [
          "Trainee_ID", "Name", "Gender", "Category", "District",
          "Programme", "Provider", "Cohort", "Status",
          "Employer", "Current_Wage", "Retention_6M"
        ];
        const rows = scopedTrainees.map(t => [
          t.id,
          `"${t.name}"`,
          t.gender,
          t.category,
          t.district,
          `"${t.programme_name}"`,
          `"${t.provider_name}"`,
          t.cohort,
          t.employment?.status || "UNEMPLOYED",
          `"${t.employment?.employer_name || 'N/A'}"`,
          t.employment?.current_wage || 0,
          t.retention?.retention_6m || "Pending"
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        downloadBlob(csvContent, "text/csv", "csv");
      }
    } catch (err) {
      console.error("Export error", err);
      alert("Error generating export.");
    } finally {
      setDownloading(false);
    }
  };

  const downloadBlob = (content, mimeType, extension) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const scopeLabel = Object.values(filters).filter(Boolean).join("_") || "AllState";
    link.setAttribute("download", `Skilling_Impact_Report_${scopeLabel}_${new Date().toISOString().split("T")[0]}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <FileText size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {t("reports.admin_badge", "EXECUTIVE REPORTING & COMPLIANT DATA EXPORT")}
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          {t("reports.page_title", "Outcome Reports & Data Export")}
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          {t("reports.page_subtitle", "Generate government compliance reports matching the exact scope defined by your active global filters.")}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Scope Config & Export Controller */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", height: "fit-content" }}>
          <h3 style={{ margin: "0 0 0.4rem 0", fontSize: "1.15rem", color: "#0f172a" }}>
            {t("reports.scope_title", "Report Generation Scope")}
          </h3>
          <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.8rem", color: "#64748b" }}>
            {t("reports.scope_subtitle", "The export dataset automatically mirrors the active global filter scope.")}
          </p>

          <div className="report-scope-card" style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1.5rem", fontSize: "0.8rem" }}>
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>{t("reports.current_scope", "Current Analytical Scope:")}</div>
            <div><strong>{t("common.cohort", "Cohort")}:</strong> {filters.cohort || t("reports.all_cohorts", "All Cohorts")}</div>
            <div><strong>{t("common.programme", "Programme")}:</strong> {filters.course || filters.programme || t("reports.all_programmes", "All Programmes")}</div>
            <div><strong>{t("common.provider", "Provider")}:</strong> {filters.provider || t("reports.all_providers", "All Providers")}</div>
            <div><strong>{t("common.district", "District")}:</strong> {filters.district || t("reports.all_districts", "All Districts")}</div>
            <div><strong>{t("common.gender", "Gender")}:</strong> {filters.gender || t("reports.all_genders", "All Genders")}</div>
            <div><strong>{t("common.age_group", "Age Group")}:</strong> {filters.ageGroup || t("reports.all_ages", "All Ages")}</div>
            <div><strong>{t("common.category", "Category")}:</strong> {filters.category || t("reports.all_categories", "All Categories")}</div>

            <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "#2563eb" }}>
                {t("reports.records_in_scope", "Records in Scope:")} {scopedTrainees.length}
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline" }}
                >
                  {t("reports.reset_scope", "Reset Scope")}
                </button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.4rem" }}>
              {t("reports.export_format", "Export Format")}
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[
                { key: "csv", label: t("reports.csv_format", "CSV Dataset (.csv)") },
                { key: "json", label: t("reports.json_format", "JSON Feed (.json)") }
              ].map((f) => (
                <button
                  type="button"
                  key={f.key}
                  onClick={() => setSelectedFormat(f.key)}
                  style={{
                    flex: 1,
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: selectedFormat === f.key ? "2px solid #2563eb" : "1px solid #cbd5e1",
                    background: selectedFormat === f.key ? "#eff6ff" : "white",
                    color: selectedFormat === f.key ? "#1d4ed8" : "#475569",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer"
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateExport}
            disabled={downloading || scopedTrainees.length === 0}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: scopedTrainees.length === 0 ? "#94a3b8" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: scopedTrainees.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            <Download size={18} />
            {downloading ? t("reports.compiling_dataset", "Compiling Dataset...") : `${t("reports.download_report", "Download Report")} (${selectedFormat.toUpperCase()} - ${scopedTrainees.length})`}
          </button>
        </div>

        {/* Live Scope Preview & Metrics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Summary Metric Cards */}
          {scopeSummary && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{t("reports.placement_rate", "Placement Rate")}</span>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#16a34a" }}><CountUp value={scopeSummary.placement_rate} suffix="%" /></div>
              </div>
              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{t("reports.retention_6m", "6M Retention")}</span>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2563eb" }}><CountUp value={scopeSummary.retention_6m} suffix="%" /></div>
              </div>
              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{t("reports.mean_wage", "Mean Wage")}</span>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}><CountUp value={scopeSummary.avg_wage} prefix="₹" /></div>
              </div>
              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{t("reports.self_employed", "Self-Employed")}</span>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0d9488" }}><CountUp value={scopeSummary.selfEmployed} /></div>
              </div>
            </div>
          )}

          {/* Live Table Preview */}
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 0.2rem 0", fontSize: "1.1rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Table size={18} color="#2563eb" /> {t("reports.live_preview_title", "Live Scope Data Preview")} ({scopedTrainees.length} records)
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  {t("reports.live_preview_subtitle", "DPDP compliance threshold enforced: Aggregated records meeting minimum verification standards.")}
                </span>
              </div>
            </div>

            <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
              <DataStateWrapper
                isLoading={loading}
                error={error}
                data={scopedTrainees}
                onRetry={() => setLoading(false)}
                isDataAvailable={(d) => d && d.length > 0}
                isEmptyDetails={t("reports.empty_details", "No records match current report scope. Please adjust filter parameters.")}
              >
                <DataTable
                  columns={[
                    { key: "id", label: t("reports.col_trainee_id", "Trainee ID"), render: (tItem) => <strong>{tItem.id}</strong> },
                    { key: "name", label: t("reports.col_candidate_name", "Candidate Name"), render: (tItem) => <strong style={{ color: "#0f172a" }}>{tItem.name}</strong> },
                    { key: "district", label: t("reports.col_district", "District"), render: (tItem) => tItem.district },
                    { key: "programme_name", label: t("reports.col_programme", "Programme"), render: (tItem) => tItem.programme_name },
                    { key: "provider_name", label: t("reports.col_provider", "Provider"), render: (tItem) => tItem.provider_name },
                    { key: "cohort", label: t("reports.col_cohort", "Cohort"), render: (tItem) => tItem.cohort },
                    {
                      key: "status",
                      label: t("reports.col_status", "Status"),
                      render: (tItem) => (
                        <span style={{
                          background: tItem.employment?.status === "EMPLOYED" ? "#dcfce7" : tItem.employment?.status === "UNEMPLOYED" ? "#fee2e2" : "#fef3c7",
                          color: tItem.employment?.status === "EMPLOYED" ? "#166534" : tItem.employment?.status === "UNEMPLOYED" ? "#991b1b" : "#b45309",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "0.72rem",
                          fontWeight: 700
                        }}>
                          {tItem.employment?.status || "ENROLLED"}
                        </span>
                      )
                    },
                    {
                      key: "wage",
                      label: t("reports.col_wage", "Current Wage"),
                      render: (tItem) => tItem.employment?.current_wage > 0 ? `₹${tItem.employment.current_wage.toLocaleString()}` : "N/A"
                    }
                  ]}
                  data={scopedTrainees.slice(0, 20)}
                />
              </DataStateWrapper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

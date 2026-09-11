import { useState, useEffect } from "react";
import { Users2, TrendingUp, Award, Target, CheckCircle2, ChevronRight, BarChart2 } from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { useFilters } from "../context/FilterContext";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import DataTable from "../components/common/DataTable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function Cohorts() {
  const { filters, updateFilter } = useFilters();
  const store = usePlatformStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCohort, setSelectedCohort] = useState("2024-Q1");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getCohortAnalytics(filters);
      setData(res);
      if (res.cohorts && res.cohorts.length > 0) {
        if (!res.cohorts.find(c => c.cohort === selectedCohort)) {
          setSelectedCohort(res.cohorts[0].cohort);
        }
      }
    } catch (err) {
      console.error("Failed to load cohort analytics", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, store.last_updated]);

  const cohorts = data?.cohorts || [];
  const activeCohort = cohorts.find(c => c.cohort === selectedCohort) || cohorts[0];

  const chartData = cohorts.map(c => ({
    cohort: c.cohort,
    placementRate: parseFloat(c.placement_rate) || 0,
    retentionRate: parseFloat(c.retention_6m) || 0,
    completionRate: parseFloat(c.completion_rate) || 0
  }));

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <Users2 size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            LONGITUDINAL PERFORMANCE BENCHMARKING (A12, SECTION 23)
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          Quarterly Cohort Analysis & Progression
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Compare skilling cohorts across graduation quarters to analyze completion trajectories, placement velocity, and wage retention derived from relational records.
        </p>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={cohorts}
        onRetry={loadData}
        isDataAvailable={(d) => d && d.length > 0}
        isEmptyDetails="No cohort performance records found matching the active global filters."
      >
        {activeCohort && (
          <>
            {/* Cohort Selector Pills */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>Select Focus Cohort:</span>
              {cohorts.map((c) => (
                <button
                  key={c.cohort}
                  className="cohort-pill"
                  onClick={() => setSelectedCohort(c.cohort)}
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: "8px",
                    border: selectedCohort === c.cohort ? "2px solid #2563eb" : "1px solid #cbd5e1",
                    background: selectedCohort === c.cohort ? "#eff6ff" : "white",
                    color: selectedCohort === c.cohort ? "#1d4ed8" : "#334155",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem"
                  }}
                >
                  <span>Cohort {c.cohort}</span>
                  {selectedCohort === c.cohort && <CheckCircle2 size={14} color="#2563eb" />}
                </button>
              ))}
            </div>

            {/* Active Cohort Highlight Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Trained in Scope</span>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
                  {activeCohort.trained}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 600 }}>Cohort {activeCohort.cohort}</span>
              </div>

              <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Completion Rate</span>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#16a34a", marginTop: "0.2rem" }}>
                  {activeCohort.completion_rate}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>Passed assessments</span>
              </div>

              <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Placement Velocity</span>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#2563eb", marginTop: "0.2rem" }}>
                  {activeCohort.placement_rate}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Formal employment</span>
              </div>

              <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>6M Retention Benchmark</span>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
                  {activeCohort.retention_6m}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>Sustained in role</span>
              </div>

              <div style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Wage Growth</span>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#16a34a", marginTop: "0.2rem" }}>
                  {activeCohort.wage_growth}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>Appraisal delta</span>
              </div>
            </div>

            {/* Comparative Chart (Section 23) */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.2rem", color: "#0f172a" }}>
                  Quarterly Cohort Benchmark Comparison (Chart View)
                </h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                  Visual comparison of placement velocity and 6-month retention rates across intakes.
                </p>
              </div>

              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="cohort" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}%`} />
                    <Tooltip
                      formatter={(val) => [`${val}%`]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Bar dataKey="placementRate" name="Placement Rate %" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="retentionRate" name="6M Retention %" fill="#16a34a" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="completionRate" name="Completion Rate %" fill="#93c5fd" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparative Matrix Table */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>
                  Cohort Cross-Comparison Matrix
                </h3>
              </div>

              <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
                <DataTable
                  columns={[
                    {
                      key: "cohort",
                      label: "Intake Cohort",
                      render: (row) => (
                        <div>
                          <strong style={{ color: "#0f172a" }}>{row.cohort}</strong>
                          {row.cohort === selectedCohort && (
                            <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", background: "#eff6ff", color: "#1d4ed8", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                              Selected Focus
                            </span>
                          )}
                        </div>
                      )
                    },
                    {
                      key: "trained",
                      label: "Trained Candidates",
                      render: (row) => <span>{row.trained}</span>
                    },
                    {
                      key: "completion_rate",
                      label: "Completion %",
                      render: (row) => <strong>{row.completion_rate}</strong>
                    },
                    {
                      key: "placement_rate",
                      label: "Placement %",
                      render: (row) => (
                        <span style={{ color: "#2563eb", fontWeight: 700 }}>
                          {row.placement_rate}
                        </span>
                      )
                    },
                    {
                      key: "retention_6m",
                      label: "6M Retention",
                      render: (row) => <strong>{row.retention_6m}</strong>
                    },
                    {
                      key: "wage_growth",
                      label: "Wage Growth",
                      render: (row) => <span style={{ color: "#16a34a", fontWeight: 700 }}>{row.wage_growth}</span>
                    },
                    {
                      key: "top_gap",
                      label: "Primary Identified Gap",
                      render: (row) => <span style={{ color: "#475569" }}>{row.top_gap}</span>
                    }
                  ]}
                  data={cohorts}
                />
              </div>
            </div>
          </>
        )}
      </DataStateWrapper>
    </div>
  );
}

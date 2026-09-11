import { useState, useEffect } from "react";
import { TrendingUp, Banknote, ShieldCheck, ArrowUpRight, BarChart2, Calendar, Award } from "lucide-react";
import { useFilters } from "../context/FilterContext";
import { platformService, usePlatformStore } from "../services/platformService";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function Employment() {
  const { filters } = useFilters();
  const storeState = usePlatformStore();
  const [longitudinal, setLongitudinal] = useState([]);
  const [wage, setWage] = useState(null);
  const [retention, setRetention] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [longRes, wageRes, retRes] = await Promise.all([
        platformService.getLongitudinalTracking(filters),
        platformService.getWageProgression(filters),
        platformService.getRetentionMetrics(filters)
      ]);

      if (longRes.data_available) {
        setLongitudinal(longRes.points || []);
      } else {
        setLongitudinal([]);
      }

      if (wageRes.data_available) {
        setWage(wageRes);
      } else {
        setWage(null);
      }

      if (retRes.data_available) {
        setRetention(retRes);
      } else {
        setRetention(null);
      }
    } catch (err) {
      console.error("Failed to load employment tracking data", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, storeState]);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const isDataAvailable = () => longitudinal.length > 0 || !!wage;

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <TrendingUp size={18} color="#2563eb" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              LONGITUDINAL TRACKING & WAGE APPRECIATION (A3, A4, A5)
            </span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
            Employment Outcome Tracking & Wage Growth
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
            Longitudinal skilling outcome trajectory over 3-month, 6-month, and 12-month post-placement intervals derived from relational employment and appraisal records.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setActiveTab("all")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: activeTab === "all" ? "#1e293b" : "white",
              color: activeTab === "all" ? "white" : "#475569",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Combined View
          </button>
          <button
            onClick={() => setActiveTab("retention")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: activeTab === "retention" ? "#1e293b" : "white",
              color: activeTab === "retention" ? "white" : "#475569",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Retention Focus
          </button>
          <button
            onClick={() => setActiveTab("wages")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: activeTab === "wages" ? "#1e293b" : "white",
              color: activeTab === "wages" ? "white" : "#475569",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Wage Progression Focus
          </button>
        </div>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={isDataAvailable() ? longitudinal : null}
        onRetry={loadData}
        isDataAvailable={isDataAvailable}
        isEmptyDetails="No longitudinal employment records match the active filter criteria."
      >
        {/* Retention Benchmarks Summary Cards (A5) */}
        {retention && (activeTab === "all" || activeTab === "retention") && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
            <div className="benchmark-card" style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>3-Month Retention Rate</span>
                <span style={{ fontSize: "0.75rem", background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                  {retention.retention_3m.status}
                </span>
              </div>
              <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a" }}>
                {retention.retention_3m.observed}%
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>National Standard: 70%</span>
            </div>

            <div className="benchmark-card" style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>6-Month Retention Rate</span>
                <span style={{ fontSize: "0.75rem", background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                  {retention.retention_6m.status}
                </span>
              </div>
              <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#2563eb" }}>
                {retention.retention_6m.observed}%
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Key Funding Milestone Target</span>
            </div>

            <div className="benchmark-card" style={{ background: "white", padding: "1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>12-Month Sustained Retention</span>
                <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                  {retention.retention_12m.status}
                </span>
              </div>
              <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a" }}>
                {retention.retention_12m.observed}%
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Long-term Career Stability</span>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: activeTab === "all" ? "1fr 1fr" : "1fr", gap: "2rem" }}>
          {/* A3: Longitudinal Retention Curve */}
          {(activeTab === "all" || activeTab === "retention") && (
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>
                    Longitudinal Employment Retention Curve (A3)
                  </h3>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                    Track cohort retention stability from initial hiring day through 12 months.
                  </p>
                </div>
              </div>

              <div style={{ height: "320px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={longitudinal} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}%`} />
                    <Tooltip
                      formatter={(val, name) => [`${val}%`, name === "rate" ? "Observed Retention" : "State Benchmark"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      name="Observed Retention %"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#2563eb" }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      name="State Benchmark %"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* A4: Wage Progression Bar Chart */}
          {(activeTab === "all" || activeTab === "wages") && wage && (
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0f172a" }}>
                    Wage Progression & Growth Curve (A4)
                  </h3>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                    Average monthly compensation appraisals across 3M, 6M, and 12M checkpoints.
                  </p>
                </div>
                <span style={{ fontSize: "0.75rem", background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                  {wage.growth_summary}
                </span>
              </div>

              <div style={{ height: "320px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wage.milestones} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip
                      formatter={(val, name) => [formatCurrency(val), name === "average" ? "Mean Salary" : "90th Percentile"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Bar dataKey="average" name="Mean Salary" fill="#16a34a" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="top10Pct" name="90th Percentile Top Wage" fill="#86efac" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </DataStateWrapper>
    </div>
  );
}

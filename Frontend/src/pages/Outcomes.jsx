import { useState, useEffect } from "react";
import {
  TrendingUp, AlertTriangle, Users, ChevronRight, X, Search,
  Briefcase, GraduationCap, CheckCircle2, UserMinus, ArrowRight,
  Shield, HelpCircle, MapPin, DollarSign, Target, Award, Layers
} from "lucide-react";
import { useFilters } from "../context/FilterContext";
import { platformService, usePlatformStore } from "../services/platformService";
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function Outcomes() {
  const { filters } = useFilters();
  const storeState = usePlatformStore();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drilldown selection state
  const [selectedNonPlacementKey, setSelectedNonPlacementKey] = useState("Location");
  const [selectedAttritionKey, setSelectedAttritionKey] = useState("Salary");
  const [candidateSearch, setCandidateSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getOutcomesWorkspace(filters);
      setWorkspace(res);
    } catch (err) {
      console.error("Failed to load outcomes workspace", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, storeState.last_updated]);

  const summary = workspace?.summary;
  const funnel = workspace?.funnel || [];
  const distribution = workspace?.distribution || [];
  const employmentOverTime = workspace?.employment_over_time || [];
  const nonPlacement = workspace?.non_placement;
  const attrition = workspace?.attrition;
  const diagnosis = workspace?.diagnosis || [];

  // Active selected drilldowns
  const selectedNpData = nonPlacement?.categories?.[selectedNonPlacementKey];
  const selectedAttData = attrition?.categories?.[selectedAttritionKey];

  return (
    <div style={{ maxWidth: "1440px", margin: "0 auto", paddingBottom: "4rem" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <TrendingUp size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            ADMIN OUTCOME INTELLIGENCE & EVALUATION WORKSPACE
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
              Programme Outcomes Workspace
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
              Holistic outcome evaluation, longitudinal tracking, and evidence-grounded diagnosis for candidate transitions.
            </p>
          </div>
          <div style={{ background: "#f8fafc", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
            <span style={{ color: "#64748b" }}>Active Evaluation Scope: </span>
            <strong style={{ color: "#2563eb" }}>{workspace?.total || 0}</strong> candidates
          </div>
        </div>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={workspace}
        onRetry={loadData}
        isDataAvailable={(d) => d && d.data_available}
        isEmptyDetails="No candidate outcome records found for the selected filter scope."
      >
        {workspace && (
          <>
            {/* Top Summary: 10 Dynamically Calculated KPIs (Section 16) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Total Trained</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
                  {summary?.total_trained?.toLocaleString() || 0}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#2563eb", fontWeight: 600 }}>Enrolled Pool</span>
              </div>

              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Certified Pass</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2563eb", marginTop: "0.2rem" }}>
                  {summary?.certified?.toLocaleString() || 0}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                  {Math.round(((summary?.certified || 0) / (summary?.total_trained || 1)) * 100)}% pass rate
                </span>
              </div>

              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Placed (Employed)</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16a34a", marginTop: "0.2rem" }}>
                  {summary?.employed?.toLocaleString() || 0}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 600 }}>Formal Corporate Jobs</span>
              </div>

              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Self-Employed</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0d9488", marginTop: "0.2rem" }}>
                  {summary?.self_employed?.toLocaleString() || 0}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#0d9488" }}>Commercial Enterprises</span>
              </div>

              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Apprentices</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#7c3aed", marginTop: "0.2rem" }}>
                  {summary?.apprentices?.toLocaleString() || 0}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#7c3aed" }}>Industrial Contracts</span>
              </div>

              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Unemployed</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b", marginTop: "0.2rem" }}>
                  {summary?.unemployed?.toLocaleString() || 0}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#b45309", fontWeight: 600 }}>Seeking Placement</span>
              </div>

              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Employment Rate</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16a34a", marginTop: "0.2rem" }}>
                  {summary?.employment_percentage}%
                </div>
                <span style={{ fontSize: "0.7rem", color: "#16a34a" }}>Active in Economy</span>
              </div>

              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>6M Retention</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
                  {summary?.retention_6m_percentage}%
                </div>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>3M: {summary?.retention_3m_percentage}% • 12M: {summary?.retention_12m_percentage}%</span>
              </div>

              <div style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Average Wage</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
                  {summary?.average_wage > 0 ? `₹${summary.average_wage.toLocaleString()}` : "N/A"}
                </div>
                <span style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: 700 }}>
                  +{summary?.wage_growth_percentage}% Increment
                </span>
              </div>
            </div>

            {/* Section A: Outcome Funnel & Outcome Distribution Donut (Section 18 & 19) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
              {/* Outcome Funnel (Section 18) */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Layers size={18} color="#2563eb" /> 6-Stage Outcome Funnel
                    </h3>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                      Conversion throughput from initial enrollment to sustained employment.
                    </p>
                  </div>
                  <span style={{ fontSize: "0.75rem", background: "#eff6ff", color: "#1d4ed8", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                    Relational Funnel
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {funnel.map((stage) => (
                    <div key={stage.id} style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>{stage.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <strong style={{ color: stage.color, fontSize: "0.95rem" }}>{stage.count}</strong>
                          <span style={{ fontSize: "0.75rem", color: "#64748b", minWidth: "40px", textAlign: "right" }}>
                            {stage.percentage}%
                          </span>
                        </div>
                      </div>
                      {/* Bar indicator */}
                      <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(stage.percentage, 100)}%`, height: "100%", background: stage.color, borderRadius: "3px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outcome Distribution Donut Chart (Section 19) */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Target size={18} color="#16a34a" /> Outcome Distribution
                    </h3>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                      Proportional breakdown of active candidates across primary economic destinations.
                    </p>
                  </div>
                  <span style={{ fontSize: "0.75rem", background: "#f0fdf4", color: "#166534", padding: "3px 8px", borderRadius: "6px", fontWeight: 700 }}>
                    Donut Breakdown
                  </span>
                </div>

                <div style={{ height: "260px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name, item) => [`${val} Trainees (${item.payload.percentage}%)`, name]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Section B: Employment Over Time Trend Line (Section 20) */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <TrendingUp size={18} color="#2563eb" /> Employment Over Time (3M → 6M → 12M Trajectory)
                  </h3>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                    Longitudinal cohort retention trajectory compared against state statutory benchmark (68%).
                  </p>
                </div>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#2563eb", fontWeight: 700 }}>
                    <span style={{ width: "10px", height: "10px", background: "#2563eb", borderRadius: "50%" }}></span> Observed Cohort Rate
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#94a3b8", fontWeight: 700 }}>
                    <span style={{ width: "10px", height: "10px", background: "#cbd5e1", borderRadius: "50%" }}></span> State Benchmark
                  </span>
                </div>
              </div>

              <div style={{ height: "240px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={employmentOverTime} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="milestone" tick={{ fontSize: 11 }} />
                    <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      formatter={(v, name) => [`${v}%`, name === "rate" ? "Cohort Employment Rate" : "State Benchmark"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    />
                    <Line type="monotone" dataKey="rate" name="rate" stroke="#2563eb" strokeWidth={3} dot={{ r: 6, fill: "#2563eb" }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="benchmark" name="benchmark" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Section C: Why People Don't Get Jobs (Section 21 & 22) */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <AlertTriangle size={20} color="#ea580c" /> Why People Don't Get Jobs
                  </h3>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Distribution of reported non-placement reasons. Click any category segment or pill to open full diagnostic inspection.
                  </p>
                </div>
                <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#b45309", padding: "4px 9px", borderRadius: "6px", fontWeight: 700 }}>
                  Interactive Root-Cause Diagnosis
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center" }}>
                {/* Donut Chart */}
                <div style={{ height: "260px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={nonPlacement?.distribution || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        onClick={(entry) => setSelectedNonPlacementKey(entry.name)}
                        cursor="pointer"
                      >
                        {(nonPlacement?.distribution || []).map((entry) => (
                          <Cell
                            key={`cell-np-${entry.name}`}
                            fill={entry.color}
                            stroke={selectedNonPlacementKey === entry.name ? "#0f172a" : "none"}
                            strokeWidth={selectedNonPlacementKey === entry.name ? 2 : 0}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name, item) => [`${val} Unplaced (${item.payload.percentage}%)`, item.payload.label]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Clickable Reason Pills */}
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    SELECT REASON TO DIAGNOSE
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                    {Object.values(nonPlacement?.categories || {}).map((cat) => {
                      const isSelected = selectedNonPlacementKey === cat.key;
                      return (
                        <button
                          key={cat.key}
                          id={`np-reason-${cat.key.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                          onClick={() => setSelectedNonPlacementKey(cat.key)}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: isSelected ? "#fff7ed" : "#f8fafc",
                            border: isSelected ? "2px solid #ea580c" : "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "0.6rem 0.9rem",
                            cursor: "pointer",
                            textAlign: "left"
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "0.85rem", color: isSelected ? "#9a3412" : "#1e293b" }}>
                              {cat.label}
                            </strong>
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                              Category: {cat.key}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <strong style={{ color: cat.color, fontSize: "0.95rem" }}>{cat.count}</strong>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>({cat.percentage}%)</span>
                            <ChevronRight size={14} color={isSelected ? "#ea580c" : "#94a3b8"} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Detail Panel: WHY THIS AREA MAY BE LAGGING (Section 22) */}
              {selectedNpData && (
                <div style={{ marginTop: "1.75rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #fed7aa", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ background: "#ea580c", color: "white", padding: "2px 7px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 800 }}>
                          DIAGNOSTIC DETAIL
                        </span>
                        <h4 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>
                          Selected Reason: "{selectedNpData.label}"
                        </h4>
                      </div>
                      <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                        Affecting <strong>{selectedNpData.count}</strong> candidates ({selectedNpData.percentage}% of unplaced group) under current scope.
                      </p>
                    </div>

                    <span style={{ fontSize: "0.8rem", background: "#ffedd5", color: "#9a3412", padding: "4px 9px", borderRadius: "6px", fontWeight: 700 }}>
                      Evidence-Grounded Root Cause
                    </span>
                  </div>

                  {/* Why this area may be lagging explanation */}
                  <div style={{ background: "#fff7ed", border: "1px solid #fdba74", borderRadius: "8px", padding: "1rem", marginBottom: "1.25rem" }}>
                    <div style={{ fontWeight: 800, color: "#9a3412", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                      WHY THIS AREA MAY BE LAGGING (Evidence-Derived Analysis)
                    </div>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#7c2d12", lineHeight: 1.4 }}>
                      {selectedNpData.lagging_explanation}
                    </p>
                  </div>

                  {/* Geographic & Programme Breakdown */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                    <div style={{ background: "white", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Programmes Affected</span>
                      <div style={{ marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {selectedNpData.programmes_affected.slice(0, 4).map(p => (
                          <div key={p.name} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                            <span style={{ color: "#334155" }}>{p.name}</span>
                            <strong style={{ color: "#2563eb" }}>{p.count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "white", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Districts Affected</span>
                      <div style={{ marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {selectedNpData.districts_affected.slice(0, 4).map(d => (
                          <div key={d.name} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                            <span style={{ color: "#334155" }}>{d.name}</span>
                            <strong style={{ color: "#ea580c" }}>{d.count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "white", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Cohorts Affected</span>
                      <div style={{ marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {selectedNpData.cohorts_affected.slice(0, 4).map(c => (
                          <div key={c.name} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                            <span style={{ color: "#334155" }}>{c.name}</span>
                            <strong style={{ color: "#475569" }}>{c.count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sample Candidate Dossiers */}
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      SAMPLE AFFECTED CANDIDATE RECORDS ({selectedNpData.sample_trainees.length})
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem", marginTop: "0.5rem" }}>
                      {selectedNpData.sample_trainees.slice(0, 6).map(t => (
                        <div key={t.id} style={{ background: "white", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.78rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                            <span style={{ color: "#0f172a" }}>{t.name}</span>
                            <span style={{ color: "#2563eb", fontFamily: "monospace" }}>{t.id}</span>
                          </div>
                          <div style={{ color: "#64748b", marginTop: "2px" }}>
                            {t.programme} • {t.district}
                          </div>
                          <div style={{ color: "#b45309", marginTop: "4px", fontSize: "0.72rem", background: "#fef3c7", padding: "2px 6px", borderRadius: "4px" }}>
                            Reported barrier: {t.reported_barrier}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section D: Why People Leave Jobs (Section 24 & 25) */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <UserMinus size={20} color="#e11d48" /> Why People Leave Jobs
                  </h3>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Distribution of reported post-placement attrition drivers. Click any segment to uncover the pattern.
                  </p>
                </div>
                <span style={{ fontSize: "0.75rem", background: "#ffe4e6", color: "#e11d48", padding: "4px 9px", borderRadius: "6px", fontWeight: 700 }}>
                  Interactive Attrition Diagnosis
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "center" }}>
                {/* Donut Chart */}
                <div style={{ height: "260px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attrition?.distribution || []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        onClick={(entry) => setSelectedAttritionKey(entry.name)}
                        cursor="pointer"
                      >
                        {(attrition?.distribution || []).map((entry) => (
                          <Cell
                            key={`cell-att-${entry.name}`}
                            fill={entry.color}
                            stroke={selectedAttritionKey === entry.name ? "#0f172a" : "none"}
                            strokeWidth={selectedAttritionKey === entry.name ? 2 : 0}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name, item) => [`${val} Exits (${item.payload.percentage}%)`, item.payload.label]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Clickable Reason Pills */}
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    SELECT REASON TO EXAMINE PATTERN
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                    {Object.values(attrition?.categories || {}).map((cat) => {
                      const isSelected = selectedAttritionKey === cat.key;
                      return (
                        <button
                          key={cat.key}
                          id={`att-reason-${cat.key.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                          onClick={() => setSelectedAttritionKey(cat.key)}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: isSelected ? "#fff1f2" : "#f8fafc",
                            border: isSelected ? "2px solid #e11d48" : "1px solid #e2e8f0",
                            borderRadius: "8px",
                            padding: "0.6rem 0.9rem",
                            cursor: "pointer",
                            textAlign: "left"
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "0.85rem", color: isSelected ? "#9f1239" : "#1e293b" }}>
                              {cat.label}
                            </strong>
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                              Factor: {cat.key}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <strong style={{ color: cat.color, fontSize: "0.95rem" }}>{cat.count}</strong>
                            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>({cat.percentage}%)</span>
                            <ChevronRight size={14} color={isSelected ? "#e11d48" : "#94a3b8"} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Detail Panel: What pattern are we seeing? (Section 25) */}
              {selectedAttData && (
                <div style={{ marginTop: "1.75rem", background: "#f8fafc", borderRadius: "12px", border: "1px solid #fecdd3", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ background: "#e11d48", color: "white", padding: "2px 7px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 800 }}>
                          PATTERN ANALYSIS
                        </span>
                        <h4 style={{ margin: 0, fontSize: "1.2rem", color: "#0f172a" }}>
                          Why People Leave Because of {selectedAttData.key}
                        </h4>
                      </div>
                      <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                        Affected Count: <strong>{selectedAttData.count}</strong> departures ({selectedAttData.percentage}% of attrited group).
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", background: "white", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.8rem" }}>
                      <div>
                        <span style={{ color: "#64748b" }}>Exit Wage: </span>
                        <strong style={{ color: "#e11d48" }}>₹{selectedAttData.average_wage.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b" }}>Platform Avg: </span>
                        <strong style={{ color: "#16a34a" }}>₹{selectedAttData.platform_average_wage.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  {/* What pattern are we seeing? explanation */}
                  <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", padding: "1rem", marginBottom: "1.25rem" }}>
                    <div style={{ fontWeight: 800, color: "#9f1239", fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                      WHAT PATTERN ARE WE SEEING? (Derived Telemetry Findings)
                    </div>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#881337", lineHeight: 1.4 }}>
                      {selectedAttData.pattern_observed}
                    </p>
                  </div>

                  {/* Distribution across Programmes & Districts */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                    <div style={{ background: "white", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Concentration by Programme</span>
                      <div style={{ marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {selectedAttData.programmes_affected.slice(0, 4).map(p => (
                          <div key={p.name} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                            <span style={{ color: "#334155" }}>{p.name}</span>
                            <strong style={{ color: "#2563eb" }}>{p.count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "white", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Concentration by District</span>
                      <div style={{ marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {selectedAttData.districts_affected.slice(0, 4).map(d => (
                          <div key={d.name} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                            <span style={{ color: "#334155" }}>{d.name}</span>
                            <strong style={{ color: "#e11d48" }}>{d.count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: "white", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>Concentration by Provider</span>
                      <div style={{ marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {selectedAttData.providers_affected.slice(0, 4).map(pr => (
                          <div key={pr.name} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                            <span style={{ color: "#334155" }}>{pr.name}</span>
                            <strong style={{ color: "#475569" }}>{pr.count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section E: Analytical Outcome Diagnosis & Associated Factors (Section 23 & 26) */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Shield size={20} color="#2563eb" /> Analytical Outcome Diagnosis (Associated Factors)
                  </h3>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Evidence-derived analysis for underperforming areas. Formulated using associated factors and observed patterns.
                  </p>
                </div>
                <span style={{ fontSize: "0.75rem", background: "#eff6ff", color: "#1d4ed8", padding: "4px 9px", borderRadius: "6px", fontWeight: 700 }}>
                  Policy Evidence Base
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                {diagnosis.map((diag) => (
                  <div key={diag.id} style={{ background: "#f8fafc", borderRadius: "10px", border: "1px solid #cbd5e1", padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#2563eb", textTransform: "uppercase" }}>
                          PROGRAMME EVALUATION DIAGNOSIS
                        </span>
                        <h4 style={{ margin: "0.2rem 0 0 0", fontSize: "1.1rem", color: "#0f172a" }}>
                          {diag.area}
                        </h4>
                      </div>
                      <span style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: diag.severity === "High Priority" ? "#fee2e2" : "#fef3c7",
                        color: diag.severity === "High Priority" ? "#b91c1c" : "#b45309"
                      }}>
                        {diag.severity}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "#334155", marginBottom: "0.75rem", background: "white", padding: "0.6rem 0.85rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                      <strong>Observed Metric:</strong> {diag.observation}
                    </div>

                    <div style={{ marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                        Key Associated Factors:
                      </span>
                      <ul style={{ margin: "0.3rem 0 0 0", paddingLeft: "1.2rem", fontSize: "0.8rem", color: "#334155" }}>
                        {diag.associated_factors.map((af, i) => (
                          <li key={i} style={{ marginBottom: "0.25rem" }}>{af}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.4, borderTop: "1px solid #e2e8f0", paddingTop: "0.6rem" }}>
                      <div><strong>Observed Pattern:</strong> {diag.observed_pattern}</div>
                      <div style={{ marginTop: "0.25rem" }}><strong>Potential Contributing Factor:</strong> {diag.potential_contributing_factors}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DataStateWrapper>
    </div>
  );
}

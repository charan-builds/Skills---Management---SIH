import { useState, useEffect } from "react";
import { 
  Target, BarChart3, Layers, BookOpen, CheckCircle, 
  AlertTriangle, ArrowUpRight, TrendingDown, Filter, X, Users, Building, ChevronRight
} from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { useFilters } from "../context/FilterContext";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import DataTable from "../components/common/DataTable";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis
} from "recharts";

export default function SkillGaps() {
  const { filters, updateFilter } = useFilters();
  const store = usePlatformStore();
  const [activeTab, setActiveTab] = useState("ranked-gaps"); // 'ranked-gaps' | 'demand-supply' | 'curriculum' | 'relevance'

  const [skillGapsData, setSkillGapsData] = useState(null);
  const [demandSupplyData, setDemandSupplyData] = useState(null);
  const [curriculumData, setCurriculumData] = useState(null);
  const [relevanceData, setRelevanceData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drilldown state for Section 15
  const [selectedSkill, setSelectedSkill] = useState(null);

  const loadAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gaps, ds, curr, rel] = await Promise.all([
        platformService.getSkillGaps(filters),
        platformService.getDemandVsSupply(filters),
        platformService.getCurriculumMapping(filters),
        platformService.getTrainingRelevance(filters)
      ]);
      setSkillGapsData(gaps);
      setDemandSupplyData(ds);
      setCurriculumData(curr);
      setRelevanceData(rel);
    } catch (err) {
      console.error("Failed to load skill analytics", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, [filters, store.last_updated]);

  return (
    <div style={{ maxWidth: "1440px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <Target size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            LABOUR MARKET ALIGNMENT & CURRICULUM INTELLIGENCE (A6, A7, A16, A17)
          </span>
        </div>
        <h1 style={{ fontSize: "1.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          Skill-Gap & Labour Market Intelligence
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Authoritative intelligence linking industry demand, trainee gaps, syllabus benchmarks, and provider training relevance derived from relational telemetry.
        </p>
      </div>

      {/* Analytical View Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("ranked-gaps")}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "ranked-gaps" ? "#2563eb" : "transparent",
            color: activeTab === "ranked-gaps" ? "white" : "#64748b",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <BarChart3 size={16} /> Ranked Skill Gaps (A6)
        </button>

        <button
          onClick={() => setActiveTab("demand-supply")}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "demand-supply" ? "#2563eb" : "transparent",
            color: activeTab === "demand-supply" ? "white" : "#64748b",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <Layers size={16} /> Demand vs Supply (A16)
        </button>

        <button
          onClick={() => setActiveTab("curriculum")}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "curriculum" ? "#2563eb" : "transparent",
            color: activeTab === "curriculum" ? "white" : "#64748b",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <BookOpen size={16} /> Curriculum-Skill Mapping (A17)
        </button>

        <button
          onClick={() => setActiveTab("relevance")}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "relevance" ? "#2563eb" : "transparent",
            color: activeTab === "relevance" ? "white" : "#64748b",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem"
          }}
        >
          <CheckCircle size={16} /> Training Relevance Matrix (A7)
        </button>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={skillGapsData}
        onRetry={loadAllAnalytics}
        isDataAvailable={(d) => Boolean(d && d.data_available)}
        isEmptyDetails="No skill telemetry records found for current filter selection."
      >
        {/* TAB 1: RANKED SKILL GAPS (Section 15) */}
        {activeTab === "ranked-gaps" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: selectedSkill ? "1fr 480px" : "1fr", gap: "2rem" }}>
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.2rem", color: "#0f172a" }}>
                      Ranked Skill Gaps (A6)
                    </h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                      Aggregated frequency of reported skill deficits across candidates and employer feedback. Click any row or bar to inspect drilldown.
                    </p>
                  </div>
                </div>

                <div style={{ height: `${Math.max(380, (skillGapsData?.skills?.length || 0) * 48)}px`, marginBottom: "1.5rem" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={skillGapsData?.skills || []}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 160, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="skill" tick={{ fontSize: 11, fill: "#334155" }} width={150} />
                      <Tooltip
                        formatter={(val, name, item) => [`${val} Citations (${item.payload.percentage}%)`, "Frequency"]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }}
                      />
                      <Bar
                        dataKey="affected_trainees"
                        fill="#2563eb"
                        radius={[0, 6, 6, 0]}
                        cursor="pointer"
                        onClick={(entry) => setSelectedSkill(entry)}
                      >
                        {(skillGapsData?.skills || []).map((entry, index) => (
                          <Cell
                            key={`cell-sg-${index}`}
                            fill={selectedSkill?.skill === entry.skill ? "#1e40af" : "#2563eb"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Ranked Gaps Table */}
                <DataTable
                  columns={[
                    {
                      key: "skill",
                      label: "Skill Deficit",
                      render: (row) => (
                        <button
                          onClick={() => setSelectedSkill(row)}
                          style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", textAlign: "left", padding: 0 }}
                        >
                          {row.skill}
                        </button>
                      )
                    },
                    {
                      key: "affected_trainees",
                      label: "Reported Citations",
                      render: (row) => <strong>{row.affected_trainees}</strong>
                    },
                    {
                      key: "percentage",
                      label: "Scope Penetration",
                      render: (row) => (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ flex: 1, height: "6px", background: "#e2e8f0", borderRadius: "3px", minWidth: "60px" }}>
                            <div style={{ width: `${row.percentage}%`, height: "100%", background: "#2563eb", borderRadius: "3px" }} />
                          </div>
                          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{row.percentage}%</span>
                        </div>
                      )
                    },
                    {
                      key: "affected_programmes",
                      label: "Programmes",
                      render: (row) => (
                        <span style={{ fontSize: "0.8rem", color: "#475569" }}>
                          {row.affected_programmes?.join(", ") || "All"}
                        </span>
                      )
                    }
                  ]}
                  data={skillGapsData?.skills || []}
                />
              </div>

              {/* Skill Gap Drilldown Panel (Section 15) */}
              {selectedSkill && (
                <div style={{ background: "white", borderRadius: "14px", border: "1px solid #cbd5e1", padding: "1.75rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", height: "fit-content" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                        SKILL DEFICIT DRILLDOWN
                      </span>
                      <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.2rem", color: "#0f172a" }}>
                        {selectedSkill.skill}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {selectedSkill.affected_trainees} Citations ({selectedSkill.percentage}% of cohort)
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedSkill(null)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div style={{ marginBottom: "1.25rem" }}>
                    <strong style={{ fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                      Affected Programmes:
                    </strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {(selectedSkill.affected_programmes || []).map(p => (
                        <span key={p} style={{ background: "#eff6ff", color: "#1d4ed8", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.25rem" }}>
                    <strong style={{ fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "0.4rem" }}>
                      Affected Cohorts:
                    </strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      {(selectedSkill.affected_cohorts || []).map(c => (
                        <span key={c} style={{ background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem" }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "#334155", display: "block", marginBottom: "0.5rem" }}>
                      Sample Trainees Reporting Gap:
                    </strong>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {(selectedSkill.sample_trainees || []).map(t => (
                        <div key={t.id} style={{ background: "#f8fafc", padding: "0.6rem 0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.8rem" }}>
                          <strong style={{ color: "#0f172a" }}>{t.name}</strong> ({t.id})
                          <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{t.programme} • {t.district}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DEMAND VS SUPPLY (Section 16, A16) */}
        {activeTab === "demand-supply" && (
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.2rem", color: "#0f172a" }}>
                Industry Demand vs Training Supply Matrix (A16)
              </h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                Macro comparison of training institute supply versus verified employer open positions across sectors.
              </p>
            </div>

            <DataTable
              columns={[
                {
                  key: "skill",
                  label: "Competency Domain",
                  render: (row) => <strong style={{ color: "#0f172a" }}>{row.skill}</strong>
                },
                {
                  key: "sector",
                  label: "Industry Sector",
                  render: (row) => <span style={{ color: "#475569" }}>{row.sector}</span>
                },
                {
                  key: "training_supply",
                  label: "Training Supply",
                  render: (row) => <span>{row.training_supply} trainees</span>
                },
                {
                  key: "employer_demand",
                  label: "Corporate Demand",
                  render: (row) => <span>{row.employer_demand} reqs</span>
                },
                {
                  key: "gap",
                  label: "Supply Gap",
                  render: (row) => (
                    <span style={{ color: row.gap < 0 ? "#b91c1c" : "#15803d", fontWeight: 700 }}>
                      {row.gap}
                    </span>
                  )
                },
                {
                  key: "priority",
                  label: "Priority Index",
                  render: (row) => (
                    <span style={{
                      background: row.priority === "Critical Gap" ? "#fee2e2" : row.priority === "High Gap" ? "#fef3c7" : "#dcfce7",
                      color: row.priority === "Critical Gap" ? "#991b1b" : row.priority === "High Gap" ? "#b45309" : "#166534",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "0.75rem",
                      fontWeight: 700
                    }}>
                      {row.priority}
                    </span>
                  )
                }
              ]}
              data={demandSupplyData?.records || []}
            />
          </div>
        )}

        {/* TAB 3: CURRICULUM-SKILL MAPPING (Section 17, A17) */}
        {activeTab === "curriculum" && (
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.2rem", color: "#0f172a" }}>
                Curriculum to Skill Competency Delta (A17)
              </h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                Target syllabus proficiency benchmarks compared against observed candidate assessment grades.
              </p>
            </div>

            <DataTable
              columns={[
                {
                  key: "programme",
                  label: "Programme",
                  render: (row) => <strong style={{ color: "#0f172a" }}>{row.programme}</strong>
                },
                {
                  key: "module",
                  label: "Course Module",
                  render: (row) => row.module || row.course_module
                },
                {
                  key: "skill",
                  label: "Target Skill",
                  render: (row) => row.skill
                },
                {
                  key: "target_proficiency",
                  label: "Target Score",
                  render: (row) => `${row.target || row.target_proficiency}%`
                },
                {
                  key: "observed_proficiency",
                  label: "Observed Score",
                  render: (row) => <strong>{row.observed || row.observed_proficiency}%</strong>
                },
                {
                  key: "gap",
                  label: "Competency Delta",
                  render: (row) => (
                    <span style={{
                      color: String(row.gap).includes("-") ? "#b91c1c" : "#15803d",
                      fontWeight: 700
                    }}>
                      {row.gap}
                    </span>
                  )
                },
                {
                  key: "status",
                  label: "Status",
                  render: (row) => (
                    <span style={{
                      background: row.status === "Deficit" ? "#fee2e2" : row.status === "Aligned" ? "#eff6ff" : "#dcfce7",
                      color: row.status === "Deficit" ? "#991b1b" : row.status === "Aligned" ? "#1d4ed8" : "#166534",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "0.75rem",
                      fontWeight: 700
                    }}>
                      {row.status}
                    </span>
                  )
                }
              ]}
              data={curriculumData?.records || []}
            />
          </div>
        )}

        {/* TAB 4: TRAINING RELEVANCE (Section 18, A7) */}
        {activeTab === "relevance" && (
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.2rem", color: "#0f172a" }}>
                Training Relevance vs Employment Rate Correlation (A7)
              </h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                Multi-quadrant correlation measuring whether high-placement programmes also deliver high curriculum relevance in day-to-day employment.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
              {(relevanceData?.programmes || []).map(p => (
                <div key={p.name} style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{p.sector}</span>
                  <h4 style={{ margin: "0.2rem 0 0.5rem 0", fontSize: "1.05rem", color: "#0f172a" }}>{p.name}</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Employment Rate</span>
                      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#16a34a" }}>{p.employment_rate}%</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Skill Relevance</span>
                      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#2563eb" }}>{p.skill_relevance}%</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: p.quadrant.includes("High Employment + High") ? "#dcfce7" : "#eff6ff",
                    color: p.quadrant.includes("High Employment + High") ? "#166534" : "#1d4ed8"
                  }}>
                    {p.quadrant}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
}

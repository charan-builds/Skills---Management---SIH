import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, TrendingUp, AlertTriangle, Users, GraduationCap, Briefcase,
  Award, ShieldCheck, Banknote, Target, ChevronRight, BarChart3
} from "lucide-react";
import { usePlatformStore, platformService } from "../services/platformService";
import { useFilters } from "../context/FilterContext";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function ProgrammeProfile() {
  const navigate = useNavigate();
  const { programmeId: id } = useParams();
  const store = usePlatformStore();
  const { filters } = useFilters();

  const [programme, setProgramme] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [wage, setWage] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [nonPlacement, setNonPlacement] = useState([]);
  const [attrition, setAttrition] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProgrammeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const rawProgrammes = store.programmes || [];
      const found = rawProgrammes.find(p => p.id === id || p.name === id) || rawProgrammes[0];
      setProgramme(found);

      // Scoped filters for this programme combined with global filters
      const scopedFilters = { ...filters, course: found.name };

      const [dashRes, funRes, wageRes, sgRes, npRes, attRes] = await Promise.all([
        platformService.getAdminDashboard(scopedFilters),
        platformService.getOutcomeFunnel(scopedFilters),
        platformService.getWageProgression(scopedFilters),
        platformService.getSkillGaps(scopedFilters),
        platformService.getNonPlacementReasons(scopedFilters),
        platformService.getAttritionReasons(scopedFilters)
      ]);

      setMetrics(dashRes);
      setFunnel(funRes);
      setWage(wageRes);
      setSkillGaps(sgRes.skills || []);
      setNonPlacement(npRes.reasons || []);
      setAttrition(attRes.reasons || []);
    } catch (err) {
      console.error("Failed to load programme profile:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgrammeData();
  }, [id, filters, store.last_updated]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/programmes")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "white",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          padding: "0.5rem 1rem",
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "#334155",
          cursor: "pointer",
          marginBottom: "1.5rem"
        }}
      >
        <ArrowLeft size={16} /> Back to Programmes
      </button>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={programme}
        onRetry={loadProgrammeData}
        isDataAvailable={(d) => Boolean(d)}
        isEmptyDetails={`No programme records found for: ${id}`}
      >
        {programme && (
          <>
            {/* Programme Header Card */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "2rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 800 }}>
                      {programme.id}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
                      Sector: {programme.sector} • {programme.duration_weeks} Weeks
                    </span>
                  </div>
                  <h1 style={{ fontSize: "1.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.5rem 0" }}>
                    {programme.name}
                  </h1>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
                    Comprehensive outcome evaluation derived strictly from the relational database under current scope.
                  </p>
                </div>

                <div style={{ background: "#f8fafc", padding: "1rem 1.5rem", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "right" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Trainees in Scope</span>
                  <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#2563eb" }}>
                    {metrics?.total || 0}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>
                    {metrics?.breakdown?.completed || 0} completed
                  </span>
                </div>
              </div>
            </div>

            {/* Complete Outcome KPIs Grid (Section 24) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
              {(metrics?.stats || []).slice(0, 6).map((s) => (
                <div key={s.title} className="kpi-card" style={{ background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>{s.title}</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>{s.value}</div>
                  <span style={{ fontSize: "0.7rem", color: "#16a34a" }}>{s.change}</span>
                </div>
              ))}
            </div>

            {/* Funnel & Wage Trajectory Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
              {/* Funnel */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <TrendingUp size={18} color="#2563eb" /> Programme Outcome Funnel
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {(funnel?.stages || []).map((st) => (
                    <div key={st.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", background: "#f8fafc", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.85rem", color: "#334155", fontWeight: 600 }}>{st.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <strong style={{ color: st.color }}>{st.count}</strong>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", minWidth: "45px", textAlign: "right" }}>{st.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wage Progression Curve */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Banknote size={18} color="#16a34a" /> Programme Wage Growth
                </h3>
                <div style={{ height: "240px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wage?.milestones || []} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v/1000}k`} />
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                      <Bar dataKey="average" name="Mean Salary" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Diagnostic Sections: Non-Placement, Attrition, and Skill Gaps */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
              {/* Top Skill Gaps */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 0.85rem 0", fontSize: "1.05rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Target size={16} color="#2563eb" /> Top Skill Gaps
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {skillGaps.slice(0, 5).map((g) => (
                    <div key={g.skill} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.4rem" }}>
                      <span style={{ color: "#334155" }}>{g.skill}</span>
                      <strong style={{ color: "#2563eb" }}>{g.affected_trainees}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-Placement Reasons */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 0.85rem 0", fontSize: "1.05rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <AlertTriangle size={16} color="#f59e0b" /> Non-Placement Factors
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {nonPlacement.slice(0, 5).map((r) => (
                    <div key={r.reason} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.4rem" }}>
                      <span style={{ color: "#334155" }}>{r.reason}</span>
                      <strong style={{ color: "#b45309" }}>{r.count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attrition Drivers */}
              <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 0.85rem 0", fontSize: "1.05rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <TrendingUp size={16} color="#e11d48" /> Attrition Factors
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {attrition.slice(0, 5).map((a) => (
                    <div key={a.reason} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.4rem" }}>
                      <span style={{ color: "#334155" }}>{a.reason}</span>
                      <strong style={{ color: "#e11d48" }}>{a.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </DataStateWrapper>
    </div>
  );
}

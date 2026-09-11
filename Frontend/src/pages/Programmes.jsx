import { useState, useMemo, useEffect } from "react";
import {
  Search, ArrowRight, Layers, RotateCcw, GraduationCap, Building2, MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/common/DataTable";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import { usePlatformStore, platformService } from "../services/platformService";
import { useFilters } from "../context/FilterContext";

export default function Programmes() {
  const navigate = useNavigate();
  const store = usePlatformStore();
  const { filters } = useFilters();

  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [sortBy, setSortBy] = useState("employment_desc");
  const [viewMode, setViewMode] = useState("cards"); // "cards", "table"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const programmesWithMetrics = useMemo(() => {
    const rawProgrammes = store.programmes || [];
    const allTrainees = store.trainees || [];

    return rawProgrammes.map(p => {
      const pTrainees = allTrainees.filter(t => t.programme_id === p.id || t.programme_name === p.name);
      const total = pTrainees.length;
      const completed = pTrainees.filter(t => t.training_status === "Completed").length;
      const placed = pTrainees.filter(t => t.employment?.status === "EMPLOYED" || t.employment?.status === "APPRENTICESHIP").length;
      const retained6M = pTrainees.filter(t => t.retention?.retention_6m === "Retained").length;
      const eligibleRetention = pTrainees.filter(t => t.retention?.retention_6m).length || 1;

      // Find primary provider and district for this programme
      const primaryProvider = pTrainees[0]?.provider_name || "TATA STRIVE";
      const primaryDistrict = pTrainees[0]?.district || "Mumbai";

      const empRate = total > 0 ? Math.round((placed / total) * 100) : 0;
      const retRate = total > 0 ? Math.round((retained6M / eligibleRetention) * 100) : 0;

      return {
        id: p.id,
        name: p.name,
        sector: p.sector,
        duration_weeks: p.duration_weeks,
        provider: primaryProvider,
        district: primaryDistrict,
        enrolled: total,
        completed,
        employment_rate: `${empRate}%`,
        retention_12m: `${retRate}%`,
        status: empRate >= 80 ? "HIGH_PERFORMER" : empRate >= 70 ? "OPTIMAL" : "WATCHLIST"
      };
    });
  }, [store.programmes, store.trainees]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleClearFilters = () => {
    setSearch("");
    setDistrictFilter("All Districts");
    setSortBy("employment_desc");
  };

  const filteredProgrammes = useMemo(() => {
    let result = programmesWithMetrics.filter((prog) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        prog.name?.toLowerCase().includes(q) ||
        prog.provider?.toLowerCase().includes(q) ||
        prog.id?.toLowerCase().includes(q);

      const matchesDistrict =
        districtFilter === "All Districts" ||
        prog.district === districtFilter;

      return matchesSearch && matchesDistrict;
    });

    result.sort((a, b) => {
      if (sortBy === "employment_desc") {
        const aVal = parseInt(a.employment_rate) || 0;
        const bVal = parseInt(b.employment_rate) || 0;
        return bVal - aVal;
      }
      if (sortBy === "enrolled_desc") {
        return (b.enrolled || 0) - (a.enrolled || 0);
      }
      return 0;
    });

    return result;
  }, [programmesWithMetrics, search, districtFilter, sortBy]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <GraduationCap size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            VOCATIONAL CURRICULUM PORTFOLIO (SECTION 24)
          </span>
        </div>
        <h1 style={{ fontSize: "1.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          State Skilling Programmes
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Evaluate accredited training curricula, enrollment volumes, placement velocity, and long-term retention. Click any programme to view in-depth evaluation.
        </p>
      </div>

      {/* Controls Bar */}
      <div style={{ 
        display: "flex", justifyContent: "space-between", alignItems: "center", 
        background: "white", padding: "1rem 1.25rem", borderRadius: "12px", 
        border: "1px solid #e2e8f0", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" 
      }}>
        <div style={{ display: "flex", gap: "1rem", flex: 1, minWidth: "300px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "10px" }} />
            <input
              type="text"
              placeholder="Search programme, ID, or provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.5rem 1rem 0.5rem 2.25rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
            />
          </div>

          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "white" }}
          >
            <option value="All Districts">All Districts</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Pune">Pune</option>
            <option value="Nagpur">Nagpur</option>
            <option value="Nashik">Nashik</option>
            <option value="Thane">Thane</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "white" }}
          >
            <option value="employment_desc">Sort: Highest Placement</option>
            <option value="enrolled_desc">Sort: Most Enrolled</option>
          </select>

          {(search || districtFilter !== "All Districts") && (
            <button
              onClick={handleClearFilters}
              style={{ display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.75rem", background: "#f1f5f9", border: "none", borderRadius: "8px", fontSize: "0.8rem", color: "#475569", cursor: "pointer" }}
            >
              <RotateCcw size={14} /> Clear
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            onClick={() => setViewMode("cards")}
            style={{
              padding: "0.45rem 0.85rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: viewMode === "cards" ? "#1e293b" : "white",
              color: viewMode === "cards" ? "white" : "#475569",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Cards View
          </button>
          <button
            onClick={() => setViewMode("table")}
            style={{
              padding: "0.45rem 0.85rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: viewMode === "table" ? "#1e293b" : "white",
              color: viewMode === "table" ? "white" : "#475569",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Table View
          </button>
        </div>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={filteredProgrammes}
        onRetry={() => setLoading(false)}
        isDataAvailable={(d) => d && d.length > 0}
        isEmptyDetails="No skilling programmes match the current search or district filter."
      >
        {viewMode === "cards" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
            {filteredProgrammes.map((prog) => (
              <div
                key={prog.id}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  padding: "1.5rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.15s ease, border-color 0.15s ease"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "none"; }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                      {prog.id}
                    </span>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: prog.status === "HIGH_PERFORMER" ? "#dcfce7" : "#eff6ff",
                      color: prog.status === "HIGH_PERFORMER" ? "#166534" : "#1d4ed8"
                    }}>
                      {prog.status === "HIGH_PERFORMER" ? "High Performer" : "Optimal"}
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 0.4rem 0", fontSize: "1.15rem", color: "#0f172a" }}>
                    {prog.name}
                  </h3>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "1rem" }}>
                    Sector: <strong>{prog.sector}</strong> • {prog.duration_weeks} Weeks
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", background: "#f8fafc", padding: "0.85rem", borderRadius: "8px", marginBottom: "1.25rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Enrolled in Scope</span>
                      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>{prog.enrolled}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Placement Rate</span>
                      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#16a34a" }}>{prog.employment_rate}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/admin/programmes/${prog.id}`)}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem"
                  }}
                >
                  View Programme Evaluation <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <DataTable
              columns={[
                { key: "id", label: "ID", render: (r) => <strong>{r.id}</strong> },
                { key: "name", label: "Programme", render: (r) => <strong style={{ color: "#0f172a" }}>{r.name}</strong> },
                { key: "sector", label: "Sector", render: (r) => r.sector },
                { key: "enrolled", label: "Enrolled", render: (r) => r.enrolled },
                { key: "employment_rate", label: "Placement Rate", render: (r) => <strong style={{ color: "#16a34a" }}>{r.employment_rate}</strong> },
                { key: "retention_12m", label: "6M Retention", render: (r) => r.retention_12m },
                {
                  key: "actions",
                  label: "Action",
                  render: (r) => (
                    <button
                      onClick={() => navigate(`/admin/programmes/${r.id}`)}
                      style={{ padding: "4px 10px", background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Evaluate
                    </button>
                  )
                }
              ]}
              data={filteredProgrammes}
            />
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
}

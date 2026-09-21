import { useState, useEffect, useMemo } from "react";
import { Map, ShieldAlert, TrendingUp, Search, ArrowUpDown, X, Users, MapPin } from "lucide-react";
import { useFilters } from "../context/FilterContext";
import DataTable from "../components/common/DataTable";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import { platformService, usePlatformStore } from "../services/platformService";

export default function Districts() {
  const { filters, updateFilter } = useFilters();
  const storeState = usePlatformStore();
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting
  const [sortField, setSortField] = useState("employment_rate");
  const [sortAsc, setSortAsc] = useState(false);

  // Drilldown
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getDistrictAnalytics(filters);
      if (res.data_available) {
        setDistricts(res.districts || []);
      } else {
        setDistricts([]);
      }
    } catch (err) {
      console.error("Failed to load district analytics", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, storeState]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedDistricts = useMemo(() => {
    const list = [...districts];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string" && valA.includes("%")) valA = parseFloat(valA);
      if (typeof valB === "string" && valB.includes("%")) valB = parseFloat(valB);

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [districts, sortField, sortAsc]);

  const filteredDistricts = sortedDistricts.filter(d =>
    (d.district || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.top_skill_gap || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Trainees in selected district within active filter scope
  const districtTrainees = useMemo(() => {
    if (!selectedDistrict) return [];
    const all = platformService.filterTrainees(storeState.trainees || [], filters);
    return all.filter(t => t.district.toLowerCase() === selectedDistrict.district.toLowerCase());
  }, [selectedDistrict, storeState.trainees, filters]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Map size={18} color="#2563eb" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              GEOGRAPHIC OUTCOME INTELLIGENCE
            </span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
            District-Level Skilling Analytics
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
            Regional performance indices, employment placement ratios, 6-month retention, and localized skill-gap priorities across districts. Click any district to inspect detail.
          </p>
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "12px" }} />
          <input
            type="text"
            placeholder="Search district or skill gap..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 1rem 0.6rem 2.25rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.875rem"
            }}
          />
        </div>
      </div>

      {/* Regional Cards Grid (Geographic Visualization) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        {filteredDistricts.map(d => (
          <div
            key={d.district}
            className="district-card"
            onClick={() => setSelectedDistrict(d)}
            style={{
              background: "white",
              borderRadius: "12px",
              border: selectedDistrict?.district === d.district ? "2px solid #2563eb" : "1px solid #e2e8f0",
              padding: "1.25rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
              <strong style={{ fontSize: "1.1rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <MapPin size={16} color="#2563eb" /> {d.district}
              </strong>
              <span style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#475569" }}>
                {d.tier}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", margin: "0.75rem 0" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Trained</span>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>{d.trainees}</div>
              </div>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Employment</span>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#16a34a" }}>{d.employment_rate}</div>
              </div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Top Deficit: <strong style={{ color: "#334155" }}>{d.top_skill_gap}</strong>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.15rem", color: "#0f172a" }}>
            <Map size={20} color="#0284c7" /> Regional Performance Index
          </h3>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            Showing {filteredDistricts.length} districts in active scope
          </span>
        </div>

        <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
          <DataStateWrapper
            isLoading={loading}
            error={error}
            data={filteredDistricts}
            onRetry={loadData}
            isDataAvailable={(d) => d && d.length > 0}
            isEmptyDetails="No District Data Meets Privacy Threshold for the selected filter."
          >
            <DataTable 
              columns={[
                { 
                  key: "district", 
                  label: "District", 
                  render: (d) => (
                    <button
                      onClick={() => setSelectedDistrict(d)}
                      style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", textAlign: "left", padding: 0, fontSize: "0.95rem" }}
                    >
                      {d.district}
                    </button>
                  )
                },
                { 
                  key: "tier", 
                  label: "Tier", 
                  render: (d) => <span style={{ color: "#64748b" }}>{d.tier}</span> 
                },
                { 
                  key: "trainees", 
                  label: (
                    <div onClick={() => handleSort("trainees")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      Trained <ArrowUpDown size={12} />
                    </div>
                  ),
                  render: (d) => <strong>{d.trainees}</strong> 
                },
                { 
                  key: "employment_rate", 
                  label: (
                    <div onClick={() => handleSort("employment_rate")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      Employment % <ArrowUpDown size={12} />
                    </div>
                  ),
                  render: (d) => (
                    <span style={{ 
                      background: parseFloat(d.employment_rate) >= 80 ? "#dcfce7" : "#eff6ff", 
                      color: parseFloat(d.employment_rate) >= 80 ? "#166534" : "#1d4ed8", 
                      padding: "3px 8px", 
                      borderRadius: "12px", 
                      fontWeight: 700 
                    }}>
                      {d.employment_rate}
                    </span>
                  ) 
                },
                { 
                  key: "retention_6m", 
                  label: (
                    <div onClick={() => handleSort("retention_6m")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      6M Retention % <ArrowUpDown size={12} />
                    </div>
                  ),
                  render: (d) => <strong>{d.retention_6m}</strong> 
                },
                { 
                  key: "top_skill_gap", 
                  label: "Top Reported Deficit", 
                  render: (d) => <span style={{ color: "#475569" }}>{d.top_skill_gap}</span> 
                },
                { 
                  key: "status", 
                  label: "Status", 
                  render: (d) => (
                    <span style={{ 
                      background: d.status === "High Impact" ? "#dcfce7" : d.status === "Optimal" ? "#eff6ff" : "#fee2e2", 
                      color: d.status === "High Impact" ? "#166534" : d.status === "Optimal" ? "#1d4ed8" : "#991b1b", 
                      padding: "3px 8px", 
                      borderRadius: "6px", 
                      fontSize: "0.75rem", 
                      fontWeight: 700 
                    }}>
                      {d.status}
                    </span>
                  ) 
                }
              ]}
              data={filteredDistricts}
            />
          </DataStateWrapper>
        </div>
      </div>

      {/* District Detail Modal / Drilldown */}
      {selectedDistrict && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div style={{
            background: "white",
            width: "100%",
            maxWidth: "760px",
            maxHeight: "85vh",
            borderRadius: "14px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                  DISTRICT AUDIT DOSSIER
                </span>
                <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.25rem", color: "#0f172a" }}>
                  {selectedDistrict.district} ({selectedDistrict.tier})
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Employment: {selectedDistrict.employment_rate} • 6M Retention: {selectedDistrict.retention_6m} • Top Deficit: {selectedDistrict.top_skill_gap}
                </span>
              </div>
              <button
                onClick={() => setSelectedDistrict(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                  District Trainee Roster ({districtTrainees.length} in Active Scope)
                </strong>
                <button
                  onClick={() => {
                    updateFilter("district", selectedDistrict.district);
                    setSelectedDistrict(null);
                  }}
                  style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Set as Global Filter Scope
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {districtTrainees.slice(0, 15).map(t => (
                  <div key={t.id} style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ color: "#0f172a", fontSize: "0.85rem" }}>{t.name}</strong>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: "0.4rem" }}>({t.id})</span>
                      <div style={{ fontSize: "0.75rem", color: "#475569" }}>{t.programme_name} • Provider: {t.provider_name}</div>
                    </div>
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: t.employment?.status === "EMPLOYED" ? "#dcfce7" : "#fee2e2",
                      color: t.employment?.status === "EMPLOYED" ? "#166534" : "#991b1b"
                    }}>
                      {t.employment?.status || "ENROLLED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedDistrict(null)}
                style={{ padding: "0.5rem 1.25rem", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { Building2, Search, Award, ArrowUpDown, ChevronDown, ChevronUp, X, Users } from "lucide-react";
import { useFilters } from "../context/FilterContext";
import DataTable from "../components/common/DataTable";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import { platformService, usePlatformStore } from "../services/platformService";

export default function Providers() {
  const { filters, updateFilter } = useFilters();
  const storeState = usePlatformStore();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting state
  const [sortField, setSortField] = useState("placement_rate");
  const [sortAsc, setSortAsc] = useState(false);

  // Drilldown state
  const [selectedProvider, setSelectedProvider] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getProviderAccountability(filters);
      if (res.data_available) {
        setProviders(res.providers || []);
      } else {
        setProviders([]);
      }
    } catch (err) {
      console.error("Failed to load provider accountability", err);
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

  const sortedProviders = useMemo(() => {
    const list = [...providers];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Parse percentages or numbers
      if (typeof valA === "string" && valA.includes("%")) valA = parseFloat(valA);
      if (typeof valB === "string" && valB.includes("%")) valB = parseFloat(valB);

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [providers, sortField, sortAsc]);

  const filteredProviders = sortedProviders.filter(p =>
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.district || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Drilldown trainees for selected provider under current filter scope
  const providerTrainees = useMemo(() => {
    if (!selectedProvider) return [];
    const all = platformService.filterTrainees(storeState.trainees || [], filters);
    return all.filter(t => t.provider_name === selectedProvider.name || t.provider_id === selectedProvider.id);
  }, [selectedProvider, storeState.trainees, filters]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Building2 size={18} color="#2563eb" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              INSTITUTIONAL ACCOUNTABILITY & LEAGUE TABLE
            </span>
          </div>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
            Provider Accountability & Benchmarking
          </h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
            Transparent institutional performance metrics: training completion rates, placement effectiveness, 6-month retention, and graduate wage progression. Click headers to sort.
          </p>
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "12px" }} />
          <input
            type="text"
            placeholder="Search provider or district..."
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

      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.15rem", color: "#0f172a" }}>
            <Building2 size={20} color="#6366f1" /> Partner Performance League Table
          </h3>
          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
            {filteredProviders.length} registered vocational partners in scope
          </span>
        </div>

        <div style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
          <DataStateWrapper
            isLoading={loading}
            error={error}
            data={filteredProviders}
            onRetry={loadData}
            isDataAvailable={(d) => d && d.length > 0}
            isEmptyDetails="No training provider accountability data meets the reporting threshold for this filter."
          >
            <DataTable 
              columns={[
                { 
                  key: "name", 
                  label: "Training Partner / Agency", 
                  render: (p) => (
                    <div>
                      <button
                        onClick={() => setSelectedProvider(p)}
                        style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", textAlign: "left", padding: 0, fontSize: "0.95rem" }}
                      >
                        {p.name}
                      </button>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        District: {p.district} • {p.centres} Certified Centres
                      </div>
                    </div>
                  )
                },
                { 
                  key: "trained", 
                  label: (
                    <div onClick={() => handleSort("trained")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      Trained <ArrowUpDown size={12} />
                    </div>
                  ),
                  render: (p) => <strong>{p.trained}</strong> 
                },
                { 
                  key: "completion_rate", 
                  label: (
                    <div onClick={() => handleSort("completion_rate")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      Completion % <ArrowUpDown size={12} />
                    </div>
                  ),
                  render: (p) => <span style={{ color: "#334155", fontWeight: 600 }}>{p.completion_rate}</span> 
                },
                { 
                  key: "certification_rate", 
                  label: (
                    <div onClick={() => handleSort("certification_rate")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      Certification % <ArrowUpDown size={12} />
                    </div>
                  ),
                  render: (p) => <span style={{ color: "#334155", fontWeight: 600 }}>{p.certification_rate}</span> 
                },
                { 
                  key: "placement_rate", 
                  label: (
                    <div onClick={() => handleSort("placement_rate")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      Placement % <ArrowUpDown size={12} />
                    </div>
                  ),
                  render: (p) => (
                    <span style={{ 
                      background: parseFloat(p.placement_rate) >= 80 ? "#dcfce7" : "#eff6ff", 
                      color: parseFloat(p.placement_rate) >= 80 ? "#166534" : "#1d4ed8", 
                      padding: "3px 8px", 
                      borderRadius: "12px", 
                      fontWeight: 700 
                    }}>
                      {p.placement_rate}
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
                  render: (p) => <strong>{p.retention_6m}</strong> 
                },
                { 
                  key: "wage_growth", 
                  label: (
                    <div onClick={() => handleSort("wage_growth")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      Wage Growth % <ArrowUpDown size={12} />
                    </div>
                  ),
                  render: (p) => (
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>
                      {p.wage_growth}
                    </span>
                  ) 
                }
              ]}
              data={filteredProviders}
            />
          </DataStateWrapper>
        </div>
      </div>

      {/* Provider Detail Modal / Drilldown */}
      {selectedProvider && (
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
                  PROVIDER AUDIT DOSSIER
                </span>
                <h3 style={{ margin: "0.2rem 0 0 0", fontSize: "1.25rem", color: "#0f172a" }}>
                  {selectedProvider.name}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  District: {selectedProvider.district} • Placement: {selectedProvider.placement_rate} • 6M Retention: {selectedProvider.retention_6m}
                </span>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                  Trainee Roster ({providerTrainees.length} in Active Scope)
                </strong>
                <button
                  onClick={() => {
                    updateFilter("provider", selectedProvider.name);
                    setSelectedProvider(null);
                  }}
                  style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Set as Global Filter Scope
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {providerTrainees.slice(0, 15).map(t => (
                  <div key={t.id} style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ color: "#0f172a", fontSize: "0.85rem" }}>{t.name}</strong>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: "0.4rem" }}>({t.id})</span>
                      <div style={{ fontSize: "0.75rem", color: "#475569" }}>{t.programme_name} • Cohort: {t.cohort}</div>
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
                onClick={() => setSelectedProvider(null)}
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

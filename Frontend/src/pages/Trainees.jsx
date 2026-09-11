import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight,
  Eye, Shield, AlertTriangle, CheckCircle2, Briefcase, GraduationCap,
  Building2, MapPin, DollarSign, X
} from "lucide-react";
import { useFilters } from "../context/FilterContext";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function Trainees() {
  const navigate = useNavigate();
  const { filters } = useFilters();
  const store = usePlatformStore();

  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Directory controls
  const [search, setSearch] = useState("");
  const [trainingStatus, setTrainingStatus] = useState("");
  const [outcomeStatus, setOutcomeStatus] = useState("");
  const [retentionStatus, setRetentionStatus] = useState("");
  const [riskIndicator, setRiskIndicator] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const loadTrainees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getTrainees(filters, {
        search,
        trainingStatus,
        outcomeStatus,
        retentionStatus,
        riskIndicator,
        sortField,
        sortOrder,
        page,
        limit
      });

      if (res.data_available) {
        setTrainees(res.trainees || []);
        setPagination({ total: res.total, totalPages: res.totalPages });
      } else {
        setTrainees([]);
        setPagination({ total: 0, totalPages: 1 });
      }
    } catch (err) {
      console.error("Failed to load trainees:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainees();
  }, [filters, search, trainingStatus, outcomeStatus, retentionStatus, riskIndicator, sortField, sortOrder, page, store.last_updated]);

  // Reset page when search or filters change
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearch("");
    setTrainingStatus("");
    setOutcomeStatus("");
    setRetentionStatus("");
    setRiskIndicator("");
    setPage(1);
  };

  const hasActiveFilters = search || trainingStatus || outcomeStatus || retentionStatus || riskIndicator;

  return (
    <div style={{ maxWidth: "1440px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <Shield size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            ADMIN POPULATION SURVEILLANCE & OUTCOME INTELLIGENCE
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
              Trainee Directory
            </h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
              Longitudinal registry of candidates across all state skilling cohorts. Inspect outcomes, wage growth, retention, and individual trajectories.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "#f8fafc", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
              <span style={{ color: "#64748b" }}>Matched Population: </span>
              <strong style={{ color: "#2563eb", fontSize: "1.1rem" }}>{pagination.total}</strong>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem", marginLeft: "4px" }}>trainees</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Search + Multi-Dimensional Filters */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem", marginBottom: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Search Bar */}
          <div style={{ position: "relative", flex: "1 1 280px" }}>
            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
            <input
              type="text"
              id="trainee-search-input"
              placeholder="Search by ID, candidate name, programme, provider, district, or employer..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                width: "100%",
                padding: "0.55rem 1rem 0.55rem 2.25rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem"
              }}
            />
          </div>

          {/* Outcome Filter */}
          <div style={{ minWidth: "160px" }}>
            <select
              id="outcome-filter-select"
              value={outcomeStatus}
              onChange={(e) => { setOutcomeStatus(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "white" }}
            >
              <option value="">All Current Outcomes</option>
              <option value="employed">Employed</option>
              <option value="self_employed">Self-Employed</option>
              <option value="apprenticeship">Apprenticeship</option>
              <option value="unemployed">Unemployed</option>
            </select>
          </div>

          {/* Training Status Filter */}
          <div style={{ minWidth: "150px" }}>
            <select
              id="training-filter-select"
              value={trainingStatus}
              onChange={(e) => { setTrainingStatus(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "white" }}
            >
              <option value="">All Training Status</option>
              <option value="Completed">Completed</option>
              <option value="Dropped Out">Dropped Out</option>
            </select>
          </div>

          {/* Retention Filter */}
          <div style={{ minWidth: "150px" }}>
            <select
              id="retention-filter-select"
              value={retentionStatus}
              onChange={(e) => { setRetentionStatus(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "white" }}
            >
              <option value="">All Retention</option>
              <option value="Retained">6M Retained</option>
              <option value="Left Employment">Left Employment</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div style={{ minWidth: "160px" }}>
            <select
              id="risk-filter-select"
              value={riskIndicator}
              onChange={(e) => { setRiskIndicator(e.target.value); setPage(1); }}
              style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", background: "white" }}
            >
              <option value="">All Attention Levels</option>
              <option value="High">High Attention Needed</option>
              <option value="Moderate">Moderate Skill Gap</option>
              <option value="Stable">Stable Retention</option>
              <option value="Optimal">Optimal Impact</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              id="clear-trainee-filters-btn"
              onClick={clearAllFilters}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.55rem 0.9rem",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer"
              }}
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Trainee Table */}
      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={trainees}
        onRetry={loadTrainees}
        isDataAvailable={(d) => d && d.length > 0}
        isEmptyDetails="No candidate records match the active search and filter criteria."
      >
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "0.85rem 1rem", fontWeight: 700, cursor: "pointer" }} onClick={() => handleSort("id")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      Trainee ID <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ padding: "0.85rem 1rem", fontWeight: 700, cursor: "pointer" }} onClick={() => handleSort("name")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      Candidate Identity <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Programme & Provider</th>
                  <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>District & Cohort</th>
                  <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Current Outcome</th>
                  <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Employer & Role</th>
                  <th style={{ padding: "0.85rem 1rem", fontWeight: 700, cursor: "pointer" }} onClick={() => handleSort("wage")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      Latest Wage <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Retention (6M)</th>
                  <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Risk Status</th>
                  <th style={{ padding: "0.85rem 1rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainees.map((t) => {
                  const emp = t.employment;
                  const isEmployed = emp?.status === "EMPLOYED";
                  const isApprentice = emp?.status === "APPRENTICESHIP";
                  const isSelf = emp?.status === "SELF_EMPLOYED";
                  const isUnemployed = emp?.status === "UNEMPLOYED";

                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }} className="hover-row">
                      {/* ID */}
                      <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
                        {t.id}
                      </td>

                      {/* Identity */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: t.gender === "Female" ? "#fce7f3" : "#eff6ff",
                            color: t.gender === "Female" ? "#be185d" : "#1d4ed8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.85rem"
                          }}>
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>{t.name}</div>
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                              {t.gender} • Age {t.age} • {t.category}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Programme & Provider */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{t.programme_name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{t.provider_name}</div>
                      </td>

                      {/* District & Cohort */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <div style={{ fontWeight: 600, color: "#334155" }}>{t.district}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{t.cohort}</div>
                      </td>

                      {/* Outcome Status */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        {isEmployed && (
                          <span style={{ background: "#dcfce7", color: "#15803d", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 }}>
                            Employed
                          </span>
                        )}
                        {isSelf && (
                          <span style={{ background: "#ccfbf1", color: "#0f766e", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 }}>
                            Self-Employed
                          </span>
                        )}
                        {isApprentice && (
                          <span style={{ background: "#f3e8ff", color: "#7e22ce", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 }}>
                            Apprentice
                          </span>
                        )}
                        {isUnemployed && (
                          <span style={{ background: "#fef3c7", color: "#b45309", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 }}>
                            Unemployed
                          </span>
                        )}
                        {!isEmployed && !isSelf && !isApprentice && !isUnemployed && (
                          <span style={{ background: "#f1f5f9", color: "#475569", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 700 }}>
                            {t.employment?.status || "In Training"}
                          </span>
                        )}
                      </td>

                      {/* Employer & Role */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        {emp?.employer_name ? (
                          <>
                            <div style={{ fontWeight: 600, color: "#1e293b" }}>{emp.employer_name}</div>
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{emp.job_role || "Associate"}</div>
                          </>
                        ) : isSelf ? (
                          <>
                            <div style={{ fontWeight: 600, color: "#0f766e" }}>{emp.business_name || "Enterprise"}</div>
                            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Contractor</div>
                          </>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>N/A (Unplaced)</span>
                        )}
                      </td>

                      {/* Latest Wage */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        {emp?.current_wage > 0 ? (
                          <div>
                            <strong style={{ color: "#0f172a" }}>₹{emp.current_wage.toLocaleString()}</strong>
                            {t.wage_metrics?.growth_percentage > 0 && (
                              <span style={{ fontSize: "0.7rem", color: "#16a34a", marginLeft: "4px", fontWeight: 700 }}>
                                +{t.wage_metrics.growth_percentage}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>

                      {/* Retention Status */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        {t.retention?.retention_6m === "Retained" ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#16a34a", fontWeight: 600, fontSize: "0.75rem" }}>
                            <CheckCircle2 size={13} /> Retained
                          </span>
                        ) : t.retention?.retention_6m === "Left Employment" ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#e11d48", fontWeight: 600, fontSize: "0.75rem" }}>
                            <AlertTriangle size={13} /> Exited
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>In Progress</span>
                        )}
                      </td>

                      {/* Risk Indicator */}
                      <td style={{ padding: "0.85rem 1rem" }}>
                        <span style={{
                          padding: "2px 7px",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          background: t.risk_indicator?.includes("High") ? "#fee2e2" : (t.risk_indicator?.includes("Moderate") ? "#fef3c7" : "#dcfce7"),
                          color: t.risk_indicator?.includes("High") ? "#b91c1c" : (t.risk_indicator?.includes("Moderate") ? "#b45309" : "#15803d")
                        }}>
                          {t.risk_indicator}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                        <button
                          id={`view-trainee-${t.id}`}
                          onClick={() => navigate(`/admin/trainees/${t.id}`)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            border: "1px solid #bfdbfe",
                            borderRadius: "6px",
                            padding: "0.35rem 0.65rem",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            cursor: "pointer"
                          }}
                        >
                          <Eye size={13} /> View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", borderTop: "1px solid #f1f5f9" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Showing page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} records)
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                id="pagination-prev-btn"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem",
                  padding: "0.4rem 0.75rem",
                  background: page <= 1 ? "#f1f5f9" : "white",
                  color: page <= 1 ? "#94a3b8" : "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  cursor: page <= 1 ? "not-allowed" : "pointer"
                }}
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <button
                id="pagination-next-btn"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem",
                  padding: "0.4rem 0.75rem",
                  background: page >= pagination.totalPages ? "#f1f5f9" : "white",
                  color: page >= pagination.totalPages ? "#94a3b8" : "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  cursor: page >= pagination.totalPages ? "not-allowed" : "pointer"
                }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </DataStateWrapper>
    </div>
  );
}

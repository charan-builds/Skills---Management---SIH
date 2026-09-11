import { API_BASE } from '../../utils/config';
import { useState, useEffect, useMemo } from "react";
import { fetchAuth } from "../../utils/authFetch";
import { AlertCircle, Filter, ChevronDown, ChevronUp, AlertOctagon, AlertTriangle, Info } from "lucide-react";
import "./ImpactIntelligence.css";

export default function ImpactIntelligence() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data States
  const [programmesData, setProgrammesData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Filters
  const [programmeFilter, setProgrammeFilter] = useState("All Programmes");
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [priorityFilter, setPriorityFilter] = useState("All Priorities");

  // Expanded items state
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setError(null);
      try {
        const [
          programmesRes,
          decisionEngineRes
        ] = await Promise.all([
          fetchAuth(`${API_BASE}/api/programmes`),
          fetchAuth(`${API_BASE}/api/ai/decision-engine/summary`)
        ]);

        const programmes = programmesRes.ok ? await programmesRes.json() : [];
        const decisionEngine = decisionEngineRes.ok ? await decisionEngineRes.json() : { data: { recommendations: [] } };

        setProgrammesData(programmes);
        const recs = decisionEngine.data?.recommendations || decisionEngine.recommendations || [];
        setRecommendations(recs);

      } catch (err) {
        console.error(err);
        setError("Failed to load Impact Intelligence. Please check your connection and authentication.");
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      // Handle Priority Filter
      if (priorityFilter !== "All Priorities" && rec.strength !== priorityFilter) {
        return false;
      }
      
      // Handle Programme Filter
      if (programmeFilter !== "All Programmes") {
        const isProgrammeSpecific = rec.metrics?.programme === programmeFilter || rec.target_scope === "PROGRAMME";
        const isGlobal = rec.target_scope === "PROGRAMME_WIDE" || rec.target_scope === "GLOBAL";
        const matchesFactor = rec.metrics?.factor_value === programmeFilter;
        
        if (!isGlobal && !isProgrammeSpecific && !matchesFactor) {
           if (rec.target_scope !== "PROGRAMME_WIDE" && rec.target_scope !== "GLOBAL" && rec.metrics?.factor_type !== "PROGRAMME") {
               return false;
           }
           if (rec.metrics?.factor_type === "PROGRAMME" && rec.metrics?.factor_value !== programmeFilter) {
               return false;
           }
        }
      }

      // Handle District Filter
      if (districtFilter !== "All Districts") {
        const matchesFactor = rec.metrics?.factor_value === districtFilter;
        if (rec.metrics?.factor_type === "DISTRICT" && !matchesFactor) {
           return false;
        }
      }

      return true;
    });
  }, [recommendations, priorityFilter, programmeFilter, districtFilter]);


  // Sort filtered recommendations by strength (CRITICAL -> HIGH -> MEDIUM -> LOW)
  // then by some metric.
  const sortedRecommendations = useMemo(() => {
    const strengthOrder = { "CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3 };
    return [...filteredRecommendations].sort((a, b) => {
      if (strengthOrder[a.strength] !== strengthOrder[b.strength]) {
        return strengthOrder[a.strength] - strengthOrder[b.strength];
      }
      // Sort by some evidence measure (e.g., deficiency_rate or difference)
      const aMetric = a.metrics?.deficiency_rate || Math.abs(a.metrics?.difference || 0);
      const bMetric = b.metrics?.deficiency_rate || Math.abs(b.metrics?.difference || 0);
      return bMetric - aMetric;
    });
  }, [filteredRecommendations]);


  const counts = {
    CRITICAL: filteredRecommendations.filter(r => r.strength === "CRITICAL").length,
    HIGH: filteredRecommendations.filter(r => r.strength === "HIGH").length,
    MEDIUM: filteredRecommendations.filter(r => r.strength === "MEDIUM").length,
    LOW: filteredRecommendations.filter(r => r.strength === "LOW").length,
  };

  if (loading) {
    return (
      <div className="impact-loading">
        <div className="spinner"></div>
        <p>Gathering intelligence streams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="impact-error">
        <AlertCircle size={32} />
        <p>{error}</p>
      </div>
    );
  }

  const getPriorityColor = (strength) => {
    switch (strength) {
      case "CRITICAL": return "#ef4444";
      case "HIGH": return "#f97316";
      case "MEDIUM": return "#eab308";
      case "LOW": return "#3b82f6";
      default: return "#94a3b8";
    }
  };

  const getPriorityIcon = (strength) => {
    switch (strength) {
      case "CRITICAL": return <AlertOctagon size={16} color="#ffffff" />;
      case "HIGH": return <AlertTriangle size={16} color="#ffffff" />;
      case "MEDIUM": return <AlertCircle size={16} color="#ffffff" />;
      case "LOW": return <Info size={16} color="#ffffff" />;
      default: return <Info size={16} color="#ffffff" />;
    }
  };

  return (
    <div className="impact-intelligence-container">
      {/* A. PAGE HEADER */}
      <div className="impact-header">
        <div>
          <h1>Impact Intelligence</h1>
          <p>Prioritized evidence-backed workforce and skill issues requiring administrative attention.</p>
        </div>
        
        {/* B. FILTER BAR */}
        <div className="impact-filters">
          <Filter size={18} />
          
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="All Priorities">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select value={programmeFilter} onChange={(e) => setProgrammeFilter(e.target.value)}>
            <option value="All Programmes">All Programmes</option>
            {programmesData.map(p => (
              <option key={p.id} value={p.name || p.id}>{p.name || p.id}</option>
            ))}
          </select>

          <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="All Districts">All Districts</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Warangal">Warangal</option>
            <option value="Nalgonda">Nalgonda</option>
            <option value="Visakhapatnam">Visakhapatnam</option>
          </select>
        </div>
      </div>

      {/* C. PRIORITY SUMMARY */}
      <div className="priority-summary-grid">
        <div className="priority-card critical">
          <h3>Critical</h3>
          <p className="count">{counts.CRITICAL}</p>
        </div>
        <div className="priority-card high">
          <h3>High</h3>
          <p className="count">{counts.HIGH}</p>
        </div>
        <div className="priority-card medium">
          <h3>Medium</h3>
          <p className="count">{counts.MEDIUM}</p>
        </div>
        <div className="priority-card low">
          <h3>Low</h3>
          <p className="count">{counts.LOW}</p>
        </div>
      </div>

      {/* G. EMPTY STATE */}
      {sortedRecommendations.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} color="#94a3b8" />
          <p>No intelligence matches the selected filters.</p>
        </div>
      ) : (
        /* D. PRIORITIZED INTELLIGENCE LIST */
        <div className="intelligence-list">
          {sortedRecommendations.map((rec) => {
            const isExpanded = expandedItems[rec.recommendation_id];
            
            return (
              <div key={rec.recommendation_id} className={`intelligence-item ${rec.strength.toLowerCase()}`}>
                <div className="item-header" onClick={() => toggleExpand(rec.recommendation_id)}>
                  <div className="item-title-section">
                    <span className="priority-badge" style={{ backgroundColor: getPriorityColor(rec.strength) }}>
                      {getPriorityIcon(rec.strength)}
                      {rec.strength}
                    </span>
                    <h3>{rec.title}</h3>
                  </div>
                  <button className="expand-btn">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                <div className="item-summary">
                  <p>{rec.description}</p>
                  
                  <div className="item-meta">
                    {rec.affected_skill && (
                      <span className="meta-tag"><strong>Skill:</strong> {rec.affected_skill}</span>
                    )}
                    {rec.target_scope && (
                      <span className="meta-tag"><strong>Scope:</strong> {rec.target_scope.replace('_', ' ')}</span>
                    )}
                    {rec.metrics?.factor_value && (
                      <span className="meta-tag"><strong>Affected:</strong> {rec.metrics.factor_value}</span>
                    )}
                    {rec.metrics?.employer_complaint_frequency !== undefined && (
                      <span className="meta-tag"><strong>Complaints:</strong> {rec.metrics.employer_complaint_frequency}</span>
                    )}
                    {rec.metrics?.trainees_affected !== undefined && (
                      <span className="meta-tag"><strong>Trainees Affected:</strong> {rec.metrics.trainees_affected}</span>
                    )}
                  </div>
                </div>

                {/* E. DETAILS */}
                {isExpanded && (
                  <div className="item-details">
                    <div className="details-grid">
                      <div className="details-section">
                        <h4>Evidence</h4>
                        <ul>
                          {rec.evidence?.length > 0 ? (
                            rec.evidence.map((ev, idx) => <li key={idx}>{ev}</li>)
                          ) : (
                            <li className="no-data">Not available</li>
                          )}
                        </ul>
                      </div>
                      <div className="details-section">
                        <h4>Reasoning & Action</h4>
                        <ul>
                          {rec.reasoning?.length > 0 ? (
                            rec.reasoning.map((rs, idx) => <li key={idx}>{rs}</li>)
                          ) : (
                            <li className="no-data">Not available</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

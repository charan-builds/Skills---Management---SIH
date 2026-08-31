import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import React, { useState, useEffect } from "react";
import { AlertCircle, Target, TrendingDown, Info, ShieldAlert, Cpu } from "lucide-react";
import "./AIDecisionCenter.css";



const AIDecisionCenter = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchAuth(`${API_BASE}/api/ai/decision-engine/summary`);
        if (!res.ok) throw new Error("Failed to fetch decision engine insights.");
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="ai-decision-loading">
        <Cpu className="spin-icon" size={24} />
        <p>Analyzing Skilling Ecosystem Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-decision-error">
        <AlertCircle size={20} />
        <p>{error}</p>
      </div>
    );
  }

  const { recommendations, metadata } = data;

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="ai-decision-empty">
        <Info size={20} />
        <p>Insufficient Data: Not enough data to generate systemic recommendations.</p>
      </div>
    );
  }

  return (
    <div className="ai-decision-container">
      <div className="ai-decision-header">
        <div>
          <h2 className="ai-title">
            <Cpu size={22} className="ai-icon" /> AI Decision Engine
          </h2>
          <p className="ai-subtitle">
            Evidence-backed recommendations based on {metadata.skill_gaps_analyzed} skill gaps and {metadata.retention_risks_analyzed} retention risks.
          </p>
        </div>
        <div className="ai-badge">V{metadata.engine_version}</div>
      </div>

      <div className="ai-recommendations-list">
        {recommendations.map((rec) => (
          <div key={rec.recommendation_id} className={`ai-recommendation-card priority-${(rec.strength || "").toLowerCase()}`}>
            
            <div className="rec-header">
              <span className={`rec-strength strength-${(rec.strength || "").toLowerCase()}`}>
                {rec.strength} PRIORITY
              </span>
              <span className="rec-type">{rec.type.replace("_", " ")}</span>
            </div>

            <h3 className="rec-title">{rec.title}</h3>
            <p className="rec-description">{rec.description}</p>

            <div className="rec-evidence-box">
              <strong><Target size={14} /> Supporting Evidence:</strong>
              <ul>
                {rec.evidence.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>

            <div className="rec-reasoning">
              <strong>Reasoning:</strong>
              <p>{rec.reasoning.join(" ")}</p>
            </div>

            <div className="rec-limitations">
              <ShieldAlert size={14} />
              <small>{rec.limitations[0]}</small>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default AIDecisionCenter;

import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useState, useEffect } from "react";
import { AlertCircle, Target, Users, BookOpen, Layers } from "lucide-react";
import "./SkillGapDashboard.css";



const SkillGapDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchAuth(`${API_BASE}/api/ai/skill-gaps/summary`);
        if (!res.ok) throw new Error("Failed to fetch skill gap intelligence.");
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
      <div className="skillgap-loading">
        <div className="spinner"></div>
        <p>Loading Skill Gap Intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="skillgap-error">
        <AlertCircle size={20} />
        <p>{error}</p>
      </div>
    );
  }

  if (data?.meta?.insufficient_data || !data?.skill_gaps?.length) {
    return (
      <div className="skillgap-empty">
        <Target size={24} />
        <h3>Insufficient Evidence</h3>
        <p>Not enough assessments or employer feedback to identify significant skill gaps.</p>
      </div>
    );
  }

  return (
    <div className="skillgap-container">
      <div className="skillgap-header">
        <h2>Skill Gap Intelligence</h2>
        <p>Ecosystem-wide recurring skill deficiencies identified via outcomes and assessments.</p>
        
        <div className="skillgap-meta-pills">
          <span><Users size={14}/> {data.meta.total_feedback_analyzed} Employer Feedback Analyzed</span>
          <span><BookOpen size={14}/> {data.meta.total_assessments_analyzed} Assessments Analyzed</span>
        </div>
      </div>

      <div className="skillgap-grid">
        {data.skill_gaps.map((gap, idx) => (
          <div key={idx} className="skillgap-card">
            
            <div className="sg-card-header">
              <h3>{gap.skill}</h3>
              {gap.evidence.employer_complaint_frequency > 0 && (
                <span className="badge-employer">Employer Reported</span>
              )}
            </div>

            <div className="sg-stats-grid">
              
              <div className="sg-stat">
                <span className="sg-label">Deficiency Rate</span>
                <strong className={gap.evidence.deficiency_rate >= 0.3 ? "text-danger" : ""}>
                  {(gap.evidence.deficiency_rate * 100).toFixed(1)}%
                </strong>
              </div>

              <div className="sg-stat">
                <span className="sg-label">Avg Proficiency</span>
                <strong>
                  {gap.evidence.average_proficiency ? gap.evidence.average_proficiency.toFixed(1) : "N/A"}
                </strong>
              </div>

              <div className="sg-stat">
                <span className="sg-label">Employer Complaints</span>
                <strong className={gap.evidence.employer_complaint_frequency >= 2 ? "text-danger" : ""}>
                  {gap.evidence.employer_complaint_frequency}
                </strong>
              </div>

              <div className="sg-stat">
                <span className="sg-label">Affected Trainees</span>
                <strong>{gap.evidence.trainees_affected}</strong>
              </div>

            </div>

            <div className="sg-programs">
              <strong><Layers size={14}/> Affected Programmes:</strong>
              <div className="sg-tags">
                {Object.entries(gap.evidence.affected_programmes).map(([prog, count]) => (
                  <span key={prog} className="sg-tag">{prog} ({count})</span>
                ))}
              </div>
            </div>
            
            {gap.evidence.affected_providers && Object.keys(gap.evidence.affected_providers).length > 0 && (
              <div className="sg-programs" style={{marginTop: "10px"}}>
                <strong><Layers size={14}/> Affected Providers:</strong>
                <div className="sg-tags">
                  {Object.entries(gap.evidence.affected_providers).map(([prov, count]) => (
                    <span key={prov} className="sg-tag">{prov} ({count})</span>
                  ))}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillGapDashboard;

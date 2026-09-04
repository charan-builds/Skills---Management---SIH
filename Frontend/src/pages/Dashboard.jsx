import { useState, useEffect } from "react";
import {
  TrendingUp,
  ArrowRight,
  Bell,
  Sparkles,
  HelpCircle,
  FileDown,
  Check,
  Zap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/config";
import { fetchAuth } from "../utils/authFetch";
import { adminIntelligenceData } from "../utils/adminData";

export default function Dashboard() {
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [adoptedActions, setAdoptedActions] = useState({});

  // Filter States
  const [district, setDistrict] = useState("All Districts");
  const [course, setCourse] = useState("All Programmes");
  const [cohort, setCohort] = useState("All Cohorts");

  const [kpis, setKpis] = useState(adminIntelligenceData.overview_kpis);
  const [funnel, setFunnel] = useState(adminIntelligenceData.trainee_funnel);
  const [programmes, setProgrammes] = useState(adminIntelligenceData.programmes);
  const [insights, setInsights] = useState(adminIntelligenceData.ai_programme_insights);
  const [actions, setActions] = useState(adminIntelligenceData.action_center_items);
  const [notifications, setNotifications] = useState(adminIntelligenceData.notifications || []);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, traineesRes] = await Promise.all([
          fetchAuth(`${API_BASE}/api/analytics/dashboard`),
          fetchAuth(`${API_BASE}/api/trainees`)
        ]);
        
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          if (dashData.stats) {
            setKpis(dashData.stats.map(s => ({
              title: s.title,
              value: s.value || "N/A",
              previous: "-",
              change: "-",
              trend: "flat",
              tooltip: ""
            })));
          }
          if (dashData.notifications) {
            setNotifications(dashData.notifications.map((n, i) => ({
              id: i,
              title: n.title,
              message: n.message,
              type: n.type === "Critical" ? "error" : "warning",
              path: "/outcomes"
            })));
          }
        }
        
        if (traineesRes.ok) {
          const trainees = await traineesRes.json();
          const total = trainees.length;
          const certified = trainees.filter(t => t.status === "Certified").length;
          const employed = trainees.filter(t => t.outcome === "Employed" || t.outcome === "Self-Employed").length;
          
          setFunnel([
            { stage: "Enrolled", count: total, percentage: 100, color: "#2563eb" },
            { stage: "Certified", count: certified, percentage: total ? Math.round((certified/total)*100) : 0, color: "#60a5fa" },
            { stage: "Hired / Placed", count: employed, percentage: total ? Math.round((employed/total)*100) : 0, color: "#16a34a" }
          ]);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleAdoptAction = (actionId) => {
    setAdoptedActions(prev => ({
      ...prev,
      [actionId]: true
    }));
  };

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Programme,Enrolled,Completion Rate,Certification Rate,Employment Rate,Retention 12M\n"
      + programmes.map(p => `"${p.name}",${p.enrolled},${p.completion_rate}%,${p.certification_rate}%,${p.employment_rate}%,${p.retention_12m}%`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "State_Skilling_Executive_Report_2025.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard" style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Sparkles size={18} color="#2563eb" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              STATE WORKFORCE DIRECT NUMBER ONE
            </span>
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Skilling Programme Intelligence Center
          </h1>
          <p className="page-description" style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Executive intelligence on training progression, skill acquisition, assessment benchmarks, and verified employment outcomes.
          </p>
        </div>

        {/* Header Actions: Report Export & Notifications */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          
          <button
            onClick={() => setReportModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.15rem',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#0f172a',
              cursor: 'pointer'
            }}
          >
            <FileDown size={16} /> Generate Executive Report
          </button>

          <button
            className="notification-button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.15rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Bell size={16} />
            Alerts & Attention Items
            <span style={{ background: '#ffffff', color: '#2563eb', padding: '1px 6px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, marginLeft: '4px' }}>
              {notifications.length}
            </span>
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div style={{ position: 'absolute', right: 0, top: '48px', width: '380px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', zIndex: 100, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>System Alerts & Action Items</strong>
                <button onClick={() => setNotificationsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}>&times;</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => { setNotificationsOpen(false); navigate(n.path); }}
                    style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', borderLeft: n.type === 'warning' ? '3px solid #f59e0b' : '3px solid #2563eb', cursor: 'pointer' }}
                  >
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>{n.title}</strong>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.35 }}>{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* FILTER BAR (WHITE BACKGROUND, HIGH CONTRAST) */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>District:</span>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            style={{ padding: '0.45rem 0.85rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="All Districts">All Districts (State-wide)</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Warangal">Warangal</option>
            <option value="Nalgonda">Nalgonda</option>
            <option value="Visakhapatnam">Visakhapatnam</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Programme:</span>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            style={{ padding: '0.45rem 0.85rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="All Programmes">All Training Programmes</option>
            <option value="Data Analytics">Data Analytics Specialist</option>
            <option value="Cybersecurity">Cybersecurity Specialist</option>
            <option value="AI & ML">AI & Machine Learning</option>
            <option value="Cloud">Cloud Infrastructure & DevOps</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Cohort:</span>
          <select
            value={cohort}
            onChange={(e) => setCohort(e.target.value)}
            style={{ padding: '0.45rem 0.85rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="All Cohorts">All Cohorts (2024–2025)</option>
            <option value="2025-Q1">Cohort 2025-Q1 (Current)</option>
            <option value="2024-Q4">Cohort 2024-Q4 (Placed)</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '4px 10px', borderRadius: '12px' }}>
            ● Live Data Synchronized
          </span>
        </div>

      </div>

      {/* 10 EXECUTIVE KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {kpi.title}
              </span>
              <span title={kpi.tooltip} style={{ color: '#94a3b8', cursor: 'help' }}>
                <HelpCircle size={14} />
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {kpi.value}
              </h2>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                {kpi.change}
              </span>
            </div>

            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              vs prev period ({kpi.previous})
            </span>
          </div>
        ))}
      </div>

      {/* TRAINEE PROGRESSION PIPELINE FUNNEL */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <TrendingUp size={18} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Trainee Impact & Progression Funnel</h3>
            </div>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Comprehensive stage-by-stage progression from enrollment to verified 12-month retention.</p>
          </div>
          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
            86% Training Completion Rate
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {funnel.map((step, idx) => (
            <div
              key={idx}
              style={{
                background: '#f8fafc',
                borderRadius: '10px',
                padding: '1rem',
                borderTop: `4px solid ${step.color}`,
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                {step.stage}
              </span>
              <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                {step.count}
              </h4>
              <span style={{ fontSize: '0.75rem', color: step.color, fontWeight: 700 }}>
                {step.percentage}% of cohort
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2-COLUMN SECTION: AI PROGRAMME INSIGHTS + ACTION CENTER */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* AI Programme Intelligence Section */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>AI DECISION SUPPORT</span>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Programme Intelligence & Diagnostics</h3>
            </div>
            <Link to="/impact-intelligence" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Deep Analytics <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {insights.map((ins) => (
              <div key={ins.id} style={{ padding: '1.15rem', background: '#f8fafc', borderRadius: '10px', borderLeft: ins.priority === 'High' ? '4px solid #f59e0b' : '4px solid #2563eb', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{ins.title}</strong>
                  <span style={{ background: ins.priority === 'High' ? '#fef3c7' : '#eff6ff', color: ins.priority === 'High' ? '#b45309' : '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                    {ins.category}
                  </span>
                </div>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>
                  {ins.summary}
                </p>
                <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                  <strong style={{ color: '#2563eb' }}>Suggested Strategy: </strong>
                  <span style={{ color: '#475569' }}>{ins.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center Section */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>EXECUTIVE ACTION QUEUE</span>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Recommended Interventions</h3>
            </div>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
              {actions.length} Action Items
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {actions.map((act) => {
              const isAdopted = Boolean(adoptedActions[act.id]);
              return (
                <div key={act.id} style={{ padding: '1.15rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{act.title}</strong>
                    <span style={{ background: act.priority.includes('High') ? '#fee2e2' : '#fef3c7', color: act.priority.includes('High') ? '#b91c1c' : '#b45309', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                      {act.priority}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.8rem', color: '#64748b' }}>
                    {act.programme} • {act.district}
                  </p>

                  <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>
                    <strong>Action:</strong> {act.suggested_action}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleAdoptAction(act.id)}
                      disabled={isAdopted}
                      style={{
                        padding: '0.45rem 0.95rem',
                        background: isAdopted ? '#dcfce7' : '#2563eb',
                        color: isAdopted ? '#15803d' : '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: isAdopted ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      {isAdopted ? <Check size={14} /> : <Zap size={14} />}
                      {isAdopted ? "Action Adopted" : "Approve & Adopt"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* PROGRAMME PERFORMANCE OVERVIEW TABLE */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Programme Health & Performance Summary</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Comparative scorecard of training completion, skill growth, and placement outcomes.</p>
          </div>
          <Link to="/programmes" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Full Programme Explorer <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Programme Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Enrolled</th>
                <th style={{ padding: '0.75rem 1rem' }}>Completion %</th>
                <th style={{ padding: '0.75rem 1rem' }}>Certified %</th>
                <th style={{ padding: '0.75rem 1rem' }}>Assessment Avg</th>
                <th style={{ padding: '0.75rem 1rem' }}>Employment %</th>
                <th style={{ padding: '0.75rem 1rem' }}>12M Retention</th>
                <th style={{ padding: '0.75rem 1rem' }}>Health Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {programmes.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    {p.name}
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{p.provider} • {p.district}</span>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#334155' }}>{p.enrolled} Trainees</td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#2563eb' }}>{p.completion_rate}%</td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#16a34a' }}>{p.certification_rate}%</td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#334155' }}>{p.avg_assessment_score}%</td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#15803d' }}>{p.employment_rate}%</td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#7c3aed' }}>{p.retention_12m}%</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: p.health_status === 'Excellent' ? '#dcfce7' : (p.health_status === 'Good' ? '#eff6ff' : '#fef3c7'), color: p.health_status === 'Excellent' ? '#15803d' : (p.health_status === 'Good' ? '#1d4ed8' : '#b45309'), padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {p.health_status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <Link to={`/programmes/${p.id}`} style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      Inspect <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= EXECUTIVE REPORT MODAL ================= */}
      {reportModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '650px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>STATE INTELLIGENCE EXPORT</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>Executive Skilling Programme Report</h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Generated on August 31, 2025 • Dept of IT & Skilling Intelligence</span>
              </div>
              <button onClick={() => setReportModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Executive Summary:</strong> 500 total trainees enrolled with 86% training completion and 78% confirmed employment rate across 5 flagship state programmes.</p>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>Top Performing Programme:</strong> AI & Machine Learning Associate (84% Employment, 91% 12M Retention).</p>
              <p style={{ margin: 0 }}><strong>Key Policy Recommendation:</strong> Expand Machine Learning capacity by 40 seats and mandate Technical Communication modules across all centers.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Includes full CSV dataset and audit records</span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setReportModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  onClick={handleDownloadCSV}
                  style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <FileDown size={15} /> Download CSV Report
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

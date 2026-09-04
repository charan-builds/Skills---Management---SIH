import { useState, useMemo, useEffect } from "react";
import {
  Target,
  Sparkles,
  Zap,
  Check,
  Search,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../utils/config";
import { fetchAuth } from "../utils/authFetch";
import { adminIntelligenceData } from "../utils/adminData";

export default function SkillGaps() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [liveSkills, setLiveSkills] = useState(null);

  useEffect(() => {
    async function loadSkillGaps() {
      try {
        const res = await fetchAuth(`${API_BASE}/api/ai/skill-gaps/summary`);
        if (res.ok) {
          const data = await res.json();
          // Map backend response: { skill_name, taught_by_programmes, demanded_by_employers, gap_score, priority }
          const mapped = data.map(s => ({
            skill: s.skill_name,
            category: "General", // Placeholder
            supply: s.taught_by_programmes,
            demand: s.demanded_by_employers,
            gap: s.gap_score,
            avg_proficiency: 75, // Mock fallback
            relevance: "High", // Mock fallback
            priority: s.priority,
            trend: "+10% YoY" // Mock fallback
          }));
          setLiveSkills(mapped.length > 0 ? mapped : null);
        }
      } catch (err) {
        console.error("Failed to load skill gaps:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSkillGaps();
  }, []);

  // Fail-safe data fallbacks
  const rawSkills = useMemo(() => liveSkills || adminIntelligenceData?.skill_intelligence || [
    {
      skill: "Python",
      category: "Programming & Automation",
      supply: 240,
      demand: 310,
      gap: 70,
      avg_proficiency: 82,
      relevance: "94% of vacancies",
      priority: "High",
      trend: "+14% YoY"
    },
    {
      skill: "Machine Learning",
      category: "AI & Data Science",
      supply: 85,
      demand: 160,
      gap: 75,
      avg_proficiency: 68,
      relevance: "88% of AI roles",
      priority: "Very High",
      trend: "+38% YoY"
    },
    {
      skill: "SQL & Relational DBs",
      category: "Database & Backend",
      supply: 260,
      demand: 280,
      gap: 20,
      avg_proficiency: 84,
      relevance: "96% of analytics roles",
      priority: "Moderate",
      trend: "+5% YoY"
    },
    {
      skill: "Power BI & Visualization",
      category: "Business Intelligence",
      supply: 110,
      demand: 180,
      gap: 70,
      avg_proficiency: 65,
      relevance: "78% of reporting roles",
      priority: "High",
      trend: "+22% YoY"
    },
    {
      skill: "Cybersecurity & SIEM",
      category: "Security Operations",
      supply: 90,
      demand: 175,
      gap: 85,
      avg_proficiency: 71,
      relevance: "90% of SOC vacancies",
      priority: "Very High",
      trend: "+42% YoY"
    },
    {
      skill: "Communication & Reporting",
      category: "Professional Competencies",
      supply: 190,
      demand: 250,
      gap: 60,
      avg_proficiency: 61,
      relevance: "Required across all roles",
      priority: "High",
      trend: "+8% YoY"
    },
    {
      skill: "Linux Administration",
      category: "Systems & Infrastructure",
      supply: 180,
      demand: 210,
      gap: 30,
      avg_proficiency: 86,
      relevance: "82% of tech ops roles",
      priority: "Moderate",
      trend: "+10% YoY"
    }
  ], [adminIntelligenceData]);

  // Rich metadata mapping for skills
  const skillMetadata = {
    "Python": {
      roles: ["Data Analyst", "ML/AI Associate", "Backend Developer", "Cloud Automation Engineer"],
      programmes: ["Data Analytics Specialist", "AI & Machine Learning Associate"],
      supporting_skills: ["Data Structures", "Pandas", "OOP", "Scripting"],
      why: "Python is the foundational language required across data engineering, AI, and backend automation.",
      action: "Maintain mandatory Python coding benchmarks and integrate automated test-driven assignments."
    },
    "Machine Learning": {
      roles: ["ML/AI Associate", "Predictive Analytics Specialist", "Junior Data Scientist"],
      programmes: ["AI & Machine Learning Associate"],
      supporting_skills: ["Statistics", "Scikit-Learn", "Model Evaluation", "Feature Engineering"],
      why: "Employer demand for predictive modelling has grown 38% YoY, far outpacing certified candidate supply.",
      action: "Add 40 additional training seats and deploy hands-on GPU cloud labs focused on model evaluation."
    },
    "SQL & Relational DBs": {
      roles: ["Data Analyst", "Database Engineer", "Business Intelligence Analyst"],
      programmes: ["Data Analytics Specialist", "Full Stack Web Development"],
      supporting_skills: ["Complex JOINs", "Window Functions", "Query Optimization"],
      why: "Universal prerequisite for data extraction and business reporting across all sectors.",
      action: "Introduce timed query optimization benchmarks in the second curriculum module."
    },
    "Power BI & Visualization": {
      roles: ["BI Developer", "Reporting Analyst", "Operations Data Specialist"],
      programmes: ["Data Analytics Specialist"],
      supporting_skills: ["DAX Formulas", "Data Modeling", "Dashboard UI Design"],
      why: "Enterprise analytics teams demand candidates capable of delivering executive dashboards with custom DAX.",
      action: "Embed 12 hours of advanced DAX practical modeling into the capstone project."
    },
    "Cybersecurity & SIEM": {
      roles: ["Cybersecurity Analyst", "SOC Tier-1 Triage Specialist", "Network Security Engineer"],
      programmes: ["Cybersecurity Specialist"],
      supporting_skills: ["Log Correlation", "Packet Analysis", "Incident Response", "Linux CLI"],
      why: "90% of SOC openings require live experience triaging alert telemetry in virtual sandboxes.",
      action: "Deploy interactive Splunk/ELK virtual SOC sandbox for 60 hours of live intrusion triage."
    },
    "Communication & Reporting": {
      roles: ["All Roles", "Technical Support", "Client-Facing Associates"],
      programmes: ["All Programmes"],
      supporting_skills: ["Stakeholder Briefings", "Technical Documentation", "Incident Reporting"],
      why: "62% of technical interview rejections cite difficulty in verbal problem decomposition and stakeholder briefings.",
      action: "Mandate weekly 15-minute simulated client presentations and structured written reports."
    },
    "Linux Administration": {
      roles: ["DevOps Engineer", "Cloud Associate", "System Administrator", "Cybersecurity Specialist"],
      programmes: ["Cloud Infrastructure & DevOps", "Cybersecurity Specialist"],
      supporting_skills: ["Shell Scripting", "User Permissions", "Systemd Services", "Networking"],
      why: "Standard OS operating foundation for enterprise cloud servers and security platforms.",
      action: "Maintain hands-on terminal mastery requirements with automated grading scripts."
    }
  };

  // States
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedSkillDetail, setSelectedSkillDetail] = useState(null);
  const [adoptedRecs, setAdoptedRecs] = useState({});

  // Calculations for KPIs
  const totalSkillsCount = rawSkills.length;
  const highPriorityGapsCount = rawSkills.filter(s => s.priority === "Very High" || s.priority === "High").length;
  const totalDemand = rawSkills.reduce((sum, s) => sum + (Number(s.demand) || 0), 0);
  const totalSupply = rawSkills.reduce((sum, s) => sum + (Number(s.supply) || 0), 0);

  // Maximum value for horizontal bar chart scaling
  const maxBarValue = Math.max(...rawSkills.map(s => Math.max(s.demand, s.supply))) || 350;

  // Filtered skills
  const filteredSkills = useMemo(() => {
    return rawSkills.filter((s) => {
      const q = (search || "").toLowerCase();
      const matchesSearch =
        !search ||
        (s.skill || "").toLowerCase().includes(q) ||
        (s.category || "").toLowerCase().includes(q);

      const matchesPriority =
        priorityFilter === "All" ||
        s.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        s.category === categoryFilter;

      return matchesSearch && matchesPriority && matchesCategory;
    });
  }, [rawSkills, search, priorityFilter, categoryFilter]);

  const uniqueCategories = [...new Set(rawSkills.map(s => s.category))].sort();

  const handleClearFilters = () => {
    setSearch("");
    setPriorityFilter("All");
    setCategoryFilter("All");
  };

  const handleAdopt = (skillName) => {
    setAdoptedRecs(prev => ({
      ...prev,
      [skillName]: true
    }));
  };

  return (
    <div className="dashboard" style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Target size={18} color="#2563eb" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              LABOUR MARKET ALIGNMENT & 3-WAY GAP ANALYSIS
            </span>
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            SKILL GAP INTELLIGENCE
          </h1>
          <p className="page-description" style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Identify workforce skill shortages and understand where training should be strengthened.
          </p>
        </div>

        <button
          onClick={() => navigate("/interventions")}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.65rem 1.25rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <Zap size={16} /> Launch What-If Simulator
        </button>
      </div>

      {/* TOP KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Skills Analyzed</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a' }}>{totalSkillsCount}</h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Core tech & soft skill domains</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>High-Priority Gaps</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#b91c1c' }}>{highPriorityGapsCount}</h3>
          <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 700 }}>Immediate capacity expansion needed</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Employer Demand</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#2563eb' }}>{totalDemand.toLocaleString()} Openings</h3>
          <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>Across 28 hiring employers</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Candidate Supply</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#16a34a' }}>{totalSupply.toLocaleString()} Certified</h3>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>500 total active trainees</span>
        </div>

      </div>

      {/* ================= SECTION 1: SKILL DEMAND VS SUPPLY (HORIZONTAL BARS) ================= */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              SKILL DEMAND VS SUPPLY
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
              Visualizing the volume differential between industry requirements and certified trainee availability.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0f172a', fontWeight: 600 }}>
              <span style={{ width: '12px', height: '12px', background: '#0f172a', borderRadius: '2px' }}></span> Employer Demand
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb', fontWeight: 600 }}>
              <span style={{ width: '12px', height: '12px', background: '#2563eb', borderRadius: '2px' }}></span> Trainee Supply
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {rawSkills.map((item, idx) => {
            const demandPct = Math.round((item.demand / maxBarValue) * 100);
            const supplyPct = Math.round((item.supply / maxBarValue) * 100);

            return (
              <div key={idx} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{item.skill}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>({item.category})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ background: item.gap > 50 ? '#fee2e2' : '#eff6ff', color: item.gap > 50 ? '#b91c1c' : '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                      Gap: {item.gap} Deficit
                    </span>
                    <button
                      onClick={() => setSelectedSkillDetail(item)}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}
                    >
                      View Detail
                    </button>
                  </div>
                </div>

                {/* Demand Bar */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', marginBottom: '0.2rem' }}>
                    <span>Demand</span>
                    <strong>{item.demand} Openings</strong>
                  </div>
                  <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${demandPct}%`, height: '100%', background: '#0f172a', borderRadius: '5px' }}></div>
                  </div>
                </div>

                {/* Supply Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', marginBottom: '0.2rem' }}>
                    <span>Supply</span>
                    <strong style={{ color: '#2563eb' }}>{item.supply} Candidates</strong>
                  </div>
                  <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${supplyPct}%`, height: '100%', background: '#2563eb', borderRadius: '5px' }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= SECTION 2: FILTER ROW ================= */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        
        {/* Search */}
        <div style={{ flex: '1.5', minWidth: '220px', position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search skill name or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500 }}
          />
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="All">All Priorities</option>
            <option value="Very High">VERY HIGH</option>
            <option value="High">HIGH</option>
            <option value="Moderate">MODERATE</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="All">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button
          onClick={handleClearFilters}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem 0.85rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569', cursor: 'pointer', marginLeft: 'auto' }}
        >
          <RotateCcw size={13} /> Reset Filters
        </button>

      </div>

      {/* ================= SECTION 3: SKILL GAP TABLE ================= */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Skill Gap Matrix
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
              Detailed breakdown of labour market demand, trainee supply, proficiency benchmark, and intervention priority.
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Showing {filteredSkills.length} Skills</span>
        </div>

        {filteredSkills.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Skill Name</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Employer Demand</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Trainee Supply</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Net Gap</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Avg Proficiency</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Priority Level</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkills.map((s, idx) => {
                  const priorityClass = s.priority === "Very High" ? "VERY HIGH" : (s.priority === "High" ? "HIGH" : "MODERATE");
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>
                        {s.skill}
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{s.category}</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                        {s.demand}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#2563eb' }}>
                        {s.supply}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ background: s.gap > 50 ? '#fee2e2' : '#eff6ff', color: s.gap > 50 ? '#b91c1c' : '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                          {s.gap}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                        {s.avg_proficiency}%
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{ background: s.priority === 'Very High' ? '#fee2e2' : (s.priority === 'High' ? '#fef3c7' : '#eff6ff'), color: s.priority === 'Very High' ? '#b91c1c' : (s.priority === 'High' ? '#b45309' : '#1d4ed8'), padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                          {priorityClass}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedSkillDetail(s)}
                          style={{ padding: '0.4rem 0.9rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <p style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>No skills match the selected filters.</p>
            <button
              onClick={handleClearFilters}
              style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ================= SECTION 4: AI SKILL GAP INSIGHTS ================= */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Sparkles size={20} color="#2563eb" />
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            AI SKILL GAP INSIGHTS
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid #b91c1c', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Machine Learning</strong>
              <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>VERY HIGH GAP</span>
            </div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#334155' }}>
              <strong>WHY IT MATTERS:</strong> Employer demand (160 openings) is 38% higher than certified trainee supply (85 candidates).
            </p>
            <div style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#1e40af' }}>
              <strong>RECOMMENDED ACTION:</strong> Increase ML training capacity by 40 seats and add practical model evaluation labs.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid #f59e0b', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Communication & Incident Reporting</strong>
              <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>HIGH GAP</span>
            </div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#334155' }}>
              <strong>WHY IT MATTERS:</strong> 62% of interviewer rejection notes cite technical communication barriers despite strong coding scores.
            </p>
            <div style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#1e40af' }}>
              <strong>RECOMMENDED ACTION:</strong> Mandate weekly stakeholder incident briefing simulations in all training cohorts.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid #2563eb', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Python & SQL Dual Stack</strong>
              <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>HIGH RELEVANCE</span>
            </div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#334155' }}>
              <strong>WHY IT MATTERS:</strong> Python has strong trainee supply (240) and remains demanded by 94% of enterprise analytics roles.
            </p>
            <div style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#1e40af' }}>
              <strong>RECOMMENDED ACTION:</strong> Maintain mandatory dual-certification benchmark to protect 92% placement success.
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', borderLeft: '4px solid #b91c1c', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Cybersecurity & SIEM Operations</strong>
              <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>VERY HIGH GAP</span>
            </div>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#334155' }}>
              <strong>WHY IT MATTERS:</strong> 85 trainee shortage against active SOC telemetry triage vacancies.
            </p>
            <div style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#1e40af' }}>
              <strong>RECOMMENDED ACTION:</strong> Deploy virtual Splunk/ELK interactive sandbox for 80 hours practical triage.
            </div>
          </div>

        </div>
      </div>

      {/* ================= SECTION 5: RECOMMENDED TRAINING ACTIONS ================= */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              RECOMMENDED TRAINING ACTIONS
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
              Targeted curriculum enhancements and laboratory additions to eliminate identified skill deficits.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {rawSkills.map((s) => {
            const meta = skillMetadata[s.skill] || {
              why: "Critical competency required for enterprise vacancy matching.",
              action: "Strengthen practical lab hours and capstone project assessments."
            };
            const isAdopted = Boolean(adoptedRecs[s.skill]);

            return (
              <div
                key={s.skill}
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{s.skill}</strong>
                    <span style={{ background: s.priority === 'Very High' ? '#fee2e2' : (s.priority === 'High' ? '#fef3c7' : '#eff6ff'), color: s.priority === 'Very High' ? '#b91c1c' : (s.priority === 'High' ? '#b45309' : '#1d4ed8'), padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                      {s.priority.toUpperCase()}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#b91c1c', fontWeight: 600 }}>
                    <strong>Problem:</strong> {s.gap} Candidate Deficit ({s.demand} Demand vs {s.supply} Supply)
                  </p>

                  <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.85rem', color: '#334155', lineHeight: 1.4 }}>
                    <strong>Recommended Training:</strong> {meta.action}
                  </p>

                  <div style={{ background: '#ffffff', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#15803d', fontWeight: 600, marginBottom: '1rem' }}>
                    ✓ Expected Benefit: +18% Offer Generation Rate
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => handleAdopt(s.skill)}
                    disabled={isAdopted}
                    style={{
                      padding: '0.45rem 1rem',
                      background: isAdopted ? '#dcfce7' : '#2563eb',
                      color: isAdopted ? '#15803d' : '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: isAdopted ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    {isAdopted ? <Check size={14} /> : <Zap size={14} />}
                    {isAdopted ? "Action Adopted" : "Adopt Action"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= SKILL DETAIL MODAL (SECTION 9 & 11) ================= */}
      {selectedSkillDetail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>COMPETENCY PROFILE</span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{selectedSkillDetail.skill}</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Domain: {selectedSkillDetail.category}</span>
              </div>
              <button onClick={() => setSelectedSkillDetail(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            {/* 4 Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Demand</span>
                <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>{selectedSkillDetail.demand}</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Supply</span>
                <strong style={{ fontSize: '1.15rem', color: '#2563eb' }}>{selectedSkillDetail.supply}</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Net Gap</span>
                <strong style={{ fontSize: '1.15rem', color: '#b91c1c' }}>-{selectedSkillDetail.gap}</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Proficiency</span>
                <strong style={{ fontSize: '1.15rem', color: '#16a34a' }}>{selectedSkillDetail.avg_proficiency}%</strong>
              </div>
            </div>

            {/* Roles, Programmes, Supporting Skills */}
            {(() => {
              const meta = skillMetadata[selectedSkillDetail.skill] || {
                roles: ["Data Analyst", "Associate Engineer"],
                programmes: ["Data Analytics Specialist"],
                supporting_skills: ["Problem Solving", "Tools Mastery"],
                why: "Critical competency required for enterprise vacancy matching.",
                action: "Strengthen practical lab hours and capstone project assessments."
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.35rem' }}>Relevant Enterprise Roles:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {meta.roles.map((r, i) => (
                        <span key={i} style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          💼 {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.35rem' }}>Associated State Programmes:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {meta.programmes.map((p, i) => (
                        <span key={i} style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          🎓 {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.35rem' }}>Missing / Weak Supporting Skills:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {meta.supporting_skills.map((s, i) => (
                        <span key={i} style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          △ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#334155' }}><strong>Why it matters:</strong> {meta.why}</p>
                    <p style={{ margin: 0, color: '#1e40af' }}><strong>Recommended action:</strong> {meta.action}</p>
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => { setSelectedSkillDetail(null); navigate("/trainees"); }}
                  style={{ padding: '0.5rem 0.85rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                >
                  View Candidates
                </button>
                <button
                  onClick={() => { setSelectedSkillDetail(null); navigate("/programmes"); }}
                  style={{ padding: '0.5rem 0.85rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                >
                  View Programmes
                </button>
              </div>

              <button
                onClick={() => setSelectedSkillDetail(null)}
                style={{ padding: '0.55rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

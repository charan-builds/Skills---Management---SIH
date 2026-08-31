import { useState, useMemo } from "react";
import {
  Search,
  Users,
  BriefcaseBusiness,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  Building,
  Target,
  FileCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminIntelligenceData } from "../utils/adminData";

export default function Programmes() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All Districts");
  const [healthFilter, setHealthFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("employment_desc");
  const [viewMode, setViewMode] = useState("cards"); // "cards", "table", "compare"
  const [compareList, setCompareList] = useState(["P001", "P003"]);

  const allProgrammes = adminIntelligenceData.programmes;

  const toggleCompare = (progId) => {
    if (compareList.includes(progId)) {
      setCompareList(compareList.filter(id => id !== progId));
    } else {
      if (compareList.length < 3) {
        setCompareList([...compareList, progId]);
      }
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setDistrictFilter("All Districts");
    setHealthFilter("All Status");
    setSortBy("employment_desc");
  };

  const filteredProgrammes = useMemo(() => {
    let result = allProgrammes.filter((prog) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        prog.name.toLowerCase().includes(q) ||
        prog.provider.toLowerCase().includes(q) ||
        prog.id.toLowerCase().includes(q);

      const matchesDistrict =
        districtFilter === "All Districts" ||
        prog.district === districtFilter;

      const matchesHealth =
        healthFilter === "All Status" ||
        prog.health_status === healthFilter;

      return matchesSearch && matchesDistrict && matchesHealth;
    });

    result.sort((a, b) => {
      if (sortBy === "employment_desc") return b.employment_rate - a.employment_rate;
      if (sortBy === "completion_desc") return b.completion_rate - a.completion_rate;
      if (sortBy === "enrolled_desc") return b.enrolled - a.enrolled;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [allProgrammes, search, districtFilter, healthFilter, sortBy]);

  const uniqueDistricts = [...new Set(allProgrammes.map(p => p.district))].sort();

  return (
    <div className="dashboard" style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Layers size={18} color="#2563eb" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              CURRICULUM & PROVIDER EVALUATION
            </span>
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Programme Performance Center
          </h1>
          <p className="page-description" style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Evaluate training programmes across the complete impact chain: Training → Skills → Assessments → Employment → Retention.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', background: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode("cards")}
            style={{
              padding: '0.45rem 0.95rem',
              border: 'none',
              borderRadius: '6px',
              background: viewMode === "cards" ? '#ffffff' : 'transparent',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: viewMode === "cards" ? '#0f172a' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Card Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            style={{
              padding: '0.45rem 0.95rem',
              border: 'none',
              borderRadius: '6px',
              background: viewMode === "table" ? '#ffffff' : 'transparent',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: viewMode === "table" ? '#0f172a' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Performance Table
          </button>
          <button
            onClick={() => setViewMode("compare")}
            style={{
              padding: '0.45rem 0.95rem',
              border: 'none',
              borderRadius: '6px',
              background: viewMode === "compare" ? '#ffffff' : 'transparent',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: viewMode === "compare" ? '#2563eb' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Compare ({compareList.length})
          </button>
        </div>
      </div>

      {/* TOP SUMMARY KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Programmes</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a' }}>{allProgrammes.length}</h3>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>100% Accredited State Hubs</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Enrolled Trainees</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#2563eb' }}>500</h3>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Across 4 districts</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Avg Completion Rate</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#0f172a' }}>86%</h3>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>+4.0% YoY</span>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Avg Employment Rate</span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#15803d' }}>78%</h3>
          <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>80+ Trainees Placed</span>
        </div>
      </div>

      {/* FILTER BAR (WHITE BACKGROUND, CRISP VISIBLE CONTROLS) */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        
        {/* Search */}
        <div style={{ flex: '1.5', minWidth: '220px', position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search programme, ID, or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500 }}
          />
        </div>

        {/* District Filter */}
        <div>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="All Districts">All Districts</option>
            {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Health Filter */}
        <div>
          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="All Status">All Health Statuses</option>
            <option value="Excellent">Excellent Health</option>
            <option value="Good">Good Health</option>
            <option value="Needs Attention">Needs Attention</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.55rem 0.85rem', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="employment_desc">Highest Employment Rate</option>
            <option value="completion_desc">Highest Completion Rate</option>
            <option value="enrolled_desc">Highest Enrollment</option>
            <option value="name_asc">Programme Name (A-Z)</option>
          </select>
        </div>

        <button
          onClick={handleClearFilters}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.55rem 0.85rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569', cursor: 'pointer', marginLeft: 'auto' }}
        >
          <RotateCcw size={13} /> Reset
        </button>

      </div>

      {/* ================= VIEW 1: COMPARISON MODE ================= */}
      {viewMode === "compare" && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>SIDE-BY-SIDE EVALUATION</span>
              <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Programme Benchmark Matrix</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Comparing {compareList.length} selected training initiatives across 8 impact dimensions.</p>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Select checkboxes on cards to compare up to 3</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>Dimension</th>
                  {compareList.map(pid => {
                    const prog = allProgrammes.find(p => p.id === pid);
                    return (
                      <th key={pid} style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: 800 }}>
                        {prog?.name}
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{prog?.provider}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#334155' }}>Enrolled Capacity</td>
                  {compareList.map(pid => <td key={pid} style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 600 }}>{allProgrammes.find(p => p.id === pid)?.enrolled} Trainees</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#334155' }}>Training Completion %</td>
                  {compareList.map(pid => <td key={pid} style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>{allProgrammes.find(p => p.id === pid)?.completion_rate}%</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#334155' }}>Certification %</td>
                  {compareList.map(pid => <td key={pid} style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>{allProgrammes.find(p => p.id === pid)?.certification_rate}%</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#334155' }}>Skill Gain Velocity</td>
                  {compareList.map(pid => <td key={pid} style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: '#7c3aed' }}>{allProgrammes.find(p => p.id === pid)?.avg_skill_gain}</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#334155' }}>Assessment Benchmark Avg</td>
                  {compareList.map(pid => <td key={pid} style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 600 }}>{allProgrammes.find(p => p.id === pid)?.avg_assessment_score}%</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#334155' }}>Employment Outcome %</td>
                  {compareList.map(pid => <td key={pid} style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 800, color: '#15803d' }}>{allProgrammes.find(p => p.id === pid)?.employment_rate}%</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#334155' }}>12-Month Retention Rate</td>
                  {compareList.map(pid => <td key={pid} style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>{allProgrammes.find(p => p.id === pid)?.retention_12m}%</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#334155' }}>Average Starting Salary</td>
                  {compareList.map(pid => <td key={pid} style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>{allProgrammes.find(p => p.id === pid)?.avg_starting_salary}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: CARDS GRID ================= */}
      {viewMode === "cards" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
          {filteredProgrammes.map((prog) => {
            const isCompared = compareList.includes(prog.id);
            return (
              <div
                key={prog.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  {/* Card Top: Health, Demand, Compare toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ background: prog.health_status === 'Excellent' ? '#dcfce7' : (prog.health_status === 'Good' ? '#eff6ff' : '#fef3c7'), color: prog.health_status === 'Excellent' ? '#15803d' : (prog.health_status === 'Good' ? '#1d4ed8' : '#b45309'), padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {prog.health_status}
                      </span>
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                        Demand: {prog.demand_level}
                      </span>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isCompared}
                        onChange={() => toggleCompare(prog.id)}
                      />
                      Compare
                    </label>
                  </div>

                  <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                    {prog.name}
                  </h3>
                  <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#64748b' }}>
                    {prog.provider} • {prog.district} • {prog.enrolled} Enrolled Trainees
                  </p>

                  {/* Impact Metrics Progress Bars */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Completion</span>
                        <strong style={{ color: '#2563eb' }}>{prog.completion_rate}%</strong>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${prog.completion_rate}%`, height: '100%', background: '#2563eb' }}></div>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Certification</span>
                        <strong style={{ color: '#16a34a' }}>{prog.certification_rate}%</strong>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${prog.certification_rate}%`, height: '100%', background: '#16a34a' }}></div>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Employment Rate</span>
                        <strong style={{ color: '#15803d' }}>{prog.employment_rate}%</strong>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${prog.employment_rate}%`, height: '100%', background: '#15803d' }}></div>
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>12M Retention</span>
                        <strong style={{ color: '#7c3aed' }}>{prog.retention_12m}%</strong>
                      </div>
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${prog.retention_12m}%`, height: '100%', background: '#7c3aed' }}></div>
                      </div>
                    </div>

                  </div>

                  {/* Skills tags */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>CORE TAUGHT SKILLS</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {prog.top_skills.map((s, i) => (
                        <span key={i} style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Inspect Impact Chain */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Starting: <strong style={{ color: '#0f172a' }}>{prog.avg_starting_salary}</strong>
                  </span>

                  <button
                    onClick={() => navigate(`/programmes/${prog.id}`)}
                    style={{
                      padding: '0.5rem 1.15rem',
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    Inspect Impact Chain <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ================= VIEW 3: TABLE VIEW ================= */}
      {viewMode === "table" && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Programme</th>
                  <th style={{ padding: '0.75rem 1rem' }}>District</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Enrolled</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Completion</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Certified</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Skill Gain</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Employment</th>
                  <th style={{ padding: '0.75rem 1rem' }}>12M Retention</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Health</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProgrammes.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>
                      {p.name}
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{p.provider}</span>
                    </td>
                    <td style={{ padding: '1rem', color: '#475569' }}>{p.district}</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{p.enrolled}</td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#2563eb' }}>{p.completion_rate}%</td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#16a34a' }}>{p.certification_rate}%</td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#7c3aed' }}>{p.avg_skill_gain}</td>
                    <td style={{ padding: '1rem', fontWeight: 800, color: '#15803d' }}>{p.employment_rate}%</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{p.retention_12m}%</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: p.health_status === 'Excellent' ? '#dcfce7' : (p.health_status === 'Good' ? '#eff6ff' : '#fef3c7'), color: p.health_status === 'Excellent' ? '#15803d' : (p.health_status === 'Good' ? '#1d4ed8' : '#b45309'), padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {p.health_status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/programmes/${p.id}`)}
                        style={{ padding: '0.4rem 0.85rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

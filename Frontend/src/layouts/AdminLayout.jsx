import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, LogOut, ChevronDown, X,
  LayoutDashboard, BarChart3, Briefcase, Target, GraduationCap, 
  Building2, Map, Users2, Users, ShieldCheck, FileText, Filter, GitBranch, RefreshCw
} from "lucide-react";
import "../../src/App.css";
import { FilterProvider, useFilters } from "../context/FilterContext";
import { usePlatformStore, platformService } from "../services/platformService";
import { ModeBanner } from "../components/common/DataStateComponents";

const adminMenuItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Trainees", path: "/admin/trainees", icon: Users },
  { label: "Programme Outcomes", path: "/admin/outcomes", icon: BarChart3 },
  { label: "Employment Over Time", path: "/admin/employment", icon: Briefcase },
  { label: "Skills Missing in Jobs", path: "/admin/skill-gaps", icon: Target },
  { label: "Programme Performance", path: "/admin/programmes", icon: GraduationCap },
  { label: "Training Provider Performance", path: "/admin/providers", icon: Building2 },
  { label: "District Performance", path: "/admin/districts", icon: Map },
  { label: "Cohort Comparison", path: "/admin/cohorts", icon: Users2 },
  { label: "Key Findings & Insights", path: "/admin/interventions", icon: GitBranch },
  { label: "Employer Verification", path: "/admin/employers", icon: ShieldCheck },
  { label: "Reports", path: "/admin/reports", icon: FileText }
];

export default function AdminLayout({ children }) {
  return (
    <FilterProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </FilterProvider>
  );
}

function AdminLayoutInner({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { filters, updateFilter, clearFilters, activeFilterCount, isFilterTransitioning } = useFilters();
  const store = usePlatformStore();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Compute live scope count from authoritative 800 relational dataset
  const filteredTrainees = useMemo(() => {
    return platformService.filterTrainees(store.trainees || [], filters);
  }, [store.trainees, filters]);

  const totalTrainees = (store.trainees || []).length || 800;
  const scopeCount = filteredTrainees.length;
  const scopePct = Math.round((scopeCount / (totalTrainees || 1)) * 100);

  return (
    <div className={`app-layout ${sidebarOpen ? "" : "sidebar-closed"}`}>
      {/* SIDEBAR */}
      {sidebarOpen && (
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.label} to={item.path} className={`sidebar-item ${isActive ? "active" : ""}`}>
                  <Icon size={19} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      <main className="main-content">
        <div className="admin-topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar" type="button">
            <Menu size={22} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
              National Skilling Framework • Admin Intelligence
            </span>
          </div>

          <div className="admin-profile-wrapper">
            <button className="admin-profile-button" onClick={() => setProfileOpen(!profileOpen)} type="button">
              <div className="admin-avatar">A</div>
              <div className="admin-profile-text">
                <strong>Admin</strong>
                <span>Government Officer</span>
              </div>
              <ChevronDown size={16} className={profileOpen ? "profile-chevron open" : "profile-chevron"} />
            </button>

            {profileOpen && (
              <div className="admin-profile-dropdown">
                <button type="button" onClick={handleLogout} className="logout-menu-item">
                  <LogOut size={17} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* PAGE CONTENT */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
          
          {/* GLOBAL FILTER BAR (7 RELATIONAL DIMENSIONS) */}
          <div style={{ 
            background: 'white', padding: '1.25rem', borderRadius: '12px', 
            border: '1px solid #e2e8f0', marginBottom: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: '#eff6ff', padding: '6px', borderRadius: '8px', color: '#2563eb' }}>
                  <Filter size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Global Analytical Scope Filter</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                    Cascades across all KPIs, outcome funnels, longitudinal curves, and drilldowns.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="scope-badge" style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 700, 
                  background: scopeCount === 0 ? '#fee2e2' : '#f0fdf4', 
                  color: scopeCount === 0 ? '#b91c1c' : '#15803d',
                  padding: '4px 10px', 
                  borderRadius: '12px',
                  border: `1px solid ${scopeCount === 0 ? '#fca5a5' : '#bbf7d0'}`
                }}>
                  {scopeCount} / {totalTrainees} Trainees in Scope ({scopePct}%)
                </span>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    style={{
                      padding: '4px 10px',
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <RefreshCw size={12} /> Clear All Filters ({activeFilterCount})
                  </button>
                )}
              </div>
            </div>

            {/* 7 Filter Selectors Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '0.75rem' 
            }}>
              {/* 1. Cohort */}
              <div>
                <label htmlFor="filter-cohort" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Cohort</label>
                <select 
                  id="filter-cohort"
                  value={filters.cohort} 
                  onChange={e => updateFilter('cohort', e.target.value)} 
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                >
                  <option value="">All Cohorts</option>
                  <option value="2024-Q1">2024-Q1</option>
                  <option value="2023-Q4">2023-Q4</option>
                  <option value="2023-Q3">2023-Q3</option>
                  <option value="2023-Q2">2023-Q2</option>
                </select>
              </div>

              {/* 2. Programme */}
              <div>
                <label htmlFor="filter-course" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Programme</label>
                <select 
                  id="filter-course"
                  value={filters.course || filters.programme || ""} 
                  onChange={e => updateFilter('course', e.target.value)} 
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                >
                  <option value="">All Programmes</option>
                  <option value="Cloud Infrastructure & DevOps">Cloud Infrastructure & DevOps</option>
                  <option value="Full Stack Web Engineering">Full Stack Web Engineering</option>
                  <option value="Automotive Precision & EV Systems">Automotive Precision & EV</option>
                  <option value="Patient Care & Healthcare Operations">Patient Care Operations</option>
                  <option value="Renewable Energy & Solar Grid">Renewable Solar Grid</option>
                </select>
              </div>

              {/* 3. Provider */}
              <div>
                <label htmlFor="filter-provider" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Training Provider</label>
                <select 
                  id="filter-provider"
                  value={filters.provider} 
                  onChange={e => updateFilter('provider', e.target.value)} 
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                >
                  <option value="">All Providers</option>
                  <option value="TATA STRIVE">TATA STRIVE</option>
                  <option value="Tech Mahindra Foundation">Tech Mahindra Foundation</option>
                  <option value="Don Bosco Tech Society">Don Bosco Tech</option>
                  <option value="Apollo MedSkills Institute">Apollo MedSkills</option>
                  <option value="Schneider Electric Training Centre">Schneider Electric</option>
                </select>
              </div>

              {/* 4. District */}
              <div>
                <label htmlFor="filter-district" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>District</label>
                <select 
                  id="filter-district"
                  value={filters.district} 
                  onChange={e => updateFilter('district', e.target.value)} 
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                >
                  <option value="">All Districts</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Thane">Thane</option>
                  <option value="Guntur">Guntur</option>
                </select>
              </div>

              {/* 5. Gender */}
              <div>
                <label htmlFor="filter-gender" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Gender</label>
                <select 
                  id="filter-gender"
                  value={filters.gender || ""} 
                  onChange={e => updateFilter('gender', e.target.value)} 
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                >
                  <option value="">All Genders</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* 6. Age Group */}
              <div>
                <label htmlFor="filter-age-group" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Age Group</label>
                <select 
                  id="filter-age-group"
                  value={filters.ageGroup || ""} 
                  onChange={e => updateFilter('ageGroup', e.target.value)} 
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                >
                  <option value="">All Ages</option>
                  <option value="18-21">18-21 years</option>
                  <option value="22-25">22-25 years</option>
                  <option value="26-30">26-30 years</option>
                  <option value="31+">31+ years</option>
                </select>
              </div>

              {/* 7. Category */}
              <div>
                <label htmlFor="filter-category" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Category</label>
                <select 
                  id="filter-category"
                  value={filters.category || ""} 
                  onChange={e => updateFilter('category', e.target.value)} 
                  style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                >
                  <option value="">All Categories</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Active Filters:</span>
                {Object.entries(filters).map(([k, v]) => {
                  if (!v) return null;
                  return (
                    <span 
                      key={k} 
                      style={{ 
                        background: '#eff6ff', 
                        color: '#1d4ed8', 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.3rem',
                        fontWeight: 600
                      }}
                    >
                      {k}: {v}
                      <button 
                        onClick={() => updateFilter(k, "")} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d4ed8', padding: 0 }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <ModeBanner mode="Government / Admin Simulation Mode" />

          {/* TRANSITION OVERLAY / PAGE CONTAINER */}
          <div style={{ opacity: isFilterTransitioning ? 0.6 : 1, transition: 'opacity 0.15s ease' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

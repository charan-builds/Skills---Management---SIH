import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, LogOut, ChevronDown,
  LayoutDashboard, User, BookOpen,
  PieChart, Zap, Target, Milestone,
  Bell, MessageSquare, ShieldCheck,
  UserCheck, RefreshCw
} from "lucide-react";
import "../../src/App.css";
import { ModeBanner } from "../components/common/DataStateComponents";
import { usePlatformStore } from "../services/platformService";

const traineeMenuItems = [
  { label: "Home", path: "/trainee", icon: LayoutDashboard },
  { label: "My Profile", path: "/trainee/profile", icon: User },
  { label: "My Training", path: "/trainee/training", icon: BookOpen },
  { label: "My Outcomes", path: "/trainee/outcomes", icon: PieChart },
  { label: "My Skills", path: "/trainee/skills", icon: Zap },
  { label: "Skill Goals", path: "/trainee/skill-goals", icon: Target },
  { label: "Employment Journey", path: "/trainee/employment-journey", icon: Milestone },
  { label: "Follow-Ups", path: "/trainee/follow-ups", icon: Bell },
  { label: "Feedback", path: "/trainee/feedback", icon: MessageSquare },
  { label: "Privacy & Consent", path: "/trainee/consent", icon: ShieldCheck }
];

export default function TraineeLayout({ children }) {
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const storeState = usePlatformStore();

  const currentTraineeId = localStorage.getItem("traineeId") || "TR-0001";
  const currentTrainee = (storeState.trainees || []).find(t => t.id === currentTraineeId) || storeState.trainees?.[0];

  const availablePersonas = useMemo(() => {
    const list = storeState.trainees || [];
    if (list.length === 0) return [];
    const sampleIds = ["TR-0001", "TR-0002", "TR-0003", "TR-0004", "TR-0006", "TR-0014"];
    const found = sampleIds.map(id => list.find(t => t.id === id)).filter(Boolean);
    return found.length > 0 ? found : list.slice(0, 6);
  }, [storeState.trainees]);

  const handleTraineeSwitch = (newId) => {
    localStorage.setItem("traineeId", newId);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="app-layout trainee-layout-container">
      {/* Left Edge Hover Zone to open sidebar on mouse hover */}
      <div 
        onMouseEnter={() => setSidebarHovered(true)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "16px",
          height: "100vh",
          zIndex: 9999,
          cursor: "pointer"
        }}
      />

      {/* SIDEBAR - CLOSED BY DEFAULT, OPENS ON HOVER ONLY */}
      <aside 
        className={`sidebar ${sidebarHovered ? "sidebar-expanded" : "sidebar-closed"}`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        style={{
          width: "260px",
          transform: sidebarHovered ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 10000,
          background: "#0f172a",
          borderRight: "1px solid #1e293b",
          boxShadow: sidebarHovered ? "8px 0 32px rgba(0,0,0,0.35)" : "none",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={18} color="white" />
          </div>
          <div style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
            <strong style={{ fontSize: "0.95rem", color: "#f8fafc", display: "block" }}>Trainee Portal</strong>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Personal Skills & Career</span>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ padding: "0.85rem 0.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {traineeMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path === "/trainee/training" && location.pathname === "/trainee/training-history");
            return (
              <Link 
                key={item.label} 
                to={item.path} 
                className={`sidebar-item ${isActive ? "active" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  padding: "0.7rem 0.85rem",
                  borderRadius: "8px",
                  color: isActive ? "#ffffff" : "#94a3b8",
                  background: isActive ? "#2563eb" : "transparent",
                  textDecoration: "none",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.85rem",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap"
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="main-content" style={{ marginLeft: 0, width: "100%", flex: 1, minWidth: 0 }}>
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="menu-toggle" 
              onMouseEnter={() => setSidebarHovered(true)}
              onClick={() => setSidebarHovered(!sidebarHovered)} 
              type="button"
              aria-label="Toggle sidebar menu"
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                padding: "7px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0f172a"
              }}
            >
              <Menu size={22} color="#0f172a" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Trainee Persona:</span>
              <select
                value={currentTraineeId}
                onChange={(e) => handleTraineeSwitch(e.target.value)}
                style={{
                  fontSize: '0.85rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                {availablePersonas.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.id}: {t.name} ({t.employment?.status || t.training_status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a' }}>
                {currentTrainee?.name || "Trainee Persona"}
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                ID: {currentTrainee?.id || currentTraineeId}
              </span>
            </div>

            <div className="admin-profile-wrapper">
              <button className="admin-profile-button" onClick={() => setProfileOpen(!profileOpen)} type="button">
                <div className="admin-avatar" style={{ background: '#2563eb', color: 'white' }}>
                  {(currentTrainee?.name || "T")[0]}
                </div>
                <ChevronDown size={16} className={profileOpen ? "profile-chevron open" : "profile-chevron"} />
              </button>
              {profileOpen && (
                <div className="admin-profile-dropdown">
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                      {currentTrainee?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {currentTrainee?.email}
                    </div>
                  </div>
                  <button type="button" onClick={() => { setProfileOpen(false); navigate("/trainee/profile"); }} className="logout-menu-item" style={{ color: '#334155' }}>
                    <User size={15} />
                    <span>View Profile</span>
                  </button>
                  <button type="button" onClick={handleLogout} className="logout-menu-item">
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* PAGE CONTENT */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
          <ModeBanner mode="Trainee Personal Intelligence Mode" />
          {children}
        </div>
      </main>
    </div>
  );
}

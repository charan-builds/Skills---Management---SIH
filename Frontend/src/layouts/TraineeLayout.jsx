import { useState, useEffect } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const storeState = usePlatformStore();

  const currentTraineeId = localStorage.getItem("traineeId") || "TR-0001";
  const currentTrainee = (storeState.trainees || []).find(t => t.id === currentTraineeId) || storeState.trainees?.[0];

  const handleTraineeSwitch = (newId) => {
    localStorage.setItem("traineeId", newId);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={`app-layout ${sidebarOpen ? "" : "sidebar-closed"}`}>
      {/* SIDEBAR */}
      {sidebarOpen && (
        <aside className="sidebar">
          <div style={{ padding: '1.25rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <Zap size={18} color="#2563eb" />
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Trainee Portal</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
              Personal Skills & Career Intelligence
            </p>
          </div>
          <nav className="sidebar-nav">
            {traineeMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === "/trainee/training" && location.pathname === "/trainee/training-history");
              return (
                <Link key={item.label} to={item.path} className={`sidebar-item ${isActive ? "active" : ""}`}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      <main className="main-content">
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} type="button">
              <Menu size={22} />
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
                <option value="TR-0001">TR-0001: Priya Sharma (Employed, Retained)</option>
                <option value="TR-0002">TR-0002: Rahul Patil (Employed, Verified)</option>
                <option value="TR-0003">TR-0003: Sneha Kulkarni (Self-Employed)</option>
                <option value="TR-0004">TR-0004: Amit Deshmukh (Apprenticeship)</option>
                <option value="TR-0006">TR-0006: Neha Shinde (Seeking Placement)</option>
                <option value="TR-0014">TR-0014: Pooja More (Multi-Job Career Transition)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a' }}>
                {currentTrainee?.name || "Priya Sharma"}
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

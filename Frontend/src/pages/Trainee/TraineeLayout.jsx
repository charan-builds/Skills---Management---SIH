import {
  LayoutDashboard,
  BriefcaseBusiness,
  GraduationCap,
  FileText,
  UserCog,
  LogOut,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function TraineeLayout({ activeTab, onTabChange, children, portalData }) {
  const navigate = useNavigate();
  const { traineeId: paramTraineeId } = useParams();
  const traineeId = paramTraineeId || localStorage.getItem("traineeId") || "T102";
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    { id: 'overview', label: 'Overview & Insights', icon: LayoutDashboard, route: `/trainee-dashboard/${traineeId}` },
    { id: 'jobs', label: 'Explore Jobs', icon: BriefcaseBusiness, route: `/trainee/jobs` },
    { id: 'skills', label: 'Improve Skills', icon: GraduationCap, route: `/trainee/skills` },
    { id: 'applications', label: 'My Applications', icon: FileText, route: `/trainee/applications` },
    { id: 'profile', label: 'Profile & Settings', icon: UserCog, route: `/trainee/profile` },
  ];

  const handleNavClick = (item) => {
    if (onTabChange) {
      onTabChange(item.id);
    }
    // Also update browser URL if appropriate
    if (location.pathname !== item.route && !location.pathname.includes(item.id)) {
      navigate(item.route);
    }
  };

  const completeness = portalData?.profile_completeness || 88;
  const userName = portalData?.personal_info?.name || "Priya Gupta";
  const userInitials = userName.split(" ").map(n => n[0]).join("");

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: '270px', background: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '2rem 1.25rem', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        
        {/* Brand Header */}
        <div style={{ marginBottom: '2.5rem', paddingLeft: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Sparkles size={16} color="#2563eb" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', letterSpacing: '1px', textTransform: 'uppercase' }}>CAREER INTELLIGENCE</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Trainee Portal</h2>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.8rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isSelected ? '#eff6ff' : 'transparent',
                  color: isSelected ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.95rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={19} color={isSelected ? '#2563eb' : '#64748b'} />
                <span>{item.label}</span>
                {item.id === 'applications' && portalData?.target_role_metrics?.active_applications > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#3b82f6', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    {portalData.target_role_metrics.active_applications}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile Completeness Widget */}
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem 1.15rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Profile Completeness</span>
            <strong style={{ fontSize: '0.85rem', color: '#2563eb' }}>{completeness}%</strong>
          </div>
          <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${completeness}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s ease' }}></div>
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            {completeness >= 100 ? "✓ Profile fully optimized" : "Complete all fields for top matching"}
          </p>
        </div>

        {/* Logout Button */}
        <div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            <LogOut size={17} /> Logout
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top App Header */}
        <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1.25rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Welcome, {userName}
              </h1>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} /> Certified
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
              Your career readiness, opportunities and next steps — all in one place.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>TRAINEE ID</p>
              <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{traineeId}</strong>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', boxShadow: '0 2px 6px rgba(37,99,235,0.2)' }}>
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page Inner Container */}
        <div style={{ padding: '2.5rem 3rem', flex: 1 }}>
          {children}
        </div>

      </main>

    </div>
  );
}

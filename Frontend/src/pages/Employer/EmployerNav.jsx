import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Users,
  CheckCircle2,
  Building,
  Radio,
  SlidersHorizontal,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Layers
} from "lucide-react";

export default function EmployerNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const organizationName = localStorage.getItem("organizationName") || "TechFlow Solutions";
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("sih_token");
    localStorage.removeItem("traineeId");
    localStorage.removeItem("traineeEmail");
    localStorage.removeItem("organizationId");
    localStorage.removeItem("organizationName");
    localStorage.removeItem("employerEmail");
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/employer-dashboard", icon: LayoutDashboard },
    { label: "Candidate Pool", path: "/employer/candidates", icon: Users },
    { label: "Verify Outcomes", path: "/employer/verify-outcomes", icon: CheckCircle2 },
    { label: "Organization Profile", path: "/employer/profile", icon: Building },
    { label: "Integrations & API", path: "/employer/integrations", icon: Layers }
  ];

  return (
    <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Left: Organization Identity & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Building size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{organizationName}</strong>
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                  Verified Partner
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Org ID: <strong>{organizationId}</strong> • Skilling Intelligence Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '1.5rem' }}>
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === '/employer-dashboard' && location.pathname === '/');
              return (
                <Link
                  key={idx}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#2563eb' : '#475569',
                    background: isActive ? '#eff6ff' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} color={isActive ? '#2563eb' : '#64748b'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#dc2626',
              cursor: 'pointer'
            }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}

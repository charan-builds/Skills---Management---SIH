import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, LogOut, ChevronDown, ShieldCheck, Clock, XCircle,
  LayoutDashboard, CheckCircle2, Users,
  GitBranch, Building, MessageSquare
} from "lucide-react";
import "../../src/App.css";
import { ModeBanner } from "../components/common/DataStateComponents";
import { platformService, usePlatformStore } from "../services/platformService";
import { mockStore } from "../services/mockStore";

// Section 41: Simplified, human-readable employer terminology
const employerMenuItems = [
  { label: "Dashboard", path: "/employer", icon: LayoutDashboard },
  { label: "Verification Requests", path: "/employer/verifications", icon: CheckCircle2 },
  { label: "Verified Workforce", path: "/employer/workforce", icon: Users },
  { label: "Skills We Need", path: "/employer/feedback", icon: MessageSquare },
  { label: "Employment Data Integration", path: "/employer/integrations", icon: GitBranch },
  { label: "Organisation Profile", path: "/employer/profile", icon: Building }
];

const DEMO_EMPLOYERS = [
  { id: "EMP-DEMO-001", name: "Tata Consultancy Services", sector: "IT Services", system: "Workday", status: "Verified" },
  { id: "EMP-002", name: "Infosys BPM", sector: "IT & BPO", system: "BambooHR", status: "Verified" },
  { id: "EMP-003", name: "Mahindra & Mahindra Automotive", sector: "Manufacturing & EV", system: "SAP SuccessFactors", status: "Verified" },
  { id: "EMP-004", name: "Apollo Hospitals Enterprise", sector: "Healthcare", system: "Oracle HCM", status: "Verified" },
  { id: "EMP-005", name: "Reliance Clean Energy Ltd", sector: "Green Energy", system: "Darwinbox", status: "Verified" },
  { id: "EMP-009", name: "New Horizon Logistics Ltd", sector: "Logistics", system: "Custom HRIS", status: "Pending" }
];

export default function EmployerLayout({ children }) {
  const store = usePlatformStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [currentOrgId, setCurrentOrgId] = useState(
    localStorage.getItem("organizationId") || "EMP-DEMO-001"
  );
  const [currentEmployer, setCurrentEmployer] = useState(null);

  useEffect(() => {
    const emp = mockStore.getEmployer(currentOrgId);
    setCurrentEmployer(emp);
    localStorage.setItem("organizationId", emp.id);
    localStorage.setItem("organizationName", emp.name);
  }, [currentOrgId, store.last_updated]);

  const handleOrgSwitch = (e) => {
    const newId = e.target.value;
    setCurrentOrgId(newId);
    const emp = mockStore.getEmployer(newId);
    setCurrentEmployer(emp);
    localStorage.setItem("organizationId", emp.id);
    localStorage.setItem("organizationName", emp.name);
    mockStore.save();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const orgName = currentEmployer?.name || localStorage.getItem("organizationName") || "Tata Consultancy Services";
  const verificationStatus = currentEmployer?.status || "Verified";

  return (
    <div className={`app-layout ${sidebarOpen ? "" : "sidebar-closed"}`}>
      {/* SIDEBAR */}
      {sidebarOpen && (
        <aside className="sidebar">
          <div style={{ padding: "1.25rem", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
              <Building size={18} color="#2563eb" />
              <strong style={{ fontSize: "0.95rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {orgName}
              </strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {verificationStatus === "Verified" ? (
                <span style={{ background: "#dcfce7", color: "#166534", fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <CheckCircle2 size={11} /> Verified Employer
                </span>
              ) : verificationStatus === "Pending" ? (
                <span style={{ background: "#fef3c7", color: "#b45309", fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <Clock size={11} /> Admin Verification Pending
                </span>
              ) : (
                <span style={{ background: "#fee2e2", color: "#b91c1c", fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                  <XCircle size={11} /> Verification Rejected
                </span>
              )}
            </div>
          </div>

          <nav className="sidebar-nav">
            {employerMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === "/employer" && location.pathname === "/employer/dashboard") ||
                (item.path === "/employer/workforce" && location.pathname === "/employer/outcomes");
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
        <div className="admin-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.5rem", background: "white", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} type="button" aria-label="Toggle Menu">
              <Menu size={20} />
            </button>
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#1e293b", letterSpacing: "0.3px" }}>
              ORGANISATION PORTAL
            </span>
          </div>

          {/* Persona Switcher & Verification Badge & Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            {/* Multi-tenant employer selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Switch Employer:
              </span>
              <select
                value={currentOrgId}
                onChange={handleOrgSwitch}
                style={{
                  padding: "0.35rem 0.65rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                {DEMO_EMPLOYERS.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.sector}) — {e.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Read-only Admin Verification Badge (Section 5) */}
            <div style={{ display: "flex", alignItems: "center" }}>
              {verificationStatus === "Verified" ? (
                <span title="Read-only badge verified by State Skilling Authority" style={{ background: "#dcfce7", color: "#15803d", border: "1px solid #86efac", fontSize: "0.8rem", fontWeight: 700, padding: "4px 10px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <ShieldCheck size={14} /> Verified Organisation
                </span>
              ) : verificationStatus === "Pending" ? (
                <span title="Read-only badge: Awaiting State Skilling Authority review" style={{ background: "#fef3c7", color: "#b45309", border: "1px solid #fcd34d", fontSize: "0.8rem", fontWeight: 700, padding: "4px 10px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Clock size={14} /> Verification Pending
                </span>
              ) : (
                <span title="Read-only badge: Rejected by State Skilling Authority" style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", fontSize: "0.8rem", fontWeight: 700, padding: "4px 10px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <XCircle size={14} /> Verification Rejected
                </span>
              )}
            </div>

            <div className="admin-profile-wrapper">
              <button className="admin-profile-button" onClick={() => setProfileOpen(!profileOpen)} type="button">
                <div className="admin-avatar" style={{ background: "#2563eb", color: "white", fontWeight: 700 }}>
                  {orgName.charAt(0)}
                </div>
                <ChevronDown size={15} className={profileOpen ? "profile-chevron open" : "profile-chevron"} />
              </button>
              {profileOpen && (
                <div className="admin-profile-dropdown" style={{ right: 0, top: "100%", marginTop: "0.5rem" }}>
                  <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>{orgName}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: {currentOrgId}</div>
                  </div>
                  <button type="button" onClick={() => { setProfileOpen(false); navigate("/employer/profile"); }} className="logout-menu-item" style={{ color: "#334155" }}>
                    <Building size={15} />
                    <span>Organisation Details</span>
                  </button>
                  <button type="button" onClick={handleLogout} className="logout-menu-item" style={{ color: "#dc2626" }}>
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* PAGE CONTENT */}
        <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto", background: "#f8fafc" }}>
          <ModeBanner mode="Employer / Organisation Simulation Mode" />
          {children}
        </div>
      </main>
    </div>
  );
}

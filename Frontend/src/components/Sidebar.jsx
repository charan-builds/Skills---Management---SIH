import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BarChart3,
  Target,
  GitBranch,
  Settings,
  LineChart,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Trainees",
    path: "/trainees",
    icon: Users,
  },
  {
    label: "Programmes",
    path: "/programmes",
    icon: GraduationCap,
  },
  {
    label: "Outcomes",
    path: "/outcomes",
    icon: BarChart3,
  },
  {
    label: "Skill Gaps",
    path: "/skill-gaps",
    icon: Target,
  },
  {
    label: "Impact Intelligence",
    path: "/impact-intelligence",
    icon: LineChart,
  },
  {
    label: "Interventions",
    path: "/interventions",
    icon: GitBranch,
  },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">

      {/* Navigation */}
      <nav className="sidebar-nav">

        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            location.pathname === item.path;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`sidebar-item ${
                isActive ? "active" : ""
              }`}
            >
              <Icon size={19} />

              <span>
                {item.label}
              </span>
            </Link>
          );
        })}

      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">

        <Link
          to="/settings"
          className={`sidebar-item ${
            location.pathname === "/settings"
              ? "active"
              : ""
          }`}
        >
          <Settings size={19} />

          <span>
            Settings
          </span>
        </Link>

      </div>

    </aside>
  );
}

export default Sidebar;

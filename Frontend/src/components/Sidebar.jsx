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
import { useLanguage } from "../context/LanguageContext";

const menuItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    key: "trainees",
    label: "Trainees",
    path: "/trainees",
    icon: Users,
  },
  {
    key: "programmes",
    label: "Programmes",
    path: "/programmes",
    icon: GraduationCap,
  },
  {
    key: "outcomes",
    label: "Outcomes",
    path: "/outcomes",
    icon: BarChart3,
  },
  {
    key: "skill_gaps",
    label: "Skill Gaps",
    path: "/skill-gaps",
    icon: Target,
  },
  {
    key: "interventions",
    label: "Interventions",
    path: "/interventions",
    icon: GitBranch,
  },
];

function Sidebar() {
  const { t } = useLanguage();
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
                {t(`admin_nav.${item.key}`, item.label)}
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
            {t("common.settings", "Settings")}
          </span>
        </Link>

      </div>

    </aside>
  );
}

export default Sidebar;

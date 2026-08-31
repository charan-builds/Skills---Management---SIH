import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  UserCircle,
  LogOut,
  Settings as SettingsIcon,
  Menu,
  ChevronDown,
} from "lucide-react";

import "./App.css";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Trainees from "./pages/Trainees";
import TraineeProfile from "./pages/TraineeProfile";
import TraineeDashboard from "./pages/TraineeDashboard";
import Programmes from "./pages/Programmes";
import ProgrammeProfile from "./pages/ProgrammeProfile";
import Outcomes from "./pages/Outcomes";
import SkillGaps from "./pages/SkillGaps";
import Interventions from "./pages/Interventions";
import InterventionImpact from "./pages/InterventionImpact";
import Settings from "./pages/Settings";
import ImpactIntelligence from "./pages/ImpactIntelligence/ImpactIntelligence";

import EmployerDashboard from "./pages/EmployerDashboard";
import Candidates from "./pages/Candidates";
import EmployerCandidateProfile from "./pages/EmployerCandidateProfile";
import JobCandidates from "./pages/JobCandidates";
import EmployerVerifyOutcomes from "./pages/EmployerVerifyOutcomes";
import EmployerProfile from "./pages/EmployerProfile";
import EmployerIntegrations from "./pages/EmployerIntegrations";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();

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

  return (
    <div
      className={`app-layout ${
        sidebarOpen ? "" : "sidebar-closed"
      }`}
    >
      {sidebarOpen && <Sidebar />}

      <main className="main-content">

        <div className="admin-topbar">

          <button
            className="menu-toggle"
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            aria-label="Toggle sidebar"
            type="button"
          >
            <Menu size={22} />
          </button>


          <div className="admin-profile-wrapper">

            <button
              className="admin-profile-button"
              onClick={() =>
                setProfileOpen(!profileOpen)
              }
              type="button"
            >

              <div className="admin-avatar">
                A
              </div>

              <div className="admin-profile-text">
                <strong>
                  Admin
                </strong>

                <span>
                  Administrator
                </span>
              </div>

              <ChevronDown
                size={16}
                className={
                  profileOpen
                    ? "profile-chevron open"
                    : "profile-chevron"
                }
              />

            </button>


            {profileOpen && (

              <div className="admin-profile-dropdown">

                <div className="admin-dropdown-header">

                  <div className="admin-avatar large">
                    A
                  </div>

                  <div>

                    <strong>
                      Admin
                    </strong>

                    <span>
                      admin@sih.gov.in
                    </span>

                  </div>

                </div>


                <div className="admin-dropdown-divider" />


                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                >
                  <UserCircle size={17} />
                  <span>
                    My Profile
                  </span>
                </button>


                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                >
                  <SettingsIcon size={17} />
                  <span>
                    Settings
                  </span>
                </button>


                <div className="admin-dropdown-divider" />


                <button
                  type="button"
                  className="logout-menu-item"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  <span>
                    Logout
                  </span>
                </button>

              </div>

            )}

          </div>

        </div>


        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/trainees"
            element={<Trainees />}
          />

          <Route
            path="/trainees/:traineeId"
            element={<TraineeProfile />}
          />

          <Route
            path="/programmes"
            element={<Programmes />}
          />

          <Route
            path="/programmes/:programmeId"
            element={<ProgrammeProfile />}
          />

          <Route
            path="/outcomes"
            element={<Outcomes />}
          />

          <Route
            path="/skill-gaps"
            element={<SkillGaps />}
          />

          <Route
            path="/interventions"
            element={<Interventions />}
          />

          <Route
            path="/intervention-impact"
            element={<InterventionImpact />}
          />

          <Route
            path="/impact-intelligence"
            element={<ImpactIntelligence />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </main>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/trainee-dashboard/:traineeId"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard defaultTab="overview" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainee/overview"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard defaultTab="overview" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainee/jobs"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard defaultTab="jobs" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainee/jobs/:traineeId"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard defaultTab="jobs" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainee/skills"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard defaultTab="skills" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainee/skills/:traineeId"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard defaultTab="skills" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainee/applications"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard defaultTab="applications" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainee/applications/:traineeId"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard defaultTab="applications" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainee/profile"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard defaultTab="profile" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainee/profile/:traineeId"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard defaultTab="profile" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainee/settings"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard defaultTab="profile" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainee/:traineeId"
          element={
            <ProtectedRoute role="trainee">
              <TraineeDashboard defaultTab="overview" />
            </ProtectedRoute>
          }
        />


        <Route
          path="/employer-dashboard"
          element={
            <ProtectedRoute role="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/jobs/:jobId"
          element={
            <ProtectedRoute role="employer">
              <JobCandidates />
            </ProtectedRoute>
          }
        />


        <Route
          path="/employer/candidates"
          element={
            <ProtectedRoute role="employer">
              <Candidates />
            </ProtectedRoute>
          }
        />


        <Route
          path="/employer/candidates/:candidateId"
          element={
            <ProtectedRoute role="employer">
              <EmployerCandidateProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/verify-outcomes"
          element={
            <ProtectedRoute role="employer">
              <EmployerVerifyOutcomes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/profile"
          element={
            <ProtectedRoute role="employer">
              <EmployerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/settings"
          element={
            <ProtectedRoute role="employer">
              <EmployerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/integrations"
          element={
            <ProtectedRoute role="employer">
              <EmployerIntegrations />
            </ProtectedRoute>
          }
        />


        <Route
          path="/*"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;

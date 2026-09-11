import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import EmployerLayout from "./layouts/EmployerLayout";
import TraineeLayout from "./layouts/TraineeLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Shared/Auth
import Login from "./pages/Login";

// Admin Pages
import Dashboard from "./pages/Dashboard";
import Trainees from "./pages/Trainees";
import TraineeProfileView from "./pages/TraineeProfileView";
import Outcomes from "./pages/Outcomes";
import Employment from "./pages/Employment";
import SkillGaps from "./pages/SkillGaps";
import Programmes from "./pages/Programmes";
import Providers from "./pages/Providers";
import Districts from "./pages/Districts";
import Cohorts from "./pages/Cohorts";
import EmployerVerifyOutcomes from "./pages/EmployerVerifyOutcomes";
import Reports from "./pages/Reports";
import ProgrammeProfile from "./pages/ProgrammeProfile";
import Interventions from "./pages/Interventions";
import FollowUpManagement from "./pages/FollowUpManagement";

// Employer Pages
import EmployerLogin from "./pages/EmployerLogin";
import EmployerDashboard from "./pages/EmployerDashboard";
import VerificationRequests from "./pages/VerificationRequests";
import EmployeesOutcomes from "./pages/EmployeesOutcomes";
import EmploymentUpdates from "./pages/EmploymentUpdates";
import EmployerIntegrations from "./pages/EmployerIntegrations";
import EmployerFeedback from "./pages/EmployerFeedback";
import EmployerProfile from "./pages/EmployerProfile";

// Trainee Pages
import TraineeDashboard from "./pages/TraineeDashboard";
import TraineeProfile from "./pages/TraineeProfile";
import TrainingHistory from "./pages/TrainingHistory";
import TraineeEmployment from "./pages/TraineeEmployment";
import WageRetention from "./pages/WageRetention";
import FollowUps from "./pages/FollowUps";
import Feedback from "./pages/Feedback";
import TraineeConsent from "./pages/TraineeConsent";
import TraineeSkills from "./pages/TraineeSkills";
import SkillGoals from "./pages/SkillGoals";
import EmploymentJourney from "./pages/EmploymentJourney";
import TraineeOutcomes from "./pages/TraineeOutcomes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin/*" element={<ProtectedRoute role="admin"><AdminLayout><Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="trainees" element={<Trainees />} />
          <Route path="trainees/:traineeId" element={<TraineeProfileView />} />
          <Route path="outcomes" element={<Outcomes />} />
          <Route path="why-attrition" element={<Outcomes />} />
          <Route path="why-unemployed" element={<Outcomes />} />
          <Route path="employment" element={<Employment />} />
          <Route path="income-growth" element={<Employment />} />
          <Route path="skill-gaps" element={<SkillGaps />} />
          <Route path="skills" element={<SkillGaps />} />
          <Route path="demand-supply" element={<SkillGaps />} />
          <Route path="curriculum" element={<SkillGaps />} />
          <Route path="training-relevance" element={<SkillGaps />} />
          <Route path="programmes" element={<Programmes />} />
          <Route path="programmes/:programmeId" element={<ProgrammeProfile />} />
          <Route path="providers" element={<Providers />} />
          <Route path="districts" element={<Districts />} />
          <Route path="cohorts" element={<Cohorts />} />
          <Route path="follow-ups" element={<FollowUpManagement />} />
          <Route path="interventions" element={<Interventions />} />
          <Route path="priority-areas" element={<Interventions />} />
          <Route path="recommended-actions" element={<Interventions />} />
          <Route path="employers" element={<EmployerVerifyOutcomes />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes></AdminLayout></ProtectedRoute>} />

        {/* EMPLOYER AUTH ROUTES */}
        <Route path="/employer/login" element={<EmployerLogin />} />
        <Route path="/employer/register" element={<EmployerLogin />} />

        {/* EMPLOYER ROUTES */}
        <Route path="/employer/*" element={<ProtectedRoute role="employer"><EmployerLayout><Routes>
          <Route path="/" element={<EmployerDashboard />} />
          <Route path="dashboard" element={<EmployerDashboard />} />
          <Route path="verifications" element={<VerificationRequests />} />
          <Route path="workforce" element={<EmployeesOutcomes />} />
          <Route path="outcomes" element={<EmployeesOutcomes />} />
          <Route path="updates" element={<EmploymentUpdates />} />
          <Route path="integrations" element={<EmployerIntegrations />} />
          <Route path="integrations/exceptions" element={<EmployerIntegrations />} />
          <Route path="feedback" element={<EmployerFeedback />} />
          <Route path="profile" element={<EmployerProfile />} />
          <Route path="*" element={<Navigate to="/employer" replace />} />
        </Routes></EmployerLayout></ProtectedRoute>} />

        {/* TRAINEE ROUTES */}
        <Route path="/trainee/*" element={<ProtectedRoute role="trainee"><TraineeLayout><Routes>
          <Route path="/" element={<TraineeDashboard />} />
          <Route path="dashboard" element={<TraineeDashboard />} />
          <Route path="profile" element={<TraineeProfile />} />
          <Route path="training" element={<TrainingHistory />} />
          <Route path="training-history" element={<TrainingHistory />} />
          <Route path="outcomes" element={<TraineeOutcomes />} />
          <Route path="skills" element={<TraineeSkills />} />
          <Route path="skill-goals" element={<SkillGoals />} />
          <Route path="employment-journey" element={<EmploymentJourney />} />
          <Route path="employment" element={<TraineeEmployment />} />
          <Route path="wage-retention" element={<WageRetention />} />
          <Route path="follow-ups" element={<FollowUps />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="consent" element={<TraineeConsent />} />
          <Route path="*" element={<Navigate to="/trainee" replace />} />
        </Routes></TraineeLayout></ProtectedRoute>} />

        {/* ROOT REDIRECT */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const loggedInRole = localStorage.getItem("userRole");
  const token = localStorage.getItem("sih_token");

  // Not logged in or missing token
  if (!loggedInRole || !token) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role
  if (role && loggedInRole !== role) {
    if (loggedInRole === "trainee") {
      return <Navigate to="/trainee" replace />;
    } else if (loggedInRole === "employer") {
      return <Navigate to="/employer" replace />;
    } else if (loggedInRole === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

import { API_BASE } from '../utils/config';
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserRound,
  Building2,
  ArrowRight,
  ArrowLeft,
  Mail,
  LockKeyhole,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
  const navigate = useNavigate();

  const ENABLE_DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

  const [role, setRole] = useState("trainee");

  /* Trainee / OTP Auth */
  const [traineeEmail, setTraineeEmail] = useState("");
  const [traineeOtpSent, setTraineeOtpSent] = useState(false);
  const [traineeOtp, setTraineeOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  /* Employer */
  const [organizationId, setOrganizationId] = useState("");
  const [employerEmail, setEmployerEmail] = useState("");
  const [employerPassword, setEmployerPassword] = useState("");

  /* Error & Success Notice */
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  /* Cooldown countdown effect */
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  /* =========================================
     DEMO PRESETS
  ========================================= */

  const handleDemoLogin = (demoRole) => {
    setError("");
    setNotice("");

    if (demoRole === "trainee_kalyan") {
      setRole("trainee");
      setTraineeOtpSent(false);
      setTraineeOtp("");
      setTraineeEmail("kalyanpagadala1@gmail.com");
      return;
    }

    if (demoRole === "employer") {
      setRole("employer");
      setTraineeOtpSent(false);
      setOrganizationId("EMP-DEMO-001");
      setEmployerEmail("organisation.demo@sih.gov.in");
      setEmployerPassword("demo123");
      return;
    }

    let payload = {};
    if (demoRole === "admin") {
      payload = { email: "demo.admin@sih.gov.in", password: "admin123", role: "admin" };
    } else if (demoRole === "trainee") {
      setRole("trainee");
      setTraineeOtpSent(false);
      setTraineeOtp("");
      setTraineeEmail("demo.trainee@sih.gov.in");
      return;
    }

    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Demo login failed for ${demoRole}`);
        return res.json();
      })
      .then((data) => {
        if (demoRole === "admin") {
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("sih_token", data.token);
          navigate("/");
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  /* =========================================
     ADMIN LOGIN
  ========================================= */

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const email = event.target.elements["admin-email"].value;
    const password = event.target.elements["admin-password"].value;

    if (ENABLE_DEMO_MODE) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({ email, password, role: "admin" })
        });
        if (!res.ok) throw new Error("Invalid admin credentials");
        const data = await res.json();
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("sih_token", data.token);
        navigate("/");
      } catch (err) {
        setError(err.message);
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("sih_token", token);
        navigate("/");
      } catch (err) {
        setError("Production login failed: " + err.message);
      }
    }
  };

  /* =========================================
     TRAINEE - SEND REAL EMAIL OTP
  ========================================= */

  const handleTraineeSendOtp = async (event) => {
    if (event) event.preventDefault();
    setError("");
    setNotice("");

    const enteredEmail = (traineeEmail || "").trim().toLowerCase();
    if (!enteredEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ email: enteredEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to send verification code.");
      }

      setTraineeOtpSent(true);
      setCooldown(60);
      setNotice(`A 6-digit verification code has been dispatched to ${enteredEmail}. Please check your inbox and spam folder.`);
    } catch (err) {
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================
     TRAINEE - VERIFY REAL EMAIL OTP
  ========================================= */

  const handleTraineeVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const enteredEmail = (traineeEmail || "").trim().toLowerCase();
    const enteredOtp = (traineeOtp || "").trim();

    if (!enteredEmail) {
      setError("Email address is missing.");
      return;
    }

    if (!enteredOtp || enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({
          email: enteredEmail,
          otp: enteredOtp
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Verification failed. Invalid or expired code.");
      }

      // Server determines role strictly from authoritative database
      const user = data.user || {};
      const userRole = user.role || "trainee";

      localStorage.setItem("userRole", userRole);
      localStorage.setItem("sih_token", data.token);

      if (userRole === "admin") {
        navigate("/");
      } else if (userRole === "employer") {
        localStorage.setItem("organizationId", user.organization_id || user.id);
        localStorage.setItem("organizationName", user.name || "Employer");
        navigate("/employer-dashboard");
      } else {
        localStorage.setItem("traineeId", user.id || "trainee");
        localStorage.setItem("traineeEmail", user.email || enteredEmail);
        localStorage.setItem("traineeName", user.name || "Trainee");
        navigate(`/trainee-dashboard/${user.id || "trainee"}`);
      }
    } catch (err) {
      setError(err.message || "Verification code is incorrect or expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================
     EMPLOYER LOGIN
  ========================================= */

  const handleEmployerLogin = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const enteredOrganizationId = organizationId.trim().toUpperCase();
    const enteredEmail = (employerEmail || "").trim().toLowerCase();

    if (!enteredOrganizationId) {
      setError("Please enter your Organization ID.");
      return;
    }

    if (!enteredEmail) {
      setError("Please enter your official email.");
      return;
    }

    if (!employerPassword) {
      setError("Please enter your password.");
      return;
    }

    if (ENABLE_DEMO_MODE) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({
            organization_id: enteredOrganizationId,
            email: enteredEmail,
            password: employerPassword,
            role: "employer"
          })
        });
        if (!res.ok) throw new Error("Invalid organization credentials.");
        const data = await res.json();
        localStorage.setItem("userRole", "employer");
        localStorage.setItem("sih_token", data.token);
        localStorage.setItem("organizationId", data.organization_id);
        localStorage.setItem("organizationName", data.name);
        navigate("/employer-dashboard");
      } catch (err) {
        setError(err.message);
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, enteredEmail, employerPassword);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem("userRole", "employer");
        localStorage.setItem("sih_token", token);
        localStorage.setItem("organizationId", enteredOrganizationId);
        localStorage.setItem("organizationName", "Verified Employer"); 
        navigate("/employer-dashboard");
      } catch (err) {
        setError("Production login failed: " + err.message);
      }
    }
  };

  const handleBack = () => {
    setTraineeOtpSent(false);
    setTraineeOtp("");
    setError("");
    setNotice("");
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
    setNotice("");
    setTraineeOtpSent(false);
    setTraineeOtp("");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* HEADING */}
        <div className="login-heading">
          <p className="page-label">SKILLING IMPACT INTELLIGENCE</p>
          <h1>
            {traineeOtpSent ? "Enter Verification Code" : "Sign in to continue"}
          </h1>
          <p>
            {traineeOtpSent
              ? `A secure 6-digit code was sent to ${traineeEmail}`
              : "Access the Skilling Impact Intelligence platform."}
          </p>
        </div>

        {/* TRAINEE OTP VERIFICATION STEP */}
        {traineeOtpSent ? (
          <form className="login-form" onSubmit={handleTraineeVerifyOtp}>
            
            {notice && (
              <div style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "0.85rem 1rem",
                marginBottom: "1rem",
                fontSize: "0.85rem",
                color: "#166534",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem"
              }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: "2px", color: "#16a34a" }} />
                <span>{notice}</span>
              </div>
            )}

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              color: "#6b7280",
              marginBottom: "0.5rem"
            }}>
              <Clock size={15} />
              <span>Code expires in 5 minutes</span>
            </div>

            <label htmlFor="trainee-otp">
              6-Digit Verification Code
            </label>

            <input
              id="trainee-otp"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={traineeOtp}
              onChange={(event) =>
                setTraineeOtp(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              maxLength="6"
              autoComplete="one-time-code"
              autoFocus
              style={{
                letterSpacing: "8px",
                fontSize: "1.4rem",
                textAlign: "center",
                fontWeight: 700
              }}
              required
            />

            {error && (
              <p className="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={isSubmitting || traineeOtp.length !== 6}
            >
              {isSubmitting ? "Verifying..." : "Verify & Sign In"}
              <ArrowRight size={17} />
            </button>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.75rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid #f3f4f6"
            }}>
              <button
                type="button"
                className="login-back-button"
                onClick={handleBack}
                style={{ margin: 0, padding: 0 }}
              >
                <ArrowLeft size={16} />
                Change email
              </button>

              <button
                type="button"
                onClick={handleTraineeSendOtp}
                disabled={isSubmitting || cooldown > 0}
                style={{
                  background: "transparent",
                  border: "none",
                  color: cooldown > 0 ? "#9ca3af" : "#2563eb",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: cooldown > 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "4px 8px"
                }}
              >
                <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
            </div>
          </form>

        ) : (

          <>
            {/* ROLE SELECTION TABS */}
            <div className="login-role-tabs">
              <button
                type="button"
                className={role === "admin" ? "active" : ""}
                onClick={() => handleRoleChange("admin")}
              >
                <ShieldCheck size={18} />
                Admin
              </button>

              <button
                type="button"
                className={role === "trainee" ? "active" : ""}
                onClick={() => handleRoleChange("trainee")}
              >
                <UserRound size={18} />
                Trainee
              </button>

              <button
                type="button"
                className={role === "employer" ? "active" : ""}
                onClick={() => handleRoleChange("employer")}
              >
                <Building2 size={18} />
                Employer
              </button>
            </div>

            {/* ADMIN LOGIN FORM */}
            {role === "admin" && (
              <form className="login-form" onSubmit={handleAdminLogin}>
                <label htmlFor="admin-email">Email</label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="demo.admin@sih.gov.in"
                  required
                />

                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  placeholder="Enter password"
                  required
                />

                {error && <p className="login-error">{error}</p>}

                <button type="submit" className="login-submit">
                  Sign in
                  <ArrowRight size={17} />
                </button>
              </form>
            )}

            {/* TRAINEE EMAIL OTP LOGIN FORM */}
            {role === "trainee" && (
              <form className="login-form" onSubmit={handleTraineeSendOtp}>
                <label htmlFor="trainee-email">Registered Email Address</label>

                <div className="login-input-wrapper">
                  <Mail size={18} />
                  <input
                    id="trainee-email"
                    type="email"
                    placeholder="name@example.com"
                    value={traineeEmail}
                    onChange={(event) => setTraineeEmail(event.target.value)}
                    required
                  />
                </div>

                {error && <p className="login-error">{error}</p>}

                <p className="login-help">
                  A secure 6-digit one-time code will be delivered directly to your registered email inbox.
                </p>

                <button
                  type="submit"
                  className="login-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Dispatching code..." : "Send Verification Code"}
                  <ArrowRight size={17} />
                </button>
              </form>
            )}

            {/* EMPLOYER LOGIN FORM */}
            {role === "employer" && (
              <form className="login-form" onSubmit={handleEmployerLogin}>
                <label htmlFor="organization-id">Organization ID</label>
                <div className="login-input-wrapper">
                  <Building2 size={18} />
                  <input
                    id="organization-id"
                    type="text"
                    placeholder="Example: EMP-DEMO-001"
                    value={organizationId}
                    onChange={(event) => setOrganizationId(event.target.value.toUpperCase())}
                    required
                  />
                </div>

                <label htmlFor="employer-email">Official Email</label>
                <div className="login-input-wrapper">
                  <Mail size={18} />
                  <input
                    id="employer-email"
                    type="email"
                    placeholder="recruitment@company.com"
                    value={employerEmail}
                    onChange={(event) => setEmployerEmail(event.target.value)}
                    required
                  />
                </div>

                <label htmlFor="employer-password">Password</label>
                <div className="login-input-wrapper">
                  <LockKeyhole size={18} />
                  <input
                    id="employer-password"
                    type="password"
                    placeholder="Enter password"
                    value={employerPassword}
                    onChange={(event) => setEmployerPassword(event.target.value)}
                    required
                  />
                </div>

                {error && <p className="login-error">{error}</p>}

                <p className="login-help">
                  Use your organization's registered credentials to access the employer portal.
                </p>

                <button type="submit" className="login-submit">
                  Sign in
                  <ArrowRight size={17} />
                </button>
              </form>
            )}
          </>
        )}

        {/* DEMO ACCESS SECTION */}
        {ENABLE_DEMO_MODE && (
          <div className="demo-access-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', letterSpacing: '0.05em', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Quick Demo Presets
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('trainee_kalyan')}
                className="login-submit"
                style={{ background: 'var(--primary)', color: 'white', justifyContent: 'center', fontWeight: 600 }}
              >
                Trainee(Real OTP Test)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="login-submit"
                style={{ background: 'var(--primary)', color: 'white', opacity: 0.9, justifyContent: 'center' }}
              >
                Government / Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('employer')}
                className="login-submit"
                style={{ background: 'var(--primary)', color: 'white', opacity: 0.9, justifyContent: 'center' }}
              >
                Organisation
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="login-footer">
          Secure access to Skilling Impact Intelligence
        </div>

      </div>
    </div>
  );
}

export default Login;

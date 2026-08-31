import { API_BASE } from '../utils/config';
import { useState } from "react";
import {
  ShieldCheck,
  UserRound,
  Building2,
  ArrowRight,
  ArrowLeft,
  Mail,
  BadgeCheck,
  LockKeyhole,
} from "lucide-react";
import { useNavigate } from "react-router-dom";



function Login() {
  const navigate = useNavigate();

  const ENABLE_DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

  const [role, setRole] = useState("admin");

  /* Trainee */
  const [traineeId, setTraineeId] = useState("");
  const [traineeEmail, setTraineeEmail] = useState("");
  const [matchedTrainee, setMatchedTrainee] =
    useState(null);

  const [traineeOtpSent, setTraineeOtpSent] =
    useState(false);

  const [traineeOtp, setTraineeOtp] =
    useState("");

  /* Employer */
  const [organizationId, setOrganizationId] =
    useState("");

  const [employerEmail, setEmployerEmail] =
    useState("");

  const [employerPassword, setEmployerPassword] =
    useState("");

  /* Error */
  const [error, setError] = useState("");


  /* =========================================
     DEMO LOGIN
  ========================================= */

  const handleDemoLogin = (demoRole) => {
    setError("");
    setRole(demoRole);
    setTraineeOtpSent(false);

    if (demoRole === "employer") {
      setOrganizationId("EMP-DEMO-001");
      setEmployerEmail("organisation.demo@sih.gov.in");
      setEmployerPassword("demo123");
      return; // Do not silently log in
    }

    let payload = {};
    if (demoRole === "admin") {
      payload = { email: "demo.admin@sih.gov.in", password: "admin123", role: "admin" };
    } else if (demoRole === "trainee") {
      payload = { trainee_id: "T102", email: "demo.trainee@sih.gov.in", role: "trainee" };
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
        } else if (demoRole === "trainee") {
          localStorage.setItem("userRole", "trainee");
          localStorage.setItem("sih_token", data.token);
          localStorage.setItem("traineeId", data.user_id || "T102");
          localStorage.setItem("traineeEmail", "demo.trainee@sih.gov.in");
          navigate(`/trainee-dashboard/${data.user_id || "T102"}`);
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  };


  /* =========================================
     ADMIN LOGIN
  ========================================= */

  const handleAdminLogin = (event) => {
    event.preventDefault();
    setError("");

    const email = event.target.elements["admin-email"].value;
    const password = event.target.elements["admin-password"].value;

    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify({ email, password, role: "admin" })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid admin credentials");
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("sih_token", data.token);
        navigate("/");
      })
      .catch((err) => {
        setError(err.message);
      });
  };


  /* =========================================
     TRAINEE - SEND EMAIL OTP
  ========================================= */

  const handleTraineeSendOtp = (event) => {
    event.preventDefault();
    setError("");

    const enteredId = traineeId.trim().toUpperCase();
    const enteredEmail = (traineeEmail || "").trim().toLowerCase();

    if (!enteredId) {
      setError("Please enter your Trainee ID.");
      return;
    }

    if (!enteredEmail) {
      setError("Please enter your registered email.");
      return;
    }

    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify({
        trainee_id: enteredId,
        email: enteredEmail,
        role: "trainee"
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid Trainee ID or unregistered email.");
        return res.json();
      })
      .then((data) => {
        setMatchedTrainee({
          id: enteredId,
          email: enteredEmail,
          name: data.name,
          token: data.token
        });
        setTraineeOtpSent(true);
      })
      .catch((err) => {
        setError(err.message);
      });
  };


  /* =========================================
     TRAINEE - VERIFY OTP
  ========================================= */

  const handleTraineeVerifyOtp = (event) => {
    event.preventDefault();
    setError("");

    if (traineeOtp !== "123456") {
      setError("Invalid OTP. For demo use 123456.");
      return;
    }

    if (!matchedTrainee) {
      setError("Trainee account could not be identified.");
      return;
    }

    localStorage.setItem("userRole", "trainee");
    localStorage.setItem("sih_token", matchedTrainee.token);
    localStorage.setItem("traineeId", matchedTrainee.id);
    localStorage.setItem("traineeEmail", matchedTrainee.email);
    navigate(`/trainee-dashboard/${matchedTrainee.id}`);
  };




  /* =========================================
     EMPLOYER LOGIN
  ========================================= */

  const handleEmployerLogin = (event) => {
    event.preventDefault();
    setError("");

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

    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify({
        organization_id: enteredOrganizationId,
        email: enteredEmail,
        password: employerPassword,
        role: "employer"
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid organization credentials.");
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("userRole", "employer");
        localStorage.setItem("sih_token", data.token);
        localStorage.setItem("organizationId", data.organization_id);
        localStorage.setItem("organizationName", data.name);
        localStorage.setItem("employerEmail", enteredEmail);
        navigate("/employer-dashboard");
      })
      .catch((err) => {
        setError(err.message);
      });
  };


  /* =========================================
     TRAINEE OTP BACK
  ========================================= */

  const handleBack = () => {
    setTraineeOtpSent(false);
    setTraineeOtp("");
    setMatchedTrainee(null);
    setError("");
  };


  /* =========================================
     CHANGE ROLE
  ========================================= */

  const handleRoleChange = (newRole) => {
    setRole(newRole);

    setError("");

    setTraineeOtpSent(false);
    setTraineeOtp("");
    setMatchedTrainee(null);
  };


  return (
    <div className="login-page">

      <div className="login-card">


        {/* =================================
            HEADING
        ================================= */}

        <div className="login-heading">

          <p className="page-label">
            WELCOME
          </p>


          <h1>
            {traineeOtpSent
              ? "Verify your email"
              : "Sign in to continue"}
          </h1>


          <p>
            {traineeOtpSent
              ? `Enter the OTP sent to ${matchedTrainee?.email}`
              : "Access the Skilling Impact Intelligence platform."}
          </p>

        </div>


        {/* =================================
            TRAINEE OTP SCREEN
        ================================= */}

        {traineeOtpSent ? (

          <form
            className="login-form"
            onSubmit={handleTraineeVerifyOtp}
          >

            <label htmlFor="trainee-otp">
              Enter Email OTP
            </label>


            <input
              id="trainee-otp"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
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
            >
              Verify OTP
              <ArrowRight size={17} />
            </button>


            <button
              type="button"
              className="login-back-button"
              onClick={handleBack}
            >
              <ArrowLeft size={16} />
              Change Trainee ID or email
            </button>


          </form>

        ) : (

          <>


            {/* =================================
                ROLE SELECTION
            ================================= */}

            <div className="login-role-tabs">


              {/* ADMIN */}

              <button
                type="button"
                className={
                  role === "admin"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleRoleChange("admin")
                }
              >
                <ShieldCheck size={18} />
                Admin
              </button>


              {/* TRAINEE */}

              <button
                type="button"
                className={
                  role === "trainee"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleRoleChange("trainee")
                }
              >
                <UserRound size={18} />
                Trainee
              </button>


              {/* EMPLOYER */}

              <button
                type="button"
                className={
                  role === "employer"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleRoleChange("employer")
                }
              >
                <Building2 size={18} />
                Employer
              </button>

            </div>


            {/* =================================
                ADMIN LOGIN
            ================================= */}

            {role === "admin" && (

              <form
                className="login-form"
                onSubmit={handleAdminLogin}
              >

                <label htmlFor="admin-email">
                  Email
                </label>


                <input
                  id="admin-email"
                  type="email"
                  placeholder="Enter admin email"
                  required
                />


                <label htmlFor="admin-password">
                  Password
                </label>


                <input
                  id="admin-password"
                  type="password"
                  placeholder="Enter password"
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
                >
                  Sign in
                  <ArrowRight size={17} />
                </button>

              </form>

            )}


            {/* =================================
                TRAINEE LOGIN
            ================================= */}

            {role === "trainee" && (

              <form
                className="login-form"
                onSubmit={handleTraineeSendOtp}
              >

                <label htmlFor="trainee-id">
                  Permanent Trainee ID
                </label>


                <div className="login-input-wrapper">

                  <BadgeCheck size={18} />

                  <input
                    id="trainee-id"
                    type="text"
                    placeholder="Enter Permanent Trainee ID"
                    value={traineeId}
                    onChange={(event) =>
                      setTraineeId(
                        event.target.value
                          .toUpperCase()
                      )
                    }
                    required
                  />

                </div>

                <label htmlFor="trainee-email">
                  Registered Email
                </label>


                <div className="login-input-wrapper">

                  <Mail size={18} />

                  <input
                    id="trainee-email"
                    type="email"
                    placeholder="Enter registered email"
                    value={traineeEmail}
                    onChange={(event) =>
                      setTraineeEmail(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>


                {error && (
                  <p className="login-error">
                    {error}
                  </p>
                )}


                <p className="login-help">
                  Your Trainee ID is your permanent identity. An OTP will be sent to your registered email.
                </p>


                <button
                  type="submit"
                  className="login-submit"
                >
                  Send Email OTP
                  <ArrowRight size={17} />
                </button>


              </form>

            )}


            {/* =================================
                EMPLOYER LOGIN
            ================================= */}

            {role === "employer" && (

              <form
                className="login-form"
                onSubmit={handleEmployerLogin}
              >

                <label htmlFor="organization-id">
                  Organization ID
                </label>


                <div className="login-input-wrapper">

                  <Building2 size={18} />

                  <input
                    id="organization-id"
                    type="text"
                    placeholder="Example: ORG4582"
                    value={organizationId}
                    onChange={(event) =>
                      setOrganizationId(
                        event.target.value
                          .toUpperCase()
                      )
                    }
                    required
                  />

                </div>


                <label htmlFor="employer-email">
                  Official Email
                </label>


                <div className="login-input-wrapper">

                  <Mail size={18} />

                  <input
                    id="employer-email"
                    type="email"
                    placeholder="hr@company.com"
                    value={employerEmail}
                    onChange={(event) =>
                      setEmployerEmail(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>


                <label htmlFor="employer-password">
                  Password
                </label>


                <div className="login-input-wrapper">

                  <LockKeyhole size={18} />

                  <input
                    id="employer-password"
                    type="password"
                    placeholder="Enter password"
                    value={employerPassword}
                    onChange={(event) =>
                      setEmployerPassword(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>


                {error && (
                  <p className="login-error">
                    {error}
                  </p>
                )}


                <p className="login-help">
                  Use your organization's registered
                  credentials to access the employer portal.
                </p>


                <button
                  type="submit"
                  className="login-submit"
                >
                  Sign in
                  <ArrowRight size={17} />
                </button>


              </form>

            )}

          </>

        )}

        {/* =================================
            DEMO ACCESS SECTION
        ================================= */}

        {ENABLE_DEMO_MODE && (
          <div className="demo-access-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', letterSpacing: '0.05em', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Demo Access
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button type="button" onClick={() => handleDemoLogin('admin')} className="login-submit" style={{ background: 'var(--primary)', color: 'white', opacity: 0.9, justifyContent: 'center' }}>
                Government / Admin
              </button>
              <button type="button" onClick={() => handleDemoLogin('trainee')} className="login-submit" style={{ background: 'var(--primary)', color: 'white', opacity: 0.9, justifyContent: 'center' }}>
                Trainee
              </button>
              <button type="button" onClick={() => handleDemoLogin('employer')} className="login-submit" style={{ background: 'var(--primary)', color: 'white', opacity: 0.9, justifyContent: 'center' }}>
                Organisation
              </button>
            </div>
          </div>
        )}


        {/* =================================
            FOOTER
        ================================= */}

        <div className="login-footer">
          Secure access to Skilling Intelligence
        </div>

      </div>

    </div>
  );
}

export default Login;

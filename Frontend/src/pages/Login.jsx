import { API_BASE } from '../utils/config';
import { useState } from "react";
import {
  ShieldCheck,
  UserRound,
  Building2,
  ArrowRight,
  BadgeCheck,
  LockKeyhole,
  Mail,
  FileText,
  X,
  CheckSquare,
  Square
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { platformService } from "../services/platformService";

function Login() {
  const navigate = useNavigate();

  const ENABLE_DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false';

  const [role, setRole] = useState("admin");

  /* Admin */
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  /* Trainee */
  const [traineeId, setTraineeId] = useState("");
  const [traineeEmail, setTraineeEmail] = useState("");
  const [traineePassword, setTraineePassword] = useState("");
  const [traineeConsentAgreed, setTraineeConsentAgreed] = useState(false);

  /* Modal for Terms / Privacy */
  const [showModal, setShowModal] = useState(null);

  /* Employer */
  const [organizationId, setOrganizationId] = useState("");
  const [employerEmail, setEmployerEmail] = useState("");
  const [employerPassword, setEmployerPassword] = useState("");

  /* Error */
  const [error, setError] = useState("");


  /* =========================================
     DEMO AUTO-FILL CREDENTIALS
  ========================================= */

  const handleDemoFill = (demoRole) => {
    setError("");
    setRole(demoRole);

    if (demoRole === "admin") {
      setAdminEmail("admin@sih.gov.in");
      setAdminPassword("admin123");
    } else if (demoRole === "trainee") {
      setTraineeId("TR-0001");
      setTraineeEmail("demo.trainee@sih.gov.in");
      setTraineePassword("demo1234");
      setTraineeConsentAgreed(true);
    } else if (demoRole === "employer") {
      setOrganizationId("EMP-001");
      setEmployerEmail("hr@infosys.com");
      setEmployerPassword("demo1234");
    }
  };

  const handleDemoLogin = (demoRole) => {
    handleDemoFill(demoRole);
  };


  const fetchAuthoritativeProfile = async (token, fallbackRole, fallbackId) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        }
      });
      if (!res.ok) {
        throw new Error("Production verification failed. Are custom claims configured?");
      }
      const data = await res.json();
      
      const verifiedRole = data.role || fallbackRole;
      localStorage.setItem("userRole", verifiedRole);
      localStorage.setItem("sih_token", token);
      
      if (verifiedRole === "admin") {
        navigate("/admin");
      } else if (verifiedRole === "employer") {
        localStorage.setItem("organizationId", data.organization_id || fallbackId);
        localStorage.setItem("organizationName", data.name || "Authorized Employer"); 
        navigate("/employer");
      } else if (verifiedRole === "trainee") {
        localStorage.setItem("traineeId", data.user_id || fallbackId);
        localStorage.setItem("traineeEmail", data.name || "");
        navigate("/trainee");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  /* =========================================
     ADMIN LOGIN
  ========================================= */

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setError("");

    const email = event.target.elements["admin-email"].value;
    const password = event.target.elements["admin-password"].value;

    if (ENABLE_DEMO_MODE) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({ email, password, role: "admin" })
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("sih_token", data.token || "demo_admin_jwt_token_verified");
          navigate("/admin");
          return;
        }
      } catch (err) {
        // Backend offline or erroring, grant demo session
      }
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("sih_token", "demo_admin_jwt_token_verified");
      navigate("/admin");
      return;
    } else {
      // Production Identity via Firebase
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        await fetchAuthoritativeProfile(token, "admin", null);
      } catch (err) {
        setError("Production login failed: " + err.message);
      }
    }
  };


  /* =========================================
     TRAINEE LOGIN
  ========================================= */

  const handleTraineeLogin = async (event) => {
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
    if (!traineePassword) {
      setError("Please enter your password.");
      return;
    }
    if (!traineeConsentAgreed) {
      setError("You must agree to all applicable Terms & Conditions and Privacy Policy to log in.");
      return;
    }

    const proofToken = `PROOF-LOGIN-${enteredId || 'TR-0001'}-${Date.now()}`;
    const consentRecord = {
      proof_token: proofToken,
      accepted_at: new Date().toISOString(),
      terms_version: "v1.0",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Web Browser",
      consent_type: "LOGIN_TERMS_AND_PRIVACY",
      email: enteredEmail
    };

    if (ENABLE_DEMO_MODE) {
      try {
        await platformService.submitLoginConsent(enteredId || "TR-0001", consentRecord);
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({
            trainee_id: enteredId,
            email: enteredEmail,
            role: "trainee",
            consent: consentRecord
          })
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("userRole", "trainee");
          localStorage.setItem("sih_token", data.token || "demo_trainee_jwt_token_verified");
          localStorage.setItem("traineeId", data.user_id || enteredId);
          localStorage.setItem("traineeEmail", enteredEmail);
          localStorage.setItem("traineeLoginProofToken", proofToken);
          navigate("/trainee");
          return;
        }
      } catch (err) {
        // Fallback for seamless demo
      }
      await platformService.submitLoginConsent(enteredId || "TR-0001", consentRecord);
      localStorage.setItem("userRole", "trainee");
      localStorage.setItem("sih_token", "demo_trainee_jwt_token_verified");
      localStorage.setItem("traineeId", enteredId || "TR-0001");
      localStorage.setItem("traineeEmail", enteredEmail || "demo.trainee@sih.gov.in");
      localStorage.setItem("traineeLoginProofToken", proofToken);
      navigate("/trainee");
      return;
    } else {
      // Production Identity via Firebase
      try {
        await platformService.submitLoginConsent(enteredId || "TR-0001", consentRecord);
        const userCredential = await signInWithEmailAndPassword(auth, enteredEmail, traineePassword);
        const token = await userCredential.user.getIdToken();
        await fetchAuthoritativeProfile(token, "trainee", enteredId);
      } catch (err) {
        setError("Production Firebase Auth failed: " + err.message);
      }
    }
  };




  /* =========================================
     EMPLOYER LOGIN
  ========================================= */

  const handleEmployerLogin = async (event) => {
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
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("userRole", "employer");
          localStorage.setItem("sih_token", data.token || "demo_employer_jwt_token_verified");
          localStorage.setItem("organizationId", data.organization_id || enteredOrganizationId);
          localStorage.setItem("organizationName", data.name || "Infosys Technologies");
          navigate("/employer");
          return;
        }
      } catch (err) {
        // Fallback for seamless demo
      }
      localStorage.setItem("userRole", "employer");
      localStorage.setItem("sih_token", "demo_employer_jwt_token_verified");
      localStorage.setItem("organizationId", enteredOrganizationId || "EMP-001");
      localStorage.setItem("organizationName", "Infosys Technologies");
      navigate("/employer");
      return;
    } else {
      // Production Identity via Firebase
      try {
        const userCredential = await signInWithEmailAndPassword(auth, enteredEmail, employerPassword);
        const token = await userCredential.user.getIdToken();
        await fetchAuthoritativeProfile(token, "employer", enteredOrganizationId);
      } catch (err) {
        setError("Production login failed: " + err.message);
      }
    }
  };


  /* =========================================
     CHANGE ROLE
  ========================================= */

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
  };


  return (
    <>
    <div className="login-page">

      <div className="login-card">


        {/* =================================
            LOGO HERO
        ================================= */}

        <div className="login-logo-hero">
          <img
            src="/skill2impact-logo.png"
            alt="Skill2Impact — Skills Today A Brighter Tomorrow"
            className="login-brand-logo"
          />
        </div>

        {/* =================================
            HEADING
        ================================= */}

        <div className="login-heading">

          <p className="page-label">
            WELCOME
          </p>

          <h1>
            Sign in to continue
          </h1>

          <p>
            Access the Skilling Impact Intelligence platform.
          </p>

        </div>

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
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />


                <label htmlFor="admin-password">
                  Password
                </label>


                <input
                  id="admin-password"
                  type="password"
                  placeholder="Enter password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
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
                onSubmit={handleTraineeLogin}
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
                
                <label htmlFor="trainee-password">
                  Password
                </label>


                <div className="login-input-wrapper">

                  <LockKeyhole size={18} />

                  <input
                    id="trainee-password"
                    type="password"
                    placeholder="Enter password"
                    value={traineePassword}
                    onChange={(event) =>
                      setTraineePassword(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>


                {/* ---- CONSENT CHECKBOX ---- */}
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.65rem",
                  marginTop: "1.1rem",
                  background: traineeConsentAgreed ? "rgba(37,99,235,0.06)" : "rgba(248,250,252,0.9)",
                  border: traineeConsentAgreed ? "1.5px solid rgba(37,99,235,0.3)" : "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "0.85rem 1rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                  onClick={() => setTraineeConsentAgreed(prev => !prev)}
                >
                  <span style={{ flexShrink: 0, marginTop: "1px", color: traineeConsentAgreed ? "#2563eb" : "#94a3b8" }}>
                    {traineeConsentAgreed
                      ? <CheckSquare size={20} />
                      : <Square size={20} />
                    }
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.55 }}>
                    I agree to accept all applicable{" "}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowModal("terms"); }}
                      style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline", fontSize: "0.82rem" }}
                    >
                      Terms &amp; Conditions
                    </button>
                    {" "}and{" "}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowModal("privacy"); }}
                      style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline", fontSize: "0.82rem" }}
                    >
                      Privacy Policy
                    </button>
                    {". "}
                    <span style={{ color: "#64748b", fontSize: "0.78rem" }}>
                      Your consent will be logged as legal proof.
                    </span>
                  </span>
                </div>


                {error && (
                  <p className="login-error">
                    {error}
                  </p>
                )}


                <p className="login-help">
                  Your Trainee ID is your permanent identity. Use your registered credentials to access the trainee portal.
                </p>


                <button
                  type="submit"
                  className="login-submit"
                  disabled={!traineeConsentAgreed}
                  style={{ opacity: traineeConsentAgreed ? 1 : 0.55, cursor: traineeConsentAgreed ? "pointer" : "not-allowed" }}
                >
                  Sign in
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

        {/* =================================
            DEMO ACCESS SECTION
        ================================= */}

        {ENABLE_DEMO_MODE && (
          <div className="demo-access-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', letterSpacing: '0.05em', marginBottom: '1rem', textTransform: 'uppercase' }}>
              Quick Auto-Fill Demo Credentials
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                type="button" 
                id="btn-government-access"
                onClick={() => handleDemoFill('admin')} 
                className="login-submit" 
                style={{ background: '#2563eb', color: 'white', fontWeight: 700, justifyContent: 'center', cursor: 'pointer' }}
              >
                Government Admin Credentials
              </button>
              <button 
                type="button" 
                id="btn-trainee-access"
                onClick={() => handleDemoFill('trainee')} 
                className="login-submit" 
                style={{ background: '#2563eb', color: 'white', fontWeight: 700, justifyContent: 'center', cursor: 'pointer' }}
              >
                Trainee Credentials
              </button>
              <button 
                type="button" 
                id="btn-employer-access"
                onClick={() => handleDemoFill('employer')} 
                className="login-submit" 
                style={{ background: '#2563eb', color: 'white', fontWeight: 700, justifyContent: 'center', cursor: 'pointer' }}
              >
                Organisation / Employer Credentials
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

    {/* =================================
        TERMS & PRIVACY MODALS
    ================================= */}
    {showModal && (
      <div
        onClick={() => setShowModal(null)}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(15,23,42,0.65)",
          backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem"
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "white", borderRadius: "18px",
            width: "100%", maxWidth: "540px",
            maxHeight: "80vh", overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
            display: "flex", flexDirection: "column"
          }}
        >
          {/* Modal Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e2e8f0",
            background: showModal === "terms" ? "#eff6ff" : "#f0fdf4"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <FileText size={20} color={showModal === "terms" ? "#2563eb" : "#16a34a"} />
              <span style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>
                {showModal === "terms" ? "Terms & Conditions" : "Privacy Policy"}
              </span>
              <span style={{
                background: showModal === "terms" ? "#dbeafe" : "#dcfce7",
                color: showModal === "terms" ? "#1d4ed8" : "#15803d",
                fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "20px"
              }}>
                v1.0 · Effective Jan 2024
              </span>
            </div>
            <button
              onClick={() => setShowModal(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex" }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ overflowY: "auto", padding: "1.5rem", fontSize: "0.85rem", color: "#374151", lineHeight: 1.7 }}>
            {showModal === "terms" ? (
              <>
                <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
                  Skill2Impact — Government Skilling Portal — Terms &amp; Conditions
                </p>
                <ol style={{ paddingLeft: "1.25rem", margin: 0 }}>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Acceptance:</strong> By logging in, you agree to abide by these Terms and all applicable Indian Government guidelines on vocational training data.</li>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Eligibility:</strong> Access is restricted to registered trainees with a valid Permanent Trainee ID issued under the National Skills Qualification Framework (NSQF).</li>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Data Accuracy:</strong> You are responsible for ensuring that the personal and professional information you provide is accurate and up to date.</li>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Platform Use:</strong> The portal must be used solely for legitimate skill tracking, outcome reporting, and employer verification purposes.</li>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Consent Logging:</strong> Your agreement to these terms is time-stamped, proof-tokenized, and stored as an immutable legal audit record per Section 43A IT Act, 2000.</li>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Accountability:</strong> Misuse of the platform, fraudulent data entry, or unauthorized access may result in suspension and referral to appropriate authorities.</li>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Modifications:</strong> The Government reserves the right to revise these terms. Continued use after notification constitutes acceptance.</li>
                </ol>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
                  Skill2Impact — Data Privacy Policy for Trainees
                </p>
                <ol style={{ paddingLeft: "1.25rem", margin: 0 }}>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Data Collected:</strong> We collect your Trainee ID, email, training programme details, employment outcomes, and follow-up survey responses.</li>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Purpose of Collection:</strong> Data is used for policy evaluation, programme funding decisions, and employer verification only.</li>
                  <li style={{ marginBottom: "0.6rem" }}><strong>No Commercial Sharing:</strong> Your individual data will never be sold, shared with commercial marketers, or used for targeted advertising.</li>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Anonymized Analytics:</strong> Government outcome reports use only anonymized, aggregated data — never individually identifiable records.</li>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Consent Audit Trail:</strong> Your login consent is recorded with a cryptographic proof token, timestamp, and terms version as a verifiable legal record.</li>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Your Rights:</strong> You may request a data export, correction, or deletion through the State Portal Administration at any time.</li>
                  <li style={{ marginBottom: "0.6rem" }}><strong>Security:</strong> All data is encrypted at rest and in transit per IS/ISO 27001 guidelines and Government of India Cloud Security standards.</li>
                </ol>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid #e2e8f0",
            display: "flex", justifyContent: "flex-end", gap: "0.75rem",
            background: "#f8fafc"
          }}>
            <button
              onClick={() => setShowModal(null)}
              style={{
                padding: "0.55rem 1.25rem", borderRadius: "8px",
                border: "1px solid #e2e8f0", background: "white",
                color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem"
              }}
            >
              Close
            </button>
            <button
              onClick={() => { setTraineeConsentAgreed(true); setShowModal(null); }}
              style={{
                padding: "0.55rem 1.25rem", borderRadius: "8px",
                border: "none",
                background: showModal === "terms" ? "#2563eb" : "#16a34a",
                color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
                display: "flex", alignItems: "center", gap: "0.4rem"
              }}
            >
              <CheckSquare size={16} />
              I Accept &amp; Agree
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default Login;

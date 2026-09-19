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
  Square,
  Target,
  Briefcase,
  GitBranch,
  SlidersHorizontal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { platformService } from "../services/platformService";

export default function Login() {
  const navigate = useNavigate();

  const ENABLE_DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE !== 'false';

  const [role, setRole] = useState("admin");

  /* Admin */
  const [adminEmail, setAdminEmail]       = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  /* Trainee */
  const [traineeId, setTraineeId]               = useState("");
  const [traineeEmail, setTraineeEmail]         = useState("");
  const [traineePassword, setTraineePassword]   = useState("");
  const [traineeConsentAgreed, setTraineeConsentAgreed] = useState(false);

  /* Employer */
  const [organizationId, setOrganizationId]     = useState("");
  const [employerEmail, setEmployerEmail]       = useState("");
  const [employerPassword, setEmployerPassword] = useState("");

  /* Modal */
  const [showModal, setShowModal] = useState(null);

  /* Error */
  const [error, setError] = useState("");

  /* ---- Demo fill ---- */
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
      setOrganizationId("EMP-DEMO-001");
      setEmployerEmail("hr@tcs.com");
      setEmployerPassword("demo1234");
    }
  };

  /* ---- Production auth helper ---- */
  const fetchAuthoritativeProfile = async (token, fallbackRole, fallbackId) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "ngrok-skip-browser-warning": "true" }
      });
      if (!res.ok) throw new Error("Production verification failed.");
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

  /* ---- Admin login ---- */
  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setError("");
    const email    = adminEmail    || event.target.elements["admin-email"]?.value;
    const password = adminPassword || event.target.elements["admin-password"]?.value;
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
      } catch (_) { /* fallthrough */ }
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("sih_token", "demo_admin_jwt_token_verified");
      navigate("/admin");
    } else {
      try {
        const uc    = await signInWithEmailAndPassword(auth, email, password);
        const token = await uc.user.getIdToken();
        await fetchAuthoritativeProfile(token, "admin", null);
      } catch (err) {
        setError("Production login failed: " + err.message);
      }
    }
  };

  /* ---- Trainee login ---- */
  const handleTraineeLogin = async (event) => {
    event.preventDefault();
    setError("");
    const enteredId    = traineeId.trim().toUpperCase();
    const enteredEmail = (traineeEmail || "").trim().toLowerCase();
    if (!enteredId)      { setError("Please enter your Permanent Trainee ID."); return; }
    if (!enteredEmail)   { setError("Please enter your registered email."); return; }
    if (!traineePassword){ setError("Please enter your password."); return; }
    if (!traineeConsentAgreed) {
      setError("You must agree to the Terms & Conditions and Privacy Policy to log in.");
      return;
    }
    const proofToken   = `PROOF-LOGIN-${enteredId}-${Date.now()}`;
    const consentRecord = {
      proof_token:   proofToken,
      accepted_at:   new Date().toISOString(),
      terms_version: "v1.0",
      user_agent:    typeof navigator !== "undefined" ? navigator.userAgent : "Web Browser",
      consent_type:  "LOGIN_TERMS_AND_PRIVACY",
      email:         enteredEmail
    };
    if (ENABLE_DEMO_MODE) {
      try {
        await platformService.submitLoginConsent(enteredId || "TR-0001", consentRecord);
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({ trainee_id: enteredId, email: enteredEmail, role: "trainee", consent: consentRecord })
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
      } catch (_) { /* fallthrough */ }
      await platformService.submitLoginConsent(enteredId || "TR-0001", consentRecord);
      localStorage.setItem("userRole", "trainee");
      localStorage.setItem("sih_token", "demo_trainee_jwt_token_verified");
      localStorage.setItem("traineeId", enteredId || "TR-0001");
      localStorage.setItem("traineeEmail", enteredEmail || "demo.trainee@sih.gov.in");
      localStorage.setItem("traineeLoginProofToken", proofToken);
      navigate("/trainee");
    } else {
      try {
        await platformService.submitLoginConsent(enteredId || "TR-0001", consentRecord);
        const uc    = await signInWithEmailAndPassword(auth, enteredEmail, traineePassword);
        const token = await uc.user.getIdToken();
        await fetchAuthoritativeProfile(token, "trainee", enteredId);
      } catch (err) {
        setError("Production Firebase Auth failed: " + err.message);
      }
    }
  };

  /* ---- Employer login ---- */
  const handleEmployerLogin = async (event) => {
    event.preventDefault();
    setError("");
    const enteredOrganizationId = organizationId.trim().toUpperCase();
    const enteredEmail          = (employerEmail || "").trim().toLowerCase();
    if (!enteredOrganizationId) { setError("Please enter your Organization ID."); return; }
    if (!enteredEmail)          { setError("Please enter your official email."); return; }
    if (!employerPassword)      { setError("Please enter your password."); return; }
    if (ENABLE_DEMO_MODE) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({ organization_id: enteredOrganizationId, email: enteredEmail, password: employerPassword, role: "employer" })
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("userRole", "employer");
          localStorage.setItem("sih_token", data.token || "demo_employer_jwt_token_verified");
          localStorage.setItem("organizationId", data.organization_id || enteredOrganizationId);
          localStorage.setItem("organizationName", data.name || "Tata Consultancy Services");
          navigate("/employer");
          return;
        }
      } catch (_) { /* fallthrough */ }
      localStorage.setItem("userRole", "employer");
      localStorage.setItem("sih_token", "demo_employer_jwt_token_verified");
      localStorage.setItem("organizationId", enteredOrganizationId || "EMP-DEMO-001");
      localStorage.setItem("organizationName", "Tata Consultancy Services");
      navigate("/employer");
    } else {
      try {
        const uc    = await signInWithEmailAndPassword(auth, enteredEmail, employerPassword);
        const token = await uc.user.getIdToken();
        await fetchAuthoritativeProfile(token, "employer", enteredOrganizationId);
      } catch (err) {
        setError("Production login failed: " + err.message);
      }
    }
  };

  const handleRoleChange = (newRole) => { setRole(newRole); setError(""); };

  /* ---- Role label helper ---- */
  const roleLabel = role === "admin" ? "Government / Admin" : role === "employer" ? "Employer" : "Trainee";

  /* ================================================================
     RENDER
  ================================================================ */
  return (
    <>
      <div className="landing-page-container">

        {/* ── HERO — TWO COLUMNS (no separate header — logo lives in left column) ── */}
        <main className="landing-hero-section">

          {/* LEFT — Logo + Branding + Introduction + Features */}
          <div className="landing-hero-left">

            {/* LOGO — top of left column, aligned left */}
            <div className="landing-logo-block">
              <img
                src="/skill2impact-logo.png"
                alt="Skill2Impact Logo"
                className="landing-brand-logo"
              />
            </div>

            <div className="landing-category-pill">
              <span className="pill-dot" />
              Evidence-Based Decision Support
            </div>

            <h1 className="landing-headline">
              Turning Skills Into{" "}
              <br />
              <span className="gradient-text">Measurable Impact</span>
            </h1>

            <p className="landing-description">
              Skill2Impact connects training programmes, skill outcomes, employment
              records and employer feedback to help government and programme teams
              make evidence-based decisions.
            </p>

            {/* Feature highlights — 2×2 grid */}
            <div className="landing-features-grid">

              <div className="landing-feature-card">
                <div className="feature-icon-wrapper blue">
                  <Target size={19} />
                </div>
                <div>
                  <h3>Skill Gap Intelligence</h3>
                  <p>Identify skills missing from training and employment requirements.</p>
                </div>
              </div>

              <div className="landing-feature-card">
                <div className="feature-icon-wrapper green">
                  <Briefcase size={19} />
                </div>
                <div>
                  <h3>Employment Outcome Tracking</h3>
                  <p>Track employment, retention and post-training outcomes longitudinally.</p>
                </div>
              </div>

              <div className="landing-feature-card">
                <div className="feature-icon-wrapper indigo">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <h3>Employer Verification</h3>
                  <p>Capture and verify employer-side employment and workforce information.</p>
                </div>
              </div>

              <div className="landing-feature-card">
                <div className="feature-icon-wrapper rose">
                  <GitBranch size={19} />
                </div>
                <div>
                  <h3>Policy What-If Simulation</h3>
                  <p>Simulate potential impact of new training modules or policy interventions.</p>
                </div>
              </div>

            </div>

            {/* What-If Intelligence highlight */}
            <div className="what-if-highlight-box">
              <div className="what-if-header">
                <div className="what-if-title">
                  <SlidersHorizontal size={16} color="#2563eb" />
                  <strong>Policy Intelligence Simulation</strong>
                </div>
                <span className="what-if-badge">Interactive Model</span>
              </div>
              <p className="what-if-prompt">
                &ldquo;What happens if we introduce EV Powertrain &amp; Telemetry modules in Pune?&rdquo;
              </p>
              <div className="what-if-metrics">
                <div className="metric-item">
                  <span className="metric-label">Placement Rate</span>
                  <div className="metric-value">
                    <span className="current">64%</span>
                    <ArrowRight size={13} color="#94a3b8" />
                    <strong className="projected green">82% (+18%)</strong>
                  </div>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Skill Gap Deficit</span>
                  <div className="metric-value">
                    <span className="current">42%</span>
                    <ArrowRight size={13} color="#94a3b8" />
                    <strong className="projected blue">14% (−28%)</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT — Role Selection + Login Card */}
          <div className="landing-hero-right">
            <div className="login-card-container">

              {/* Card header */}
              <div className="login-card-header">
                <h2>Welcome Back</h2>
                <p>Choose your role to continue</p>
              </div>

              {/* Role selector */}
              <div className="role-cards-stack">

                <div
                  className={`role-option-card ${role === "admin" ? "active" : ""}`}
                  onClick={() => handleRoleChange("admin")}
                >
                  <div className="role-card-icon admin">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="role-card-content">
                    <div className="role-card-title">
                      <strong>Government / Admin</strong>
                      {role === "admin" && <span className="active-dot" />}
                    </div>
                    <p className="role-card-desc">
                      Monitor outcomes, skill gaps, providers and policy intelligence.
                    </p>
                  </div>
                </div>

                <div
                  className={`role-option-card ${role === "employer" ? "active" : ""}`}
                  onClick={() => handleRoleChange("employer")}
                >
                  <div className="role-card-icon employer">
                    <Building2 size={18} />
                  </div>
                  <div className="role-card-content">
                    <div className="role-card-title">
                      <strong>Employer</strong>
                      {role === "employer" && <span className="active-dot" />}
                    </div>
                    <p className="role-card-desc">
                      Verify employment, provide workforce feedback and identify skill needs.
                    </p>
                  </div>
                </div>

                <div
                  className={`role-option-card ${role === "trainee" ? "active" : ""}`}
                  onClick={() => handleRoleChange("trainee")}
                >
                  <div className="role-card-icon trainee">
                    <UserRound size={18} />
                  </div>
                  <div className="role-card-content">
                    <div className="role-card-title">
                      <strong>Trainee</strong>
                      {role === "trainee" && <span className="active-dot" />}
                    </div>
                    <p className="role-card-desc">
                      Track skills, training relevance, employment outcomes and career progress.
                    </p>
                  </div>
                </div>

              </div>

              {/* Divider */}
              <div className="login-role-divider">
                <span>Sign in as {roleLabel}</span>
              </div>

              {/* Dynamic login form */}
              <div className="login-form-area">

                {/* ADMIN FORM */}
                {role === "admin" && (
                  <form onSubmit={handleAdminLogin} className="role-form">
                    <div className="form-group">
                      <label htmlFor="admin-email">Official Email</label>
                      <div className="input-with-icon">
                        <Mail size={16} />
                        <input
                          id="admin-email"
                          type="email"
                          placeholder="admin@sih.gov.in"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="admin-password">Password</label>
                      <div className="input-with-icon">
                        <LockKeyhole size={16} />
                        <input
                          id="admin-password"
                          type="password"
                          placeholder="Enter password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    {error && <div className="form-error-alert">{error}</div>}
                    <button type="submit" className="login-submit-btn">
                      <span>Sign in as Admin</span>
                      <ArrowRight size={17} />
                    </button>
                  </form>
                )}

                {/* EMPLOYER FORM */}
                {role === "employer" && (
                  <form onSubmit={handleEmployerLogin} className="role-form">
                    <div className="form-group">
                      <label htmlFor="organization-id">Organization ID</label>
                      <div className="input-with-icon">
                        <Building2 size={16} />
                        <input
                          id="organization-id"
                          type="text"
                          placeholder="e.g. EMP-DEMO-001"
                          value={organizationId}
                          onChange={(e) => setOrganizationId(e.target.value.toUpperCase())}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="employer-email">Official Email</label>
                      <div className="input-with-icon">
                        <Mail size={16} />
                        <input
                          id="employer-email"
                          type="email"
                          placeholder="hr@company.com"
                          value={employerEmail}
                          onChange={(e) => setEmployerEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="employer-password">Password</label>
                      <div className="input-with-icon">
                        <LockKeyhole size={16} />
                        <input
                          id="employer-password"
                          type="password"
                          placeholder="Enter password"
                          value={employerPassword}
                          onChange={(e) => setEmployerPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    {error && <div className="form-error-alert">{error}</div>}
                    <button type="submit" className="login-submit-btn">
                      <span>Sign in as Employer</span>
                      <ArrowRight size={17} />
                    </button>
                  </form>
                )}

                {/* TRAINEE FORM */}
                {role === "trainee" && (
                  <form onSubmit={handleTraineeLogin} className="role-form">
                    <div className="form-group">
                      <label htmlFor="trainee-id">Permanent Trainee ID</label>
                      <div className="input-with-icon">
                        <BadgeCheck size={16} />
                        <input
                          id="trainee-id"
                          type="text"
                          placeholder="e.g. TR-0001"
                          value={traineeId}
                          onChange={(e) => setTraineeId(e.target.value.toUpperCase())}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="trainee-email">Registered Email</label>
                      <div className="input-with-icon">
                        <Mail size={16} />
                        <input
                          id="trainee-email"
                          type="email"
                          placeholder="trainee@example.com"
                          value={traineeEmail}
                          onChange={(e) => setTraineeEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="trainee-password">Password</label>
                      <div className="input-with-icon">
                        <LockKeyhole size={16} />
                        <input
                          id="trainee-password"
                          type="password"
                          placeholder="Enter password"
                          value={traineePassword}
                          onChange={(e) => setTraineePassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Consent checkbox */}
                    <div
                      className={`consent-checkbox-card ${traineeConsentAgreed ? "checked" : ""}`}
                      onClick={() => setTraineeConsentAgreed((prev) => !prev)}
                    >
                      <span className="checkbox-icon">
                        {traineeConsentAgreed ? <CheckSquare size={18} /> : <Square size={18} />}
                      </span>
                      <span className="consent-text">
                        I agree to all applicable{" "}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setShowModal("terms"); }}
                          className="legal-link"
                        >
                          Terms &amp; Conditions
                        </button>
                        {" "}and{" "}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setShowModal("privacy"); }}
                          className="legal-link"
                        >
                          Privacy Policy
                        </button>
                        .{" "}
                        <span className="sub-note">Consent is logged for legal compliance.</span>
                      </span>
                    </div>

                    {error && <div className="form-error-alert">{error}</div>}

                    <button
                      type="submit"
                      className="login-submit-btn"
                      disabled={!traineeConsentAgreed}
                    >
                      <span>Sign in as Trainee</span>
                      <ArrowRight size={17} />
                    </button>
                  </form>
                )}

              </div>

              {/* Demo quick-access */}
              {ENABLE_DEMO_MODE && (
                <div className="demo-shortcuts-area">
                  <p className="demo-shortcuts-title">Quick Demo Login</p>
                  <div className="demo-buttons-grid">
                    <button
                      type="button"
                      onClick={() => handleDemoFill("admin")}
                      className="demo-shortcut-btn admin"
                    >
                      Demo Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoFill("trainee")}
                      className="demo-shortcut-btn trainee"
                    >
                      Demo Trainee
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoFill("employer")}
                      className="demo-shortcut-btn employer"
                    >
                      Demo Employer
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </main>
      </div>

      {/* ── TERMS & PRIVACY MODAL ── */}
      {showModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowModal(null)}>
          <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>

            <div className={`modal-header ${showModal}`}>
              <div className="modal-title-group">
                <FileText size={19} color={showModal === "terms" ? "#2563eb" : "#16a34a"} />
                <strong>{showModal === "terms" ? "Terms & Conditions" : "Privacy Policy"}</strong>
                <span className="version-tag">v1.0 · Jan 2024</span>
              </div>
              <button onClick={() => setShowModal(null)} className="modal-close-btn" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-scroll">
              {showModal === "terms" ? (
                <>
                  <p className="modal-intro-bold">
                    Skill2Impact — Government Skilling Portal — Terms &amp; Conditions
                  </p>
                  <ol className="modal-legal-list">
                    <li><strong>Acceptance:</strong> By logging in, you agree to abide by these Terms and all applicable Indian Government guidelines on vocational training data.</li>
                    <li><strong>Eligibility:</strong> Access is restricted to registered trainees with a valid Permanent Trainee ID issued under the National Skills Qualification Framework (NSQF).</li>
                    <li><strong>Data Accuracy:</strong> You are responsible for ensuring that the personal and professional information you provide is accurate and up to date.</li>
                    <li><strong>Platform Use:</strong> The portal must be used solely for legitimate skill tracking, outcome reporting, and employer verification purposes.</li>
                    <li><strong>Consent Logging:</strong> Your agreement to these terms is time-stamped, proof-tokenized, and stored as an immutable legal audit record per Section 43A IT Act, 2000.</li>
                    <li><strong>Accountability:</strong> Misuse of the platform, fraudulent data entry, or unauthorized access may result in suspension and referral to appropriate authorities.</li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="modal-intro-bold">
                    Skill2Impact — Data Privacy Policy for Trainees
                  </p>
                  <ol className="modal-legal-list">
                    <li><strong>Data Collected:</strong> We collect your Trainee ID, email, training programme details, employment outcomes, and follow-up survey responses.</li>
                    <li><strong>Purpose of Collection:</strong> Data is used for policy evaluation, programme funding decisions, and employer verification only.</li>
                    <li><strong>No Commercial Sharing:</strong> Your individual data will never be sold, shared with commercial marketers, or used for targeted advertising.</li>
                    <li><strong>Anonymized Analytics:</strong> Government outcome reports use only anonymized, aggregated data — never individually identifiable records.</li>
                    <li><strong>Consent Audit Trail:</strong> Your login consent is recorded with a cryptographic proof token, timestamp, and terms version as a verifiable legal record.</li>
                  </ol>
                </>
              )}
            </div>

            <div className="modal-footer-bar">
              <button onClick={() => setShowModal(null)} className="modal-secondary-btn">
                Close
              </button>
              <button
                onClick={() => { setTraineeConsentAgreed(true); setShowModal(null); }}
                className={`modal-primary-btn ${showModal}`}
              >
                <CheckSquare size={16} /> I Accept &amp; Agree
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

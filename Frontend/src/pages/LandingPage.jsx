import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck, UserRound, Building2, ArrowRight,
  BadgeCheck, LockKeyhole, Mail, FileText,
  X, CheckSquare, Square
} from "lucide-react";
import { auth } from "../utils/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { platformService } from "../services/platformService";
import { API_BASE } from "../utils/config";
import "./LandingPage.css";

/* ─── Helper: decide where "Open Prototype" should go ─── */
function getPrototypeRoute() {
  const role  = localStorage.getItem("userRole");
  const token = localStorage.getItem("sih_token");
  if (role && token) {
    if (role === "admin")    return "/admin";
    if (role === "employer") return "/employer";
    if (role === "trainee")  return "/trainee";
  }
  return null; // triggers modal
}

export default function LandingPage() {
  const navigate = useNavigate();
  const ENABLE_DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE !== "false";

  /* ── Sign-in modal visibility ── */
  const [showSignIn, setShowSignIn]     = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(null); // "terms" | "privacy"

  /* ── Role selector ── */
  const [role, setRole] = useState("admin");

  /* Admin form */
  const [adminEmail,    setAdminEmail]    = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  /* Trainee form */
  const [traineeId,           setTraineeId]           = useState("");
  const [traineeEmail,        setTraineeEmail]        = useState("");
  const [traineePassword,     setTraineePassword]     = useState("");
  const [traineeConsentAgreed, setTraineeConsentAgreed] = useState(false);

  /* Employer form */
  const [organizationId,   setOrganizationId]   = useState("");
  const [employerEmail,    setEmployerEmail]    = useState("");
  const [employerPassword, setEmployerPassword] = useState("");

  /* Error */
  const [error, setError] = useState("");

  /* ── Helpers ── */
  const openSignIn  = () => { setError(""); setShowSignIn(true); };
  const closeSignIn = () => { setShowSignIn(false); setError(""); };
  const changeRole  = (r) => { setRole(r); setError(""); };

  const handleOpenPrototype = () => {
    const dest = getPrototypeRoute();
    if (dest) navigate(dest);
    else openSignIn();
  };
  const handleSeePortals = () =>
    document.getElementById("lp-views")?.scrollIntoView({ behavior: "smooth" });
  const handleHowVerification = () =>
    document.getElementById("lp-verification")?.scrollIntoView({ behavior: "smooth" });

  /* ── Demo fill (identical to Login.jsx) ── */
  const handleDemoFill = (demoRole) => {
    setError(""); setRole(demoRole);
    if (demoRole === "admin") {
      setAdminEmail("admin@sih.gov.in"); setAdminPassword("admin123");
    } else if (demoRole === "trainee") {
      setTraineeId("TR-0001"); setTraineeEmail("demo.trainee@sih.gov.in");
      setTraineePassword("demo1234"); setTraineeConsentAgreed(true);
    } else if (demoRole === "employer") {
      setOrganizationId("EMP-DEMO-001"); setEmployerEmail("hr@tcs.com");
      setEmployerPassword("demo1234");
    }
  };

  /* ── Production auth helper (identical to Login.jsx) ── */
  const fetchAuthoritativeProfile = async (token, fallbackRole, fallbackId) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "ngrok-skip-browser-warning": "true" },
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

  /* ── Admin login (identical to Login.jsx) ── */
  const handleAdminLogin = async (event) => {
    event.preventDefault(); setError("");
    const email    = adminEmail    || event.target.elements["admin-email"]?.value;
    const password = adminPassword || event.target.elements["admin-password"]?.value;
    if (ENABLE_DEMO_MODE) {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({ email, password, role: "admin" }),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("sih_token", data.token || "demo_admin_jwt_token_verified");
          navigate("/admin"); return;
        }
      } catch (_) {}
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("sih_token", "demo_admin_jwt_token_verified");
      navigate("/admin");
    } else {
      try {
        const uc    = await signInWithEmailAndPassword(auth, email, password);
        const token = await uc.user.getIdToken();
        await fetchAuthoritativeProfile(token, "admin", null);
      } catch (err) { setError("Production login failed: " + err.message); }
    }
  };

  /* ── Trainee login (identical to Login.jsx) ── */
  const handleTraineeLogin = async (event) => {
    event.preventDefault(); setError("");
    const enteredId    = traineeId.trim().toUpperCase();
    const enteredEmail = (traineeEmail || "").trim().toLowerCase();
    if (!enteredId)      { setError("Please enter your Permanent Trainee ID."); return; }
    if (!enteredEmail)   { setError("Please enter your registered email."); return; }
    if (!traineePassword){ setError("Please enter your password."); return; }
    if (!traineeConsentAgreed) {
      setError("You must agree to the Terms & Conditions and Privacy Policy to log in."); return;
    }
    const proofToken    = `PROOF-LOGIN-${enteredId}-${Date.now()}`;
    const consentRecord = {
      proof_token: proofToken, accepted_at: new Date().toISOString(),
      terms_version: "v1.0",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "Web Browser",
      consent_type: "LOGIN_TERMS_AND_PRIVACY", email: enteredEmail,
    };
    if (ENABLE_DEMO_MODE) {
      try {
        await platformService.submitLoginConsent(enteredId || "TR-0001", consentRecord);
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({ trainee_id: enteredId, email: enteredEmail, role: "trainee", consent: consentRecord }),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("userRole", "trainee");
          localStorage.setItem("sih_token", data.token || "demo_trainee_jwt_token_verified");
          localStorage.setItem("traineeId", data.user_id || enteredId);
          localStorage.setItem("traineeEmail", enteredEmail);
          localStorage.setItem("traineeLoginProofToken", proofToken);
          navigate("/trainee"); return;
        }
      } catch (_) {}
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
      } catch (err) { setError("Production Firebase Auth failed: " + err.message); }
    }
  };

  /* ── Employer login (identical to Login.jsx) ── */
  const handleEmployerLogin = async (event) => {
    event.preventDefault(); setError("");
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
          body: JSON.stringify({ organization_id: enteredOrganizationId, email: enteredEmail, password: employerPassword, role: "employer" }),
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("userRole", "employer");
          localStorage.setItem("sih_token", data.token || "demo_employer_jwt_token_verified");
          localStorage.setItem("organizationId", data.organization_id || enteredOrganizationId);
          localStorage.setItem("organizationName", data.name || "Tata Consultancy Services");
          navigate("/employer"); return;
        }
      } catch (_) {}
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
      } catch (err) { setError("Production login failed: " + err.message); }
    }
  };

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div className="lp-root">

      {/* ── STICKY NAV ── */}
      <header className="lp-header">
        <nav className="lp-nav">
          <div className="lp-logo">
            <img
              src="/skill2impact-logo.png"
              alt="Skill2Impact"
              className="lp-logo-img"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <span className="lp-logo-text">
              Skill2Impact<span className="lp-logo-dot">.</span>
            </span>
          </div>

          <div className="lp-nav-links">
            <a href="#lp-problem">The problem</a>
            <a href="#lp-verification">How verification works</a>
            <a href="#lp-views">Three portals</a>
            <a href="#lp-privacy">Privacy</a>
          </div>

          <div className="lp-nav-right">
            <button className="lp-btn lp-btn-outline" onClick={openSignIn}>
              Sign in
            </button>
            <button className="lp-btn lp-btn-primary" onClick={handleOpenPrototype}>
              Open prototype
            </button>
          </div>
        </nav>
      </header>

      {/* ── MAIN WRAP ── */}
      <main className="lp-wrap">

        {/* ── HERO ── */}
        <section className="lp-hero" style={{ borderTop: "none" }}>
          <div className="lp-hero-grid">

            <div className="lp-hero-left">
              <div className="lp-eyebrow">
                <span className="lp-dash" />
                SIH 2026 · Problem Statement 26135 · Team ApexCoders
              </div>
              <h1 className="lp-headline">
                Turning skills into{" "}
                <span className="lp-blue">measurable</span> impact.
              </h1>
              <p className="lp-lede">
                Training systems track enrolment, attendance and certification well. What
                happens after — the job, the wage, the years that follow — usually
                disappears. Skill2Impact is a consent-based, longitudinal outcome platform
                built for the Government of Maharashtra to close that gap.
              </p>
              <div className="lp-hero-actions">
                <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={handleSeePortals}>
                  See the three portals
                </button>
                <button className="lp-btn lp-btn-outline lp-btn-lg" onClick={handleHowVerification}>
                  How verification works
                </button>
              </div>
            </div>

            {/* Stat card */}
            <div className="lp-stat-card">
              <div className="lp-stat-card-label">Live outcome snapshot — Maharashtra cohort</div>
              <div className="lp-stat-grid">
                <div><div className="lp-stat-num">800</div><div className="lp-stat-sub">Trainees tracked</div></div>
                <div><div className="lp-stat-num">66%</div><div className="lp-stat-sub">Employment rate</div></div>
                <div><div className="lp-stat-num">77%</div><div className="lp-stat-sub">6-month retention</div></div>
                <div><div className="lp-stat-num">₹29,976</div><div className="lp-stat-sub">Average wage</div></div>
              </div>
              <div className="lp-stat-divider" />
              <div className="lp-verif-label">Verification path</div>
              <div className="lp-verif-path">
                <span className="lp-verif-badge">EPFO match</span>
                {" → "}
                <span className="lp-verif-badge">Partner HRIS</span>
                {" → "}
                <span className="lp-verif-badge">Employer confirm</span>
              </div>
            </div>

          </div>
        </section>

        {/* ── THE GAP ── */}
        <section className="lp-section" id="lp-problem">
          <div className="lp-section-head">
            <div className="lp-eyebrow lp-eyebrow-orange"><span className="lp-dash lp-dash-orange" />The gap</div>
            <h2 className="lp-section-title">Training is tracked. Impact isn't.</h2>
            <p className="lp-section-desc">
              Trainees change phone numbers. Employers don't report consistently.
              Different programmes use different identifiers for the same person. The
              result: nobody can reliably say what training actually leads to.
            </p>
          </div>
          <div className="lp-gap-table">
            <div className="lp-gap-col">
              <h4>What government already knows</h4>
              <div className="lp-gap-item"><span className="lp-dot lp-dot-on" />Enrolment</div>
              <div className="lp-gap-item"><span className="lp-dot lp-dot-on" />Attendance</div>
              <div className="lp-gap-item"><span className="lp-dot lp-dot-on" />Assessment scores</div>
              <div className="lp-gap-item"><span className="lp-dot lp-dot-on" />Certification</div>
            </div>
            <div className="lp-gap-col">
              <h4>What stays unclear</h4>
              <div className="lp-gap-item"><span className="lp-dot lp-dot-off" />Employment and retention</div>
              <div className="lp-gap-item"><span className="lp-dot lp-dot-off" />Wage progression</div>
              <div className="lp-gap-item"><span className="lp-dot lp-dot-off" />Relevance of the training itself</div>
              <div className="lp-gap-item"><span className="lp-dot lp-dot-off" />Reasons for non-placement</div>
            </div>
          </div>
        </section>

        {/* ── VERIFICATION ENGINE ── */}
        <section className="lp-section" id="lp-verification">
          <div className="lp-section-head">
            <div className="lp-eyebrow lp-eyebrow-orange"><span className="lp-dash lp-dash-orange" />Verification engine</div>
            <h2 className="lp-section-title">Three tiers, so no single source has to be perfect.</h2>
            <p className="lp-section-desc">
              Instead of asking every employer to manually confirm every trainee, outcomes
              are verified automatically wherever possible, and only fall back to a person
              when they have to.
            </p>
          </div>
          <div className="lp-tier">
            <div className="lp-tier-num">01</div>
            <div>
              <h3>EPFO auto-match</h3>
              <p>Aadhaar/UAN is checked against India's Employees' Provident Fund records — the same formal-employment database every company with 20+ staff is legally required to report to. No partnership needed, and it covers most of the formal workforce automatically.</p>
              <span className="lp-tag">Broad, automatic coverage</span>
            </div>
          </div>
          <div className="lp-tier">
            <div className="lp-tier-num">02</div>
            <div>
              <h3>Partner HRIS integration</h3>
              <p>For organisations that connect their own HR system — Workday, BambooHR, Darwinbox — a deterministic five-point match confirms employment in real time, without waiting on EPFO's monthly reporting cycle.</p>
              <span className="lp-tag">Fast, for connected employers</span>
            </div>
          </div>
          <div className="lp-tier">
            <div className="lp-tier-num">03</div>
            <div>
              <h3>Direct employer confirmation</h3>
              <p>Anyone the first two tiers miss — small businesses, informal work, apprenticeships not yet on formal payroll — gets a two-tap confirmation request sent straight to the named employer. Nobody is left permanently unverified.</p>
              <span className="lp-tag">Universal fallback</span>
            </div>
          </div>
        </section>

        {/* ── THREE CONNECTED PORTALS ── */}
        <section className="lp-section" id="lp-views">
          <div className="lp-section-head">
            <div className="lp-eyebrow lp-eyebrow-orange"><span className="lp-dash lp-dash-orange" />Three connected views</div>
            <h2 className="lp-section-title">One record, seen differently by everyone who needs it.</h2>
            <p className="lp-section-desc">
              A trainee, their employer, and the government are looking at the same underlying outcome data — each through the lens relevant to their role.
            </p>
          </div>
          <div className="lp-views-table">
            <div className="lp-view-row">
              <div><div className="lp-view-role">Government</div><div className="lp-view-sub">Admin dashboard</div></div>
              <div className="lp-view-desc">Cohort, course, provider and district analytics; root-cause diagnostics on non-placement; policy recommendations with an evidence trail.</div>
              <div className="lp-view-feats">
                <div>Provider accountability league tables</div>
                <div>District-level resource-allocation flags</div>
                <div>DPDP-compliant outcome exports</div>
              </div>
            </div>
            <div className="lp-view-row">
              <div><div className="lp-view-role">Employer</div><div className="lp-view-sub">Organisation portal</div></div>
              <div className="lp-view-desc">Confirm or dispute trainee claims, report the skills your hiring managers actually find missing, and manage HR-system integrations.</div>
              <div className="lp-view-feats">
                <div>Verification requests inbox</div>
                <div>Workforce retention benchmarking</div>
                <div>Curriculum feedback to training bodies</div>
              </div>
            </div>
            <div className="lp-view-row">
              <div><div className="lp-view-role">Trainee</div><div className="lp-view-sub">Personal intelligence</div></div>
              <div className="lp-view-desc">See your own outcome record, log a new role or wage change in seconds, and control exactly what data is shared and why.</div>
              <div className="lp-view-feats">
                <div>Two-tap milestone check-ins</div>
                <div>Verified vs. self-reported skill evidence</div>
                <div>Consent given, reviewed, and revocable</div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── STATS BANNER ── */}
      <section className="lp-banner">
        <div className="lp-wrap">
          <div className="lp-eyebrow lp-eyebrow-orange"><span className="lp-dash lp-dash-orange" />Why this matters</div>
          <h2 className="lp-section-title">Outcome data at a scale that means something.</h2>
          <div className="lp-stat-grid4">
            <div><div className="lp-stat-num">645</div><div className="lp-stat-sub lp-stat-sub-lg">Certified this cohort</div></div>
            <div><div className="lp-stat-num">380</div><div className="lp-stat-sub lp-stat-sub-lg">Formally placed</div></div>
            <div><div className="lp-stat-num">5</div><div className="lp-stat-sub lp-stat-sub-lg">Training providers benchmarked</div></div>
            <div><div className="lp-stat-num">41%</div><div className="lp-stat-sub lp-stat-sub-lg">Follow-up response rate</div></div>
          </div>
          <div className="lp-banner-foot">
            Figures shown are from the Skill2Impact prototype's simulated Maharashtra cohort, used to demonstrate the analytics pipeline end to end.
          </div>
        </div>
      </section>

      <main className="lp-wrap">
        {/* ── PRIVACY ── */}
        <section className="lp-section" id="lp-privacy">
          <div className="lp-section-head">
            <div className="lp-eyebrow lp-eyebrow-orange"><span className="lp-dash lp-dash-orange" />Built for consent, not surveillance</div>
            <h2 className="lp-section-title">Verified doesn't mean exposed.</h2>
            <p className="lp-section-desc">The system is designed to prove outcomes without holding more personal data than it needs to.</p>
          </div>
          <div className="lp-privacy-grid">
            <div>
              <h4>Consent first</h4>
              <p>Every trainee explicitly opts in to outcome tracking and can review or revoke that consent at any time from their own dashboard.</p>
            </div>
            <div>
              <h4>Identity, hashed</h4>
              <p>Aadhaar numbers are converted to a one-way hash the moment they're captured. The system links records across programmes without ever storing the raw number.</p>
            </div>
            <div>
              <h4>Aggregated by default</h4>
              <p>Analytics shared with government departments are aggregated and anonymised — individual records are never sold, monetised, or handed to third-party recruiters.</p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="lp-cta">
          <div>
            <h2>Ready to look under the hood?</h2>
            <p>Walk through the live prototype across all three portals.</p>
          </div>
          <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={handleOpenPrototype}>
            Open the prototype
          </button>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-wrap">
          Skill2Impact — SIH 2026 · Problem Statement 26135 · Team ApexCoders
        </div>
      </footer>

      {/* ══════════════════════════════════════════
          SIGN-IN MODAL OVERLAY
      ══════════════════════════════════════════ */}
      {showSignIn && (
        <div className="lp-modal-backdrop" onClick={closeSignIn}>
          <div
            className="lp-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="lp-modal-hdr">
              <div>
                <h3 className="lp-modal-title">Welcome back</h3>
                <p className="lp-modal-subtitle">Choose your role to continue</p>
              </div>
              <button className="lp-modal-close" onClick={closeSignIn} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {/* Role tabs */}
            <div className="lp-role-tabs">
              <button
                className={`lp-role-tab ${role === "admin" ? "active" : ""}`}
                onClick={() => changeRole("admin")}
                type="button"
              >
                <ShieldCheck size={14} style={{ flexShrink: 0 }} />
                Government / Admin
              </button>
              <button
                className={`lp-role-tab ${role === "employer" ? "active" : ""}`}
                onClick={() => changeRole("employer")}
                type="button"
              >
                <Building2 size={14} style={{ flexShrink: 0 }} />
                Employer
              </button>
              <button
                className={`lp-role-tab ${role === "trainee" ? "active" : ""}`}
                onClick={() => changeRole("trainee")}
                type="button"
              >
                <UserRound size={14} style={{ flexShrink: 0 }} />
                Trainee
              </button>
            </div>

            {/* ── ADMIN FORM ── */}
            {role === "admin" && (
              <form onSubmit={handleAdminLogin} className="lp-signin-form">
                <div className="lp-field">
                  <label htmlFor="m-admin-email">Official Email</label>
                  <div className="lp-input-wrap">
                    <Mail size={15} className="lp-field-icon" />
                    <input
                      id="m-admin-email"
                      type="email"
                      placeholder="admin@sih.gov.in"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="lp-field">
                  <label htmlFor="m-admin-pw">Password</label>
                  <div className="lp-input-wrap">
                    <LockKeyhole size={15} className="lp-field-icon" />
                    <input
                      id="m-admin-pw"
                      type="password"
                      placeholder="Enter password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {error && <div className="lp-form-error">{error}</div>}
                <button type="submit" className="lp-signin-btn">
                  Sign in as Government / Admin <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* ── EMPLOYER FORM ── */}
            {role === "employer" && (
              <form onSubmit={handleEmployerLogin} className="lp-signin-form">
                <div className="lp-field">
                  <label htmlFor="m-org-id">Organization ID</label>
                  <div className="lp-input-wrap">
                    <Building2 size={15} className="lp-field-icon" />
                    <input
                      id="m-org-id"
                      type="text"
                      placeholder="e.g. EMP-DEMO-001"
                      value={organizationId}
                      onChange={(e) => setOrganizationId(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                </div>
                <div className="lp-field">
                  <label htmlFor="m-emp-email">Organisation Email</label>
                  <div className="lp-input-wrap">
                    <Mail size={15} className="lp-field-icon" />
                    <input
                      id="m-emp-email"
                      type="email"
                      placeholder="hr.verification@company.com"
                      value={employerEmail}
                      onChange={(e) => setEmployerEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="lp-field">
                  <label htmlFor="m-emp-pw">Password</label>
                  <div className="lp-input-wrap">
                    <LockKeyhole size={15} className="lp-field-icon" />
                    <input
                      id="m-emp-pw"
                      type="password"
                      placeholder="Enter password"
                      value={employerPassword}
                      onChange={(e) => setEmployerPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {error && <div className="lp-form-error">{error}</div>}
                <button type="submit" className="lp-signin-btn">
                  Sign in as Employer <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* ── TRAINEE FORM ── */}
            {role === "trainee" && (
              <form onSubmit={handleTraineeLogin} className="lp-signin-form">
                <div className="lp-field">
                  <label htmlFor="m-tr-id">Permanent Trainee ID</label>
                  <div className="lp-input-wrap">
                    <BadgeCheck size={15} className="lp-field-icon" />
                    <input
                      id="m-tr-id"
                      type="text"
                      placeholder="e.g. TR-0001"
                      value={traineeId}
                      onChange={(e) => setTraineeId(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                </div>
                <div className="lp-field">
                  <label htmlFor="m-tr-email">Registered Email</label>
                  <div className="lp-input-wrap">
                    <Mail size={15} className="lp-field-icon" />
                    <input
                      id="m-tr-email"
                      type="email"
                      placeholder="trainee@example.com"
                      value={traineeEmail}
                      onChange={(e) => setTraineeEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="lp-field">
                  <label htmlFor="m-tr-pw">Password</label>
                  <div className="lp-input-wrap">
                    <LockKeyhole size={15} className="lp-field-icon" />
                    <input
                      id="m-tr-pw"
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
                  className={`lp-consent-row ${traineeConsentAgreed ? "checked" : ""}`}
                  onClick={() => setTraineeConsentAgreed((p) => !p)}
                >
                  <span className="lp-consent-chk">
                    {traineeConsentAgreed ? <CheckSquare size={16} /> : <Square size={16} />}
                  </span>
                  <span className="lp-consent-text">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="lp-legal-link"
                      onClick={(e) => { e.stopPropagation(); setShowLegalModal("terms"); }}
                    >Terms & Conditions</button>
                    {" "}and{" "}
                    <button
                      type="button"
                      className="lp-legal-link"
                      onClick={(e) => { e.stopPropagation(); setShowLegalModal("privacy"); }}
                    >Privacy Policy</button>.
                    <span className="lp-consent-note"> Consent is logged.</span>
                  </span>
                </div>

                {error && <div className="lp-form-error">{error}</div>}
                <button type="submit" className="lp-signin-btn" disabled={!traineeConsentAgreed}>
                  Sign in as Trainee <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Quick Demo Login */}
            {ENABLE_DEMO_MODE && (
              <div className="lp-demo-area">
                <div className="lp-demo-label">Quick demo login</div>
                <div className="lp-demo-btns">
                  <button type="button" className="lp-demo-btn" onClick={() => handleDemoFill("admin")}>Demo Admin</button>
                  <button type="button" className="lp-demo-btn" onClick={() => handleDemoFill("trainee")}>Demo Trainee</button>
                  <button type="button" className="lp-demo-btn" onClick={() => handleDemoFill("employer")}>Demo Employer</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          LEGAL MODAL (Terms / Privacy) — reused from Login.jsx
      ══════════════════════════════════════════ */}
      {showLegalModal && (
        <div className="lp-modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setShowLegalModal(null)}>
          <div className="lp-legal-box" onClick={(e) => e.stopPropagation()}>
            <div className={`lp-legal-hdr ${showLegalModal}`}>
              <div className="lp-legal-title">
                <FileText size={18} color={showLegalModal === "terms" ? "#2563eb" : "#16a34a"} />
                <strong>{showLegalModal === "terms" ? "Terms & Conditions" : "Privacy Policy"}</strong>
                <span className="lp-legal-version">v1.0 · Jan 2024</span>
              </div>
              <button className="lp-modal-close" onClick={() => setShowLegalModal(null)}><X size={17} /></button>
            </div>
            <div className="lp-legal-body">
              {showLegalModal === "terms" ? (
                <>
                  <p className="lp-legal-intro">Skill2Impact — Government Skilling Portal — Terms &amp; Conditions</p>
                  <ol className="lp-legal-list">
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
                  <p className="lp-legal-intro">Skill2Impact — Data Privacy Policy for Trainees</p>
                  <ol className="lp-legal-list">
                    <li><strong>Data Collected:</strong> We collect your Trainee ID, email, training programme details, employment outcomes, and follow-up survey responses.</li>
                    <li><strong>Purpose of Collection:</strong> Data is used for policy evaluation, programme funding decisions, and employer verification only.</li>
                    <li><strong>No Commercial Sharing:</strong> Your individual data will never be sold, shared with commercial marketers, or used for targeted advertising.</li>
                    <li><strong>Anonymized Analytics:</strong> Government outcome reports use only anonymized, aggregated data — never individually identifiable records.</li>
                    <li><strong>Consent Audit Trail:</strong> Your login consent is recorded with a cryptographic proof token, timestamp, and terms version as a verifiable legal record.</li>
                  </ol>
                </>
              )}
            </div>
            <div className="lp-legal-footer">
              <button className="lp-legal-btn-sec" onClick={() => setShowLegalModal(null)}>Close</button>
              <button
                className={`lp-legal-btn-pri ${showLegalModal}`}
                onClick={() => { setTraineeConsentAgreed(true); setShowLegalModal(null); }}
              >
                <CheckSquare size={15} /> I Accept &amp; Agree
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, ShieldCheck, ArrowRight, CheckCircle2, Clock, Lock, Mail, Phone, MapPin, FileText, AlertCircle } from "lucide-react";
import { mockStore } from "../services/mockStore";
import { platformService } from "../services/platformService";

const ACTIVE_DEMO_EMPLOYERS = [
  { id: "EMP-DEMO-001", name: "Tata Consultancy Services", sector: "Information Technology", rep: "Rohit Sharma", status: "Verified" },
  { id: "EMP-002", name: "Infosys BPM", sector: "IT & BPO Services", rep: "Priya Sundaram", status: "Verified" },
  { id: "EMP-003", name: "Mahindra & Mahindra Automotive", sector: "Manufacturing & EV", rep: "Anand Deshpande", status: "Verified" },
  { id: "EMP-004", name: "Apollo Hospitals Enterprise", sector: "Healthcare & Clinical", rep: "Dr. K. Swaminathan", status: "Verified" },
  { id: "EMP-005", name: "Reliance Clean Energy Ltd", sector: "Renewable Energy", rep: "Vikram Singhania", status: "Verified" },
  { id: "EMP-009", name: "New Horizon Logistics Ltd", sector: "Supply Chain & Logistics", rep: "Suresh Menon", status: "Pending" }
];

export default function EmployerLogin() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [selectedEmployerId, setSelectedEmployerId] = useState("EMP-DEMO-001");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("••••••••");
  const [authError, setAuthError] = useState("");

  // Registration Form State
  const [regForm, setRegForm] = useState({
    organisation_name: "",
    registration_gst: "",
    industry: "Information Technology",
    location: "",
    representative: "",
    email: "",
    phone: "",
    hr_system: "Workday Enterprise HCM"
  });
  const [regSuccessMessage, setRegSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickLogin = (empId) => {
    const emp = mockStore.getEmployer(empId);
    if (!emp) return;

    localStorage.setItem("userRole", "employer");
    localStorage.setItem("sih_token", `demo_employer_jwt_${empId}`);
    localStorage.setItem("organizationId", emp.id);
    localStorage.setItem("organizationName", emp.name);

    navigate("/employer/dashboard");
  };

  const handleManualLogin = (e) => {
    e.preventDefault();
    setAuthError("");

    const emp = mockStore.getEmployer(selectedEmployerId);
    if (!emp) {
      setAuthError("Organisation record not found. Please select a valid organisation.");
      return;
    }

    localStorage.setItem("userRole", "employer");
    localStorage.setItem("sih_token", `employer_session_token_${emp.id}`);
    localStorage.setItem("organizationId", emp.id);
    localStorage.setItem("organizationName", emp.name);

    navigate("/employer/dashboard");
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError("");
    setRegSuccessMessage("");

    if (!regForm.organisation_name || !regForm.registration_gst || !regForm.email || !regForm.representative) {
      setAuthError("Please provide all required fields including Organisation Name, GSTIN, Representative, and Email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newOrgId = `EMP-${Date.now().toString().slice(-4)}`;
      const newEmployer = {
        id: newOrgId,
        name: regForm.organisation_name,
        code: `${newOrgId}-REG`,
        sector: regForm.industry,
        location: regForm.location || "National Operations",
        registration_gst: regForm.registration_gst,
        representative: regForm.representative,
        email: regForm.email,
        phone: regForm.phone || "+91 98765 43210",
        hr_system: regForm.hr_system,
        status: "Pending", // Admin verification required
        registration_date: new Date().toISOString().split("T")[0],
        submitted_at: new Date().toISOString().split("T")[0],
        verified_at: null
      };

      mockStore.state.employers.push(newEmployer);
      mockStore.logEmployerActivity(newOrgId, {
        type: "REGISTRATION_SUBMITTED",
        title: "Organisation Registration Submitted",
        details: `Submitted corporate profile under GSTIN ${regForm.registration_gst}. Awaiting Admin attestation.`
      });
      mockStore.save();

      setRegSuccessMessage(
        `Registration submitted successfully! Organisation ID "${newOrgId}" registered with status "Pending". An Admin must verify your credentials before full outcome attestation is unlocked.`
      );
      
      // Auto-populate for login
      setSelectedEmployerId(newOrgId);
      setTimeout(() => {
        setAuthMode("login");
      }, 3000);
    } catch (err) {
      console.error(err);
      setAuthError("Error saving organisation registration: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* Top Banner */}
      <div style={{ background: "rgba(15, 23, 42, 0.8)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, letterSpacing: "-0.3px", color: "white" }}>
              Skilling Outcomes Intelligence Platform
            </h1>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Authorised Organisation & Employer Gateway (Sections 3–5)
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link to="/login" style={{ color: "#94a3b8", fontSize: "0.85rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            ← All Portals Login
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2.5rem 1.5rem" }}>
        <div style={{ width: "100%", maxWidth: "980px", background: "rgba(30, 41, 59, 0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
          
          {/* Nav Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(15, 23, 42, 0.4)" }}>
            <button
              onClick={() => { setAuthMode("login"); setAuthError(""); }}
              style={{
                flex: 1,
                padding: "1rem",
                background: authMode === "login" ? "rgba(37, 99, 235, 0.15)" : "transparent",
                color: authMode === "login" ? "#60a5fa" : "#94a3b8",
                border: "none",
                borderBottom: authMode === "login" ? "2px solid #3b82f6" : "2px solid transparent",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
            >
              <ShieldCheck size={18} /> Authorised Organisation Login
            </button>

            <button
              onClick={() => { setAuthMode("register"); setAuthError(""); }}
              style={{
                flex: 1,
                padding: "1rem",
                background: authMode === "register" ? "rgba(37, 99, 235, 0.15)" : "transparent",
                color: authMode === "register" ? "#60a5fa" : "#94a3b8",
                border: "none",
                borderBottom: authMode === "register" ? "2px solid #3b82f6" : "2px solid transparent",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem"
              }}
            >
              <Building2 size={18} /> Register New Organisation
            </button>
          </div>

          {/* Feedback Messages */}
          {authError && (
            <div style={{ margin: "1.25rem 1.5rem 0 1.5rem", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", padding: "0.85rem 1.25rem", borderRadius: "8px", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={18} color="#f87171" />
              <span>{authError}</span>
            </div>
          )}

          {regSuccessMessage && (
            <div style={{ margin: "1.25rem 1.5rem 0 1.5rem", background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#86efac", padding: "0.85rem 1.25rem", borderRadius: "8px", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={18} color="#4ade80" />
              <span>{regSuccessMessage}</span>
            </div>
          )}

          {/* Tab 1: LOGIN */}
          {authMode === "login" && (
            <div style={{ padding: "2rem", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }}>
              {/* Quick Persona Picker */}
              <div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Deterministic Demo Orgs
                </span>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0.25rem 0 0.75rem 0", color: "#f1f5f9" }}>
                  Select Demonstration Organisation
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "0 0 1.25rem 0" }}>
                  Each organization maintains strict multi-tenant data boundaries. Employer A never accesses records from Employer B (Section 4).
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {ACTIVE_DEMO_EMPLOYERS.map((emp) => {
                    const isSelected = selectedEmployerId === emp.id;
                    const isPending = emp.status === "Pending";

                    return (
                      <div
                        key={emp.id}
                        onClick={() => setSelectedEmployerId(emp.id)}
                        style={{
                          background: isSelected ? "rgba(37, 99, 235, 0.2)" : "rgba(15, 23, 42, 0.5)",
                          border: isSelected ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "10px",
                          padding: "0.85rem 1rem",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                            <strong style={{ fontSize: "0.95rem", color: isSelected ? "#93c5fd" : "#f1f5f9" }}>
                              {emp.name}
                            </strong>
                            {isPending ? (
                              <span style={{ background: "rgba(245, 158, 11, 0.2)", color: "#fcd34d", padding: "2px 6px", borderRadius: "10px", fontSize: "0.65rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                <Clock size={10} /> Pending Verification
                              </span>
                            ) : (
                              <span style={{ background: "rgba(34, 197, 94, 0.2)", color: "#86efac", padding: "2px 6px", borderRadius: "10px", fontSize: "0.65rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                <CheckCircle2 size={10} /> Verified
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                            {emp.id} • {emp.sector} • Rep: {emp.rep}
                          </span>
                        </div>

                        <button
                          type="button"
                          data-testid={`quick-login-${emp.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickLogin(emp.id);
                          }}
                          style={{
                            padding: "0.4rem 0.75rem",
                            background: isSelected ? "#2563eb" : "rgba(255,255,255,0.08)",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem"
                          }}
                        >
                          Login <ArrowRight size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Login Form */}
              <div style={{ background: "rgba(15, 23, 42, 0.6)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "white" }}>
                    Authorised Access Sign In
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0 0 1.25rem 0" }}>
                    Selected: <strong>{mockStore.getEmployer(selectedEmployerId)?.name}</strong>
                  </p>

                  <form onSubmit={handleManualLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem" }}>
                        Organisation Unique Identifier
                      </label>
                      <input
                        type="text"
                        value={selectedEmployerId}
                        onChange={(e) => setSelectedEmployerId(e.target.value)}
                        style={{ width: "100%", padding: "0.6rem 0.75rem", background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "6px", color: "white", fontSize: "0.85rem" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem" }}>
                        Authorised Representative Email
                      </label>
                      <div style={{ position: "relative" }}>
                        <Mail size={16} color="#64748b" style={{ position: "absolute", left: "10px", top: "11px" }} />
                        <input
                          type="email"
                          placeholder="representative@organisation.com"
                          value={loginEmail || mockStore.getEmployer(selectedEmployerId)?.email || "hr.verification@tcs.com"}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          style={{ width: "100%", padding: "0.6rem 0.75rem 0.6rem 2.25rem", background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "6px", color: "white", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem" }}>
                        Enterprise Credentials / Password
                      </label>
                      <div style={{ position: "relative" }}>
                        <Lock size={16} color="#64748b" style={{ position: "absolute", left: "10px", top: "11px" }} />
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          style={{ width: "100%", padding: "0.6rem 0.75rem 0.6rem 2.25rem", background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "6px", color: "white", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        marginTop: "0.5rem"
                      }}
                    >
                      Authenticate & Access Organisation Portal
                    </button>
                  </form>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem", marginTop: "1.25rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", lineHeight: 1.4 }}>
                    Notice: This portal is strictly for employment outcome verification, ongoing status updates, wage confirmation, and skill feedback. Recruitment and candidate job applications are not hosted here.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: REGISTER */}
          {authMode === "register" && (
            <div style={{ padding: "2rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Organisation Onboarding (Section 3)
                </span>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0.25rem 0 0.4rem 0", color: "#f1f5f9" }}>
                  Register Organisation for Outcome Verification
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
                  Enter authoritative corporate registration details. Once submitted, your profile enters the <strong>"Pending"</strong> state until verified by a State Skilling Administrator.
                </p>
              </div>

              <form onSubmit={handleRegister} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    Legal Organisation Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Larsen & Toubro Infotech"
                    value={regForm.organisation_name}
                    onChange={(e) => setRegForm({ ...regForm, organisation_name: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem 0.75rem", background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "6px", color: "white", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    Registration Number / GSTIN *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 27AAACL1234F1Z8"
                    value={regForm.registration_gst}
                    onChange={(e) => setRegForm({ ...regForm, registration_gst: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem 0.75rem", background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "6px", color: "white", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    Industry Sector
                  </label>
                  <select
                    value={regForm.industry}
                    onChange={(e) => setRegForm({ ...regForm, industry: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem 0.75rem", background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "6px", color: "white", fontSize: "0.85rem" }}
                  >
                    <option value="Information Technology">Information Technology & Software</option>
                    <option value="Manufacturing & Automotive">Manufacturing & Automotive</option>
                    <option value="Healthcare & Clinical">Healthcare & Pharmaceuticals</option>
                    <option value="Green Energy & Utilities">Green Energy & Clean Tech</option>
                    <option value="Banking & Financial Services">Banking & Financial Services (BFSI)</option>
                    <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    Corporate Headquarter Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pune, Maharashtra"
                    value={regForm.location}
                    onChange={(e) => setRegForm({ ...regForm, location: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem 0.75rem", background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "6px", color: "white", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    Authorised Representative Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Khurana (VP Talent)"
                    value={regForm.representative}
                    onChange={(e) => setRegForm({ ...regForm, representative: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem 0.75rem", background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "6px", color: "white", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    Official Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. verifications@lti.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem 0.75rem", background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "6px", color: "white", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 20 6688 1234"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem 0.75rem", background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "6px", color: "white", fontSize: "0.85rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#cbd5e1", marginBottom: "0.35rem" }}>
                    HR / ATS Platform
                  </label>
                  <select
                    value={regForm.hr_system}
                    onChange={(e) => setRegForm({ ...regForm, hr_system: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem 0.75rem", background: "rgba(15, 23, 42, 0.8)", border: "1px solid #334155", borderRadius: "6px", color: "white", fontSize: "0.85rem" }}
                  >
                    <option value="Workday Enterprise HCM">Workday Enterprise HCM</option>
                    <option value="SAP SuccessFactors">SAP SuccessFactors</option>
                    <option value="Oracle Cloud HCM">Oracle Cloud HCM</option>
                    <option value="BambooHR">BambooHR</option>
                    <option value="Darwinbox HCM">Darwinbox HCM</option>
                    <option value="Custom Proprietary HRIS">Custom Proprietary HRIS</option>
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1", marginTop: "0.5rem" }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "0.85rem",
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      cursor: isSubmitting ? "default" : "pointer"
                    }}
                  >
                    {isSubmitting ? "Submitting Registration..." : "Submit Registration for Admin Attestation"}
                  </button>
                  <span style={{ display: "block", textAlign: "center", fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem" }}>
                    Verification status will be initially marked "Pending". Only State Skilling Admins can attest employer credentials.
                  </span>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Building2, ShieldCheck, CheckCircle2, Clock, XCircle, Mail, Phone, MapPin, FileText, UserCheck, Save, AlertCircle } from "lucide-react";
import EmployerNav from "./Employer/EmployerNav";
import { platformService, usePlatformStore } from "../services/platformService";
import { mockStore } from "../services/mockStore";

export default function EmployerProfile() {
  const store = usePlatformStore();
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";

  const [employer, setEmployer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    registration_gst: "",
    sector: "",
    location: "",
    representative: "",
    email: "",
    phone: "",
    hr_system: ""
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    try {
      const emp = await platformService.getEmployer(organizationId);
      setEmployer(emp);
      setFormData({
        name: emp.name || "",
        registration_gst: emp.registration_gst || "",
        sector: emp.sector || "Information Technology",
        location: emp.location || "Mumbai, Maharashtra",
        representative: emp.representative || "Rohit Sharma",
        email: emp.email || "hr.verification@tcs.com",
        phone: emp.phone || "+91 22 6778 9999",
        hr_system: emp.hr_system || "Workday Enterprise HCM"
      });
    } catch (err) {
      console.error("Failed to load employer profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [organizationId, store.last_updated]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError("");
    try {
      await platformService.updateEmployerProfile(organizationId, formData);
      localStorage.setItem("organizationName", formData.name);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      loadProfile();
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaveError("Failed to save profile changes: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !employer) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <EmployerNav />
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center", color: "#64748b" }}>
          Loading organization profile...
        </div>
      </div>
    );
  }

  const verificationStatus = employer.status || "Verified";

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <EmployerNav />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1.5rem 4rem 1.5rem" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <Building2 size={18} color="#2563eb" />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                ORGANISATION PROFILE & VERIFICATION RECORD
              </span>
            </div>
            <h1 style={{ fontSize: "1.95rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
              Organisation Profile
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
              Corporate identification, authorised representative contact, and state verification status.
            </p>
          </div>

          {/* Section 5: Read-Only Admin Verification Badge */}
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "0.3rem", fontWeight: 600 }}>
              State Verification Badge
            </span>
            {verificationStatus === "Verified" ? (
              <span style={{
                background: "#dcfce7",
                color: "#166534",
                border: "1px solid #86efac",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}>
                <CheckCircle2 size={16} /> Verified Organisation
              </span>
            ) : verificationStatus === "Pending" ? (
              <span style={{
                background: "#fef3c7",
                color: "#b45309",
                border: "1px solid #fde68a",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}>
                <Clock size={16} /> Verification Pending Admin Review
              </span>
            ) : (
              <span style={{
                background: "#fee2e2",
                color: "#b91c1c",
                border: "1px solid #fca5a5",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}>
                <XCircle size={16} /> Verification Rejected
              </span>
            )}
          </div>
        </div>

        {/* Feedback Alerts */}
        {saveSuccess && (
          <div style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", padding: "0.85rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <span>Organisation profile changes saved successfully!</span>
          </div>
        )}

        {saveError && (
          <div style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", padding: "0.85rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={18} color="#dc2626" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Section 3: Authoritative Verification Record Card */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 1.25rem 0", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={18} color="#2563eb" />
            Authoritative Employer Registry Data
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block" }}>Employer ID</span>
              <strong style={{ fontSize: "1.05rem", color: "#0f172a" }}>{employer.id}</strong>
            </div>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block" }}>Registration / GSTIN</span>
              <strong style={{ fontSize: "1.05rem", color: "#0f172a" }}>{employer.registration_gst || "27AAACT2727Q1ZB"}</strong>
            </div>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block" }}>Registration Submitted At</span>
              <strong style={{ fontSize: "1.05rem", color: "#0f172a" }}>{employer.registration_date || employer.submitted_at || "2023-01-15"}</strong>
            </div>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, display: "block" }}>Admin Attestation Date</span>
              <strong style={{ fontSize: "1.05rem", color: employer.verified_at ? "#16a34a" : "#b45309" }}>
                {employer.verified_at || "Pending Review"}
              </strong>
            </div>
          </div>

          <div style={{ background: "#f1f5f9", padding: "0.85rem 1rem", borderRadius: "8px", marginTop: "1.25rem", fontSize: "0.8rem", color: "#475569" }}>
            <strong>Governance Rule:</strong> The verification status badge is strictly controlled by State Skilling Administrators. Employers cannot unilaterally alter their attestation standing.
          </div>
        </div>

        {/* Profile Edit Form */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0 0 1.5rem 0" }}>
            Maintain Organisation Profile Information
          </h3>

          <form onSubmit={handleSave} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Organisation Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Industry Sector
              </label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
              >
                <option value="Information Technology">Information Technology & Software</option>
                <option value="Manufacturing & Automotive">Manufacturing & Automotive</option>
                <option value="Healthcare & Clinical">Healthcare & Clinical</option>
                <option value="Green Energy & Utilities">Green Energy & Utilities</option>
                <option value="Banking & Financial Services">Banking & Financial Services</option>
                <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Headquarters / Operating Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Primary HRIS / Enterprise System
              </label>
              <input
                type="text"
                value={formData.hr_system}
                onChange={(e) => setFormData({ ...formData, hr_system: e.target.value })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Authorised Representative Name *
              </label>
              <input
                type="text"
                required
                value={formData.representative}
                onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Official Verification Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  padding: "0.75rem 2rem",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: isSaving ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Profile Changes"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

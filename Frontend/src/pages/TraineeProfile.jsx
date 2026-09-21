import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Phone, Mail, Calendar, MapPin, Save, CheckCircle2, ShieldCheck, Briefcase } from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function TraineeProfile() {
  const navigate = useNavigate();
  const { traineeId: paramId } = useParams();
  const store = usePlatformStore();
  const effectiveId = paramId || localStorage.getItem("traineeId") || "TR-0001";

  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEditingAadhaar, setIsEditingAadhaar] = useState(false);

  // Form Fields (C2)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
    gender: "Male",
    district: "",
    address: "",
    aadhaar_number: "",
    aadhaar_hash: "",
    aadhaar_last4: "",
    aadhaar_linked: false
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getTraineeProfile(effectiveId);
      if (res.trainee) {
        setTrainee(res.trainee);
        setFormData({
          name: res.trainee.name || "",
          phone: res.trainee.phone || "",
          email: res.trainee.email || "",
          dob: res.trainee.dob || "",
          gender: res.trainee.gender || "Male",
          district: res.trainee.district || "",
          address: res.trainee.address || "",
          aadhaar_number: "",
          aadhaar_hash: res.trainee.aadhaar_hash || "",
          aadhaar_last4: res.trainee.aadhaar_last4 || "9012",
          aadhaar_linked: res.trainee.aadhaar_linked !== false && Boolean(res.trainee.aadhaar_hash || res.trainee.aadhaar_last4)
        });
      } else {
        throw new Error(`No trainee found for ID ${effectiveId}`);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [effectiveId, store.last_updated]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await platformService.updateTraineeProfile(effectiveId, formData);
      setSavedSuccess(true);
      setIsEditingAadhaar(false);
      setTimeout(() => setSavedSuccess(false), 4000);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <User size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            CANDIDATE DEMOGRAPHICS & PROFILE
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          Trainee Profile & Settings
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Manage your personal information, domicile district, and verified contact coordinates.
        </p>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={trainee}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d)}
        isEmptyDetails={`No profile found for ID: ${effectiveId}`}
      >
        {trainee && (
          <div>
            {savedSuccess && (
              <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "0.85rem 1.25rem", borderRadius: "8px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={18} />
                <strong>Profile updated and synchronized successfully!</strong>
              </div>
            )}

            {/* Profile Summary Card */}
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#eff6ff", color: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 800 }}>
                  {formData.name.charAt(0) || "T"}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a" }}>{formData.name}</h3>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    ID: <strong>{trainee.id}</strong> • Enrolled in: <strong>{trainee.programme_name}</strong>
                  </span>
                </div>
              </div>

              <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 }}>
                Consent: {trainee.consent?.status || "GIVEN"}
              </span>
            </div>

            {/* Editable Profile Form (C2) */}
            <form onSubmit={handleSave} style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "2rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Date of Birth (DOB)
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    required
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    Domicile District
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Nashik">Nashik</option>
                    <option value="Thane">Thane</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1.75rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Residential Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                />
              </div>

              {/* AADHAAR IDENTITY LINKING & MASTER-ID SECTION */}
              <div style={{ marginBottom: "2rem" }}>
                {formData.aadhaar_linked && !isEditingAadhaar ? (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1.1rem 1.25rem", borderRadius: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ padding: "0.45rem", borderRadius: "50%", background: "#dcfce7", color: "#15803d", display: "flex" }}>
                          <ShieldCheck size={22} />
                        </div>
                        <div>
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Master-ID Cryptographically Linked (SHA-256)
                          </span>
                          <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginTop: "0.1rem" }}>
                            Aadhaar linked: •••• •••• {formData.aadhaar_last4 || "9012"}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingAadhaar(true)}
                        style={{
                          background: "white",
                          border: "1px solid #cbd5e1",
                          padding: "0.45rem 0.9rem",
                          borderRadius: "6px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "#334155",
                          cursor: "pointer"
                        }}
                      >
                        Update Aadhaar
                      </button>
                    </div>
                    <p style={{ margin: "0.6rem 0 0 0", fontSize: "0.78rem", color: "#15803d", lineHeight: "1.45" }}>
                      ✓ Enables automated EPFO employment verification and links cross-programme skilling records. Stored strictly as a one-way SHA-256 hash — raw Aadhaar is never saved or exposed.
                    </p>
                  </div>
                ) : (
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "1.25rem", borderRadius: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      <ShieldCheck size={18} color="#2563eb" />
                      <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                        Aadhaar Number (for Employment Verification & Master-ID Linking)
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <input
                        type="text"
                        maxLength={14}
                        placeholder="XXXX XXXX XXXX"
                        value={formData.aadhaar_number}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
                          const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
                          setFormData({ ...formData, aadhaar_number: formatted });
                        }}
                        style={{
                          width: "100%",
                          padding: "0.65rem 0.85rem",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          letterSpacing: "1px",
                          background: "white"
                        }}
                      />
                      {isEditingAadhaar && (
                        <button
                          type="button"
                          onClick={() => setIsEditingAadhaar(false)}
                          style={{
                            padding: "0.65rem 1rem",
                            border: "1px solid #cbd5e1",
                            background: "white",
                            borderRadius: "6px",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "#475569",
                            cursor: "pointer",
                            whiteSpace: "nowrap"
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <p style={{ margin: "0.55rem 0 0 0", fontSize: "0.78rem", color: "#64748b", lineHeight: "1.45" }}>
                      🔒 <strong>Privacy Assurance:</strong> Used only to verify your employment status via EPFO and merge your records across PMKVY, state, or NGO programs. Stored as a secure one-way SHA-256 cryptographic hash — never displayed in full again.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "0.8rem 2rem",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <Save size={18} />
                  {saving ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
}

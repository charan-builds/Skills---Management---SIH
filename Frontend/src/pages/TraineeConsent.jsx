import { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Clock, Info, AlertTriangle, Lock } from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";

export default function TraineeConsent() {
  const store = usePlatformStore();
  const traineeId = localStorage.getItem("traineeId") || "TR-0001";
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await platformService.getTraineeProfile(traineeId);
      setTrainee(res.trainee);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [traineeId, store.last_updated]);

  const currentConsentStatus = trainee?.consent?.status || "GIVEN";
  const isAccepted = currentConsentStatus === "GIVEN" || currentConsentStatus === "Accepted";
  const consentDate = trainee?.consent?.date || "2023-01-10";

  const handleToggleConsent = async (newStatus) => {
    setSaving(true);
    try {
      await platformService.updateTraineeConsent(traineeId, newStatus);
      setToastMessage(`Consent preference updated to ${newStatus === "GIVEN" ? "Accepted" : "Declined"}.`);
      setTimeout(() => setToastMessage(""), 4000);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update consent.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "920px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <ShieldCheck size={20} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            PRIVACY, CITIZEN DATA RIGHTS & OUTCOME CONSENT (SECTIONS 6, 7, 42)
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          Privacy & Consent Management
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Transparent control over your personal skilling records, employer outcome verification, and periodic career follow-up participation.
        </p>
      </div>

      {toastMessage && (
        <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "1rem 1.25rem", borderRadius: "10px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <CheckCircle2 size={18} />
          <strong>{toastMessage}</strong>
        </div>
      )}

      <DataStateWrapper
        isLoading={loading}
        data={trainee}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d)}
        isEmptyDetails="No profile record found."
      >
        {/* Current Consent Status Badge Card */}
        <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", marginBottom: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Active Follow-Up Participation Status
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.4rem" }}>
                {isAccepted ? (
                  <span style={{ background: "#dcfce7", color: "#15803d", padding: "6px 14px", borderRadius: "20px", fontSize: "0.95rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 size={16} /> Follow-Up Consent Accepted
                  </span>
                ) : (
                  <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "6px 14px", borderRadius: "20px", fontSize: "0.95rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
                    <XCircle size={16} /> Follow-Up Participation Declined
                  </span>
                )}
                <span style={{ color: "#64748b", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={14} /> Recorded on: <strong>{consentDate}</strong>
                </span>
              </div>
            </div>

            <div>
              {isAccepted ? (
                <button
                  onClick={() => handleToggleConsent("DECLINED")}
                  disabled={saving}
                  style={{
                    padding: "0.65rem 1.25rem",
                    borderRadius: "8px",
                    border: "1px solid #f87171",
                    background: "#fff1f2",
                    color: "#b91c1c",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: saving ? "not-allowed" : "pointer"
                  }}
                >
                  {saving ? "Saving..." : "Revoke / Decline Follow-Up Consent"}
                </button>
              ) : (
                <button
                  onClick={() => handleToggleConsent("GIVEN")}
                  disabled={saving}
                  style={{
                    padding: "0.65rem 1.25rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#2563eb",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: saving ? "not-allowed" : "pointer"
                  }}
                >
                  {saving ? "Saving..." : "Accept & Authorize Follow-Ups"}
                </button>
              )}
            </div>
          </div>

          {!isAccepted && (
            <div style={{ marginTop: "1.25rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "1rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <AlertTriangle size={20} color="#b91c1c" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "0.85rem", color: "#991b1b" }}>
                <strong>Follow-Up Participation is Restricted:</strong> You have opted out of periodic outcome follow-ups. Milestone check-in surveys at 3M, 6M, and 12M will not prompt you or record your post-training telemetry until consent is reactivated. Your completed training credentials and profile data remain securely preserved.
              </div>
            </div>
          )}
        </div>

        {/* Clear Policy Disclosures */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <Info size={20} color="#2563eb" />
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.05rem", color: "#0f172a" }}>
              1. Why Follow-Up Data is Collected
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569", lineHeight: 1.6 }}>
              Public training programmes evaluate vocational outcomes to understand whether graduates transition into sustained employment, achieve fair wages, and benefit from the curriculum. Periodic follow-ups allow policy makers to fund programmes with proven real-world outcomes.
            </p>
          </div>

          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <Lock size={20} color="#16a34a" />
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.05rem", color: "#0f172a" }}>
              2. What Information is Used
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569", lineHeight: 1.6 }}>
              Only placement coordinates (employed, self-employed, apprentice, or seeking), corporate employer name, job role, wage bracket, and skill feedback are processed. Individual records are never sold, monetized, or shared with commercial marketers.
            </p>
          </div>

          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <ShieldCheck size={20} color="#9333ea" />
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.05rem", color: "#0f172a" }}>
              3. Right to Revoke Anytime
            </h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569", lineHeight: 1.6 }}>
              You may freely change your consent setting at any moment. When declined, no outcome surveys will be administered, and no telemetry will be collected in the background. Basic profile credentials and training certificates remain fully accessible to you.
            </p>
          </div>

        </div>

        {/* Detailed Data Rights Statement */}
        <div style={{ background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
          <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.95rem", color: "#0f172a" }}>
            Data Protection & Privacy Safeguards:
          </h4>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.85rem", color: "#475569", lineHeight: 1.7 }}>
            <li>Outcome analytics shared with Government departments are strictly aggregated and anonymized.</li>
            <li>Employer verification only validates whether you were employed, role title, and tenure.</li>
            <li>No recruitments, candidate profiling, or third-party ATS pipelines are linked to this platform.</li>
            <li>You can request a data copy or account archive at any time through state portal administration.</li>
          </ul>
        </div>
      </DataStateWrapper>
    </div>
  );
}

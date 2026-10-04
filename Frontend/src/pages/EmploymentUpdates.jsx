import { useState, useEffect } from "react";
import { Activity, CheckCircle, AlertCircle, Clock, ShieldCheck, UserCheck, Search } from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import { useLanguage } from "../context/LanguageContext";

export default function EmploymentUpdates() {
  const { t } = useLanguage();
  const store = usePlatformStore();
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(false);

  // Modal / Form state
  const [statusAction, setStatusAction] = useState("Currently Employed");
  const [wageConfirmation, setWageConfirmation] = useState("Confirmed");
  const [roleConfirmation, setRoleConfirmation] = useState("Confirmed");
  const [updatedSalary, setUpdatedSalary] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  const orgId = localStorage.getItem("organizationId") || "EMP-DEMO-001";

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getAllEmployerOutcomes(orgId);
      setOutcomes(res.outcomes || []);
      if (res.outcomes && res.outcomes.length > 0 && !selectedOutcome) {
        setSelectedOutcome(res.outcomes[0]);
      }
    } catch (err) {
      console.error("Failed to load employer outcomes", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId, store.last_updated]);

  useEffect(() => {
    if (selectedOutcome) {
      setUpdatedSalary(selectedOutcome.salary || "");
      setRemarks(selectedOutcome.employer_remarks || "");
    }
  }, [selectedOutcome]);

  const handleUpdate = async () => {
    if (!selectedOutcome) return;
    setSaving(true);
    try {
      const remarksText = `[Update: ${statusAction}] Wage: ${wageConfirmation} • Role: ${roleConfirmation} • ${remarks}`;
      await platformService.verifyEmployment(
        selectedOutcome.id,
        statusAction === "Resigned" || statusAction === "Terminated" ? "Rejected Claim" : "Confirmed",
        remarksText,
        {
          salary: wageConfirmation === "Confirmed" ? selectedOutcome.salary : Number(updatedSalary) || selectedOutcome.salary,
          job_role: selectedOutcome.job_role
        }
      );
      setActionSuccess(true);
      setTimeout(() => setActionSuccess(false), 3000);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Failed to record employment update.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "1350px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <Activity size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {t("employer_updates.badge", "EMPLOYMENT LIFECYCLE & RETENTION ATTESTATION")}
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          {t("employer_updates.title", "Employment Status & Wage Updates")}
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          {t("employer_updates.subtitle", "Confirm ongoing employment, update wage progression milestones, and verify apprentice contracts.")}
        </p>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={outcomes}
        onRetry={loadData}
        isDataAvailable={(d) => d && d.length > 0}
        isEmptyDetails={t("employer_updates.empty_trainees", "No active trainee records registered under this employer.")}
      >
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "1.5rem" }}>
          {/* Employee List */}
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a" }}>
                {t("employer_updates.select_employee", "Select Employee")} ({outcomes.length})
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {outcomes.map((o) => {
                const isSelected = selectedOutcome?.id === o.id;
                const isApprentice = o.employment_type === "Apprenticeship";
                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOutcome(o)}
                    style={{
                      padding: "1rem 1.25rem",
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      background: isSelected ? "#eff6ff" : "white"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <strong style={{ color: "#0f172a", fontSize: "0.95rem" }}>{o.trainee_name}</strong>
                      <span
                        style={{
                          background: isApprentice ? "#ede9fe" : "#dcfce7",
                          color: isApprentice ? "#6d28d9" : "#15803d",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          fontWeight: 700
                        }}
                      >
                        {isApprentice ? t("employer_updates.apprentice", "Apprentice") : t("employer_updates.employed", "Employed")}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {o.job_role} • {t("employer_updates.joined", "Joined")} {o.joining_date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lifecycle Action Panel */}
          {selectedOutcome && (
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.75rem" }}>
              {actionSuccess && (
                <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckCircle size={18} />
                  <span>{t("employer_updates.sync_success", "Employment & wage update recorded and synchronized with Admin analytics.")}</span>
                </div>
              )}

              <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.35rem", color: "#0f172a" }}>
                      {selectedOutcome.trainee_name}
                    </h2>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                      {t("employer_updates.trainee_id", "Trainee ID:")} {selectedOutcome.trainee_id} • {t("employer_updates.programme", "Programme:")} {selectedOutcome.programme_name}
                    </p>
                  </div>
                  <span style={{ background: "#f1f5f9", color: "#334155", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600 }}>
                    {t("employer_updates.verification_status", "Verification Status:")} {selectedOutcome.status}
                  </span>
                </div>
              </div>

              {/* Form Controls */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
                {/* B7: Employment Status */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    {t("employer_updates.current_status_label", "Current Employment Status")}
                  </label>
                  <select
                    value={statusAction}
                    onChange={(e) => setStatusAction(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  >
                    <option value="Currently Employed">{t("employer_updates.status_employed_active", "Currently Employed (Active)")}</option>
                    <option value="Resigned">{t("employer_updates.status_resigned", "Resigned / Voluntarily Left")}</option>
                    <option value="Terminated">{t("employer_updates.status_terminated", "Terminated / Involuntary")}</option>
                    <option value="Contract Completed">{t("employer_updates.status_contract_completed", "Contract / Apprenticeship Completed")}</option>
                  </select>
                </div>

                {/* B9: Role Confirmation */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    {t("employer_updates.role_confirmation_label", "Job Role Confirmation")}
                  </label>
                  <select
                    value={roleConfirmation}
                    onChange={(e) => setRoleConfirmation(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  >
                    <option value="Confirmed">{t("employer_updates.role_confirmed", "Confirmed:")} {selectedOutcome.job_role}</option>
                    <option value="Role Changed / Promoted">{t("employer_updates.role_changed_promoted", "Role Changed / Promoted")}</option>
                    <option value="Role Disputed">{t("employer_updates.role_disputed", "Role Disputed")}</option>
                  </select>
                </div>

                {/* B8: Wage Confirmation */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                    {t("employer_updates.wage_confirmation_label", "Wage Confirmation")}
                  </label>
                  <select
                    value={wageConfirmation}
                    onChange={(e) => setWageConfirmation(e.target.value)}
                    style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  >
                    <option value="Confirmed">{t("employer_updates.wage_confirmed_amount", "Confirmed")} (₹{selectedOutcome.salary?.toLocaleString() || "Not Disclosed"})</option>
                    <option value="Different">{t("employer_updates.wage_different", "Different Amount")}</option>
                    <option value="Cannot Disclose">{t("employer_updates.wage_cannot_disclose", "Cannot Disclose (Confidentiality)")}</option>
                  </select>
                </div>

                {/* Updated Salary if Different */}
                {wageConfirmation === "Different" && (
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                      {t("employer_updates.updated_salary_label", "Updated Monthly Compensation (₹)")}
                    </label>
                    <input
                      type="number"
                      value={updatedSalary}
                      onChange={(e) => setUpdatedSalary(e.target.value)}
                      placeholder="e.g. 26000"
                      style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                  </div>
                )}
              </div>

              {/* Remarks */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  {t("employer_updates.attestation_notes_label", "Employer Attestation Notes / Reason")}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder={t("employer_updates.attestation_notes_placeholder", "e.g. Performance appraisal raise approved; continuing full-time role.")}
                  style={{ width: "100%", padding: "0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                />
              </div>

              {/* Submit */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  style={{
                    padding: "0.75rem 1.75rem",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <ShieldCheck size={18} />
                  {saving ? t("employer_updates.btn_saving", "Saving Attestation...") : t("employer_updates.btn_confirm_save", "Confirm & Save Update")}
                </button>
              </div>
            </div>
          )}
        </div>
      </DataStateWrapper>
    </div>
  );
}

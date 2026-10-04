import { useState, useEffect } from "react";
import { BookOpen, Award, Building2, Calendar, CheckCircle2, Download, Eye, X, ShieldCheck, FileCheck } from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import { DataStateWrapper } from "../components/common/DataStateComponents";
import { useLanguage } from "../context/LanguageContext";

export default function TrainingHistory() {
  const { t } = useLanguage();
  const store = usePlatformStore();
  const traineeId = localStorage.getItem("traineeId") || "TR-0001";
  const [trainee, setTrainee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await platformService.getTraineeProfile(traineeId);
      setTrainee(res.trainee);
    } catch (err) {
      console.error("Failed to load training history", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [traineeId, store.last_updated]);

  // Real SVG Certificate Generator & Downloader (Section 9 & 10)
  const handleDownloadCertificate = () => {
    if (!trainee || !trainee.certified || !trainee.certificate_id) {
      alert("Certificate not available for this record.");
      return;
    }

    const certSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#b45309" />
        </linearGradient>
      </defs>
      <!-- Certificate Background -->
      <rect width="1000" height="700" fill="#ffffff" stroke="#1e3a8a" stroke-width="14" />
      <rect x="25" y="25" width="950" height="650" fill="none" stroke="#e2e8f0" stroke-width="2" />
      <rect x="35" y="35" width="930" height="630" fill="none" stroke="#f59e0b" stroke-width="3" />

      <!-- Watermark -->
      <text x="500" y="380" font-size="70" font-family="sans-serif" font-weight="900" fill="#f8fafc" text-anchor="middle" transform="rotate(-15 500 380)">SIMULATION DEMO</text>

      <!-- Header -->
      <text x="500" y="110" font-size="16" font-family="sans-serif" font-weight="700" fill="#2563eb" letter-spacing="4" text-anchor="middle">NATIONAL SKILLING OUTCOMES PLATFORM</text>
      <text x="500" y="160" font-size="36" font-family="Georgia, serif" font-weight="bold" fill="#0f172a" text-anchor="middle">CERTIFICATE OF COMPLETION</text>
      <text x="500" y="195" font-size="15" font-family="sans-serif" fill="#64748b" text-anchor="middle">THIS IS AN ACCREDITED SIMULATION CREDENTIAL DEMONSTRATING VOCATIONAL COMPETENCY</text>

      <line x1="350" y1="220" x2="650" y2="220" stroke="#f59e0b" stroke-width="2" />

      <!-- Trainee Name -->
      <text x="500" y="270" font-size="16" font-family="sans-serif" fill="#475569" text-anchor="middle">This is formally awarded to</text>
      <text x="500" y="330" font-size="40" font-family="Georgia, serif" font-weight="bold" fill="#1e3a8a" text-anchor="middle">${trainee.name}</text>
      <text x="500" y="360" font-size="14" font-family="sans-serif" fill="#64748b" text-anchor="middle">Candidate Identifier: ${trainee.id}</text>

      <!-- Description -->
      <text x="500" y="415" font-size="16" font-family="sans-serif" fill="#334155" text-anchor="middle">for successfully completing the rigorous NSQF curriculum in</text>
      <text x="500" y="455" font-size="26" font-family="sans-serif" font-weight="bold" fill="#0f172a" text-anchor="middle">${trainee.programme_name}</text>
      <text x="500" y="490" font-size="15" font-family="sans-serif" fill="#475569" text-anchor="middle">administered by accredited provider ${trainee.provider_name}</text>

      <!-- Details -->
      <text x="250" y="560" font-size="13" font-family="sans-serif" fill="#64748b">Completion Date: ${trainee.completion_date || "2023-04-20"}</text>
      <text x="250" y="585" font-size="13" font-family="sans-serif" fill="#64748b">Assessment Score: ${trainee.assessment_score || 85}% (Passed with Merit)</text>
      <text x="250" y="610" font-size="13" font-family="sans-serif" font-weight="bold" fill="#2563eb">Credential ID: ${trainee.certificate_id}</text>

      <!-- Seal & Signatures -->
      <circle cx="750" cy="580" r="45" fill="url(#goldGrad)" />
      <circle cx="750" cy="580" r="40" fill="none" stroke="#ffffff" stroke-width="2" />
      <text x="750" y="585" font-size="11" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">ACCREDITED</text>

      <!-- Simulation Notice -->
      <rect x="250" y="640" width="500" height="22" fill="#f1f5f9" rx="4" />
      <text x="500" y="655" font-size="11" font-family="sans-serif" fill="#64748b" text-anchor="middle">SYNTHETIC SIMULATION ARTIFACT — FOR EVALUATION & DEMO PURPOSES ONLY</text>
    </svg>`;

    const blob = new Blob([certSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Certificate_${trainee.certificate_id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isCertified = Boolean(trainee?.certified && trainee?.certificate_id);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
          <BookOpen size={18} color="#2563eb" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {t("training_history.badge", "VERIFIED ACADEMIC & VOCATIONAL CREDENTIALS")}
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
          {t("training_history.title", "Training History & Certification")}
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          {t("training_history.subtitle", "Authoritative records of enrolled courses, accredited assessment outcomes, and verifiable completion certificates.")}
        </p>
      </div>

      <DataStateWrapper
        isLoading={loading}
        error={error}
        data={trainee}
        onRetry={loadData}
        isDataAvailable={(d) => Boolean(d)}
        isEmptyDetails={t("training_history.empty_history", "No training history records available.")}
      >
        {trainee && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Primary Programme Record Card */}
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "1.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <span style={{
                    background: isCertified ? "#dcfce7" : "#fef3c7",
                    color: isCertified ? "#166534" : "#b45309",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "inline-block",
                    marginBottom: "0.5rem"
                  }}>
                    {isCertified ? t("training_history.status_certified", "✓ Training Completed & Certified") : t("training_history.status_in_progress", "Coursework In Progress")}
                  </span>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem 0" }}>
                    {trainee.programme_name}
                  </h2>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                    {t("training_history.programme_code", "Programme Code:")} {trainee.programme_id} • {t("training_history.cohort_label", "Cohort:")} {trainee.cohort}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {isCertified ? (
                    <>
                      <button
                        onClick={() => setPreviewOpen(true)}
                        style={{
                          padding: "0.6rem 1rem",
                          background: "#f1f5f9",
                          color: "#1e293b",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem"
                        }}
                      >
                        <Eye size={16} /> {t("training_history.btn_view_certificate", "View Certificate")}
                      </button>

                      <button
                        onClick={handleDownloadCertificate}
                        style={{
                          padding: "0.6rem 1.2rem",
                          background: "#2563eb",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem"
                        }}
                      >
                        <Download size={16} /> {t("training_history.btn_download_certificate", "Download Certificate (.svg)")}
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic", padding: "0.5rem 0" }}>
                      {t("training_history.cert_not_available", "Certificate not available")}
                    </span>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Building2 size={14} /> {t("training_history.training_provider", "Training Provider")}
                  </span>
                  <strong style={{ color: "#0f172a", fontSize: "0.95rem", display: "block", marginTop: "0.2rem" }}>
                    {trainee.provider_name}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Calendar size={14} /> {t("training_history.completion_date", "Completion Date")}
                  </span>
                  <strong style={{ color: "#0f172a", fontSize: "0.95rem", display: "block", marginTop: "0.2rem" }}>
                    {trainee.completion_date || "2023-04-20"}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Award size={14} /> {t("training_history.certificate_credential_id", "Certificate Credential ID")}
                  </span>
                  <strong style={{ color: isCertified ? "#2563eb" : "#94a3b8", fontSize: "0.95rem", display: "block", marginTop: "0.2rem" }}>
                    {isCertified ? trainee.certificate_id : t("training_history.not_issued", "Not issued")}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <CheckCircle2 size={14} /> {t("training_history.capstone_score", "Capstone Score")}
                  </span>
                  <strong style={{ color: "#15803d", fontSize: "0.95rem", display: "block", marginTop: "0.2rem" }}>
                    {trainee.assessment_score || 88}% {t("training_history.merit_badge", "(Merit)")}
                  </strong>
                </div>
              </div>

              {/* Skills Mastered */}
              <div>
                <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.95rem", color: "#0f172a" }}>
                  {t("training_history.verified_competencies_title", "Verified Competencies & Modules Completed:")}
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {(trainee.skills || []).map((skill) => (
                    <span
                      key={skill}
                      style={{
                        background: "#eff6ff",
                        color: "#1e40af",
                        border: "1px solid #bfdbfe",
                        padding: "0.35rem 0.75rem",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem"
                      }}
                    >
                      <CheckCircle2 size={13} color="#2563eb" /> {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Read-only verification notice */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem", fontSize: "0.8rem", color: "#64748b" }}>
              <strong>Digital Attestation Notice:</strong> {t("training_history.digital_attestation_notice", "These records are cryptographically attested by the affiliated state Sector Skill Council and cannot be edited directly. To report corrections, contact your training center administrator.")}
            </div>
          </div>
        )}

        {/* CERTIFICATE PREVIEW MODAL (Section 10) */}
        {previewOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120, padding: "1.5rem" }}>
            <div style={{ background: "white", borderRadius: "16px", maxWidth: "800px", width: "100%", padding: "2.5rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", position: "relative", border: "8px solid #1e3a8a" }}>
              <button
                aria-label="Close Preview"
                onClick={() => setPreviewOpen(false)}
                style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={24} />
              </button>

              <div style={{ textAlign: "center", borderBottom: "2px solid #f59e0b", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#2563eb", letterSpacing: "2px", textTransform: "uppercase" }}>
                  {t("training_history.cert_modal_platform", "NATIONAL SKILLING OUTCOMES PLATFORM")}
                </span>
                <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", margin: "0.5rem 0 0.2rem 0", fontFamily: "Georgia, serif" }}>
                  {t("training_history.cert_modal_title", "Certificate of Completion")}
                </h2>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", letterSpacing: "1px" }}>
                  {t("training_history.cert_modal_simulation_subtitle", "ACCREDITED SIMULATION CREDENTIAL (DEMO ARTIFACT)")}
                </div>
              </div>

              <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <p style={{ margin: "0 0 0.5rem 0", color: "#64748b", fontSize: "0.95rem" }}>{t("training_history.cert_modal_certify_that", "This is to certify that")}</p>
                <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "2rem", fontWeight: 800, color: "#1e3a8a", fontFamily: "Georgia, serif" }}>
                  {trainee?.name}
                </h3>
                <p style={{ margin: "0 0 0.5rem 0", color: "#475569", fontSize: "0.95rem" }}>
                  {t("training_history.cert_modal_demonstrated", "has demonstrated verified competency in the accredited programme")}
                </p>
                <strong style={{ fontSize: "1.25rem", color: "#0f172a", display: "block", margin: "0.25rem 0" }}>
                  {trainee?.programme_name}
                </strong>
                <p style={{ margin: "0.5rem 0 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                  {t("training_history.cert_modal_administered", "Administered by")} {trainee?.provider_name}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "#64748b" }}>{t("training_history.cert_modal_date", "Date of Completion:")}</span>
                  <strong style={{ display: "block", color: "#0f172a" }}>{trainee?.completion_date || "2023-04-20"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>{t("training_history.cert_modal_score", "Assessment Score:")}</span>
                  <strong style={{ display: "block", color: "#15803d" }}>{trainee?.assessment_score || 88}% {t("training_history.merit_badge", "(Merit)")}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>{t("training_history.cert_modal_credential_id", "Credential ID:")}</span>
                  <strong style={{ display: "block", color: "#2563eb" }}>{trainee?.certificate_id}</strong>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  {t("training_history.cert_modal_disclaimer", "Simulation Data: Not a statutory government certificate.")}
                </span>
                <button
                  onClick={handleDownloadCertificate}
                  style={{
                    padding: "0.65rem 1.25rem",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem"
                  }}
                >
                  <Download size={16} /> {t("training_history.cert_modal_btn_download", "Download This Certificate (.svg)")}
                </button>
              </div>
            </div>
          </div>
        )}
      </DataStateWrapper>
    </div>
  );
}

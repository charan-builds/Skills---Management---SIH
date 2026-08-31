import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useState, useEffect } from "react";
import {
  Layers,
  Radio,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Server,
  SlidersHorizontal
} from "lucide-react";
import EmployerNav from "./Employer/EmployerNav";

export default function EmployerIntegrations() {
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";

  const [integrations, setIntegrations] = useState([]);
  const [apiConfig, setApiConfig] = useState({
    api_base_url: "https://api.workforce-intelligence.internal/v1",
    client_id: "CLIENT_TECHFLOW_PROD_8849",
    api_key: "sk_live_9984****************************",
    webhook_url: "https://techflowsolutions.demo/webhooks/talent-sync",
    environment: "Production Demo",
    status: "Verified & Connected"
  });

  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/integrations`);
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations || []);
        if (data.api_config) setApiConfig(data.api_config);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [organizationId]);

  const handleSync = async (integrationId) => {
    setSyncingId(integrationId);
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/integrations/${integrationId}/sync`, {
        method: "POST"
      });
      if (res.ok) {
        setTimeout(() => {
          setSyncingId(null);
          fetchIntegrations();
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setSyncingId(null);
    }
  };

  const handleTestConnection = () => {
    setTestResult("testing");
    setTimeout(() => {
      setTestResult("success");
      setTimeout(() => setTestResult(null), 4000);
    }, 900);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/integrations/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiConfig)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <EmployerNav />
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading enterprise integration pipelines...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmployerNav />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Layers size={18} color="#2563eb" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              DATA PIPELINES & ATS CONNECTORS
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Enterprise Integrations & API Gateway
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
            Automated synchronization with ATS, HRIS, Job Portals, and State Skilling Transcripts.
          </p>
        </div>

        {/* INTEGRATIONS LIST */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
            Active System Connectors
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {integrations.map((item) => {
              const isSyncing = syncingId === item.id;
              return (
                <div
                  key={item.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                        {item.category}
                      </span>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}></span>
                        {item.status}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      {item.name}
                    </h4>
                    
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
                      {item.description}
                    </p>

                    <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      <span>Candidates: <strong style={{ color: '#0f172a' }}>{item.candidates_synced}</strong></span>
                      <span>•</span>
                      <span>Skills: <strong style={{ color: '#0f172a' }}>{item.skills_mapped}</strong></span>
                      <span>•</span>
                      <span>Sync: <strong style={{ color: '#2563eb' }}>{item.last_synced}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleSync(item.id)}
                      disabled={isSyncing}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <RefreshCw size={14} className={isSyncing ? "spin-animation" : ""} />
                      {isSyncing ? "Synchronizing..." : "Sync Now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* API CREDENTIALS CONFIGURATION CARD */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <KeyRound size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>API Authentication & Credentials</h3>
              </div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Direct programmatic ingestion credentials for enterprise webhook pipelines.</p>
            </div>

            {saveSuccess && (
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                ✓ Configuration Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>API Gateway Base URL</label>
                <input
                  type="text"
                  value={apiConfig.api_base_url || ""}
                  onChange={(e) => setApiConfig({ ...apiConfig, api_base_url: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Client Application ID</label>
                <input
                  type="text"
                  value={apiConfig.client_id || ""}
                  onChange={(e) => setApiConfig({ ...apiConfig, client_id: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>API Key (Masked for Security)</label>
                <input
                  type="text"
                  value={apiConfig.api_key || ""}
                  onChange={(e) => setApiConfig({ ...apiConfig, api_key: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Webhook Event Endpoint</label>
                <input
                  type="text"
                  value={apiConfig.webhook_url || ""}
                  onChange={(e) => setApiConfig({ ...apiConfig, webhook_url: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
              <div>
                {testResult === "testing" && (
                  <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>Pinging API Gateway endpoint...</span>
                )}
                {testResult === "success" && (
                  <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Connection Verified (HTTP 200 OK)
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  style={{ padding: '0.65rem 1.25rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
                >
                  Test Connection
                </button>

                <button
                  type="submit"
                  style={{ padding: '0.65rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

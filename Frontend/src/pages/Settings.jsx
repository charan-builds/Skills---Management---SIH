import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Database,
  ShieldCheck,
  CheckCircle2,
  Save,
  Server,
  Sparkles
} from "lucide-react";

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "Dr. K. V. Raman",
    title: "Principal Director of Skilling Intelligence",
    department: "State Directorate of Technical Education & Skilling",
    email: "director.skilling@state.gov.in",
    phone: "+91 40 2345 6789",
    role: "State Executive Administrator",
    node_id: "NODE-TELANGANA-HQ-01",
    auto_alert: true,
    email_digest: "Weekly Executive Digest",
    audit_mode: "Strict 3-Way Verification"
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="dashboard" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <SettingsIcon size={18} color="#2563eb" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ADMINISTRATION & SYSTEM PREFERENCES
            </span>
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Admin Profile & Governance Settings
          </h1>
          <p className="page-description" style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Manage directorate profile credentials, system notification thresholds, and data governance policies.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          
          {/* Left Column: Admin Profile */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <User size={18} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Directorate Profile Information</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Administrator Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Official Title</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Government Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Department / Mission</label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>Contact Phone</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>State Node Identifier</label>
                <input
                  type="text"
                  value={profile.node_id}
                  disabled
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#f8fafc', color: '#64748b' }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Alerts & Governance Preferences */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <Bell size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Intelligence Alerts</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={profile.auto_alert}
                    onChange={(e) => setProfile({ ...profile, auto_alert: e.target.checked })}
                  />
                  <span>Automated alerts on skill demand surge ({">"}30%)</span>
                </label>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Executive Digest Frequency</label>
                  <select
                    value={profile.email_digest}
                    onChange={(e) => setProfile({ ...profile, email_digest: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="Daily Executive Digest">Daily Executive Digest</option>
                    <option value="Weekly Executive Digest">Weekly Executive Digest</option>
                    <option value="Monthly Policy Brief">Monthly Policy Brief</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                <Server size={18} color="#16a34a" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Data Nodes Status</h3>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>State Skilling Lakehouse:</span>
                  <strong style={{ color: '#16a34a' }}>● Synchronized (100%)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Employer Gateway Ingestion:</span>
                  <strong style={{ color: '#16a34a' }}>● Online (28 APIs)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>AI Matching Core:</span>
                  <strong style={{ color: '#2563eb' }}>● Operational (v2.4)</strong>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Save Bar */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {savedSuccess && (
              <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} /> Directorate profile and governance configuration saved successfully!
              </span>
            )}
          </div>

          <button
            type="submit"
            style={{
              padding: '0.65rem 1.75rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Save size={16} /> Save Admin Settings
          </button>
        </div>

      </form>

    </div>
  );
}

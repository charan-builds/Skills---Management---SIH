import { API_BASE } from '../utils/config';
import { fetchAuth } from '../utils/authFetch';
import { useState, useEffect } from "react";
import {
  Building,
  Save,
  X,
  Plus
} from "lucide-react";
import EmployerNav from "./Employer/EmployerNav";

export default function EmployerProfile() {
  const organizationId = localStorage.getItem("organizationId") || "EMP-DEMO-001";
  
  const [profile, setProfile] = useState({
    organization_id: "EMP-DEMO-001",
    name: "TechFlow Solutions",
    industry: "Information Technology & Cybersecurity",
    company_size: "250–500 Employees",
    location: "Hyderabad, Telangana",
    website: "https://techflowsolutions.demo",
    contact_person: "Vikram Malhotra",
    contact_email: "recruitment@techflowsolutions.demo",
    contact_phone: "+91 40 4890 1200",
    hiring_preferences: {
      employment_types: ["Full-time", "Apprenticeship"],
      preferred_locations: ["Hyderabad", "Warangal", "Nalgonda"],
      preferred_skills: ["Python", "Machine Learning", "Cybersecurity", "SQL", "Power BI", "Linux"],
      salary_budget_range: "₹4.5–7.5 LPA",
      work_mode: "Hybrid / On-site"
    }
  });

  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [organizationId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchAuth(`${API_BASE}/api/employers/${organizationId}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setSaveSuccess(true);
        localStorage.setItem("organizationName", profile.name);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const current = profile.hiring_preferences?.preferred_skills || [];
    if (!current.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        hiring_preferences: {
          ...profile.hiring_preferences,
          preferred_skills: [...current, newSkill.trim()]
        }
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillName) => {
    const current = profile.hiring_preferences?.preferred_skills || [];
    setProfile({
      ...profile,
      hiring_preferences: {
        ...profile.hiring_preferences,
        preferred_skills: current.filter(s => s !== skillName)
      }
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <EmployerNav />
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading organization profile...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <EmployerNav />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
        
        {/* Header & Save Notification */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Building size={18} color="#2563eb" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                ORGANIZATION SETTINGS
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
              Organization Profile & Hiring Criteria
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
              Manage corporate details, recruiting contacts, and AI candidate matching preferences.
            </p>
          </div>

          {saveSuccess && (
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.65rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 2px 6px rgba(22,163,74,0.15)' }}>
              ✓ Profile saved successfully!
            </div>
          )}
        </div>

        <form onSubmit={handleSave}>
          
          {/* 1. ORGANIZATION DETAILS */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              Company Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Organization Name</label>
                <input
                  type="text"
                  value={profile.name || ""}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Organization Identifier (ID)</label>
                <input
                  type="text"
                  disabled
                  value={profile.organization_id || "EMP-DEMO-001"}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Industry Domain</label>
                <input
                  type="text"
                  value={profile.industry || ""}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Company Headcount</label>
                <select
                  value={profile.company_size || "250–500 Employees"}
                  onChange={(e) => setProfile({ ...profile, company_size: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="50–250 Employees">50–250 Employees</option>
                  <option value="250–500 Employees">250–500 Employees</option>
                  <option value="500–1000 Employees">500–1000 Employees</option>
                  <option value="1000+ Employees">1000+ Enterprise</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Headquarters Location</label>
                <input
                  type="text"
                  value={profile.location || ""}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Corporate Website</label>
                <input
                  type="text"
                  value={profile.website || ""}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>

          {/* 2. RECRUITMENT CONTACT */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              Primary Hiring Coordinator
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Contact Person</label>
                <input
                  type="text"
                  value={profile.contact_person || ""}
                  onChange={(e) => setProfile({ ...profile, contact_person: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Official Email</label>
                <input
                  type="email"
                  value={profile.contact_email || ""}
                  onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Direct Phone</label>
                <input
                  type="text"
                  value={profile.contact_phone || ""}
                  onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          </div>

          {/* 3. HIRING PREFERENCES & TARGET SKILLS */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              Workforce Hiring Preferences & AI Match Filters
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                Priority Skills for Automated AI Candidate Matching
              </label>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {profile.hiring_preferences?.preferred_skills?.map((skill, idx) => (
                  <span key={idx} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', padding: 0 }}>
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add target skill (e.g. Docker, SIEM)..."
                  style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  style={{ padding: '0.6rem 1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Plus size={15} /> Add
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Default Salary Budget Range</label>
                <input
                  type="text"
                  value={profile.hiring_preferences?.salary_budget_range || "₹4.5–7.5 LPA"}
                  onChange={(e) => setProfile({ ...profile, hiring_preferences: { ...profile.hiring_preferences, salary_budget_range: e.target.value } })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Preferred Work Mode</label>
                <select
                  value={profile.hiring_preferences?.work_mode || "Hybrid / On-site"}
                  onChange={(e) => setProfile({ ...profile, hiring_preferences: { ...profile.hiring_preferences, work_mode: e.target.value } })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="Hybrid / On-site">Hybrid / On-site</option>
                  <option value="Remote">Remote Only</option>
                  <option value="On-site Only">On-site Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '1rem', paddingBottom: '3rem' }}>
            <button
              type="submit"
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.85rem 2.25rem',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(37,99,235,0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Save size={18} /> Save Organization Profile
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

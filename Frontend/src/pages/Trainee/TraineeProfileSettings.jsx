import { useState, useEffect } from "react";
import { API_BASE } from '../../utils/config';
import { fetchAuth } from '../../utils/authFetch';
import {
  User,
  GraduationCap,
  BriefcaseBusiness,
  Award,
  Plus,
  Trash2,
  Check,
  X,
  FileText,
  Upload,
  Sparkles,
  Save
} from "lucide-react";
import { useParams } from "react-router-dom";

export default function TraineeProfileSettings({ onProfileUpdated }) {
  const { traineeId: paramTraineeId } = useParams();
  const traineeId = paramTraineeId || localStorage.getItem("traineeId") || "T102";

  const [loading, setLoading] = useState(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const [profile, setProfile] = useState({
    personal_info: {
      name: "Priya Gupta",
      email: "priya.gupta@example.com",
      phone: "+91 98765 43210",
      location: "Hyderabad, Telangana",
      career_goal: "Cybersecurity Analyst",
      target_role: "Cybersecurity Analyst",
      current_role: "Cybersecurity Specialist (Trainee)",
      work_mode: "Hybrid / Remote",
      expected_salary: "₹5.5–7.5 LPA",
      resume_name: "Priya_Gupta_Cybersecurity_Resume.pdf"
    },
    education: [],
    skills: [],
    experience: [],
    certifications: [],
    career_preferences: {
      target_roles: [],
      preferred_locations: [],
      expected_salary: "₹5.5–7.5 LPA",
      employment_preference: "Full-time",
      work_mode: "Hybrid / Remote"
    }
  });

  // Local helper states for adding new items
  const [newSkillInput, setNewSkillInput] = useState("");
  const [showAddEdu, setShowAddEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ degree: "", specialization: "", college: "", graduation_year: "" });
  const [showAddExp, setShowAddExp] = useState(false);
  const [newExp, setNewExp] = useState({ role: "", company: "", period: "", responsibilities: "" });
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCert, setNewCert] = useState({ name: "", issuer: "", date: "", credential_id: "", status: "Verified" });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          personal_info: data.personal_info || {},
          education: data.education || [],
          skills: data.skills || [],
          experience: data.experience || [],
          certifications: data.certifications || [],
          career_preferences: data.career_preferences || {}
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [traineeId]);

  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setSaveSuccessMsg("✓ Profile & preferences saved successfully!");
        setTimeout(() => setSaveSuccessMsg(""), 4000);
        if (onProfileUpdated) onProfileUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Skill Management
  const handleAddSkill = async (e) => {
    e.preventDefault();
    const skillTrimmed = newSkillInput.trim();
    if (!skillTrimmed) return;
    
    const existing = profile.skills.map(s => (typeof s === 'string' ? s.toLowerCase() : s.name.toLowerCase()));
    if (!existing.includes(skillTrimmed.toLowerCase())) {
      const updatedSkills = [...profile.skills, { name: skillTrimmed, level: 85, category: "Technical", primary: false }];
      setProfile({ ...profile, skills: updatedSkills });
      setNewSkillInput("");

      try {
        await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/skills/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill: skillTrimmed })
        });
        if (onProfileUpdated) onProfileUpdated();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRemoveSkill = async (skillName) => {
    const updatedSkills = profile.skills.filter(s => (typeof s === 'string' ? s : s.name) !== skillName);
    setProfile({ ...profile, skills: updatedSkills });

    try {
      await fetchAuth(`${API_BASE}/api/trainee-portal/${traineeId}/skills/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: skillName })
      });
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  // Education Management
  const handleAddEducation = () => {
    if (!newEdu.degree || !newEdu.college) return;
    const item = { ...newEdu, id: `edu_${Date.now()}` };
    setProfile({ ...profile, education: [...profile.education, item] });
    setNewEdu({ degree: "", specialization: "", college: "", graduation_year: "" });
    setShowAddEdu(false);
  };

  const handleRemoveEducation = (id) => {
    setProfile({ ...profile, education: profile.education.filter(e => e.id !== id) });
  };

  // Experience Management
  const handleAddExperience = () => {
    if (!newExp.role || !newExp.company) return;
    const item = { ...newExp, id: `exp_${Date.now()}` };
    setProfile({ ...profile, experience: [...profile.experience, item] });
    setNewExp({ role: "", company: "", period: "", responsibilities: "" });
    setShowAddExp(false);
  };

  const handleRemoveExperience = (id) => {
    setProfile({ ...profile, experience: profile.experience.filter(e => e.id !== id) });
  };

  // Certification Management
  const handleAddCertification = () => {
    if (!newCert.name || !newCert.issuer) return;
    const item = { ...newCert, id: `cert_${Date.now()}` };
    setProfile({ ...profile, certifications: [...profile.certifications, item] });
    setNewCert({ name: "", issuer: "", date: "", credential_id: "", status: "Verified" });
    setShowAddCert(false);
  };

  const handleRemoveCertification = (id) => {
    setProfile({ ...profile, certifications: profile.certifications.filter(c => c.id !== id) });
  };

  // Calculate Completeness
  const checklist = [
    { item: "Personal Info", completed: Boolean(profile.personal_info.name && profile.personal_info.email) },
    { item: "Education Qualifications", completed: profile.education.length > 0 },
    { item: "Skills (3+)", completed: profile.skills.length >= 3 },
    { item: "Verified Certifications", completed: profile.certifications.length > 0 },
    { item: "Experience / Internships", completed: profile.experience.length > 0 }
  ];
  const completedCount = checklist.filter(c => c.completed).length;
  const completeness = Math.round((completedCount / checklist.length) * 100);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading Profile...</div>;
  }

  return (
    <div style={{ maxWidth: '920px' }}>
      
      {/* Page Title & Save Alert */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Sparkles size={18} color="#2563eb" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Trainee Profile & Career Settings</h2>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
            Update your qualifications, skills, and preferences to adapt AI job recommendations in real-time.
          </p>
        </div>

        {saveSuccessMsg && (
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.6rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 2px 6px rgba(22,163,74,0.15)' }}>
            {saveSuccessMsg}
          </div>
        )}
      </div>

      {/* PROFILE COMPLETENESS CARD */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem 1.75rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Profile Completeness ({completeness}%)</h3>
          <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>Optimal profile quality for enterprise discovery</span>
        </div>
        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
          <div style={{ width: `${completeness}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s ease' }}></div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem' }}>
          {checklist.map((item, idx) => (
            <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: item.completed ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
              {item.completed ? <Check size={16} color="#16a34a" /> : <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #cbd5e1' }} />} {item.item}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSaveAll}>
        
        {/* 1. PERSONAL INFORMATION */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            Personal Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Full Name</label>
              <input
                type="text"
                value={profile.personal_info.name || ""}
                onChange={(e) => setProfile({ ...profile, personal_info: { ...profile.personal_info, name: e.target.value } })}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                placeholder="e.g. Priya Gupta"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Email Address</label>
              <input
                type="email"
                value={profile.personal_info.email || ""}
                onChange={(e) => setProfile({ ...profile, personal_info: { ...profile.personal_info, email: e.target.value } })}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Phone Number</label>
              <input
                type="text"
                value={profile.personal_info.phone || ""}
                onChange={(e) => setProfile({ ...profile, personal_info: { ...profile.personal_info, phone: e.target.value } })}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Location (City, State)</label>
              <input
                type="text"
                value={profile.personal_info.location || ""}
                onChange={(e) => setProfile({ ...profile, personal_info: { ...profile.personal_info, location: e.target.value } })}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>
          </div>
        </div>

        {/* 2. CAREER GOALS & PREFERENCES */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            Career Goals & Preferences
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Primary Target Role</label>
              <input
                type="text"
                value={profile.personal_info.target_role || profile.personal_info.career_goal || ""}
                onChange={(e) => setProfile({ ...profile, personal_info: { ...profile.personal_info, target_role: e.target.value, career_goal: e.target.value } })}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                placeholder="e.g. Cybersecurity Analyst"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Expected Salary Range</label>
              <input
                type="text"
                value={profile.career_preferences.expected_salary || ""}
                onChange={(e) => setProfile({ ...profile, career_preferences: { ...profile.career_preferences, expected_salary: e.target.value } })}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                placeholder="e.g. ₹5.5–7.5 LPA"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Work Mode Preference</label>
              <select
                value={profile.career_preferences.work_mode || "Hybrid / Remote"}
                onChange={(e) => setProfile({ ...profile, career_preferences: { ...profile.career_preferences, work_mode: e.target.value } })}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              >
                <option value="Hybrid / Remote">Hybrid / Remote</option>
                <option value="Remote">Remote Only</option>
                <option value="On-site">On-site Only</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Employment Type</label>
              <select
                value={profile.career_preferences.employment_preference || "Full-time"}
                onChange={(e) => setProfile({ ...profile, career_preferences: { ...profile.career_preferences, employment_preference: e.target.value } })}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              >
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract / Apprenticeship</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. SKILLS & COMPETENCIES (Interactive Add & Remove) */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            Skills & Competencies
          </h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {profile.skills.map((skillItem, idx) => {
              const skillName = typeof skillItem === 'string' ? skillItem : skillItem.name;
              return (
                <span key={idx} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.45rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {skillName}
                  <button type="button" onClick={() => handleRemoveSkill(skillName)} style={{ background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                    <X size={14} />
                  </button>
                </span>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '450px' }}>
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="Enter skill (e.g. SIEM, Cloud Security, Python)..."
              style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '0.65rem 1.15rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={16} /> Add Skill
            </button>
          </div>
        </div>

        {/* 4. EDUCATION SECTION */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Education Qualifications</h3>
            <button
              type="button"
              onClick={() => setShowAddEdu(!showAddEdu)}
              style={{ background: 'transparent', border: '1px solid #2563eb', color: '#2563eb', borderRadius: '6px', padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={14} /> Add Education
            </button>
          </div>

          {profile.education.map((edu, idx) => (
            <div key={idx} style={{ padding: '1.15rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{edu.degree} in {edu.specialization || "Computer Science"}</strong>
                <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#475569' }}>{edu.college}</p>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{edu.graduation_year}</span>
              </div>
              <button type="button" onClick={() => handleRemoveEducation(edu.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {showAddEdu && (
            <div style={{ background: '#f1f5f9', padding: '1.25rem', borderRadius: '8px', border: '1px dashed #cbd5e1', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#0f172a' }}>New Qualification</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <input type="text" placeholder="Degree (e.g. M.Tech)" value={newEdu.degree} onChange={e=>setNewEdu({...newEdu, degree: e.target.value})} style={{ padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                <input type="text" placeholder="Specialization (e.g. Cybersecurity)" value={newEdu.specialization} onChange={e=>setNewEdu({...newEdu, specialization: e.target.value})} style={{ padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                <input type="text" placeholder="College / University" value={newEdu.college} onChange={e=>setNewEdu({...newEdu, college: e.target.value})} style={{ padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                <input type="text" placeholder="Year (e.g. 2025-2027)" value={newEdu.graduation_year} onChange={e=>setNewEdu({...newEdu, graduation_year: e.target.value})} style={{ padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={handleAddEducation} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', padding: '0.45rem 0.95rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Save Qualification</button>
                <button type="button" onClick={()=>setShowAddEdu(false)} style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.45rem 0.95rem', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* 5. EXPERIENCE SECTION */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Internships & Experience</h3>
            <button
              type="button"
              onClick={() => setShowAddExp(!showAddExp)}
              style={{ background: 'transparent', border: '1px solid #2563eb', color: '#2563eb', borderRadius: '6px', padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={14} /> Add Experience
            </button>
          </div>

          {profile.experience.map((exp, idx) => (
            <div key={idx} style={{ padding: '1.15rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{exp.role} at {exp.company}</strong>
                <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#64748b' }}>{exp.period}</p>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#334155' }}>{exp.responsibilities}</p>
              </div>
              <button type="button" onClick={() => handleRemoveExperience(exp.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {showAddExp && (
            <div style={{ background: '#f1f5f9', padding: '1.25rem', borderRadius: '8px', border: '1px dashed #cbd5e1', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#0f172a' }}>New Experience</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <input type="text" placeholder="Role (e.g. SOC Analyst Intern)" value={newExp.role} onChange={e=>setNewExp({...newExp, role: e.target.value})} style={{ padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                <input type="text" placeholder="Company (e.g. CyberDefense Ltd)" value={newExp.company} onChange={e=>setNewExp({...newExp, company: e.target.value})} style={{ padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
              </div>
              <input type="text" placeholder="Period (e.g. Jan 2025 – Present)" value={newExp.period} onChange={e=>setNewExp({...newExp, period: e.target.value})} style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '0.75rem' }} />
              <textarea placeholder="Key responsibilities & accomplishments..." value={newExp.responsibilities} onChange={e=>setNewExp({...newExp, responsibilities: e.target.value})} style={{ width: '100%', padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', marginBottom: '1rem', height: '65px' }} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={handleAddExperience} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', padding: '0.45rem 0.95rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Save Experience</button>
                <button type="button" onClick={()=>setShowAddExp(false)} style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.45rem 0.95rem', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* 6. CERTIFICATIONS SECTION */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Verified Certifications</h3>
            <button
              type="button"
              onClick={() => setShowAddCert(!showAddCert)}
              style={{ background: 'transparent', border: '1px solid #2563eb', color: '#2563eb', borderRadius: '6px', padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={14} /> Add Certification
            </button>
          </div>

          {profile.certifications.map((cert, idx) => (
            <div key={idx} style={{ padding: '1.15rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{cert.name}</strong>
                <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#475569' }}>{cert.issuer} • Completed: {cert.date}</p>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Verified • ID: {cert.credential_id || "VERIFIED-2025"}</span>
              </div>
              <button type="button" onClick={() => handleRemoveCertification(cert.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {showAddCert && (
            <div style={{ background: '#f1f5f9', padding: '1.25rem', borderRadius: '8px', border: '1px dashed #cbd5e1', marginTop: '1rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#0f172a' }}>New Certification</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <input type="text" placeholder="Certification Name" value={newCert.name} onChange={e=>setNewCert({...newCert, name: e.target.value})} style={{ padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                <input type="text" placeholder="Issuing Body / Provider" value={newCert.issuer} onChange={e=>setNewCert({...newCert, issuer: e.target.value})} style={{ padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                <input type="text" placeholder="Completion Date (e.g. Feb 2025)" value={newCert.date} onChange={e=>setNewCert({...newCert, date: e.target.value})} style={{ padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                <input type="text" placeholder="Credential ID (optional)" value={newCert.credential_id} onChange={e=>setNewCert({...newCert, credential_id: e.target.value})} style={{ padding: '0.55rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={handleAddCertification} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', padding: '0.45rem 0.95rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Save Certification</button>
                <button type="button" onClick={()=>setShowAddCert(false)} style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.45rem 0.95rem', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* 7. RESUME SECTION */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', marginBottom: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
            Resume & Attachments
          </h3>

          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={24} color="#2563eb" />
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>{profile.personal_info.resume_name || "Priya_Gupta_Cybersecurity_Resume.pdf"}</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Verified Candidate Resume • PDF • 142 KB</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => alert("Viewing verified demo resume for Priya Gupta.")}
                style={{ padding: '0.45rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}
              >
                View
              </button>
              <button
                type="button"
                onClick={() => alert("Resume replacement dialog (Demo mode: current resume is locked for verified demo presentation).")}
                style={{ padding: '0.45rem 0.85rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
              >
                Replace
              </button>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div style={{ display: 'flex', gap: '1rem', paddingBottom: '3rem' }}>
          <button
            type="submit"
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.9rem 2.25rem',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(37,99,235,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Save size={18} /> Save All Changes
          </button>
        </div>

      </form>

    </div>
  );
}

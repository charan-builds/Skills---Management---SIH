// Centralized, coherent data architecture for the Skilling Programme Intelligence Center

export const adminIntelligenceData = {
  overview_kpis: [
    {
      title: "Total Trainees",
      value: "500",
      previous: "450",
      change: "+11.1%",
      trend: "up",
      tooltip: "Total candidates enrolled across all state skilling programmes."
    },
    {
      title: "Active Trainees",
      value: "350",
      previous: "320",
      change: "+9.4%",
      trend: "up",
      tooltip: "Trainees currently attending ongoing training modules."
    },
    {
      title: "Certified Trainees",
      value: "380",
      previous: "340",
      change: "+11.8%",
      trend: "up",
      tooltip: "Candidates who passed benchmark examinations and earned state certification."
    },
    {
      title: "Training Completion Rate",
      value: "86%",
      previous: "82%",
      change: "+4.0%",
      trend: "up",
      tooltip: "Percentage of enrolled trainees who complete the full curriculum."
    },
    {
      title: "Assessment Pass Rate",
      value: "82%",
      previous: "78%",
      change: "+4.0%",
      trend: "up",
      tooltip: "Pass percentage across technical skill assessments."
    },
    {
      title: "Job-Ready Trainees",
      value: "290",
      previous: "250",
      change: "+16.0%",
      trend: "up",
      tooltip: "Trainees evaluated at 80%+ role readiness by AI skill matching."
    },
    {
      title: "Employment Rate",
      value: "78%",
      previous: "72%",
      change: "+6.0%",
      trend: "up",
      tooltip: "Percentage of certified job-ready candidates successfully placed."
    },
    {
      title: "3M Retention",
      value: "92%",
      previous: "90%",
      change: "+2.0%",
      trend: "up",
      tooltip: "Confirmed employed trainees retained after 3 months."
    },
    {
      title: "6M Retention",
      value: "88%",
      previous: "85%",
      change: "+3.0%",
      trend: "up",
      tooltip: "Confirmed employed trainees retained after 6 months."
    },
    {
      title: "12M Retention",
      value: "84%",
      previous: "80%",
      change: "+4.0%",
      trend: "up",
      tooltip: "Confirmed employed trainees retained after 12 months."
    }
  ],

  trainee_funnel: [
    { stage: "Enrolled", count: 500, percentage: 100, color: "#2563eb" },
    { stage: "Completed Training", count: 430, percentage: 86, color: "#3b82f6" },
    { stage: "Certified", count: 380, percentage: 76, color: "#60a5fa" },
    { stage: "Job-Ready (80%+)", count: 290, percentage: 58, color: "#f59e0b" },
    { stage: "Applications Submitted", count: 210, percentage: 42, color: "#8b5cf6" },
    { stage: "Shortlisted / Interviews", count: 120, percentage: 24, color: "#a855f7" },
    { stage: "Hired / Placed", count: 80, percentage: 16, color: "#16a34a" },
    { stage: "Retained (6M+)", count: 68, percentage: 13.6, color: "#15803d" }
  ],

  programmes: [
    {
      id: "P001",
      name: "Data Analytics Specialist",
      provider: "State IT Academy",
      district: "Hyderabad",
      enrolled: 140,
      completion_rate: 88,
      certification_rate: 82,
      avg_assessment_score: 79,
      avg_skill_gain: "+31%",
      job_readiness_rate: 76,
      employment_rate: 82,
      retention_12m: 86,
      demand_level: "High",
      health_status: "Excellent",
      top_skills: ["Python", "SQL", "Power BI", "Data Cleaning"],
      missing_skills: ["Statistics", "Advanced DAX"],
      hiring_employers: 12,
      avg_starting_salary: "₹5.2 LPA"
    },
    {
      id: "P002",
      name: "Cybersecurity Specialist",
      provider: "Telangana Cyber Defense Hub",
      district: "Hyderabad",
      enrolled: 110,
      completion_rate: 85,
      certification_rate: 80,
      avg_assessment_score: 83,
      avg_skill_gain: "+28%",
      job_readiness_rate: 74,
      employment_rate: 76,
      retention_12m: 89,
      demand_level: "Very High",
      health_status: "Good",
      top_skills: ["Linux", "Networking", "Cybersecurity Fundamentals", "Python"],
      missing_skills: ["SIEM Tools", "Cloud Security"],
      hiring_employers: 9,
      avg_starting_salary: "₹5.8 LPA"
    },
    {
      id: "P003",
      name: "AI & Machine Learning Associate",
      provider: "Advanced Tech Skilling Mission",
      district: "Nalgonda",
      enrolled: 95,
      completion_rate: 82,
      certification_rate: 75,
      avg_assessment_score: 77,
      avg_skill_gain: "+34%",
      job_readiness_rate: 70,
      employment_rate: 84,
      retention_12m: 91,
      demand_level: "Critical High",
      health_status: "Excellent",
      top_skills: ["Python", "Machine Learning", "Pandas", "SQL"],
      missing_skills: ["Model Deployment", "Statistics"],
      hiring_employers: 8,
      avg_starting_salary: "₹6.2 LPA"
    },
    {
      id: "P004",
      name: "Cloud Infrastructure & DevOps",
      provider: "Cloud Center of Excellence",
      district: "Warangal",
      enrolled: 85,
      completion_rate: 89,
      certification_rate: 84,
      avg_assessment_score: 81,
      avg_skill_gain: "+29%",
      job_readiness_rate: 78,
      employment_rate: 80,
      retention_12m: 88,
      demand_level: "High",
      health_status: "Excellent",
      top_skills: ["Linux", "Docker", "Python", "Networking"],
      missing_skills: ["Kubernetes", "Terraform"],
      hiring_employers: 10,
      avg_starting_salary: "₹5.6 LPA"
    },
    {
      id: "P005",
      name: "Full Stack Web Development",
      provider: "Digital Skills Initiative",
      district: "Visakhapatnam",
      enrolled: 70,
      completion_rate: 80,
      certification_rate: 71,
      avg_assessment_score: 74,
      avg_skill_gain: "+25%",
      job_readiness_rate: 64,
      employment_rate: 68,
      retention_12m: 78,
      demand_level: "Moderate",
      health_status: "Needs Attention",
      top_skills: ["JavaScript", "React", "Node.js", "SQL"],
      missing_skills: ["TypeScript", "API Testing"],
      hiring_employers: 7,
      avg_starting_salary: "₹4.6 LPA"
    }
  ],

  skill_intelligence: [
    {
      skill: "Python",
      category: "Programming & Automation",
      supply: 240,
      demand: 310,
      gap: 70,
      avg_proficiency: 82,
      relevance: "94% of vacancies",
      priority: "High",
      trend: "+14% YoY"
    },
    {
      skill: "Machine Learning",
      category: "AI & Data Science",
      supply: 85,
      demand: 160,
      gap: 75,
      avg_proficiency: 68,
      relevance: "88% of AI roles",
      priority: "Very High",
      trend: "+38% YoY"
    },
    {
      skill: "SQL & Relational DBs",
      category: "Database & Backend",
      supply: 260,
      demand: 280,
      gap: 20,
      avg_proficiency: 84,
      relevance: "96% of analytics roles",
      priority: "Moderate",
      trend: "+5% YoY"
    },
    {
      skill: "Power BI & Visualization",
      category: "Business Intelligence",
      supply: 110,
      demand: 180,
      gap: 70,
      avg_proficiency: 65,
      relevance: "78% of reporting roles",
      priority: "High",
      trend: "+22% YoY"
    },
    {
      skill: "Cybersecurity & SIEM",
      category: "Security Operations",
      supply: 90,
      demand: 175,
      gap: 85,
      avg_proficiency: 71,
      relevance: "90% of SOC vacancies",
      priority: "Very High",
      trend: "+42% YoY"
    },
    {
      skill: "Communication & Reporting",
      category: "Professional Competencies",
      supply: 190,
      demand: 250,
      gap: 60,
      avg_proficiency: 61,
      relevance: "Required across all roles",
      priority: "High",
      trend: "+8% YoY"
    },
    {
      skill: "Linux Administration",
      category: "Systems & Infrastructure",
      supply: 180,
      demand: 210,
      gap: 30,
      avg_proficiency: 86,
      relevance: "82% of tech ops roles",
      priority: "Moderate",
      trend: "+10% YoY"
    }
  ],

  ai_programme_insights: [
    {
      id: "ins-01",
      title: "Machine Learning Talent Shortage",
      category: "Demand-Supply Imbalance",
      priority: "High",
      summary: "Machine Learning demand across enterprise vacancies exceeds certified trainee supply by 38%.",
      why: "Rapid enterprise AI adoption in Hyderabad and Nalgonda tech clusters has increased demand for predictive modelling and pipeline engineers.",
      recommendation: "Increase ML training capacity by 40 seats in Cohort 2025-Q2 and integrate specialized model evaluation labs.",
      expected_impact: "Will improve employer match rate from 70% to 88% for ML/AI vacancies."
    },
    {
      id: "ins-02",
      title: "Communication as Primary Placement Barrier",
      category: "Competency Gap",
      priority: "High",
      summary: "Technical communication is the most frequent missing competency flagged by interviewers (62% of rejected candidates).",
      why: "Trainees excel at coding challenges but struggle in stakeholder incident reporting and verbal problem decomposition.",
      recommendation: "Embed weekly mock client briefings and structured stakeholder reporting assessments into all core curricula.",
      expected_impact: "Projected 15% increase in technical interview-to-offer conversion rate."
    },
    {
      id: "ins-03",
      title: "Strong Placement Synergy in Python + SQL",
      category: "High-Performing Pattern",
      priority: "Medium",
      summary: "Candidates certified in both Python and SQL demonstrate a 92% placement success rate and 89% 12-month retention.",
      why: "Enterprise analytics teams require hybrid candidates capable of both ETL scripting and relational database querying.",
      recommendation: "Maintain mandatory joint certification benchmarks for Data Analytics and Full Stack cohorts.",
      expected_impact: "Protects high baseline employment rate (78%+)."
    },
    {
      id: "ins-04",
      title: "Cybersecurity SOC Hands-on Readiness",
      category: "Curriculum Optimization",
      priority: "Medium",
      summary: "Cybersecurity trainees with Linux + SIEM practical labs secure employment 3.2 weeks faster than those with theory only.",
      why: "Employers prioritize immediate operational capability in log correlation and vulnerability remediation.",
      recommendation: "Allocate 60% of curriculum hours to real-time live intrusion triage simulations.",
      expected_impact: "Reduces post-certification bench time from 42 days to 18 days."
    }
  ],

  action_center_items: [
    {
      id: "act-01",
      title: "Expand Machine Learning Training Capacity",
      priority: "High Priority",
      programme: "AI & Machine Learning Associate",
      district: "Nalgonda & Hyderabad",
      evidence: "38% demand supply gap; 8 partner employers requesting ML candidates.",
      suggested_action: "Approve 40 additional training seats and sponsor GPU cloud lab credits.",
      status: "Pending Review"
    },
    {
      id: "act-02",
      title: "Introduce Mandatory Technical Communication Module",
      priority: "High Priority",
      programme: "All Programmes",
      district: "State-wide",
      evidence: "62% of interviewer feedback reports communication as top improvement area.",
      suggested_action: "Deploy interactive 16-hour business communication micro-learning course.",
      status: "Pending Review"
    },
    {
      id: "act-03",
      title: "Deploy SIEM Hands-On Virtual Terminal",
      priority: "Medium Priority",
      programme: "Cybersecurity Specialist",
      district: "Hyderabad",
      evidence: "SIEM proficiency is requested by 90% of SOC analyst job postings.",
      suggested_action: "Integrate Splunk/ELK interactive sandbox into cybersecurity final month.",
      status: "In Progress"
    },
    {
      id: "act-04",
      title: "Audit Web Development Employment Conversion",
      priority: "Medium Priority",
      programme: "Full Stack Web Development",
      district: "Visakhapatnam",
      evidence: "Employment rate (68%) is below state average target (78%).",
      suggested_action: "Update stack requirements to include TypeScript and cloud deployments.",
      status: "Pending Review"
    }
  ],

  assessments: [
    {
      id: "ASSESS-01",
      name: "Python & Algorithmic Problem Solving",
      programme: "Data Analytics & AI",
      participants: 235,
      pass_rate: 84,
      avg_score: 79,
      strong_skills: ["Data Structures", "Looping & Syntax", "Pandas Functions"],
      weak_skills: ["Exception Handling", "Memory Optimization"],
      employment_correlation: "High (r = 0.74)"
    },
    {
      id: "ASSESS-02",
      name: "Relational SQL & Schema Design",
      programme: "Data Analytics Specialist",
      participants: 180,
      pass_rate: 88,
      avg_score: 82,
      strong_skills: ["Complex JOINs", "Aggregation", "GROUP BY"],
      weak_skills: ["Window Functions", "Index Tuning"],
      employment_correlation: "Very High (r = 0.81)"
    },
    {
      id: "ASSESS-03",
      name: "Linux Security & Vulnerability Triage",
      programme: "Cybersecurity Specialist",
      participants: 110,
      pass_rate: 79,
      avg_score: 76,
      strong_skills: ["Permission Management", "Network Scanning", "Port Triage"],
      weak_skills: ["SIEM Alert Rules", "Cryptographic Protocols"],
      employment_correlation: "High (r = 0.76)"
    },
    {
      id: "ASSESS-04",
      name: "Machine Learning Pipeline Evaluation",
      programme: "AI & Machine Learning Associate",
      participants: 90,
      pass_rate: 74,
      avg_score: 72,
      strong_skills: ["Model Fitting", "Feature Scaling"],
      weak_skills: ["Hyperparameter Tuning", "Cross-Validation"],
      employment_correlation: "Very High (r = 0.83)"
    }
  ],

  verification_queue: [
    {
      trainee_id: "T102",
      trainee_name: "Priya Gupta",
      programme: "Cybersecurity Specialist",
      employer: "TechFlow Solutions",
      role: "Cybersecurity Analyst",
      salary: "₹55,000 / mo",
      joining_date: "2025-01-15",
      verification_status: "Verified",
      retention_3m: "Retained (Verified)",
      retention_6m: "Retained (Verified)",
      retention_12m: "On Track",
      last_updated: "2025-08-20"
    },
    {
      trainee_id: "TR-DEMO-1001",
      trainee_name: "Anjali Joshi",
      programme: "AI & Data Science Professional",
      employer: "TechFlow Solutions",
      role: "ML/AI Associate",
      salary: "₹50,000 / mo",
      joining_date: "2025-02-01",
      verification_status: "Pending",
      retention_3m: "Retained (Verified)",
      retention_6m: "Due in 30 days",
      retention_12m: "Not yet due",
      last_updated: "2025-08-25"
    },
    {
      trainee_id: "TR-DEMO-1002",
      trainee_name: "Manoj Das",
      programme: "Data Analytics Specialist",
      employer: "TechFlow Solutions",
      role: "Data Analyst",
      salary: "₹45,000 / mo",
      joining_date: "2025-02-15",
      verification_status: "Pending",
      retention_3m: "Due for Confirmation",
      retention_6m: "Not yet due",
      retention_12m: "Not yet due",
      last_updated: "2025-08-28"
    },
    {
      trainee_id: "TR-DEMO-1003",
      trainee_name: "Rahul Verma",
      programme: "Cloud Infrastructure & DevOps",
      employer: "TechFlow Solutions",
      role: "Cloud Associate",
      salary: "₹60,000 / mo",
      joining_date: "2024-11-01",
      verification_status: "Verified",
      retention_3m: "Retained (Verified)",
      retention_6m: "Retained (Verified)",
      retention_12m: "Retained (Verified)",
      last_updated: "2025-08-15"
    },
    {
      trainee_id: "TR-DEMO-1004",
      trainee_name: "Sneha Reddy",
      programme: "Data Analytics Specialist",
      employer: "Global Analytics Corp",
      role: "BI Associate",
      salary: "₹48,000 / mo",
      joining_date: "2025-01-10",
      verification_status: "Verified",
      retention_3m: "Retained (Verified)",
      retention_6m: "Retained (Verified)",
      retention_12m: "On Track",
      last_updated: "2025-08-10"
    }
  ]
};

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Building2, Check, CheckCircle2, ChevronDown, ShieldCheck, Sparkles, Target, TrendingUp, UserRound, Users } from "lucide-react";
import { platformService, usePlatformStore } from "../services/platformService";
import CountUp from "../components/common/CountUp";
import LanguageSelector from "../components/common/LanguageSelector";
import { useLanguage } from "../context/LanguageContext";
import "./LandingPage.css";

export default function LandingPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [role, setRole] = useState("admin");

  // Moved inside component so t() is available
  const portals = [
    ["trainee", t("nav.trainee", "Trainee"), UserRound, "/landing-trainee.png", [
      t("trainee_nav.my_profile", "Update outcomes"),
      t("trainee_nav.employment_journey", "Track employment journey"),
      t("trainee_nav.wage_retention", "Report wages & retention"),
      t("trainee_nav.feedback", "Give feedback"),
    ]],
    ["employer", t("nav.employer", "Employer"), Building2, "/landing-employer.png", [
      t("employer_nav.verify_claims", "Verify employment"),
      t("employer_nav.verified_workforce", "Confirm workforce"),
      t("employer_nav.skill_demand", "Report skill gaps"),
      t("employer_nav.feedback_surveys", "Provide feedback"),
    ]],
    ["admin", t("nav.admin", "Government"), BarChart3, "/landing-admin.png", [
      t("admin_nav.outcomes", "Monitor outcomes"),
      t("admin_nav.providers", "Compare providers"),
      t("admin_nav.skill_gaps", "Identify skill gaps"),
      t("admin_nav.policy_simulator", "Simulate interventions"),
    ]],
  ];

  const steps = [
    ["01", t("landing.step_01_title", "Check in"), t("landing.step_01_desc", "Trainees update employment and outcome status.")],
    ["02", t("landing.step_02_title", "Verify"), t("landing.step_02_desc", "Employer and verified sources validate employment information.")],
    ["03", t("landing.step_03_title", "Track"), t("landing.step_03_desc", "3 / 6 / 12-month follow-ups capture retention, wages and relevance.")],
    ["04", t("landing.step_04_title", "Analyze"), t("landing.step_04_desc", "Identify skill gaps, outcome trends and provider performance.")],
    ["05", t("landing.step_05_title", "Act"), t("landing.step_05_desc", "Simulate interventions and support corrective action.")],
  ];

  const valueProps = [
    [ShieldCheck, t("landing.why_label", "Confidence-Aware"), t("landing.step_01_desc", "Multi-tier verification")],
    [Users, t("landing.triangulated", "Triangulated"), t("landing.triangulated_desc", "Employer + Trainee + Verified Syllabus")],
    [Sparkles, t("landing.simulation_driven", "Simulation-Driven"), t("landing.sim_desc", "Simulate policy impact before action")],
    [TrendingUp, t("landing.action_driven", "Action-Driven"), t("landing.action_driven_desc", "Insights → Action → Impact")],
  ];

  const scroll = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const login = (selected = "admin") => { setRole(selected); setModal(true); };
  const enter = () => {
    localStorage.setItem("userRole", role);
    localStorage.setItem("sih_token", `demo_${role}_jwt_token_verified`);
    if (role === "trainee") localStorage.setItem("traineeId", "TR-0001");
    if (role === "employer") {
      localStorage.setItem("organizationId", "EMP-DEMO-001");
      localStorage.setItem("organizationName", "Tata Consultancy Services");
    }
    navigate(role === "admin" ? "/admin" : `/${role}`);
  };

  return (
    <div className="s2i-page">
      {/* ── NAV ── */}
      <header className="s2i-nav">
        <button className="s2i-brand" onClick={() => scroll("home")}>
          <img src="/skill2impact-logo.png" alt="Skill2Impact" />
          <span>{t("landing.brand_tagline", "From Skills to Measurable Employment Impact")}</span>
        </button>
        <nav>
          <button onClick={() => scroll("home")}>{t("landing.home", "Home")}</button>
          <button onClick={() => scroll("how")}>{t("landing.how_it_works", "How It Works")}</button>
          <button onClick={() => scroll("dashboards")}>{t("landing.dashboards", "Dashboards")}</button>
          <button onClick={() => scroll("impact")}>{t("landing.impact", "Impact")}</button>
          <LanguageSelector compact />
          <button className="s2i-login" onClick={() => login()}>
            {t("landing.login", "Login")} <ArrowRight size={16} />
          </button>
        </nav>
      </header>

      <main id="home">
        {/* ── HERO ── */}
        <section className="s2i-hero s2i-container">
          <div>
            <p className="s2i-kicker">{t("landing.kicker", "Skilling Outcome Intelligence Platform")}</p>
            <h1>
              {t("landing.hero_title", "Beyond certification.")}
              <br />
              <span>{t("landing.hero_span", "Track what happens next.")}</span>
            </h1>
            <p className="s2i-lede">
              {t("landing.hero_lede", "Connect training data with employment, retention, wage progression and skill relevance — and turn outcome intelligence into actionable policy decisions.")}
            </p>
            <div className="s2i-actions">
              <button className="s2i-primary" onClick={() => scroll("dashboards")}>
                {t("landing.explore_platform", "Explore Platform")} <ArrowRight size={17} />
              </button>
              <button className="s2i-secondary" onClick={() => login()}>
                {t("landing.login", "Login")}
              </button>
            </div>
            <div className="s2i-journey">
              {t("landing.step_01_title", "Train")} <ArrowRight /> {t("landing.step_02_title", "Certify")} <ArrowRight /> {t("landing.step_03_title", "Employ")} <ArrowRight /> {t("landing.step_04_title", "Retain")} <ArrowRight /> {t("landing.step_05_title", "Improve")}
            </div>
          </div>
          <LiveOutcome />
        </section>

        {/* ── OUTCOME GAP ── */}
        <section className="s2i-section s2i-container">
          <Heading
            label={t("landing.gap_label", "The outcome gap")}
            title={<>{t("landing.gap_title_main", "Training is tracked. ")}<span>{t("landing.gap_title_span", "Impact isn't.")}</span></>}
          />
          <div className="s2i-gap-grid">
            <Gap
              title={t("landing.gap_tracked", "What is already tracked")}
              items={[
                t("landing.step_01_title", "Enrolment"),
                t("landing.step_02_title", "Attendance"),
                t("landing.step_03_title", "Assessment"),
                t("landing.step_04_title", "Certification"),
              ]}
            />
            <Gap
              title={t("landing.gap_unclear", "What remains unclear")}
              items={[
                t("admin_nav.employment", "Employment & Retention"),
                t("admin_nav.outcomes", "Non-placement / Attrition"),
                t("employer_nav.employment_updates", "Wage Progression"),
                t("admin_nav.skill_gaps", "Skill Relevance"),
              ]}
              unclear
            />
          </div>
          <p className="s2i-bridge">
            {t("landing.gap_bridge", "Skill2Impact connects these missing outcomes into a longitudinal view of skilling impact.")}
          </p>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="s2i-section s2i-soft" id="how">
          <div className="s2i-container">
            <Heading
              center
              label={t("landing.how_label", "How it works")}
              title={<>{t("landing.how_title_main", "From Training Data to ")}<span>{t("landing.how_title_span", "Measurable Impact")}</span></>}
            />
            <div className="s2i-steps">
              {steps.map(([n, title, desc], i) => (
                <article className="s2i-step" key={n}>
                  <b>{n}</b>
                  <i>{i < 4 ? <ChevronDown /> : <Target />}</i>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── DASHBOARDS ── */}
        <section className="s2i-section s2i-container" id="dashboards">
          <Heading
            label={t("landing.dash_label", "Connected dashboards")}
            title={<>{t("landing.dash_title_main", "One Platform. ")}<span>{t("landing.dash_title_span", "Three Perspectives.")}</span></>}
            text={t("landing.dash_text", "Each portal serves the people who create, verify and act on outcome intelligence.")}
          />
          <div className="s2i-dashboard-grid">
            {portals.map(([key, title, Icon, img, items]) => (
              <article className="s2i-dashboard" key={key}>
                <div className="s2i-card-title">
                  <Icon />
                  <div>
                    <h3>{title}</h3>
                    <p>{key === "admin" ? t("landing.kicker", "Outcome intelligence") : `${title} ${t("landing.open_portal", "portal")}`}</p>
                  </div>
                </div>
                <img src={img} alt={`Actual Skill2Impact ${title} dashboard`} />
                <ul>
                  {items.map((x) => (
                    <li key={x}><Check />{x}</li>
                  ))}
                </ul>
                <button onClick={() => login(key)}>
                  {t("landing.open_portal", "Open")} {title} {t("landing.open_portal", "portal")} <ArrowRight />
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* ── WHY SKILL2IMPACT ── */}
        <section className="s2i-section s2i-container">
          <Heading
            label={t("landing.why_label", "Purpose-built intelligence")}
            title={<>{t("landing.why_title_main", "Why ")}<span>{t("landing.why_title_span", "Skill2Impact?")}</span></>}
          />
          <div className="s2i-value-grid">
            {valueProps.map(([Icon, title, text], i) => (
              <article key={title}>
                <b>0{i + 1}</b>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── OUTCOME INTELLIGENCE ── */}
        <section className="s2i-section s2i-soft">
          <div className="s2i-container">
            <Heading
              center
              label={t("landing.impact", "Outcome intelligence")}
              title={<>{t("landing.gap_title_main", "From Data to ")}<span>{t("landing.impact_title_span", "Decisions")}</span></>}
            />
            <div className="s2i-decision">
              <div className="s2i-outcomes">
                {[
                  t("admin_nav.employment", "Employment"),
                  t("employer_nav.verified_workforce", "Retention"),
                  t("employer_nav.employment_updates", "Wage Growth"),
                  t("admin_nav.skill_gaps", "Skill Relevance"),
                  t("admin_nav.outcomes", "Non-placement / Attrition"),
                ].map((x) => (
                  <span key={x}>{x}</span>
                ))}
              </div>
              <div className="s2i-flow">
                <b>{t("landing.step_04_title", "Outcome Data")}</b>
                <ArrowRight />
                <b>{t("landing.kicker", "Intelligence")}</b>
                <ArrowRight />
                <b>{t("admin_nav.interventions", "Intervention")}</b>
                <ArrowRight />
                <b>{t("landing.impact_title_span", "Measured Impact")}</b>
              </div>
            </div>
          </div>
        </section>

        {/* ── SIMULATION ── */}
        <section className="s2i-section s2i-container">
          <div className="s2i-simulation">
            <div>
              <p className="s2i-kicker">{t("landing.sim_kicker", "Simulation / Projection")}</p>
              <h2>{t("landing.sim_title", "Test Interventions Before Rollout")}</h2>
              <p>{t("landing.sim_desc", "Simulate potential policy or training interventions using outcome data before implementation.")}</p>
              <button className="s2i-primary" onClick={() => login("admin")}>
                {t("landing.explore_simulation", "Explore policy simulation")} <ArrowRight />
              </button>
            </div>
            <div>
              <Screen image="/landing-simulation.png" label={t("admin_nav.policy_simulator", "Policy Simulation")} alt="Actual Skill2Impact policy simulation interface" />
              <p className="s2i-projection">
                {t("landing.sim_kicker", "Policy Scenario: Retraining Intervention")} <ArrowRight /> {t("landing.step_02_title", "Simulated Impact")} <ArrowRight /> {t("admin_nav.outcomes", "Placement / Outcome Change")}
              </p>
            </div>
          </div>
        </section>

        {/* ── IMPACT ── */}
        <section className="s2i-section s2i-container" id="impact">
          <Heading
            center
            label={t("landing.impact_label", "Impact framework")}
            title={<>{t("landing.impact_title_main", "Measuring What Happens ")}<span>{t("landing.impact_title_span", "After Training")}</span></>}
          />
          <div className="s2i-impact-grid">
            {[
              ["3 / 6 / 12 Months", t("landing.retention_6m", "Longitudinal follow-up")],
              ["3 User Roles", `${t("nav.trainee", "Trainee")} • ${t("nav.employer", "Employer")} • ${t("nav.admin", "Government")}`],
              ["5 Outcome Areas", `${t("admin_nav.employment", "Employment")} • ${t("employer_nav.verified_workforce", "Retention")} • ${t("employer_nav.employment_updates", "Wages")} • ${t("admin_nav.skill_gaps", "Skills")} • ${t("admin_nav.outcomes", "Attrition")}`],
              ["Multi-tier", t("landing.verification_path", "Outcome verification")],
            ].map(([a, b]) => (
              <article key={a}>
                <h3>{a}</h3>
                <p>{b}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="s2i-final">
          <div className="s2i-container">
            <div>
              <p className="s2i-kicker">Skill2Impact</p>
              <h2>{t("landing.hero_title", "Beyond certification.")} {t("landing.impact_title_span", "Measure real impact.")}</h2>
              <p>{t("landing.gap_bridge", "Skill2Impact connects training data with the employment outcomes that matter.")}</p>
            </div>
            <div className="s2i-actions">
              <button className="s2i-light" onClick={() => scroll("dashboards")}>
                {t("landing.explore_platform", "Explore Platform")}
              </button>
              <button className="s2i-outline" onClick={() => login()}>
                {t("landing.login", "Login")}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="s2i-footer">
        <div className="s2i-container">
          <div>
            <strong>Skill2Impact</strong>
            <p>{t("landing.brand_tagline", "From Skills to Measurable Employment Impact")}</p>
          </div>
          <p>{t("nav.trainee", "Trainee")} &nbsp;|&nbsp; {t("nav.employer", "Employer")} &nbsp;|&nbsp; {t("nav.admin", "Government")}</p>
        </div>
      </footer>

      {/* ── ROLE SELECT MODAL ── */}
      {modal && (
        <div className="s2i-modal-backdrop" onClick={() => setModal(false)}>
          <div className="s2i-modal" onClick={(e) => e.stopPropagation()}>
            <button className="s2i-close" onClick={() => setModal(false)}>×</button>
            <p className="s2i-kicker">{t("landing.portal_access", "Secure platform access")}</p>
            <h2>{t("landing.choose_portal", "Choose your portal")}</h2>
            <p>{t("landing.portal_desc", "Open the Skill2Impact prototype as the relevant platform user.")}</p>
            <div className="s2i-tabs">
              {portals.map(([key, title, Icon]) => (
                <button key={key} className={role === key ? "active" : ""} onClick={() => setRole(key)}>
                  <Icon />{title}
                </button>
              ))}
            </div>
            <div className="s2i-modal-card">
              <span>{role === "admin" ? `${t("nav.admin", "Government")} / Admin` : role}</span>
              <h3>{t("landing.open_portal", "Open the")} {role === "admin" ? t("nav.admin", "government") : role} {t("landing.open_portal", "dashboard")}</h3>
              <p>{t("landing.portal_desc", "Demo access opens the existing interactive prototype with its working data and workflows.")}</p>
              <button className="s2i-primary" onClick={enter}>
                {t("landing.continue_to_portal", "Continue to portal")} <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Heading({ label, title, text, center }) {
  return (
    <div className={`s2i-heading ${center ? "center" : ""}`}>
      <p className="s2i-kicker">{label}</p>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function Gap({ title, items, unclear }) {
  return (
    <article className={`s2i-gap ${unclear ? "unclear" : ""}`}>
      <h3>{title}</h3>
      {items.map((x) => (
        <p key={x}>{unclear ? <i>?</i> : <CheckCircle2 />}{x}</p>
      ))}
    </article>
  );
}

function Screen({ image, label, alt, hero }) {
  return (
    <div className={`s2i-screen ${hero ? "hero" : ""}`}>
      <div className="s2i-window"><i /><i /><i /><span>{label}</span></div>
      <img src={image} alt={alt} />
    </div>
  );
}

function LiveOutcome() {
  const { t } = useLanguage();
  const store = usePlatformStore();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    let active = true;
    platformService.getAdminDashboard()
      .then((data) => { if (active) setDashboard(data); })
      .catch(() => { if (active) setDashboard(null); });
    return () => { active = false; };
  }, [store.last_updated]);

  const stats = Object.fromEntries((dashboard?.stats || []).map((stat) => [stat.id, stat]));
  const values = [
    [stats.trained?.value ?? "—", t("landing.trainees_tracked", "Trainees tracked")],
    [stats.rate?.value ?? "—", t("landing.employment_rate", "Employment rate")],
    [stats.retention?.value ?? "—", t("landing.retention_6m", "6-month retention")],
    [stats.wage?.value ?? "—", t("landing.average_wage", "Average wage")],
  ];

  return (
    <aside className="s2i-live-outcome" aria-live="polite">
      <div className="s2i-live-title">
        <span>{t("landing.live_snapshot", "Live outcome snapshot")}</span>
        <i />
        <span>{t("landing.maharashtra_cohort", "Maharashtra cohort")}</span>
      </div>
      <div className="s2i-live-grid">
        {values.map(([value, label]) => (
          <div key={label}>
            <CountUp value={value} as="strong" />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="s2i-live-divider" />
      <p>{t("landing.verification_path", "Verification path")}</p>
      <div className="s2i-live-path">
        <span>EPFO match</span><ArrowRight /><span>Partner HRIS</span><ArrowRight /><span>Employer confirm</span>
      </div>
      <small>{dashboard ? t("landing.live_hint", "Updates as outcome records change") : t("landing.connecting_data", "Connecting to live outcome data")}</small>
    </aside>
  );
}

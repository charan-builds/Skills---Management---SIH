
export default function ImpactExecutiveSummary({ dashboardData }) {
  if (!dashboardData) return null;

  // Dashboard API returns stats as an array of {title, value, icon}
  // Extract values by matching on the title field
  const statsArray = dashboardData.stats || [];
  const findStat = (title) => {
    const stat = statsArray.find(s => s.title === title);
    return stat?.value || null;
  };

  const totalTrainees = findStat("Total Trainees");
  const employmentRate = findStat("Employment Rate");
  const retentionRate = findStat("6M Retention");
  const wageProgression = findStat("Wage Progression");

  const stats = [
    { label: "Total Trainees", value: totalTrainees || "0" },
    { label: "Employment Rate", value: employmentRate || "0%" },
    { label: "6M Retention", value: retentionRate || "N/A" },
    { label: "Wage Progression", value: wageProgression || "N/A" },
  ];

  return (
    <div className="exec-summary-grid">
      {stats.map(s => (
        <div key={s.label} className="exec-stat">
          <span>{s.label}</span>
          <strong>{s.value}</strong>
        </div>
      ))}
    </div>
  );
}

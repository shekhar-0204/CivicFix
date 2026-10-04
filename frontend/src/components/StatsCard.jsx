function StatsCard({ label, value, icon: Icon, tone = "neutral" }) {
  return (
    <div className={`stats-card stats-${tone}`}>
      <div className="stats-icon">
        <Icon size={20} />
      </div>

      <div>
        <span className="stats-label">{label}</span>
        <strong className="stats-value">{value}</strong>
      </div>
    </div>
  );
}

export default StatsCard;

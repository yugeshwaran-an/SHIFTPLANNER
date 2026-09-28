import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = '#4f46e5', bg = '#eef2ff' }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper" style={{ backgroundColor: bg, color }}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
      </div>
    </div>
  );
}

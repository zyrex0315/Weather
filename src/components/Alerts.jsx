import React from 'react';

const Alerts = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div className="pt-4 border-t border-white/20">
      <div className="font-semibold mb-2 text-red-600">Weather Alerts</div>
      {alerts.map((alert, i) => (
        <div key={i} className="text-xs bg-red-100 text-red-800 rounded p-2 mb-2">
          <div className="font-bold">{alert.event}</div>
          <div>{alert.description}</div>
        </div>
      ))}
    </div>
  );
};

export default Alerts; 
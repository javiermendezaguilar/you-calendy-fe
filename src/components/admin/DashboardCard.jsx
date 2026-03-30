import React from 'react';
import { useBatchTranslation } from '../../contexts/BatchTranslationContext';

const DashboardCard = ({ title, value, icon, bgColor, iconBgColor }) => {
  const { tc } = useBatchTranslation();
  
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md flex items-center justify-between`}>
      <div>
        <p className="text-xs text-gray-500 uppercase">{tc(title)}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`p-3 rounded-full`} style={{ backgroundColor: iconBgColor }}>
        {icon}
      </div>
    </div>
  );
};

export default DashboardCard;
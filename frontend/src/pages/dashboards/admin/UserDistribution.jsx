import React from 'react';
import { PieChart, Users } from 'lucide-react';

const UserDistribution = ({ users = [] }) => {
  // Calculate user distribution
  const calculateDistribution = () => {
    const farmers = users.filter(user => user.role === 'farmer').length;
    const experts = users.filter(user => user.role === 'expert').length;
    const admins = users.filter(user => user.role === 'admin').length;
    const totalUsers = farmers + experts + admins;

    return {
      farmers,
      experts,
      admins,
      totalUsers,
      farmerPercentage: totalUsers > 0 ? (farmers / totalUsers * 100).toFixed(1) : 0,
      expertPercentage: totalUsers > 0 ? (experts / totalUsers * 100).toFixed(1) : 0,
      adminPercentage: totalUsers > 0 ? (admins / totalUsers * 100).toFixed(1) : 0
    };
  };

  const distribution = calculateDistribution();

  // Modern color palette with better contrast
  const roleColors = {
    farmers: {
      light: '#10B981',
      medium: '#059669', 
      dark: '#047857'
    },
    experts: {
      light: '#3B82F6',
      medium: '#2563EB',
      dark: '#1D4ED8'
    },
    admins: {
      light: '#8B5CF6',
      medium: '#7C3AED',
      dark: '#6D28D9'
    }
  };

  // Generate modern donut chart segments
  const generateDonutChart = () => {
    if (distribution.totalUsers === 0) return null;

    const segments = [];
    const roles = ['farmers', 'experts', 'admins'];
    const percentages = [
      parseFloat(distribution.farmerPercentage),
      parseFloat(distribution.expertPercentage),
      parseFloat(distribution.adminPercentage)
    ];

    const radius = 45;
    const centerX = 60;
    const centerY = 60;
    const strokeWidth = 12;
    const gap = 1; // Small gap between segments
    
    let currentAngle = -90; // Start from top

    percentages.forEach((percentage, index) => {
      if (percentage > 0) {
        const role = roles[index];
        const colors = roleColors[role];
        
        // Calculate segment length (subtract gap)
        const segmentAngle = (percentage * 3.6) - gap;
        const endAngle = currentAngle + segmentAngle;
        
        // Convert angles to radians
        const startAngleRad = (currentAngle * Math.PI) / 180;
        const endAngleRad = (endAngle * Math.PI) / 180;
        
        // Calculate points for arc
        const x1 = centerX + radius * Math.cos(startAngleRad);
        const y1 = centerY + radius * Math.sin(startAngleRad);
        const x2 = centerX + radius * Math.cos(endAngleRad);
        const y2 = centerY + radius * Math.sin(endAngleRad);
        
        // Large arc flag
        const largeArcFlag = segmentAngle > 180 ? 1 : 0;
        
        // Create arc path for donut segment
        const pathData = `
          M ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        `;

        segments.push(
          <g key={index}>
            {/* Main donut segment */}
            <path
              d={pathData}
              fill="none"
              stroke={colors.medium}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-500 hover:stroke-width-16 cursor-pointer"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
              }}
            />
            
            {/* Percentage label in the center of each segment */}
            <text
              x={centerX + (radius + 8) * Math.cos((currentAngle + segmentAngle/2) * Math.PI / 180)}
              y={centerY + (radius + 8) * Math.sin((currentAngle + segmentAngle/2) * Math.PI / 180)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white text-xs font-bold pointer-events-none"
              fontSize="7"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                opacity: percentage > 10 ? 1 : 0 // Hide label if segment too small
              }}
            >
              {percentage}%
            </text>
          </g>
        );

        currentAngle = endAngle + gap;
      }
    });

    return segments;
  };

  const StatItem = ({ label, count, percentage, color }) => (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
      <div className="flex items-center space-x-4">
        <div 
          className="w-4 h-4 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-125"
          style={{ 
            backgroundColor: color,
            boxShadow: `0 2px 8px ${color}40`
          }}
        ></div>
        <div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white block">
            {label}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {percentage}% 
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-gray-900 dark:text-white bg-white/50 dark:bg-gray-600/30 px-3 py-1 rounded-full">
          {count}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-xl shadow-lg">
            <PieChart size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Distribution</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Platform user roles overview</p>
          </div>
        </div>
        
        {/* Total Users Badge */}
        <div className="text-right">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Users</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{distribution.totalUsers}</div>
        </div>
      </div>
      
      {distribution.totalUsers === 0 ? (
        <div className="text-center py-12">
          <Users className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No users data available</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">User distribution will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* Modern Donut Chart */}
          <div className="flex-shrink-0">
            <div className="relative">
              <svg 
                width="140" 
                height="140" 
                viewBox="0 0 120 120" 
                className="transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
              >
                <defs>
                  {/* Glow effects */}
                  <filter id="segmentGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  {/* Radial gradient for center */}
                  <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </radialGradient>
                </defs>
                
                {/* Chart background circle */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="45" 
                  fill="none" 
                  stroke="#F3F4F6" 
                  strokeWidth="12" 
                  className="dark:stroke-gray-700"
                />
                
                {/* Donut segments */}
                <g filter="url(#segmentGlow)">
                  {generateDonutChart()}
                </g>
                
                {/* Center circle with gradient */}
                <circle 
                  cx="60" 
                  cy="60" 
                  r="32" 
                  fill="url(#centerGradient)" 
                />
                
                {/* Center text */}
                <text 
                  x="60" 
                  y="58" 
                  textAnchor="middle" 
                  className="fill-gray-700 dark:fill-gray-300 text-xs font-bold"
                  fontSize="10"
                >
                  User 
                </text>
                <text 
                  x="60" 
                  y="70" 
                  textAnchor="middle" 
                  className="fill-gray-500 dark:fill-gray-400 text-xs"
                  fontSize="8"
                >
                  Distribution
                </text>
              </svg>
            </div>
          </div>

          {/* Enhanced Statistics */}
          <div className="flex-1 min-w-0 space-y-4">
            <StatItem
              label="Farmers"
              count={distribution.farmers}
              percentage={distribution.farmerPercentage}
              color={roleColors.farmers.medium}
            />
            <StatItem
              label="Experts"
              count={distribution.experts}
              percentage={distribution.expertPercentage}
              color={roleColors.experts.medium}
            />
            <StatItem
              label="Admins"
              count={distribution.admins}
              percentage={distribution.adminPercentage}
              color={roleColors.admins.medium}
            />

          </div>
        </div>
      )}
    </div>
  );
};

export default UserDistribution;
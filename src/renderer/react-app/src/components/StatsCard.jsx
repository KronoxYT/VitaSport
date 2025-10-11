import { memo } from 'react';

export const StatsCard = memo(({ 
  title, 
  value, 
  trend, 
  icon: Icon,
  color = 'primary'
}) => {
  const trendColor = trend >= 0 ? 'text-green-500' : 'text-red-500';
  const trendIcon = trend >= 0 ? '↑' : '↓';
  
  return (
    <div className="card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        {Icon && (
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-500`} />
          </div>
        )}
        <div className="flex-1 ml-4">
          <h3 className="text-sm font-medium text-content-secondary">{title}</h3>
          <p className="mt-1 text-2xl font-semibold text-content-primary">{value}</p>
          {trend !== undefined && (
            <p className={`mt-1 text-sm ${trendColor} flex items-center`}>
              {trendIcon} {Math.abs(trend)}%
              <span className="ml-1 text-content-light">vs. mes anterior</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
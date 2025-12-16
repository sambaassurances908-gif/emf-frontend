// src/components/comptable/StatsCard.tsx

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const VARIANT_STYLES = {
  default: {
    icon: 'bg-gray-100 text-gray-600',
    trend: {
      positive: 'text-emerald-600',
      negative: 'text-red-600',
    },
  },
  success: {
    icon: 'bg-emerald-100 text-emerald-600',
    trend: {
      positive: 'text-emerald-600',
      negative: 'text-red-600',
    },
  },
  warning: {
    icon: 'bg-yellow-100 text-yellow-600',
    trend: {
      positive: 'text-emerald-600',
      negative: 'text-red-600',
    },
  },
  danger: {
    icon: 'bg-red-100 text-red-600',
    trend: {
      positive: 'text-emerald-600',
      negative: 'text-red-600',
    },
  },
  info: {
    icon: 'bg-blue-100 text-blue-600',
    trend: {
      positive: 'text-emerald-600',
      negative: 'text-red-600',
    },
  },
};

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) => {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className={cn(
      'bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm font-medium',
              trend.isPositive ? styles.trend.positive : styles.trend.negative
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-gray-400 font-normal">vs mois précédent</span>
            </div>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', styles.icon)}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

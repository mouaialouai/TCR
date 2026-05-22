import React from 'react';
import { LucideIcon, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface InfoCalloutProps {
  title: string;
  description: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'info' | 'warning' | 'success' | 'error';
  className?: string;
}

const variants = {
  info: {
    container: 'bg-sleek-primary/10 border-sleek-primary/20',
    iconWrapper: 'bg-sleek-primary shadow-sleek-primary/20',
    title: 'text-sleek-primary',
    defaultIcon: Info,
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/20',
    iconWrapper: 'bg-amber-500 shadow-amber-500/20',
    title: 'text-amber-600',
    defaultIcon: AlertTriangle,
  },
  success: {
    container: 'bg-emerald-500/10 border-emerald-500/20',
    iconWrapper: 'bg-emerald-500 shadow-emerald-500/20',
    title: 'text-emerald-600',
    defaultIcon: CheckCircle2,
  },
  error: {
    container: 'bg-red-500/10 border-red-500/20',
    iconWrapper: 'bg-red-500 shadow-red-500/20',
    title: 'text-red-600',
    defaultIcon: XCircle,
  },
};

export const InfoCallout: React.FC<InfoCalloutProps> = ({
  title,
  description,
  icon: Icon,
  variant = 'info',
  className,
}) => {
  const styles = variants[variant];
  const DisplayIcon = Icon || styles.defaultIcon;

  return (
    <div 
      className={cn(
        "p-6 rounded-2xl border transition-all duration-300",
        styles.container,
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg",
          styles.iconWrapper
        )}>
          <DisplayIcon size={20} />
        </div>
        <div className="space-y-1">
          <h4 className={cn("text-sm font-bold tracking-tight", styles.title)}>
            {title}
          </h4>
          <div className="text-[11px] text-sleek-text-muted leading-relaxed font-medium">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

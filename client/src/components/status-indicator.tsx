import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: 'connected' | 'reconnecting' | 'offline';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ status, showLabel = true, size = 'md' }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  const statusConfig = {
    connected: {
      color: 'bg-status-online',
      label: 'Connected',
      animate: false,
    },
    reconnecting: {
      color: 'bg-status-away',
      label: 'Reconnecting',
      animate: true,
    },
    offline: {
      color: 'bg-status-offline',
      label: 'Offline',
      animate: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2" data-testid={`status-indicator-${status}`}>
      <span
        className={cn(
          "rounded-full",
          sizeClasses[size],
          config.color,
          config.animate && "animate-pulse"
        )}
      />
      {showLabel && (
        <span className="text-sm text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}

interface HealthBarProps {
  health: number;
  showLabel?: boolean;
}

export function HealthBar({ health, showLabel = true }: HealthBarProps) {
  const getHealthColor = (h: number) => {
    if (h >= 80) return 'bg-status-online';
    if (h >= 50) return 'bg-status-away';
    return 'bg-status-busy';
  };

  return (
    <div className="space-y-1" data-testid="health-bar">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Connection Health</span>
          <span className="font-mono">{health}%</span>
        </div>
      )}
      <div className="h-2 bg-muted rounded-md overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500", getHealthColor(health))}
          style={{ width: `${health}%` }}
        />
      </div>
    </div>
  );
}

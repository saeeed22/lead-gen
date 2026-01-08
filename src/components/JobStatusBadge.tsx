import { Loader2, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types/leads';

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const statusConfig: Record<JobStatus, { label: string; icon: typeof Clock; className: string }> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-status-pending/10 text-status-pending border-status-pending/20',
  },
  running: {
    label: 'Running',
    icon: Loader2,
    className: 'bg-status-running/10 text-status-running border-status-running/20',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-status-completed/10 text-status-completed border-status-completed/20',
  },
};

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-4 w-4', status === 'running' && 'animate-spin')} />
      {config.label}
    </span>
  );
}

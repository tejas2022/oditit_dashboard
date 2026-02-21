import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Activity,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard';
import type { DashboardSummary, ControlStats } from '../types/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Progress,
  CircularProgress,
  Badge,
  Alert,
  SkeletonCard,
} from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

export function Home() {
  const { organization } = useAuthStore();

  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary', organization?.id],
    queryFn: () => dashboardApi.summary(),
    enabled: !!organization,
  });

  const { data: controlStats } = useQuery<ControlStats>({
    queryKey: ['control-stats', organization?.id],
    queryFn: () => dashboardApi.controlStats(),
    enabled: !!organization,
  });

  if (!organization) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Welcome</h1>
        <p className="text-slate-400">
          Create an organisation to use frameworks, controls, and compliance features. Use the prompt above to create one.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const overview = summary?.overview ?? {
    totalControls: 0,
    completedControls: 0,
    inProgressControls: 0,
    notStartedControls: 0,
    complianceScore: 0,
    auditReadiness: 0,
  };
  const totalFrameworks = summary?.frameworks?.length ?? 0;

  const completionRate = overview.totalControls > 0
    ? Math.round((overview.completedControls / overview.totalControls) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back to {organization?.name || 'Oditit'}
        </h1>
        <p className="mt-1 text-slate-400">
          Here's your compliance overview for today
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Controls"
          value={overview.totalControls}
          icon={<Shield className="h-6 w-6" />}
          trend={`${completionRate}% complete`}
          trendUp={completionRate > 50}
        />
        <MetricCard
          title="Completed"
          value={overview.completedControls}
          icon={<CheckCircle className="h-6 w-6" />}
          variant="success"
        />
        <MetricCard
          title="In Progress"
          value={overview.inProgressControls}
          icon={<Clock className="h-6 w-6" />}
          variant="warning"
        />
        <MetricCard
          title="Not Started"
          value={overview.notStartedControls}
          icon={<AlertTriangle className="h-6 w-6" />}
          variant="danger"
        />
      </div>

      {/* Compliance Score & Frameworks */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compliance Score */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Compliance Score</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            <CircularProgress
              value={overview.complianceScore}
              size={160}
              strokeWidth={12}
            />
          </CardContent>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">
                  {overview.auditReadiness}%
                </p>
                <p className="text-xs text-slate-400">Audit Readiness</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {totalFrameworks}
                </p>
                <p className="text-xs text-slate-400">Active Frameworks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Frameworks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle
              action={
                <Link to="/frameworks">
                  <Button size="sm" variant="ghost">
                    View All
                  </Button>
                </Link>
              }
            >
              Active Frameworks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary?.frameworks && summary.frameworks.length > 0 ? (
              summary.frameworks.slice(0, 3).map((framework) => (
                <div
                  key={framework.id}
                  className="rounded-lg border border-slate-700 p-4 transition-colors hover:border-accent/50"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{framework.name}</h4>
                      <p className="text-sm text-slate-400">{framework.code.toUpperCase()}</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Activated {new Date(framework.activatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <Alert variant="info">
                <p className="text-sm">
                  No frameworks activated yet.{' '}
                  <Link to="/frameworks" className="font-semibold text-blue-300 hover:underline">
                    Activate a framework
                  </Link>{' '}
                  to get started.
                </p>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Control Status Distribution */}
      {controlStats && (
        <Card>
          <CardHeader>
            <CardTitle>Control Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid gap-4 md:grid-cols-5">
              <StatusBlock
                label="Draft"
                count={controlStats.draft}
                total={controlStats.total}
                variant="default"
              />
              <StatusBlock
                label="Uploaded"
                count={controlStats.uploaded}
                total={controlStats.total}
                variant="info"
              />
              <StatusBlock
                label="Submitted"
                count={controlStats.submitted}
                total={controlStats.total}
                variant="purple"
              />
              <StatusBlock
                label="Reviewed"
                count={controlStats.reviewed}
                total={controlStats.total}
                variant="warning"
              />
              <StatusBlock
                label="Approved"
                count={controlStats.approved}
                total={controlStats.total}
                variant="success"
              />
            </div>
            {(controlStats.applicable !== undefined || controlStats.notApplicable !== undefined) && (
              <div className="mb-6 flex flex-wrap gap-4">
                <StatusBlock
                  label="Applicable"
                  count={controlStats.applicable ?? 0}
                  total={controlStats.total}
                  variant="success"
                />
                <StatusBlock
                  label="Not applicable"
                  count={controlStats.notApplicable ?? 0}
                  total={controlStats.total}
                  variant="warning"
                />
              </div>
            )}
            {controlStats.byFramework && controlStats.byFramework.length > 0 && (
              <div className="space-y-3">
                {controlStats.byFramework.slice(0, 5).map((item) => (
                  <div key={item.frameworkId}>
                    <Progress
                      value={item.progress}
                      label={item.frameworkName}
                      showLabel
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity & Critical Findings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle
              icon={<Activity className="h-5 w-5" />}
            >
              Recent Audits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary?.recentAudits && summary.recentAudits.length > 0 ? (
              summary.recentAudits.slice(0, 5).map((audit) => (
                <div
                  key={String(audit.id)}
                  className="flex items-start gap-3 rounded-lg border border-slate-800 p-3 transition-colors hover:border-slate-700"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                      <Activity className="h-4 w-4 text-accent" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300">{audit.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {audit.scheduledDate
                        ? new Date(audit.scheduledDate).toLocaleString()
                        : ''}{' '}
                      {audit.status ? `· ${audit.status}` : ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-slate-500">No recent audits</p>
            )}
          </CardContent>
        </Card>

        {/* Critical Findings */}
        <Card>
          <CardHeader>
            <CardTitle
              icon={<AlertTriangle className="h-5 w-5" />}
              action={
                <Link to="/risk">
                  <Button size="sm" variant="ghost">
                    View All
                  </Button>
                </Link>
              }
            >
              Critical Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500/50" />
              <p className="text-slate-500">No critical findings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/controls">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4" />
                Manage Controls
              </Button>
            </Link>
            <Link to="/evidence">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4" />
                Upload Evidence
              </Button>
            </Link>
            <Link to="/policies">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4" />
                View Policies
              </Button>
            </Link>
            <Link to="/report">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4" />
                Generate Report
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  trend?: string;
  trendUp?: boolean;
}

function MetricCard({ title, value, icon, variant = 'default', trend, trendUp }: MetricCardProps) {
  const variantClasses = {
    default: 'text-accent',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  };

  return (
    <Card hover>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="mt-1 text-3xl font-bold text-white">{value}</p>
            {trend && (
              <p className={`mt-2 text-xs flex items-center gap-1 ${trendUp ? 'text-green-400' : 'text-slate-400'}`}>
                {trendUp && <TrendingUp className="h-3 w-3" />}
                {trend}
              </p>
            )}
          </div>
          <div className={`rounded-full bg-slate-800 p-3 ${variantClasses[variant]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusBlockProps {
  label: string;
  count: number;
  total: number;
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

function StatusBlock({ label, count, total, variant }: StatusBlockProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="text-center">
      <Badge variant={variant} className="mb-2 w-full justify-center">
        {label}
      </Badge>
      <p className="text-2xl font-bold text-white">{count}</p>
      <p className="text-xs text-slate-500">{percentage}%</p>
    </div>
  );
}

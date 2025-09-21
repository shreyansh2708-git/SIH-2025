import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Clock, FileText, TrendingUp, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiService } from '@/services/api';
import { Issue } from '@/hooks/useIssues'; // Assuming you have this type defined

// --- Helper Components for Loading/Error States ---
const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
);

const RecentIssuesSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    ))}
  </div>
);

// --- Main Overview Component ---
const Overview = () => {
  // Fetch overview stats from the API
  const { data: overviewData, isLoading: isLoadingStats, isError: isErrorStats } = useQuery({
    queryKey: ['analyticsOverview'],
    queryFn: () => apiService.getAnalyticsOverview(),
  });

  // Fetch recent issues from the API
  const { data: recentIssuesData, isLoading: isLoadingIssues, isError: isErrorIssues } = useQuery({
    queryKey: ['recentIssues'],
    queryFn: () => apiService.getRecentIssues(),
  });

  const stats = overviewData?.stats;
  const recentIssues: Issue[] = recentIssuesData?.recentIssues || [];

  const statCards = [
    { title: 'Total Issues', value: stats?.totalIssues, change: '+12%', icon: FileText, color: 'text-primary' },
    { title: 'Open Issues', value: stats?.openIssues, change: '-5%', icon: AlertTriangle, color: 'text-warning' },
    { title: 'Resolved This Month', value: stats?.resolvedThisMonth, change: `+${stats?.resolvedChange?.toFixed(1) || 0}%`, icon: CheckCircle, color: 'text-success' },
    { title: 'Avg Resolution Time', value: `${stats?.avgResolutionTime?.toFixed(1) || 0} days`, change: '-8%', icon: Clock, color: 'text-info' },
  ];
  
  const priorityColors: { [key: string]: string } = {
    CRITICAL: 'bg-destructive text-destructive-foreground',
    HIGH: 'bg-warning text-warning-foreground',
    MEDIUM: 'bg-primary text-primary-foreground',
    LOW: 'bg-muted text-muted-foreground',
  };

  const statusColors: { [key: string]: string } = {
    SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    ACKNOWLEDGED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    ASSIGNED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    IN_PROGRESS: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Live overview of civic issues and system performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoadingStats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : isErrorStats ? (
          <p className="text-destructive col-span-4">Failed to load statistics.</p>
        ) : (
          statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value ?? 'N/A'}</div>
                <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
              <CardDescription>Latest reported civic issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingIssues ? (
                <RecentIssuesSkeleton />
              ) : isErrorIssues ? (
                <p className="text-destructive">Failed to load recent issues.</p>
              ) : recentIssues.length === 0 ? (
                <p className="text-muted-foreground">No recent issues found.</p>
              ) : (
                <div className="space-y-4">
                  {recentIssues.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{issue.title}</h4>
                          <Badge className={priorityColors[issue.priority]} variant="secondary">{issue.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1"><span>ID: {issue.id.substring(0, 8)}...</span></div>
                          <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /><span>{issue.location}</span></div>
                          <div className="flex items-center gap-1"><Users className="h-3 w-3" /><span>{issue.assignee?.name || 'Unassigned'}</span></div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge className={statusColors[issue.status]} variant="secondary">{issue.status.replace('_', ' ')}</Badge>
                        <p className="text-xs text-muted-foreground">{new Date(issue.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions (Static for now) */}
        <div className="space-y-6">
          {/* ... quick actions and alerts cards ... */}
        </div>
      </div>
    </div>
  );
};

export default Overview;

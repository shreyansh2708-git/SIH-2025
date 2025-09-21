import React, { useState } from 'react';
import { Calendar, MapPin, AlertCircle, CheckCircle, Clock, Filter, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useIssues } from '@/hooks/useIssues';

const statusColors = {
  'Submitted': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Acknowledged': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Assigned': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'In Progress': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'Resolved':
    case 'Closed':
      return <CheckCircle className="h-4 w-4" />;
    case 'In Progress':
      return <Clock className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const MyIssues = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { issues, loading, error, refetch } = useIssues({
    status: statusFilter === 'all' ? undefined : statusFilter.toUpperCase().replace(/\s+/g, '_'),
    search: searchTerm || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Issues</h1>
        <p className="text-muted-foreground mt-2">
          Track the status of your reported civic issues.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your issues...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Error loading issues</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button 
                onClick={refetch}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      {!loading && !error && (
        <div className="space-y-4">
          {issues.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No issues found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your filters or search terms.'
                      : 'You haven\'t reported any issues yet.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            issues.map((issue) => (
            <Card key={issue.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{issue.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>ID: {issue.id}</span>
                        <span>•</span>
                        <span>{issue.category.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${statusColors[issue.status as keyof typeof statusColors]} flex items-center gap-1`}
                      >
                        <StatusIcon status={issue.status} />
                        {issue.status.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline">
                        Severity {issue.severity}
                      </Badge>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4">{issue.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{issue.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Reported: {new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last Update: {new Date(issue.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {issue.resolvedAt && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      <span>Resolved: {new Date(issue.resolvedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Status Timeline */}
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-foreground mb-2">Status Progress</h4>
                  <div className="flex items-center space-x-2">
                    {['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((status, index) => {
                      const isCompleted = ['SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].indexOf(issue.status) >= index;
                      const isCurrent = issue.status === status;
                      
                      return (
                        <React.Fragment key={status}>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${
                            isCurrent 
                              ? 'bg-primary text-primary-foreground' 
                              : isCompleted 
                                ? 'bg-success text-success-foreground' 
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          {index < 4 && (
                            <div className={`flex-1 h-1 ${
                              isCompleted ? 'bg-success' : 'bg-muted'
                            }`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        </div>
      )}
    </div>
  );
};

export default MyIssues;
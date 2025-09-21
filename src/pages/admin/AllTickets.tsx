import React, { useState, useMemo } from 'react';
import { Search, Eye, Edit, MoreHorizontal, Calendar, MapPin, User, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIssues } from '@/hooks/useIssues';
import { useDebounce } from 'use-debounce';

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
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const AllTickets = () => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  });
  
  const [debouncedSearchTerm] = useDebounce(filters.searchTerm, 500);

  const apiParams = useMemo(() => ({
    page: filters.page,
    limit: filters.limit,
    status: filters.status === 'all' ? undefined : filters.status.toUpperCase().replace('-', '_'),
    priority: filters.priority === 'all' ? undefined : filters.priority.toUpperCase(),
    search: debouncedSearchTerm || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  }), [filters, debouncedSearchTerm]);
  
  const { issues, pagination, loading, error, refetch } = useIssues(apiParams);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">All Tickets</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all civic issue reports in the system.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Filter and search through all tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, title, location, or reporter..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(v) => handleFilterChange('priority', v)}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {issues.length} of {pagination.total} tickets
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p>Loading tickets...</p>
                  </TableCell>
                </TableRow>
              ) : error ? (
                 <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-destructive">
                     <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>Error loading tickets: {error}</p>
                  </TableCell>
                </TableRow>
              ) : issues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">No tickets found.</div>
                  </TableCell>
                </TableRow>
              ) : (
                issues.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">{ticket.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <div className="font-medium">{ticket.title}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{ticket.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[ticket.priority]} variant="secondary">
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[ticket.status]} variant="secondary">
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{ticket.assignee?.name || 'Unassigned'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" /> Edit Status
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="h-4 w-4 mr-2" /> Reassign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button 
          variant="outline" 
          onClick={() => handleFilterChange('page', filters.page - 1)}
          disabled={filters.page <= 1 || loading}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.pages}
        </span>
        <Button 
          variant="outline"
          onClick={() => handleFilterChange('page', filters.page + 1)}
          disabled={filters.page >= pagination.pages || loading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default AllTickets;
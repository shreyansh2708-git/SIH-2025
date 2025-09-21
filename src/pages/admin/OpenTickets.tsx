import React, { useState, useMemo } from 'react';
import { AlertTriangle, User, MapPin, Calendar, CheckSquare, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useIssues, Issue } from '@/hooks/useIssues';
import { apiService, ApiError } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

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
};

const OpenTickets = () => {
  const [sortBy, setSortBy] = useState('priority');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const { toast } = useToast();

  const { issues: allIssues, loading, error, refetch } = useIssues({ limit: 100 }); // Fetch a larger batch of issues

  const { data: adminUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => apiService.getUsers({ role: 'ADMIN' }),
  });

  const openTickets = useMemo(() => {
    return allIssues.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED');
  }, [allIssues]);

  const sortedTickets = useMemo(() => {
    return [...openTickets].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [openTickets, sortBy]);

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      await apiService.updateIssueStatus(ticketId, newStatus);
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${newStatus.replace('_', ' ')}`,
      });
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to update status: ${(err as ApiError).message}`,
        variant: "destructive",
      });
    }
  };

  const assignTicket = async (ticketId: string, assigneeId: string) => {
    try {
      await apiService.assignIssue(ticketId, assigneeId);
      toast({
        title: "Ticket Assigned",
        description: `Ticket has been assigned.`,
      });
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to assign ticket: ${(err as ApiError).message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
       <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Open Tickets</h1>
            <p className="text-muted-foreground mt-2">
              Manage and prioritize unresolved civic issues ({sortedTickets.length} open)
            </p>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {loading && <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />}
        {error && <p className="text-destructive text-center">Error: {error}</p>}

        {!loading && !error && sortedTickets.map((ticket: Issue) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">{ticket.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge className={priorityColors[ticket.priority]} variant="secondary">{ticket.priority}</Badge>
                    <Badge className={statusColors[ticket.status]} variant="secondary">{ticket.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)}
                >
                  {selectedTicket === ticket.id ? 'Hide Details' : 'View Details'}
                </Button>
              </div>

              <p className="text-foreground mb-4">{ticket.description}</p>
              
              {selectedTicket === ticket.id && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-medium text-foreground mb-3">Actions</h4>
                  <div className="flex gap-4">
                     <Select onValueChange={(value) => updateTicketStatus(ticket.id, value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACKNOWLEDGED">Acknowledge</SelectItem>
                          <SelectItem value="IN_PROGRESS">Start Progress</SelectItem>
                          <SelectItem value="RESOLVED">Mark Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select onValueChange={(value) => assignTicket(ticket.id, value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Reassign Ticket" />
                        </SelectTrigger>
                        <SelectContent>
                          {adminUsers?.users.map((admin: any) => (
                            <SelectItem key={admin.id} value={admin.id}>{admin.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {!loading && !error && sortedTickets.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Open Tickets</h3>
                <p className="text-muted-foreground">All civic issues have been resolved! Great work.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OpenTickets;
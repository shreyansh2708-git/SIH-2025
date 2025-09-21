import { useState, useEffect } from 'react';
import { apiService, ApiError } from '@/services/api';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  severity: number;
  location: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  attachments: Array<{
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    type: string;
    url: string;
    size: number;
  }>;
  comments: Array<{
    id: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    author: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
  statusHistory: Array<{
    id: string;
    status: string;
    comment?: string;
    createdAt: string;
    changedBy: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface IssuesResponse {
  issues: Issue[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useIssues = (params: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getIssues(params);
      setIssues(response.issues);
      setPagination(response.pagination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch issues');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [params.page, params.limit, params.status, params.priority, params.category, params.search, params.sortBy, params.sortOrder]);

  return {
    issues,
    pagination,
    loading,
    error,
    refetch: fetchIssues,
  };
};

export const useIssue = (id: string) => {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIssue = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getIssue(id);
      setIssue(response.issue);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch issue');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [id]);

  return {
    issue,
    loading,
    error,
    refetch: fetchIssue,
  };
};

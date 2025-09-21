const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.error || `HTTP ${response.status}`,
          errorData.details
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network error', error);
    }
  }

  // Auth endpoints
  async login(email: string, password: string, role: 'citizen' | 'admin') {
    const response = await this.request<{
      message: string;
      user: any;
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role: role.toUpperCase() }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(email: string, password: string, name: string, role: 'citizen' | 'admin' = 'citizen') {
    const response = await this.request<{
      message: string;
      user: any;
      token: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role: role.toUpperCase() }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async getProfile() {
    return this.request<{ user: any }>('/auth/me');
  }

  async updateProfile(data: { name?: string; email?: string }) {
    return this.request<{ message: string; user: any }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  logout() {
    this.setToken(null);
  }

  // Issues endpoints
  async getIssues(params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request<{
      issues: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/issues?${searchParams.toString()}`);
  }

  async getIssue(id: string) {
    return this.request<{ issue: any }>(`/issues/${id}`);
  }

  async createIssue(data: {
    title: string;
    description: string;
    category: string;
    priority: string;
    severity: number;
    location: string;
    latitude?: number;
    longitude?: number;
  }) {
    return this.request<{ message: string; issue: any }>('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIssue(id: string, data: any) {
    return this.request<{ message: string; issue: any }>(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateIssueStatus(id: string, status: string, comment?: string) {
    return this.request<{ message: string; issue: any }>(`/issues/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comment }),
    });
  }

  async assignIssue(id: string, assigneeId: string) {
    return this.request<{ message: string; issue: any }>(`/issues/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assigneeId }),
    });
  }

  async addComment(id: string, content: string, isInternal: boolean = false) {
    return this.request<{ message: string; comment: any }>(`/issues/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, isInternal }),
    });
  }

  async deleteIssue(id: string) {
    return this.request<{ message: string }>(`/issues/${id}`, {
      method: 'DELETE',
    });
  }

  // File upload endpoints
  async uploadFile(file: File, issueId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('issueId', issueId);

    const response = await fetch(`${this.baseURL}/upload/single`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error || `HTTP ${response.status}`,
        errorData.details
      );
    }

    return response.json();
  }

  async uploadMultipleFiles(files: File[], issueId: string) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('issueId', issueId);

    const response = await fetch(`${this.baseURL}/upload/multiple`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error || `HTTP ${response.status}`,
        errorData.details
      );
    }

    return response.json();
  }

  async deleteAttachment(attachmentId: string) {
    return this.request<{ message: string }>(`/upload/${attachmentId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getAnalyticsOverview() {
    return this.request<{ stats: any }>('/analytics/overview');
  }

  async getAnalyticsCategories(period: string = '30days') {
    return this.request<{ categories: any[] }>(`/analytics/categories?period=${period}`);
  }

  async getAnalyticsStatus(period: string = '30days') {
    return this.request<{ statuses: any[] }>(`/analytics/status?period=${period}`);
  }

  async getAnalyticsPriority(period: string = '30days') {
    return this.request<{ priorities: any[] }>(`/analytics/priority?period=${period}`);
  }

  async getAnalyticsTrends(period: string = '30days') {
    return this.request<{ trends: any[] }>(`/analytics/trends?period=${period}`);
  }

  async getAnalyticsPerformance() {
    return this.request<{ metrics: any }>('/analytics/performance');
  }

  async getRecentIssues() {
    return this.request<{ recentIssues: any[] }>('/analytics/recent');
  }

  // Users endpoints (Admin only)
  async getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    return this.request<{
      users: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/users?${searchParams.toString()}`);
  }

  async getUser(id: string) {
    return this.request<{ user: any }>(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request<{ message: string; user: any }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserStats(id: string) {
    return this.request<{ stats: any }>(`/users/${id}/stats`);
  }
}

export const apiService = new ApiService(API_BASE_URL);
export { ApiError };

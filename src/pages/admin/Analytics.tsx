import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
  const [period, setPeriod] = useState('30days');

  const { data: categoryData, isLoading: isCategoryLoading, isError: isCategoryError } = useQuery({
    queryKey: ['analyticsCategories', period],
    queryFn: () => apiService.getAnalyticsCategories(period),
  });

  const { data: statusData, isLoading: isStatusLoading, isError: isStatusError } = useQuery({
    queryKey: ['analyticsStatus', period],
    queryFn: () => apiService.getAnalyticsStatus(period),
  });

  const { data: trendsData, isLoading: isTrendsLoading, isError: isTrendsError } = useQuery({
    queryKey: ['analyticsTrends', period],
    queryFn: () => apiService.getAnalyticsTrends(period),
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">Insights and trends from civic issue reporting data.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
          </div>
      </div>

      <div className="grid gap-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Issues by Category</CardTitle>
              <CardDescription>Distribution of reported issues across categories.</CardDescription>
            </CardHeader>
            <CardContent>
              {isCategoryLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : isCategoryError ? <AlertCircle className="h-8 w-8 text-destructive mx-auto" /> :
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData?.categories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tickFormatter={(value) => value.replace('_', ' ').toLowerCase()} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />Status Distribution</CardTitle>
              <CardDescription>Current status breakdown of issues.</CardDescription>
            </CardHeader>
            <CardContent>
              {isStatusLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : isStatusError ? <AlertCircle className="h-8 w-8 text-destructive mx-auto" /> :
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusData?.statuses} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                    {statusData?.statuses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Issue Reporting Trends</CardTitle>
            <CardDescription>Volume of new issues reported over time.</CardDescription>
          </CardHeader>
          <CardContent>
            {isTrendsLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : isTrendsError ? <AlertCircle className="h-8 w-8 text-destructive mx-auto" /> :
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData?.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

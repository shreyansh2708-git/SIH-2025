import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import ReportIssue from './ReportIssue';
import MyIssues from './MyIssues';
import Profile from './Profile';

const CitizenDashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/citizen/report" replace />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/issues" element={<MyIssues />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </DashboardLayout>
  );
};

export default CitizenDashboard;
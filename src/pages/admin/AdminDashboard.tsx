import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import Overview from './Overview';
import Analytics from './Analytics';
import AllTickets from './AllTickets';
import OpenTickets from './OpenTickets';
import MapView from './MapView';
import Settings from './Settings';

const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/tickets" element={<AllTickets />} />
        <Route path="/open-tickets" element={<OpenTickets />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
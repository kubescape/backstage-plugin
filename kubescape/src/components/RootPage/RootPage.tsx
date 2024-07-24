import { Navigate, Route, Routes } from 'react-router-dom';
import React from 'react';
import { LandingPage } from '../LandingPage';
import { ClusterPage } from '../ClusterPage';

export function RootPage() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="landing" />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/cluster" element={<ClusterPage />} />
      <Route path="/vulnerability" />
      <Route path="/compliance" />
      <Route path="/resource" />
      <Route path="/control" />
    </Routes>
  );
}
